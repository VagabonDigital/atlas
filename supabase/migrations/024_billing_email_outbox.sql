-- ============================================================
-- Atlas Commercial System — 024
-- Billing email outbox
--
-- Keeps Atlas-owned transactional billing email state private and
-- idempotent. The Worker prepares mail only from already-accepted Paddle
-- billing events, then marks successful Resend delivery by event.
-- ============================================================

create table if not exists private.atlas_billing_email_outbox (
    environment text not null,
    event_id text not null,
    email_kind text not null,
    owner_user_id uuid
        references auth.users(id)
        on delete set null,
    recipient_email text not null,
    subscription_id text,
    context jsonb not null default '{}'::jsonb,
    attempts integer not null default 0,
    last_attempt_at timestamptz,
    resend_email_id text,
    sent_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now()),
    primary key (environment, event_id, email_kind),
    constraint atlas_billing_email_outbox_environment_valid
        check (environment in ('sandbox', 'live')),
    constraint atlas_billing_email_outbox_event_present
        check (length(trim(event_id)) > 0),
    constraint atlas_billing_email_outbox_kind_present
        check (length(trim(email_kind)) > 0),
    constraint atlas_billing_email_outbox_recipient_present
        check (length(trim(recipient_email)) > 0),
    constraint atlas_billing_email_outbox_context_object
        check (jsonb_typeof(context) = 'object'),
    constraint atlas_billing_email_outbox_attempts_valid
        check (attempts >= 0)
);

create index if not exists atlas_billing_email_outbox_pending_idx
    on private.atlas_billing_email_outbox (
        environment,
        created_at
    )
    where sent_at is null;

alter table private.atlas_billing_email_outbox
    enable row level security;

revoke all on table private.atlas_billing_email_outbox
    from public, anon, authenticated;

create or replace function public.atlas_prepare_billing_email_v1(
    p_environment text,
    p_event_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_environment text :=
        lower(btrim(coalesce(p_environment, '')));
    v_event_id text :=
        btrim(coalesce(p_event_id, ''));
    v_event private.paddle_billing_events%rowtype;
    v_recipient_email text;
    v_email_kind text;
    v_context jsonb;
    v_job private.atlas_billing_email_outbox%rowtype;
begin
    if (
        v_environment not in ('sandbox', 'live')
        or v_event_id = ''
    ) then
        raise exception using
            errcode = '22023',
            message = 'ATLAS_BILLING_EMAIL_INPUT_INVALID';
    end if;

    select event.*
    into v_event
    from private.paddle_billing_events event
    where event.environment = v_environment
      and event.event_id = v_event_id;

    if not found then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'billing_event_missing'
        );
    end if;

    if v_event.event_type <> 'subscription.past_due' then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'unsupported_event'
        );
    end if;

    if v_event.outcome not in (
        'mirrored_no_entitlement',
        'pro_active'
    ) then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'event_not_customer_actionable'
        );
    end if;

    if v_event.owner_user_id is null then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'owner_missing'
        );
    end if;

    select nullif(btrim(coalesce(usr.email, '')), '')
    into v_recipient_email
    from auth.users usr
    where usr.id = v_event.owner_user_id;

    if v_recipient_email is null then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'recipient_missing'
        );
    end if;

    v_email_kind := 'payment_issue';
    v_context := jsonb_build_object(
        'subscriptionId', v_event.subscription_id,
        'currentPeriodEnd',
            nullif(
                v_event.payload#>>'{data,current_billing_period,ends_at}',
                ''
            )
    );

    insert into private.atlas_billing_email_outbox (
        environment,
        event_id,
        email_kind,
        owner_user_id,
        recipient_email,
        subscription_id,
        context
    )
    values (
        v_environment,
        v_event_id,
        v_email_kind,
        v_event.owner_user_id,
        v_recipient_email,
        v_event.subscription_id,
        v_context
    )
    on conflict (environment, event_id, email_kind)
    do nothing;

    update private.atlas_billing_email_outbox job
    set
        attempts = job.attempts + 1,
        last_attempt_at = timezone('utc', now()),
        updated_at = timezone('utc', now())
    where job.environment = v_environment
      and job.event_id = v_event_id
      and job.email_kind = v_email_kind
      and job.sent_at is null
    returning job.*
    into v_job;

    if not found then
        select job.*
        into v_job
        from private.atlas_billing_email_outbox job
        where job.environment = v_environment
          and job.event_id = v_event_id
          and job.email_kind = v_email_kind;
    end if;

    return jsonb_build_object(
        'ok', true,
        'available', true,
        'shouldSend', v_job.sent_at is null,
        'eventId', v_job.event_id,
        'emailKind', v_job.email_kind,
        'recipientEmail', v_job.recipient_email,
        'subscriptionId', v_job.subscription_id,
        'context', v_job.context,
        'attempts', v_job.attempts,
        'sentAt', v_job.sent_at,
        'idempotencyKey',
            concat(
                'atlas-billing:',
                v_job.environment,
                ':',
                v_job.event_id,
                ':',
                v_job.email_kind
            )
    );
end;
$$;

revoke all on function public.atlas_prepare_billing_email_v1(text, text)
    from public, anon, authenticated;
grant execute on function public.atlas_prepare_billing_email_v1(text, text)
    to service_role;

create or replace function public.atlas_mark_billing_email_sent_v1(
    p_environment text,
    p_event_id text,
    p_email_kind text,
    p_resend_email_id text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_environment text :=
        lower(btrim(coalesce(p_environment, '')));
    v_event_id text :=
        btrim(coalesce(p_event_id, ''));
    v_email_kind text :=
        btrim(coalesce(p_email_kind, ''));
    v_resend_email_id text :=
        btrim(coalesce(p_resend_email_id, ''));
    v_job private.atlas_billing_email_outbox%rowtype;
begin
    if (
        v_environment not in ('sandbox', 'live')
        or v_event_id = ''
        or v_email_kind = ''
        or v_resend_email_id = ''
    ) then
        raise exception using
            errcode = '22023',
            message = 'ATLAS_BILLING_EMAIL_MARK_INVALID';
    end if;

    update private.atlas_billing_email_outbox job
    set
        resend_email_id =
            coalesce(
                job.resend_email_id,
                v_resend_email_id
            ),
        sent_at =
            coalesce(
                job.sent_at,
                timezone('utc', now())
            ),
        updated_at = timezone('utc', now())
    where job.environment = v_environment
      and job.event_id = v_event_id
      and job.email_kind = v_email_kind
    returning job.*
    into v_job;

    if not found then
        return jsonb_build_object(
            'ok', false,
            'found', false
        );
    end if;

    return jsonb_build_object(
        'ok', true,
        'found', true,
        'sentAt', v_job.sent_at,
        'resendEmailId', v_job.resend_email_id
    );
end;
$$;

revoke all on function public.atlas_mark_billing_email_sent_v1(
    text,
    text,
    text,
    text
)
    from public, anon, authenticated;
grant execute on function public.atlas_mark_billing_email_sent_v1(
    text,
    text,
    text,
    text
)
    to service_role;
