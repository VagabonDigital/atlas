-- ============================================================
-- Atlas Commercial System — 019
-- Authenticated AI operation guardrails
--
-- These limits are operational abuse boundaries, not tutor-facing credits.
-- Normal product use should remain far below them.
-- ============================================================

create table if not exists public.ai_operation_policy (
    policy_key text primary key,
    schema_version integer not null default 1,
    subject_build_success_limit integer not null,
    subject_shape_daily_success_limit integer not null,
    subject_shape_monthly_success_limit integer not null,
    web_action_daily_success_limit integer not null,
    web_action_monthly_success_limit integer not null,
    cover_search_daily_success_limit integer not null,
    general_attempts_per_minute integer not null,
    subject_build_attempts_per_minute integer not null,
    reservation_ttl_seconds integer not null default 180,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint ai_operation_policy_singleton
        check (policy_key = 'default'),
    constraint ai_operation_policy_schema_version_positive
        check (schema_version >= 1),
    constraint ai_operation_policy_limits_positive
        check (
            subject_build_success_limit > 0
            and subject_shape_daily_success_limit > 0
            and subject_shape_monthly_success_limit > 0
            and web_action_daily_success_limit > 0
            and web_action_monthly_success_limit > 0
            and cover_search_daily_success_limit > 0
            and general_attempts_per_minute > 0
            and subject_build_attempts_per_minute > 0
            and reservation_ttl_seconds between 30 and 900
        )
);

insert into public.ai_operation_policy (
    policy_key,
    subject_build_success_limit,
    subject_shape_daily_success_limit,
    subject_shape_monthly_success_limit,
    web_action_daily_success_limit,
    web_action_monthly_success_limit,
    cover_search_daily_success_limit,
    general_attempts_per_minute,
    subject_build_attempts_per_minute,
    reservation_ttl_seconds
)
values (
    'default',
    60,
    100,
    500,
    30,
    150,
    200,
    30,
    60,
    180
)
on conflict (policy_key) do nothing;

create table if not exists public.ai_operation_events (
    id uuid primary key default gen_random_uuid(),
    owner_user_id uuid not null
        references auth.users(id)
        on delete cascade,
    request_id text not null,
    subject_id text,
    endpoint text not null,
    action_type text not null,
    usage_class text not null,
    status text not null default 'reserved',
    reserved_at timestamptz not null default timezone('utc', now()),
    expires_at timestamptz not null,
    succeeded_at timestamptz,
    failed_at timestamptz,
    provider_status integer,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint ai_operation_events_request_present
        check (length(trim(request_id)) between 8 and 160),
    constraint ai_operation_events_endpoint_present
        check (length(trim(endpoint)) between 2 and 120),
    constraint ai_operation_events_action_present
        check (length(trim(action_type)) between 2 and 120),
    constraint ai_operation_events_usage_class_valid
        check (
            usage_class in (
                'subject_build_internal',
                'subject_shape',
                'web_action',
                'cover_search'
            )
        ),
    constraint ai_operation_events_status_valid
        check (status in ('reserved', 'succeeded', 'failed')),
    constraint ai_operation_events_reservation_window
        check (expires_at > reserved_at),
    unique (owner_user_id, request_id)
);

create index if not exists ai_operation_events_usage_idx
    on public.ai_operation_events (
        owner_user_id,
        usage_class,
        status,
        succeeded_at,
        expires_at
    );

create index if not exists ai_operation_events_subject_idx
    on public.ai_operation_events (
        owner_user_id,
        subject_id,
        action_type,
        status
    );

create table if not exists public.ai_operation_rate_buckets (
    owner_user_id uuid not null
        references auth.users(id)
        on delete cascade,
    bucket_kind text not null,
    bucket_start timestamptz not null,
    attempt_count integer not null default 0,
    updated_at timestamptz not null default timezone('utc', now()),
    primary key (owner_user_id, bucket_kind, bucket_start),
    constraint ai_operation_rate_bucket_kind_valid
        check (bucket_kind in ('general', 'subject_build')),
    constraint ai_operation_rate_attempts_nonnegative
        check (attempt_count >= 0)
);

alter table public.ai_operation_policy enable row level security;
alter table public.ai_operation_events enable row level security;
alter table public.ai_operation_rate_buckets enable row level security;

revoke all privileges on table
    public.ai_operation_policy,
    public.ai_operation_events,
    public.ai_operation_rate_buckets
from public, anon, authenticated;

drop trigger if exists ai_operation_policy_set_updated_at
    on public.ai_operation_policy;
