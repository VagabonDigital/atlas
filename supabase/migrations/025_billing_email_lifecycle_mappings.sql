-- ============================================================
-- Atlas Commercial System — 025
-- Billing email lifecycle mappings
--
-- Extends the private billing email outbox from the initial past-due proof
-- to the full Atlas Pro lifecycle. Event classification happens server-side
-- from verified Paddle events and stored subscription history.
-- ============================================================

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
    v_policy private.paddle_billing_policy%rowtype;
    v_subscription private.paddle_subscriptions%rowtype;
    v_owner_user_id uuid;
    v_recipient_email text;
    v_email_kind text;
    v_context jsonb := '{}'::jsonb;
    v_price_id text;
    v_origin text;
    v_status text;
    v_scheduled_action text;
    v_scheduled_effective_at text;
    v_previous_scheduled_action text;
    v_has_failed_attempt boolean := false;
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

    if v_event.outcome in (
        'received',
        'stale',
        'owner_conflict',
        'ignored_invalid_subscription',
        'mirrored_unlinked'
    ) then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'event_not_customer_actionable'
        );
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

    if v_event.subscription_id is not null then
        select sub.*
        into v_subscription
        from private.paddle_subscriptions sub
        where sub.environment = v_environment
          and sub.subscription_id = v_event.subscription_id;
    end if;

    v_owner_user_id :=
        coalesce(
            v_event.owner_user_id,
            v_subscription.owner_user_id
        );

    if v_owner_user_id is null then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'owner_missing'
        );
    end if;

    select nullif(btrim(coalesce(usr.email, '')), '')
    into v_recipient_email
    from auth.users usr
    where usr.id = v_owner_user_id;

    if v_recipient_email is null then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'recipient_missing'
        );
    end if;

    v_price_id :=
        coalesce(
            nullif(
                btrim(
                    coalesce(
                        v_event.payload#>>'{data,items,0,price,id}',
                        ''
                    )
                ),
                ''
            ),
            v_subscription.price_id
        );

    if (
        v_price_id is null
        or v_price_id <> v_policy.pro_price_id
    ) then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'not_atlas_pro'
        );
    end if;

    v_status :=
        lower(
            btrim(
                coalesce(
                    v_event.payload#>>'{data,status}',
                    ''
                )
            )
        );

    v_origin :=
        lower(
            btrim(
                coalesce(
                    v_event.payload#>>'{data,origin}',
                    ''
                )
            )
        );

    v_scheduled_action :=
        case
            when jsonb_typeof(
                v_event.payload#>'{data,scheduled_change}'
            ) = 'object'
            then nullif(
                btrim(
                    coalesce(
                        v_event.payload#>>'{data,scheduled_change,action}',
                        ''
                    )
                ),
                ''
            )
            else null
        end;

    v_scheduled_effective_at :=
        case
            when jsonb_typeof(
                v_event.payload#>'{data,scheduled_change}'
            ) = 'object'
            then nullif(
                btrim(
                    coalesce(
                        v_event.payload#>>'{data,scheduled_change,effective_at}',
                        ''
                    )
                ),
                ''
            )
            else null
        end;

    if v_event.event_type = 'subscription.updated' then
        select
            case
                when jsonb_typeof(
                    previous.payload#>'{data,scheduled_change}'
                ) = 'object'
                then nullif(
                    btrim(
                        coalesce(
                            previous.payload#>>'{data,scheduled_change,action}',
                            ''
                        )
                    ),
                    ''
                )
                else null
            end
        into v_previous_scheduled_action
        from private.paddle_billing_events previous
        where previous.environment = v_environment
          and previous.subscription_id = v_event.subscription_id
          and previous.event_type like 'subscription.%'
          and previous.occurred_at < v_event.occurred_at
          and previous.outcome not in (
              'received',
              'stale',
              'owner_conflict',
              'ignored_invalid_subscription',
              'mirrored_unlinked'
          )
        order by previous.occurred_at desc
        limit 1;
    end if;

    if v_event.event_type = 'subscription.past_due' then
        v_email_kind := 'payment_issue';

    elsif v_event.event_type = 'subscription.created' then
        v_email_kind := 'pro_welcome';

    elsif v_event.event_type = 'subscription.updated' then
        if (
            v_scheduled_action = 'cancel'
            and v_previous_scheduled_action is distinct from 'cancel'
        ) then
            v_email_kind := 'cancellation_scheduled';

        elsif (
            v_scheduled_action is null
            and v_previous_scheduled_action = 'cancel'
            and v_status in (
                'active',
                'trialing',
                'past_due'
            )
        ) then
            v_email_kind := 'cancellation_reversed';
        end if;

    elsif v_event.event_type = 'subscription.canceled' then
        v_email_kind := 'pro_ended';

    elsif v_event.event_type = 'transaction.completed' then
        if v_origin = 'subscription_payment_method_change' then
            v_email_kind := 'payment_method_updated';

        elsif v_origin = 'subscription_recurring' then
            select exists (
                select 1
                from jsonb_array_elements(
                    case
                        when jsonb_typeof(
                            v_event.payload#>'{data,payments}'
                        ) = 'array'
                        then v_event.payload#>'{data,payments}'
                        else '[]'::jsonb
                    end
                ) payment
                where lower(
                    btrim(
                        coalesce(
                            payment->>'status',
                            ''
                        )
                    )
                ) in (
                    'error',
                    'dropped',
                    'canceled'
                )
            )
            into v_has_failed_attempt;

            if v_has_failed_attempt then
                v_email_kind := 'payment_recovered';
            else
                v_email_kind := 'payment_received';
            end if;
        end if;
    end if;

    if v_email_kind is null then
        return jsonb_build_object(
            'ok', true,
            'available', false,
            'reason', 'unsupported_event'
        );
    end if;

    v_context :=
        jsonb_build_object(
            'subscriptionId',
                v_event.subscription_id,
            'currentPeriodStart',
                nullif(
                    v_event.payload#>>'{data,current_billing_period,starts_at}',
                    ''
                ),
            'currentPeriodEnd',
                nullif(
                    v_event.payload#>>'{data,current_billing_period,ends_at}',
                    ''
                ),
            'scheduledEffectiveAt',
                v_scheduled_effective_at,
            'currencyCode',
                nullif(
                    btrim(
                        coalesce(
                            v_event.payload#>>'{data,currency_code}',
                            ''
                        )
                    ),
                    ''
                ),
            'grandTotal',
                nullif(
                    btrim(
                        coalesce(
                            v_event.payload#>>'{data,details,totals,grand_total}',
                            ''
                        )
                    ),
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
        v_owner_user_id,
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
