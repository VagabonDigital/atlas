-- ============================================================
-- Atlas Commercial System — 017
-- Server-owned AI subject creation allowance enforcement
--
-- Commercial unit:
-- one successfully completed fresh AI-built subject.
--
-- The browser may read the normalized allowance through
-- atlas_get_account_access_v1(), but it cannot mutate policy, usage state or
-- usage events. A generated subject reserves capacity while it is building
-- and consumes capacity only when the completed subject is durably committed.
-- ============================================================

alter table public.account_entitlements
    add column if not exists current_period_start timestamptz,
    add column if not exists current_period_end timestamptz;

create table if not exists public.ai_subject_creation_policy (
    policy_key text primary key,
    schema_version integer not null default 1,
    free_lifetime_limit integer not null,
    pro_period_limit integer not null,
    reservation_ttl_minutes integer not null default 240,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint ai_subject_creation_policy_singleton
        check (policy_key = 'default'),
    constraint ai_subject_creation_policy_schema_version_positive
        check (schema_version >= 1),
    constraint ai_subject_creation_policy_free_limit_nonnegative
        check (free_lifetime_limit >= 0),
    constraint ai_subject_creation_policy_pro_limit_nonnegative
        check (pro_period_limit >= 0),
    constraint ai_subject_creation_policy_ttl_positive
        check (
            reservation_ttl_minutes >= 5
            and reservation_ttl_minutes <= 1440
        )
);

insert into public.ai_subject_creation_policy (
    policy_key,
    free_lifetime_limit,
    pro_period_limit,
    reservation_ttl_minutes
)
values (
    'default',
    8,
    100,
    240
)
on conflict (policy_key) do nothing;

create table if not exists public.account_ai_subject_usage_state (
    owner_user_id uuid primary key
        references auth.users(id)
        on delete cascade,
    schema_version integer not null default 1,
    free_completed integer not null default 0,
    pro_completed integer not null default 0,
    pro_period_start timestamptz,
    pro_period_end timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint account_ai_subject_usage_schema_version_positive
        check (schema_version >= 1),
    constraint account_ai_subject_usage_free_nonnegative
        check (free_completed >= 0),
    constraint account_ai_subject_usage_pro_nonnegative
        check (pro_completed >= 0),
    constraint account_ai_subject_usage_period_pair
        check (
            (
                pro_period_start is null
                and pro_period_end is null
            )
            or (
                pro_period_start is not null
                and pro_period_end is not null
                and pro_period_end > pro_period_start
            )
        )
);

create table if not exists public.ai_subject_creation_events (
    owner_user_id uuid not null
        references auth.users(id)
        on delete cascade,
    subject_id text not null,
    schema_version integer not null default 1,
    status text not null,
    plan_code text not null,
    period_start timestamptz,
    period_end timestamptz,
    reserved_at timestamptz not null,
    expires_at timestamptz not null,
    completed_at timestamptz,
    released_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    primary key (owner_user_id, subject_id),
    constraint ai_subject_creation_events_schema_version_positive
        check (schema_version >= 1),
    constraint ai_subject_creation_events_subject_present
        check (length(trim(subject_id)) > 0),
    constraint ai_subject_creation_events_status_valid
        check (status in ('reserved', 'completed', 'released')),
    constraint ai_subject_creation_events_plan_valid
        check (plan_code in ('free', 'pro')),
    constraint ai_subject_creation_events_reservation_window
        check (expires_at > reserved_at),
    constraint ai_subject_creation_events_period_pair
        check (
            (
                period_start is null
                and period_end is null
            )
            or (
                period_start is not null
                and period_end is not null
                and period_end > period_start
            )
        )
);

create index if not exists ai_subject_creation_events_active_idx
    on public.ai_subject_creation_events (
        owner_user_id,
        plan_code,
        status,
        expires_at
    );

create index if not exists ai_subject_creation_events_period_idx
    on public.ai_subject_creation_events (
        owner_user_id,
        plan_code,
        period_start,
        period_end,
        status
    );

alter table public.ai_subject_creation_policy
    enable row level security;
alter table public.account_ai_subject_usage_state
    enable row level security;
alter table public.ai_subject_creation_events
    enable row level security;

revoke all privileges on table
    public.ai_subject_creation_policy,
    public.account_ai_subject_usage_state,
    public.ai_subject_creation_events
from public, anon, authenticated;

drop trigger if exists ai_subject_creation_policy_set_updated_at
    on public.ai_subject_creation_policy;