create trigger ai_operation_policy_set_updated_at
before update on public.ai_operation_policy
for each row
execute function public.set_updated_at();

drop trigger if exists ai_operation_events_set_updated_at
    on public.ai_operation_events;
create trigger ai_operation_events_set_updated_at
before update on public.ai_operation_events
for each row
execute function public.set_updated_at();

create or replace function public.atlas_begin_ai_operation_v1(
    p_owner_user_id uuid,
    p_request_id text,
    p_subject_id text,
    p_endpoint text,
    p_mode text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_now timestamptz := timezone('utc', now());
    v_request_id text := btrim(coalesce(p_request_id, ''));
    v_subject_id text := nullif(btrim(coalesce(p_subject_id, '')), '');
    v_endpoint text := btrim(coalesce(p_endpoint, ''));
    v_mode text := lower(btrim(coalesce(p_mode, '')));
    v_usage_class text;
    v_action_type text;
    v_active_build boolean := false;
    v_rate_kind text;
    v_rate_limit integer;
    v_attempt_count integer;
    v_daily_used integer := 0;
    v_monthly_used integer := 0;
    v_build_used integer := 0;
    v_existing_found boolean := false;
    v_existing public.ai_operation_events%rowtype;
    v_policy public.ai_operation_policy%rowtype;
begin
    if p_owner_user_id is null then
        return jsonb_build_object(
            'allowed', false,
            'reason', 'auth_required'
        );
    end if;

    if length(v_request_id) < 8 or length(v_request_id) > 160 then
        return jsonb_build_object(
            'allowed', false,
            'reason', 'invalid_request_id'
        );
    end if;

    if v_endpoint not in (
        '/generate-moment',
        '/generate-cultural-lens-card',
        '/generate-discussion-set',
        '/generate-subject-framing',
        '/generate-overview',
        '/generate-discussion-framing',
        '/generate-cultural-lens-framing',
        '/generate-reflection',
        '/select-key-language-opportunities',
        '/generate-moment-upgrade',
        '/generate-cultural-lens-upgrade',
        '/generate-make-it-real',
        '/generate-discussion-pathway',
        '/generate-subject-artwork',
        '/generate-current-affairs-reading',
        '/search-covers',
        '/suggest-subject-ideas',
        '/recommend-subjects'
    ) then
        return jsonb_build_object(
            'allowed', false,
            'reason', 'unsupported_endpoint'
        );
    end if;

    perform pg_advisory_xact_lock(
        hashtextextended(p_owner_user_id::text, 0)
    );

    select *
    into v_policy
    from public.ai_operation_policy policy
    where policy.policy_key = 'default';

    if not found then
        return jsonb_build_object(
            'allowed', false,
            'reason', 'policy_unavailable'
        );
    end if;

    select exists (
        select 1
        from public.ai_subject_creation_events event
        where event.owner_user_id = p_owner_user_id
          and event.subject_id = v_subject_id
          and event.status = 'reserved'
          and event.expires_at > v_now
    )
    into v_active_build;

    if v_active_build then
        v_usage_class := 'subject_build_internal';
    elsif v_endpoint = '/search-covers' then
        v_usage_class := 'cover_search';
    elsif (
        v_endpoint = '/generate-current-affairs-reading'
        or (
            v_endpoint = '/suggest-subject-ideas'
            and v_mode = 'current-affairs'
        )
    ) then
        v_usage_class := 'web_action';
    else
        v_usage_class := 'subject_shape';
    end if;

    v_action_type :=
        regexp_replace(
            trim(both '/' from v_endpoint),
            '-',
            '_',
            'g'
        );

    if (
        v_endpoint = '/suggest-subject-ideas'
        and v_mode = 'current-affairs'
    ) then
        v_action_type := 'current_affairs_suggestions';
    elsif v_endpoint = '/generate-current-affairs-reading' then
        v_action_type := 'current_affairs_reading';
    end if;

    if v_action_type = 'current_affairs_reading' then
        if (
            v_subject_id is null
            or not exists (
                select 1
                from public.owned_subjects subject
                where subject.owner_user_id = p_owner_user_id
                  and subject.id = v_subject_id
            )
        ) then
            return jsonb_build_object(
                'allowed', false,
                'reason', 'owned_subject_required',
                'usageClass', v_usage_class,
                'actionType', v_action_type
            );
        end if;

        if exists (
            select 1
            from public.ai_operation_events event
            where event.owner_user_id = p_owner_user_id
              and event.subject_id = v_subject_id
              and event.action_type = 'current_affairs_reading'
              and event.request_id <> v_request_id
              and (
                  event.status = 'succeeded'
                  or (
                      event.status = 'reserved'
                      and event.expires_at > v_now
                  )
              )
        ) then
            return jsonb_build_object(
                'allowed', false,
                'reason', 'one_shot_used',
                'usageClass', v_usage_class,
                'actionType', v_action_type
            );
        end if;
    end if;

    select *
    into v_existing
    from public.ai_operation_events event
    where event.owner_user_id = p_owner_user_id
      and event.request_id = v_request_id
    for update;

    v_existing_found := found;

    if v_existing_found then
        if v_existing.status = 'succeeded' then
            return jsonb_build_object(
                'allowed', false,
                'reason', 'request_already_completed',
                'usageClass', v_existing.usage_class,
                'actionType', v_existing.action_type
            );
        end if;

        if (
            v_existing.status = 'reserved'
            and v_existing.expires_at > v_now
        ) then
            return jsonb_build_object(
                'allowed', false,
                'reason', 'request_in_progress',
                'usageClass', v_existing.usage_class,
                'actionType', v_existing.action_type
            );
        end if;
    end if;

    if v_usage_class = 'subject_build_internal' then
        v_rate_kind := 'subject_build';
        v_rate_limit := v_policy.subject_build_attempts_per_minute;
    else
        v_rate_kind := 'general';
        v_rate_limit := v_policy.general_attempts_per_minute;
    end if;

    insert into public.ai_operation_rate_buckets (
        owner_user_id,
        bucket_kind,
        bucket_start,
        attempt_count
    )
    values (
        p_owner_user_id,
        v_rate_kind,
        date_trunc('minute', v_now),
        1
    )
    on conflict (
        owner_user_id,
        bucket_kind,
        bucket_start
    )
    do update set
        attempt_count =
            public.ai_operation_rate_buckets.attempt_count + 1,
        updated_at = v_now
    returning attempt_count into v_attempt_count;

    if v_attempt_count > v_rate_limit then
        return jsonb_build_object(
            'allowed', false,
            'reason', 'rate_limited',
            'usageClass', v_usage_class,
            'actionType', v_action_type
        );
    end if;

    if v_usage_class = 'subject_build_internal' then
        select count(*)::integer
        into v_build_used
        from public.ai_operation_events event
        where event.owner_user_id = p_owner_user_id
          and event.subject_id = v_subject_id
          and event.usage_class = 'subject_build_internal'
          and (
              event.status = 'succeeded'
              or (
                  event.status = 'reserved'
                  and event.expires_at > v_now
              )
          );

        if v_build_used >= v_policy.subject_build_success_limit then
            return jsonb_build_object(
                'allowed', false,
                'reason', 'build_guardrail',
                'usageClass', v_usage_class,
                'actionType', v_action_type
            );
        end if;

    elsif v_usage_class = 'subject_shape' then
        select count(*)::integer
        into v_daily_used
        from public.ai_operation_events event
        where event.owner_user_id = p_owner_user_id
          and event.usage_class = 'subject_shape'
          and (
              (
                  event.status = 'succeeded'
                  and event.succeeded_at >= date_trunc('day', v_now)
              )
              or (
                  event.status = 'reserved'
                  and event.expires_at > v_now
              )
          );

        select count(*)::integer
        into v_monthly_used
        from public.ai_operation_events event
        where event.owner_user_id = p_owner_user_id
          and event.usage_class = 'subject_shape'
          and (
              (
                  event.status = 'succeeded'
                  and event.succeeded_at >= date_trunc('month', v_now)
              )
              or (
                  event.status = 'reserved'
                  and event.expires_at > v_now
              )
          );

        if (
            v_daily_used >= v_policy.subject_shape_daily_success_limit
            or v_monthly_used >= v_policy.subject_shape_monthly_success_limit
        ) then
            return jsonb_build_object(
                'allowed', false,
                'reason', 'shape_guardrail',
                'usageClass', v_usage_class,
                'actionType', v_action_type
            );
        end if;

    elsif v_usage_class = 'web_action' then
        select count(*)::integer
        into v_daily_used
        from public.ai_operation_events event
        where event.owner_user_id = p_owner_user_id
          and event.usage_class = 'web_action'
          and (
              (
                  event.status = 'succeeded'
                  and event.succeeded_at >= date_trunc('day', v_now)
              )
              or (
                  event.status = 'reserved'
                  and event.expires_at > v_now
              )
          );

        select count(*)::integer
        into v_monthly_used
        from public.ai_operation_events event
        where event.owner_user_id = p_owner_user_id
          and event.usage_class = 'web_action'
          and (
              (
                  event.status = 'succeeded'
                  and event.succeeded_at >= date_trunc('month', v_now)
              )
              or (
                  event.status = 'reserved'
                  and event.expires_at > v_now
              )
          );

        if (
            v_daily_used >= v_policy.web_action_daily_success_limit
            or v_monthly_used >= v_policy.web_action_monthly_success_limit
        ) then
            return jsonb_build_object(
                'allowed', false,
                'reason', 'web_guardrail',
                'usageClass', v_usage_class,
                'actionType', v_action_type
            );
        end if;

    else
        select count(*)::integer
        into v_daily_used
        from public.ai_operation_events event
        where event.owner_user_id = p_owner_user_id
          and event.usage_class = 'cover_search'
          and (
              (
                  event.status = 'succeeded'
                  and event.succeeded_at >= date_trunc('day', v_now)
              )
              or (
                  event.status = 'reserved'
                  and event.expires_at > v_now
              )
          );

        if v_daily_used >= v_policy.cover_search_daily_success_limit then
            return jsonb_build_object(
                'allowed', false,
                'reason', 'cover_guardrail',
                'usageClass', v_usage_class,
                'actionType', v_action_type
            );
        end if;
    end if;

    if v_existing_found then
        update public.ai_operation_events
        set
            subject_id = v_subject_id,
            endpoint = v_endpoint,
            action_type = v_action_type,
            usage_class = v_usage_class,
            status = 'reserved',
            reserved_at = v_now,
            expires_at = v_now
                + make_interval(secs => v_policy.reservation_ttl_seconds),
            succeeded_at = null,
            failed_at = null,
            provider_status = null,
            updated_at = v_now
        where owner_user_id = p_owner_user_id
          and request_id = v_request_id;
    else
        insert into public.ai_operation_events (
            owner_user_id,
            request_id,
            subject_id,
            endpoint,
            action_type,
            usage_class,
            status,
            reserved_at,
            expires_at
        )
        values (
            p_owner_user_id,
            v_request_id,
            v_subject_id,
            v_endpoint,
            v_action_type,
            v_usage_class,
            'reserved',
            v_now,
            v_now + make_interval(secs => v_policy.reservation_ttl_seconds)
        );
    end if;

    return jsonb_build_object(
        'allowed', true,
        'reason', 'allowed',
        'usageClass', v_usage_class,
        'actionType', v_action_type
    );
end;
$$;

revoke all on function public.atlas_begin_ai_operation_v1(
    uuid, text, text, text, text
) from public, anon, authenticated;
grant execute on function public.atlas_begin_ai_operation_v1(
    uuid, text, text, text, text
) to service_role;

create or replace function public.atlas_finish_ai_operation_v1(
    p_owner_user_id uuid,
    p_request_id text,
    p_succeeded boolean,
    p_provider_status integer default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_now timestamptz := timezone('utc', now());
    v_request_id text := btrim(coalesce(p_request_id, ''));
    v_event public.ai_operation_events%rowtype;
begin
    if p_owner_user_id is null or length(v_request_id) < 8 then
        return jsonb_build_object(
            'ok', false,
            'reason', 'invalid_request'
        );
    end if;

    perform pg_advisory_xact_lock(
        hashtextextended(p_owner_user_id::text, 0)
    );

    select *
    into v_event
    from public.ai_operation_events event
    where event.owner_user_id = p_owner_user_id
      and event.request_id = v_request_id
    for update;

    if not found then
        return jsonb_build_object(
            'ok', false,
            'reason', 'reservation_missing'
        );
    end if;

    if v_event.status = 'succeeded' then
        return jsonb_build_object(
            'ok', true,
            'status', 'succeeded',
            'idempotent', true
        );
    end if;

    if p_succeeded then
        update public.ai_operation_events
        set
            status = 'succeeded',
            succeeded_at = v_now,
            failed_at = null,
            provider_status = p_provider_status,
            updated_at = v_now
        where id = v_event.id;

        return jsonb_build_object(
            'ok', true,
            'status', 'succeeded',
            'idempotent', false
        );
    end if;

    update public.ai_operation_events
    set
        status = 'failed',
        failed_at = v_now,
        provider_status = p_provider_status,
        updated_at = v_now
    where id = v_event.id;

    return jsonb_build_object(
        'ok', true,
        'status', 'failed',
        'idempotent', false
    );
end;
$$;

revoke all on function public.atlas_finish_ai_operation_v1(
    uuid, text, boolean, integer
) from public, anon, authenticated;
grant execute on function public.atlas_finish_ai_operation_v1(
    uuid, text, boolean, integer
) to service_role;
