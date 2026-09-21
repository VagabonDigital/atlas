-- ============================================================
-- Atlas Commercial System — 020
-- Paddle billing foundation
--
-- Stores verified Paddle webhook state behind Atlas's private server boundary.
-- Browser clients cannot read or mutate billing provider records.
--
-- Sandbox events are mirrored but do not grant production entitlements by
-- default. Live activation is enabled only when the live catalog is configured.
-- ============================================================

create schema if not exists private;
revoke all on schema private
    from public, anon, authenticated;

create table if not exists private.paddle_billing_policy (
    environment text primary key,
    pro_price_id text not null,
    grants_entitlements boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    constraint paddle_billing_policy_environment_valid
        check (environment in ('sandbox', 'live')),
    constraint paddle_billing_policy_price_present
        check (length(trim(pro_price_id)) > 0)
);

insert into private.paddle_billing_policy (
    environment,
    pro_price_id,
    grants_entitlements
)
values (
    'sandbox',
    'pri_01m32eh22evm0xjtcrm71yndnx',
    false
)
on conflict (environment)
do update set
    pro_price_id = excluded.pro_price_id,
    updated_at = timezone('utc', now());

create table if not exists private.paddle_billing_events (
    environment text not null,
    event_id text not null,
    event_type text not null,
    occurred_at timestamptz not null,
    owner_user_id uuid
        references auth.users(id)
        on delete set null,
    customer_id text,
    subscription_id text,
    outcome text not null default 'received',
    payload jsonb not null,
    processed_at timestamptz not null default timezone('utc', now()),
    primary key (environment, event_id),
    constraint paddle_billing_events_environment_valid
        check (environment in ('sandbox', 'live')),
    constraint paddle_billing_events_id_present
        check (length(trim(event_id)) > 0),
    constraint paddle_billing_events_type_present
        check (length(trim(event_type)) > 0),
    constraint paddle_billing_events_payload_object
        check (jsonb_typeof(payload) = 'object')
);

create index if not exists paddle_billing_events_subscription_idx
    on private.paddle_billing_events (
        environment,
        subscription_id,
        occurred_at desc
    );

create index if not exists paddle_billing_events_owner_idx
    on private.paddle_billing_events (
        owner_user_id,
        occurred_at desc
    )
    where owner_user_id is not null;

create table if not exists private.paddle_subscriptions (
    environment text not null,
    subscription_id text not null,
    owner_user_id uuid
        references auth.users(id)
        on delete set null,
    customer_id text,
    status text not null,
    price_id text,
    product_id text,
    current_period_start timestamptz,
    current_period_end timestamptz,
    scheduled_change jsonb,
    custom_data jsonb not null default '{}'::jsonb,
    last_event_id text not null,
    last_event_type text not null,
    last_event_occurred_at timestamptz not null,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    primary key (environment, subscription_id),
    constraint paddle_subscriptions_environment_valid
        check (environment in ('sandbox', 'live')),
    constraint paddle_subscriptions_id_present
        check (length(trim(subscription_id)) > 0),
    constraint paddle_subscriptions_status_valid
        check (
            status in (
                'active',
                'trialing',
                'past_due',
                'paused',
                'canceled'
            )
        ),
    constraint paddle_subscriptions_period_pair
        check (
            (
                current_period_start is null
                and current_period_end is null
            )
            or (
                current_period_start is not null
                and current_period_end is not null
                and current_period_end > current_period_start
            )
        ),
    constraint paddle_subscriptions_custom_data_object
        check (jsonb_typeof(custom_data) = 'object')
);

create index if not exists paddle_subscriptions_owner_idx
    on private.paddle_subscriptions (
        owner_user_id,
        updated_at desc
    )
    where owner_user_id is not null;

create index if not exists paddle_subscriptions_customer_idx
    on private.paddle_subscriptions (
        environment,
        customer_id
    )
    where customer_id is not null;

