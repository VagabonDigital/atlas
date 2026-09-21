-- ============================================================
-- Atlas Commercial System — 021
-- Paddle customer portal context
--
-- Exposes only the minimum private billing relationship needed by
-- Atlas's trusted server boundary to create hosted Paddle portal sessions.
-- Browser roles cannot execute this function.
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
    from private.paddle_subscriptions sub
    join private.paddle_billing_policy policy
      on policy.environment = sub.environment
     and policy.pro_price_id = sub.price_id
    where sub.environment = v_environment
      and sub.owner_user_id = p_owner_user_id
      and sub.customer_id is not null
    order by sub.last_event_occurred_at desc
    limit 1;

    if not found then
        return jsonb_build_object(
            'ok', true,
            'available', false
        );
    end if;

    return jsonb_build_object(
        'ok', true,
        'available', true,
        'customerId', v_subscription.customer_id,
        'subscriptionId', v_subscription.subscription_id,
        'status', v_subscription.status
    );
end;
$$;

revoke all on function public.atlas_get_paddle_portal_context_v1(uuid, text)
    from public, anon, authenticated;
grant execute on function public.atlas_get_paddle_portal_context_v1(uuid, text)
    to service_role;