create trigger ai_subject_creation_policy_set_updated_at
before update on public.ai_subject_creation_policy
for each row
execute function public.set_updated_at();

drop trigger if exists account_ai_subject_usage_set_updated_at
    on public.account_ai_subject_usage_state;
create trigger account_ai_subject_usage_set_updated_at
before update on public.account_ai_subject_usage_state
for each row
execute function public.set_updated_at();

drop trigger if exists ai_subject_creation_events_set_updated_at
    on public.ai_subject_creation_events;
create trigger ai_subject_creation_events_set_updated_at
before update on public.ai_subject_creation_events
for each row
execute function public.set_updated_at();

create schema if not exists private;
revoke all on schema private
    from public, anon, authenticated;

create or replace function private.atlas_ai_subject_plan_v1(
    p_owner_user_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_plan_code text := 'free';
    v_capabilities jsonb := '{}'::jsonb;
    v_period_start timestamptz;
    v_period_end timestamptz;
    v_limit integer;
    v_ttl_minutes integer;
    v_can_create boolean := true;
begin
    select
        case
            when lower(trim(ent.plan_code)) = 'pro'
                then 'pro'
            else 'free'
        end,
        coalesce(ent.capabilities, '{}'::jsonb),
        ent.current_period_start,
        ent.current_period_end
    into
        v_plan_code,
        v_capabilities,
        v_period_start,
        v_period_end
    from public.account_entitlements ent
    where ent.owner_user_id = p_owner_user_id;

    if not found then
        v_plan_code := 'free';
        v_capabilities := '{}'::jsonb;
        v_period_start := null;
        v_period_end := null;
    end if;

    if (
        jsonb_typeof(v_capabilities->'canCreateWithAI') = 'boolean'
        and (v_capabilities->>'canCreateWithAI')::boolean = false
    ) then
        v_can_create := false;
    end if;

    select
        case
            when v_plan_code = 'pro'
                then policy.pro_period_limit
            else policy.free_lifetime_limit
        end,
        policy.reservation_ttl_minutes
    into
        v_limit,
        v_ttl_minutes
    from public.ai_subject_creation_policy policy
    where policy.policy_key = 'default';

    if v_limit is null or v_ttl_minutes is null then
        v_can_create := false;
    end if;

    if v_plan_code = 'pro' then
        if (
            v_period_start is null
            or v_period_end is null
            or v_period_end <= v_period_start
            or timezone('utc', now()) < v_period_start
            or timezone('utc', now()) >= v_period_end
        ) then
            v_can_create := false;
        end if;
    else
        v_period_start := null;
        v_period_end := null;
    end if;

    return jsonb_build_object(
        'planCode', v_plan_code,
        'canCreate', v_can_create,
        'limit', v_limit,
        'ttlMinutes', v_ttl_minutes,
        'periodStart', v_period_start,
        'periodEnd', v_period_end
    );
end;
$$;

revoke all on function private.atlas_ai_subject_plan_v1(uuid)
    from public, anon, authenticated;

create or replace function private.atlas_reserve_ai_subject_creation_v1(
    p_owner_user_id uuid,
    p_subject_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid uuid := auth.uid();
    v_subject_id text := btrim(coalesce(p_subject_id, ''));
    v_plan jsonb;
    v_plan_code text;
    v_limit integer;
    v_ttl_minutes integer;
    v_period_start timestamptz;
    v_period_end timestamptz;
    v_can_create boolean;
    v_completed integer := 0;
    v_active integer := 0;
    v_event public.ai_subject_creation_events%rowtype;
    v_state public.account_ai_subject_usage_state%rowtype;
begin
    if v_uid is null or v_uid <> p_owner_user_id then
        raise exception using
            errcode = '42501',
            message = 'ATLAS_AI_CREATION_AUTH_REQUIRED';
    end if;

    if v_subject_id = '' then
        raise exception using
            errcode = '22023',
            message = 'ATLAS_AI_CREATION_SUBJECT_REQUIRED';
    end if;

    v_plan :=
        private.atlas_ai_subject_plan_v1(
            p_owner_user_id
        );

    v_plan_code :=
        coalesce(v_plan->>'planCode', 'free');
    v_can_create :=
        coalesce(
            (v_plan->>'canCreate')::boolean,
            false
        );
    v_limit :=
        nullif(v_plan->>'limit', '')::integer;
    v_ttl_minutes :=
        nullif(v_plan->>'ttlMinutes', '')::integer;
    v_period_start :=
        nullif(v_plan->>'periodStart', '')::timestamptz;
    v_period_end :=
        nullif(v_plan->>'periodEnd', '')::timestamptz;

    if (
        not v_can_create
        or v_limit is null
        or v_ttl_minutes is null
    ) then
        raise exception using
            errcode = 'P0001',
            message = 'ATLAS_AI_CREATION_UNAVAILABLE';
    end if;

    insert into public.account_ai_subject_usage_state (
        owner_user_id
    )
    values (
        p_owner_user_id
    )
    on conflict (owner_user_id) do nothing;

    select *
    into v_state
    from public.account_ai_subject_usage_state
    where owner_user_id = p_owner_user_id
    for update;

    if v_plan_code = 'pro' then
        if (
            v_state.pro_period_start is distinct from v_period_start
            or v_state.pro_period_end is distinct from v_period_end
        ) then
            update public.account_ai_subject_usage_state
            set
                pro_completed = 0,
                pro_period_start = v_period_start,
                pro_period_end = v_period_end
            where owner_user_id = p_owner_user_id
            returning * into v_state;
        end if;

        v_completed := v_state.pro_completed;
    else
        v_completed := v_state.free_completed;
    end if;

    select *
    into v_event
    from public.ai_subject_creation_events
    where owner_user_id = p_owner_user_id
      and subject_id = v_subject_id;

    if found and v_event.status = 'completed' then
        return;
    end if;

    if (
        found
        and v_event.status = 'reserved'
        and v_event.expires_at > timezone('utc', now())
        and v_event.plan_code = v_plan_code
        and (
            v_plan_code = 'free'
            or (
                v_event.period_start is not distinct from v_period_start
                and v_event.period_end is not distinct from v_period_end
            )
        )
    ) then
        update public.ai_subject_creation_events
        set
            expires_at =
                timezone('utc', now())
                + make_interval(mins => v_ttl_minutes),
            updated_at = timezone('utc', now())
        where owner_user_id = p_owner_user_id
          and subject_id = v_subject_id;

        return;
    end if;

    select count(*)::integer
    into v_active
    from public.ai_subject_creation_events event
    where event.owner_user_id = p_owner_user_id
      and event.subject_id <> v_subject_id
      and event.status = 'reserved'
      and event.expires_at > timezone('utc', now())
      and event.plan_code = v_plan_code
      and (
          v_plan_code = 'free'
          or (
              event.period_start is not distinct from v_period_start
              and event.period_end is not distinct from v_period_end
          )
      );

    if v_completed + v_active >= v_limit then
        raise exception using
            errcode = 'P0001',
            message = 'ATLAS_AI_CREATION_LIMIT_REACHED';
    end if;

    insert into public.ai_subject_creation_events (
        owner_user_id,
        subject_id,
        status,
        plan_code,
        period_start,
        period_end,
        reserved_at,
        expires_at,
        completed_at,
        released_at
    )
    values (
        p_owner_user_id,
        v_subject_id,
        'reserved',
        v_plan_code,
        v_period_start,
        v_period_end,
        timezone('utc', now()),
        timezone('utc', now())
            + make_interval(mins => v_ttl_minutes),
        null,
        null
    )
    on conflict (owner_user_id, subject_id)
    do update set
        status = 'reserved',
        plan_code = excluded.plan_code,
        period_start = excluded.period_start,
        period_end = excluded.period_end,
        reserved_at = excluded.reserved_at,
        expires_at = excluded.expires_at,
        completed_at = null,
        released_at = null,
        updated_at = timezone('utc', now());
end;
$$;

revoke all on function private.atlas_reserve_ai_subject_creation_v1(uuid, text)
    from public, anon, authenticated;

create or replace function private.atlas_release_ai_subject_creation_v1(
    p_owner_user_id uuid,
    p_subject_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid uuid := auth.uid();
begin
    if v_uid is null or v_uid <> p_owner_user_id then
        raise exception using
            errcode = '42501',
            message = 'ATLAS_AI_CREATION_AUTH_REQUIRED';
    end if;

    update public.ai_subject_creation_events
    set
        status = 'released',
        released_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where owner_user_id = p_owner_user_id
      and subject_id = btrim(coalesce(p_subject_id, ''))
      and status = 'reserved';
end;
$$;

revoke all on function private.atlas_release_ai_subject_creation_v1(uuid, text)
    from public, anon, authenticated;

create or replace function private.atlas_complete_ai_subject_creation_v1(
    p_owner_user_id uuid,
    p_subject_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_uid uuid := auth.uid();
    v_subject_id text := btrim(coalesce(p_subject_id, ''));
    v_event public.ai_subject_creation_events%rowtype;
    v_state public.account_ai_subject_usage_state%rowtype;
begin
    if v_uid is null or v_uid <> p_owner_user_id then
        raise exception using
            errcode = '42501',
            message = 'ATLAS_AI_CREATION_AUTH_REQUIRED';
    end if;

    if v_subject_id = '' then
        raise exception using
            errcode = '22023',
            message = 'ATLAS_AI_CREATION_SUBJECT_REQUIRED';
    end if;

    insert into public.account_ai_subject_usage_state (
        owner_user_id
    )
    values (
        p_owner_user_id
    )
    on conflict (owner_user_id) do nothing;

    select *
    into v_state
    from public.account_ai_subject_usage_state
    where owner_user_id = p_owner_user_id
    for update;

    select *
    into v_event
    from public.ai_subject_creation_events
    where owner_user_id = p_owner_user_id
      and subject_id = v_subject_id;

    if found and v_event.status = 'completed' then
        return;
    end if;

    if (
        not found
        or v_event.status <> 'reserved'
        or v_event.expires_at <= timezone('utc', now())
    ) then
        perform private.atlas_reserve_ai_subject_creation_v1(
            p_owner_user_id,
            v_subject_id
        );

        select *
        into v_event
        from public.ai_subject_creation_events
        where owner_user_id = p_owner_user_id
          and subject_id = v_subject_id;
    end if;

    if v_event.status <> 'reserved' then
        raise exception using
            errcode = 'P0001',
            message = 'ATLAS_AI_CREATION_RESERVATION_REQUIRED';
    end if;

    if v_event.plan_code = 'free' then
        update public.account_ai_subject_usage_state
        set free_completed = free_completed + 1
        where owner_user_id = p_owner_user_id;
    elsif (
        v_state.pro_period_start is not distinct from v_event.period_start
        and v_state.pro_period_end is not distinct from v_event.period_end
    ) then
        update public.account_ai_subject_usage_state
        set pro_completed = pro_completed + 1
        where owner_user_id = p_owner_user_id;
    end if;

    update public.ai_subject_creation_events
    set
        status = 'completed',
        completed_at = timezone('utc', now()),
        released_at = null,
        updated_at = timezone('utc', now())
    where owner_user_id = p_owner_user_id
      and subject_id = v_subject_id;
end;
$$;

revoke all on function private.atlas_complete_ai_subject_creation_v1(uuid, text)
    from public, anon, authenticated;

create or replace function private.atlas_owned_subject_ai_usage_guard_v1()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_old_kind text :=
        case
            when tg_op in ('UPDATE', 'DELETE')
                then coalesce(old.provenance->>'kind', '')
            else ''
        end;
    v_new_kind text :=
        case
            when tg_op in ('INSERT', 'UPDATE')
                then coalesce(new.provenance->>'kind', '')
            else ''
        end;
    v_old_status text :=
        case
            when tg_op in ('UPDATE', 'DELETE')
                then coalesce(old.metadata->>'aiBuildStatus', '')
            else ''
        end;
    v_new_status text :=
        case
            when tg_op in ('INSERT', 'UPDATE')
                then coalesce(new.metadata->>'aiBuildStatus', '')
            else ''
        end;
begin
    if tg_op = 'INSERT' then
        if (
            v_new_kind = 'ai-subject-build'
            and v_new_status = 'building'
        ) then
            perform private.atlas_reserve_ai_subject_creation_v1(
                new.owner_user_id,
                new.id
            );
        end if;

        return new;
    end if;

    if tg_op = 'UPDATE' then
        if (
            v_old_kind = 'ai-subject-build'
            or v_new_kind = 'ai-subject-build'
        ) then
            if v_new_status = 'building' then
                perform private.atlas_reserve_ai_subject_creation_v1(
                    new.owner_user_id,
                    new.id
                );
            elsif v_new_status = 'paused' then
                perform private.atlas_release_ai_subject_creation_v1(
                    new.owner_user_id,
                    new.id
                );
            elsif (
                v_new_status = 'complete'
                and v_old_status <> 'complete'
            ) then
                perform private.atlas_complete_ai_subject_creation_v1(
                    new.owner_user_id,
                    new.id
                );
            end if;
        end if;

        return new;
    end if;

    if (
        tg_op = 'DELETE'
        and v_old_kind = 'ai-subject-build'
    ) then
        perform private.atlas_release_ai_subject_creation_v1(
            old.owner_user_id,
            old.id
        );

        return old;
    end if;

    return coalesce(new, old);
end;
$$;

revoke all on function private.atlas_owned_subject_ai_usage_guard_v1()
    from public, anon, authenticated;

drop trigger if exists owned_subjects_ai_usage_guard
    on public.owned_subjects;
create trigger owned_subjects_ai_usage_guard
before insert or update or delete on public.owned_subjects
for each row
execute function private.atlas_owned_subject_ai_usage_guard_v1();

create or replace function public.atlas_get_account_access_v1()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
    v_uid uuid := auth.uid();
    v_schema_version integer := 1;
    v_entitlement_updated_at timestamptz;
    v_capabilities jsonb := '{}'::jsonb;
    v_plan jsonb;
    v_plan_code text;
    v_limit integer;
    v_can_create boolean;
    v_period_start timestamptz;
    v_period_end timestamptz;
    v_completed integer := 0;
    v_active integer := 0;
    v_remaining integer;
    v_state public.account_ai_subject_usage_state%rowtype;
begin
    if v_uid is null then
        raise exception using
            errcode = '42501',
            message = 'Atlas account access requires a signed-in account.';
    end if;

    select
        ent.schema_version,
        coalesce(ent.capabilities, '{}'::jsonb),
        ent.updated_at
    into
        v_schema_version,
        v_capabilities,
        v_entitlement_updated_at
    from public.account_entitlements ent
    where ent.owner_user_id = v_uid;

    if not found then
        v_schema_version := 1;
        v_capabilities := '{}'::jsonb;
        v_entitlement_updated_at := null;
    end if;

    v_plan :=
        private.atlas_ai_subject_plan_v1(v_uid);

    v_plan_code :=
        coalesce(v_plan->>'planCode', 'free');
    v_can_create :=
        coalesce(
            (v_plan->>'canCreate')::boolean,
            false
        );
    v_limit :=
        nullif(v_plan->>'limit', '')::integer;
    v_period_start :=
        nullif(v_plan->>'periodStart', '')::timestamptz;
    v_period_end :=
        nullif(v_plan->>'periodEnd', '')::timestamptz;

    select *
    into v_state
    from public.account_ai_subject_usage_state
    where owner_user_id = v_uid;

    if v_plan_code = 'pro' then
        if (
            found
            and v_state.pro_period_start is not distinct from v_period_start
            and v_state.pro_period_end is not distinct from v_period_end
        ) then
            v_completed := v_state.pro_completed;
        else
            v_completed := 0;
        end if;
    else
        v_completed :=
            case
                when found then v_state.free_completed
                else 0
            end;
    end if;

    select count(*)::integer
    into v_active
    from public.ai_subject_creation_events event
    where event.owner_user_id = v_uid
      and event.status = 'reserved'
      and event.expires_at > timezone('utc', now())
      and event.plan_code = v_plan_code
      and (
          v_plan_code = 'free'
          or (
              event.period_start is not distinct from v_period_start
              and event.period_end is not distinct from v_period_end
          )
      );

    if v_limit is null then
        v_remaining := null;
    else
        v_remaining :=
            greatest(
                v_limit - v_completed - v_active,
                0
            );
    end if;

    v_capabilities :=
        (v_capabilities - 'creationAllowance')
        || jsonb_build_object(
            'creationAllowance',
            jsonb_build_object(
                'allowed',
                    (
                        v_can_create
                        and coalesce(v_remaining, 0) > 0
                    ),
                'remaining', v_remaining,
                'limit', v_limit,
                'resetAt',
                    case
                        when v_plan_code = 'pro'
                            then v_period_end
                        else null
                    end
            )
        );

    return jsonb_build_object(
        'schemaVersion', v_schema_version,
        'planCode', v_plan_code,
        'capabilities', v_capabilities,
        'updatedAt', v_entitlement_updated_at
    );
end;
$$;

revoke all on function public.atlas_get_account_access_v1()
    from public;
revoke all on function public.atlas_get_account_access_v1()
    from anon;
grant execute on function public.atlas_get_account_access_v1()
    to authenticated;