create table if not exists private.paddle_account_state (
    owner_user_id uuid primary key
        references auth.users(id)
        on delete cascade,
    environment text not null,
    subscription_id text not null,
    customer_id text,
    status text not null,
    price_id text,
    current_period_start timestamptz,
    current_period_end timestamptz,
    updated_at timestamptz not null default timezone('utc', now()),
    constraint paddle_account_state_environment_valid
        check (environment in ('sandbox', 'live')),
    constraint paddle_account_state_status_valid
        check (
            status in (
                'active',
                'trialing',
                'past_due',
                'paused',
                'canceled'
            )
        ),
    constraint paddle_account_state_period_pair
        check (
            (
                current_period_start is null
                and current_period_end is null
            )
            or (
                current_period_start is not null
                and current_period_end is not null
                and current_period_end > current_period_start
            )
        )
);

alter table private.paddle_billing_policy
    enable row level security;
alter table private.paddle_billing_events
    enable row level security;
alter table private.paddle_subscriptions
    enable row level security;
alter table private.paddle_account_state
    enable row level security;

revoke all on table
    private.paddle_billing_policy,
    private.paddle_billing_events,
    private.paddle_subscriptions,
    private.paddle_account_state
from public, anon, authenticated;

create or replace function public.atlas_apply_paddle_event_v1(
    p_environment text,
    p_event jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_environment text :=
        lower(btrim(coalesce(p_environment, '')));
    v_event jsonb :=
        coalesce(p_event, '{}'::jsonb);
    v_event_id text :=
        btrim(coalesce(v_event->>'event_id', ''));
    v_event_type text :=
        btrim(coalesce(v_event->>'event_type', ''));
    v_occurred_at timestamptz;
    v_data jsonb :=
        coalesce(v_event->'data', '{}'::jsonb);
    v_custom_data jsonb :=
        coalesce(v_data->'custom_data', '{}'::jsonb);
    v_owner_text text :=
        btrim(coalesce(v_custom_data->>'atlas_user_id', ''));
    v_owner_user_id uuid;
    v_customer_id text :=
        nullif(btrim(coalesce(v_data->>'customer_id', '')), '');
    v_subscription_id text;
    v_status text;
    v_price_id text;
    v_product_id text;
    v_period_start timestamptz;
    v_period_end timestamptz;
    v_scheduled_change jsonb;
    v_existing_owner uuid;
    v_existing_occurred_at timestamptz;
    v_policy private.paddle_billing_policy%rowtype;
    v_inserted integer := 0;
    v_outcome text := 'recorded';
    v_is_subscription_event boolean := false;
    v_is_pro_price boolean := false;
begin
    if v_environment not in ('sandbox', 'live') then
        raise exception using
            errcode = '22023',
            message = 'ATLAS_PADDLE_ENVIRONMENT_INVALID';
    end if;

    if (
        v_event_id = ''
        or v_event_type = ''
        or jsonb_typeof(v_event) <> 'object'
        or jsonb_typeof(v_data) <> 'object'
    ) then
        raise exception using
            errcode = '22023',
            message = 'ATLAS_PADDLE_EVENT_INVALID';
    end if;

    begin
        v_occurred_at :=
            nullif(v_event->>'occurred_at', '')::timestamptz;
    exception when others then
        v_occurred_at := null;
    end;

    if v_occurred_at is null then
        raise exception using
            errcode = '22023',
            message = 'ATLAS_PADDLE_EVENT_TIME_INVALID';
    end if;

    select *
    into v_policy
    from private.paddle_billing_policy
    where environment = v_environment;

    if not found then
        raise exception using
            errcode = 'P0001',
            message = 'ATLAS_PADDLE_POLICY_MISSING';
    end if;

    if (
        v_owner_text ~*
        '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    ) then
        v_owner_user_id := v_owner_text::uuid;

        if not exists (
            select 1
            from auth.users usr
            where usr.id = v_owner_user_id
        ) then
            v_owner_user_id := null;
        end if;
    end if;

    if v_event_type = 'transaction.completed' then
        v_subscription_id :=
            nullif(
                btrim(
                    coalesce(
                        v_data->>'subscription_id',
                        ''
                    )
                ),
                ''
            );
    elsif v_event_type like 'subscription.%' then
        v_is_subscription_event := true;
        v_subscription_id :=
            nullif(
                btrim(
                    coalesce(v_data->>'id', '')
                ),
                ''
            );
    end if;

    v_price_id :=
        nullif(
            btrim(
                coalesce(
                    v_data#>>'{items,0,price,id}',
                    ''
                )
            ),
            ''
        );

    v_product_id :=
        nullif(
            btrim(
                coalesce(
                    v_data#>>'{items,0,price,product_id}',
                    v_data#>>'{items,0,product,id}',
                    ''
                )
            ),
            ''
        );

    insert into private.paddle_billing_events (
        environment,
        event_id,
        event_type,
        occurred_at,
        owner_user_id,
        customer_id,
        subscription_id,
        outcome,
        payload
    )
    values (
        v_environment,
        v_event_id,
        v_event_type,
        v_occurred_at,
        v_owner_user_id,
        v_customer_id,
        v_subscription_id,
        'received',
        v_event
    )
    on conflict (environment, event_id)
    do nothing;

    get diagnostics v_inserted = row_count;

    if v_inserted = 0 then
        return jsonb_build_object(
            'ok', true,
            'duplicate', true,
            'eventId', v_event_id
        );
    end if;

    if not v_is_subscription_event then
        update private.paddle_billing_events
        set outcome = 'recorded'
        where environment = v_environment
          and event_id = v_event_id;

        return jsonb_build_object(
            'ok', true,
            'duplicate', false,
            'outcome', 'recorded'
        );
    end if;

    v_status :=
        lower(btrim(coalesce(v_data->>'status', '')));

    if (
        v_subscription_id is null
        or v_status not in (
            'active',
            'trialing',
            'past_due',
            'paused',
            'canceled'
        )
    ) then
        update private.paddle_billing_events
        set outcome = 'ignored_invalid_subscription'
        where environment = v_environment
          and event_id = v_event_id;

        return jsonb_build_object(
            'ok', true,
            'duplicate', false,
            'outcome', 'ignored_invalid_subscription'
        );
    end if;

    begin
        v_period_start :=
            nullif(
                v_data#>>'{current_billing_period,starts_at}',
                ''
            )::timestamptz;
        v_period_end :=
            nullif(
                v_data#>>'{current_billing_period,ends_at}',
                ''
            )::timestamptz;
    exception when others then
        v_period_start := null;
        v_period_end := null;
    end;

    if (
        v_period_start is null
        or v_period_end is null
        or v_period_end <= v_period_start
    ) then
        v_period_start := null;
        v_period_end := null;
    end if;

    v_scheduled_change :=
        case
            when jsonb_typeof(v_data->'scheduled_change') = 'object'
                then v_data->'scheduled_change'
            else null
        end;

    select
        sub.owner_user_id,
        sub.last_event_occurred_at
    into
        v_existing_owner,
        v_existing_occurred_at
    from private.paddle_subscriptions sub
    where sub.environment = v_environment
      and sub.subscription_id = v_subscription_id;

    if (
        v_existing_owner is not null
        and v_owner_user_id is not null
        and v_existing_owner <> v_owner_user_id
    ) then
        update private.paddle_billing_events
        set outcome = 'owner_conflict'
        where environment = v_environment
          and event_id = v_event_id;

        return jsonb_build_object(
            'ok', false,
            'duplicate', false,
            'outcome', 'owner_conflict'
        );
    end if;

    if (
        v_existing_occurred_at is not null
        and v_occurred_at < v_existing_occurred_at
    ) then
        update private.paddle_billing_events
        set outcome = 'stale'
        where environment = v_environment
          and event_id = v_event_id;

        return jsonb_build_object(
            'ok', true,
            'duplicate', false,
            'outcome', 'stale'
        );
    end if;

    v_owner_user_id :=
        coalesce(v_owner_user_id, v_existing_owner);

    insert into private.paddle_subscriptions (
        environment,
        subscription_id,
        owner_user_id,
        customer_id,
        status,
        price_id,
        product_id,
        current_period_start,
        current_period_end,
        scheduled_change,
        custom_data,
        last_event_id,
        last_event_type,
        last_event_occurred_at
    )
    values (
        v_environment,
        v_subscription_id,
        v_owner_user_id,
        v_customer_id,
        v_status,
        v_price_id,
        v_product_id,
        v_period_start,
        v_period_end,
        v_scheduled_change,
        case
            when jsonb_typeof(v_custom_data) = 'object'
                then v_custom_data
            else '{}'::jsonb
        end,
        v_event_id,
        v_event_type,
        v_occurred_at
    )
    on conflict (environment, subscription_id)
    do update set
        owner_user_id =
            coalesce(
                excluded.owner_user_id,
                private.paddle_subscriptions.owner_user_id
            ),
        customer_id =
            coalesce(
                excluded.customer_id,
                private.paddle_subscriptions.customer_id
            ),
        status = excluded.status,
        price_id =
            coalesce(
                excluded.price_id,
                private.paddle_subscriptions.price_id
            ),
        product_id =
            coalesce(
                excluded.product_id,
                private.paddle_subscriptions.product_id
            ),
        current_period_start = excluded.current_period_start,
        current_period_end = excluded.current_period_end,
        scheduled_change = excluded.scheduled_change,
        custom_data =
            case
                when excluded.custom_data = '{}'::jsonb
                    then private.paddle_subscriptions.custom_data
                else excluded.custom_data
            end,
        last_event_id = excluded.last_event_id,
        last_event_type = excluded.last_event_type,
        last_event_occurred_at = excluded.last_event_occurred_at,
        updated_at = timezone('utc', now());

    v_is_pro_price :=
        v_price_id is not null
        and v_price_id = v_policy.pro_price_id;

    if v_owner_user_id is null then
        v_outcome := 'mirrored_unlinked';
    elsif not v_policy.grants_entitlements then
        v_outcome := 'mirrored_no_entitlement';
    elsif (
        v_is_pro_price
        and v_status in (
            'active',
            'trialing',
            'past_due'
        )
        and v_period_start is not null
        and v_period_end is not null
    ) then
        insert into private.paddle_account_state (
            owner_user_id,
            environment,
            subscription_id,
            customer_id,
            status,
            price_id,
            current_period_start,
            current_period_end
        )
        values (
            v_owner_user_id,
            v_environment,
            v_subscription_id,
            v_customer_id,
            v_status,
            v_price_id,
            v_period_start,
            v_period_end
        )
        on conflict (owner_user_id)
        do update set
            environment = excluded.environment,
            subscription_id = excluded.subscription_id,
            customer_id = excluded.customer_id,
            status = excluded.status,
            price_id = excluded.price_id,
            current_period_start = excluded.current_period_start,
            current_period_end = excluded.current_period_end,
            updated_at = timezone('utc', now());

        insert into public.account_entitlements (
            owner_user_id,
            plan_code,
            current_period_start,
            current_period_end
        )
        values (
            v_owner_user_id,
            'pro',
            v_period_start,
            v_period_end
        )
        on conflict (owner_user_id)
        do update set
            plan_code = 'pro',
            current_period_start = excluded.current_period_start,
            current_period_end = excluded.current_period_end,
            updated_at = timezone('utc', now());

        v_outcome := 'pro_active';
    elsif v_owner_user_id is not null then
        if exists (
            select 1
            from private.paddle_account_state state
            where state.owner_user_id = v_owner_user_id
              and state.environment = v_environment
              and state.subscription_id = v_subscription_id
        ) then
            update private.paddle_account_state
            set
                status = v_status,
                price_id = v_price_id,
                current_period_start = v_period_start,
                current_period_end = v_period_end,
                updated_at = timezone('utc', now())
            where owner_user_id = v_owner_user_id;

            update public.account_entitlements
            set
                plan_code = 'free',
                current_period_start = null,
                current_period_end = null,
                updated_at = timezone('utc', now())
            where owner_user_id = v_owner_user_id;

            v_outcome := 'pro_revoked';
        else
            v_outcome := 'mirrored_non_pro';
        end if;
    end if;

    update private.paddle_billing_events
    set
        owner_user_id = v_owner_user_id,
        customer_id = v_customer_id,
        subscription_id = v_subscription_id,
        outcome = v_outcome
    where environment = v_environment
      and event_id = v_event_id;

    return jsonb_build_object(
        'ok', true,
        'duplicate', false,
        'outcome', v_outcome,
        'ownerUserId', v_owner_user_id,
        'subscriptionId', v_subscription_id,
        'status', v_status
    );
end;
$$;

revoke all on function public.atlas_apply_paddle_event_v1(text, jsonb)
    from public, anon, authenticated;
grant execute on function public.atlas_apply_paddle_event_v1(text, jsonb)
    to service_role;
