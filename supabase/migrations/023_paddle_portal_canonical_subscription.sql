-- ============================================================
-- Atlas Commercial System — 023
-- Paddle customer portal active-subscription selection
--
-- Prefer Atlas's canonical account billing state when multiple Paddle
-- subscriptions exist for one owner. Fall back to the latest relevant
-- Paddle subscription only when no canonical account state is available.
-- ============================================================

create or replace function public.atlas_get_paddle_portal_context_v1(
    p_owner_user_id uuid,
    p_environment text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_environment text :=
        lower(btrim(coalesce(p_environment, '')));
    v_subscription private.paddle_subscriptions%rowtype;
    v_scheduled_action text;
    v_scheduled_effective_at timestamptz;
begin
    if (
        p_owner_user_id is null
        or v_environment not in ('sandbox', 'live')
    ) then
        raise exception using
            errcode = '22023',
            message = 'ATLAS_PADDLE_PORTAL_CONTEXT_INVALID';
    end if;

    select sub.*
    into v_subscription
    from private.paddle_account_state state
    join private.paddle_subscriptions sub
      on sub.environment = state.environment
     and sub.subscription_id = state.subscription_id
    join private.paddle_billing_policy policy
      on policy.environment = sub.environment
     and policy.pro_price_id = sub.price_id
    where state.owner_user_id = p_owner_user_id
      and state.environment = v_environment
      and sub.owner_user_id = p_owner_user_id
      and sub.customer_id is not null
    limit 1;

    if not found then
        select sub.*
        into v_subscription
        from private.paddle_subscriptions sub
        join private.paddle_billing_policy policy
          on policy.environment = sub.environment
         and policy.pro_price_id = sub.price_id
        where sub.environment = v_environment
          and sub.owner_user_id = p_owner_user_id
          and sub.customer_id is not null
        order by
            case
                when sub.status in (
                    'active',
                    'trialing',
                    'past_due',
                    'paused'
                ) then 0
                else 1
            end,
            sub.last_event_occurred_at desc
        limit 1;
    end if;

    if not found then
        return jsonb_build_object(
            'ok', true,
            'available', false
        );
    end if;

    v_scheduled_action :=
        nullif(
            btrim(
                coalesce(
                    v_subscription.scheduled_change->>'action',
                    ''
                )
            ),
            ''
        );

    begin
        v_scheduled_effective_at :=
            nullif(
                v_subscription.scheduled_change->>'effective_at',
                ''
            )::timestamptz;
    exception when others then
        v_scheduled_effective_at := null;
    end;

    return jsonb_build_object(
        'ok', true,
        'available', true,
        'customerId', v_subscription.customer_id,
        'subscriptionId', v_subscription.subscription_id,
        'status', v_subscription.status,
        'currentPeriodStart', v_subscription.current_period_start,
        'currentPeriodEnd', v_subscription.current_period_end,
        'scheduledAction', v_scheduled_action,
        'scheduledEffectiveAt', v_scheduled_effective_at
    );
end;
$$;

revoke all on function public.atlas_get_paddle_portal_context_v1(uuid, text)
    from public, anon, authenticated;
grant execute on function public.atlas_get_paddle_portal_context_v1(uuid, text)
    to service_role;
