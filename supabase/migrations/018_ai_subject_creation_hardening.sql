-- ============================================================
-- Atlas Commercial System — 018
-- Harden AI subject quota lifecycle against client marker tampering.
--
-- Once a fresh AI build reserves server capacity, its billable identity is
-- server-owned. Browser writes may move the build through building / paused /
-- complete, but cannot erase its provenance or durably change its generated
-- document without completing the build.
-- ============================================================

update public.ai_subject_creation_policy
set reservation_ttl_minutes = 30
where policy_key = 'default'
  and reservation_ttl_minutes = 240;

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
    v_event_status text;
begin
    if tg_op = 'INSERT' then
        if v_new_kind = 'ai-subject-build' then
            if v_new_status <> 'building' then
                raise exception using
                    errcode = 'P0001',
                    message = 'ATLAS_AI_CREATION_BUILD_STATE_REQUIRED';
            end if;

            perform private.atlas_reserve_ai_subject_creation_v1(
                new.owner_user_id,
                new.id
            );
        end if;

        return new;
    end if;

    if tg_op = 'UPDATE' then
        select event.status
        into v_event_status
        from public.ai_subject_creation_events event
        where event.owner_user_id = old.owner_user_id
          and event.subject_id = old.id;

        if found then
            if v_new_kind <> 'ai-subject-build' then
                raise exception using
                    errcode = 'P0001',
                    message = 'ATLAS_AI_CREATION_PROVENANCE_IMMUTABLE';
            end if;

            if v_new_status not in (
                'building',
                'paused',
                'complete'
            ) then
                raise exception using
                    errcode = 'P0001',
                    message = 'ATLAS_AI_CREATION_BUILD_STATE_REQUIRED';
            end if;

            if (
                v_event_status = 'completed'
                and v_new_status <> 'complete'
            ) then
                raise exception using
                    errcode = 'P0001',
                    message = 'ATLAS_AI_CREATION_COMPLETION_IMMUTABLE';
            end if;

            if (
                new.document is distinct from old.document
                and v_event_status <> 'completed'
                and v_new_status <> 'complete'
            ) then
                raise exception using
                    errcode = 'P0001',
                    message = 'ATLAS_AI_CREATION_COMMIT_REQUIRED';
            end if;

            if v_event_status <> 'completed' then
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
                elsif v_new_status = 'complete' then
                    perform private.atlas_complete_ai_subject_creation_v1(
                        new.owner_user_id,
                        new.id
                    );
                end if;
            end if;

            return new;
        end if;

        if v_new_kind = 'ai-subject-build' then
            if v_new_status <> 'building' then
                raise exception using
                    errcode = 'P0001',
                    message = 'ATLAS_AI_CREATION_BUILD_STATE_REQUIRED';
            end if;

            perform private.atlas_reserve_ai_subject_creation_v1(
                new.owner_user_id,
                new.id
            );
        end if;

        return new;
    end if;

    if tg_op = 'DELETE' then
        select event.status
        into v_event_status
        from public.ai_subject_creation_events event
        where event.owner_user_id = old.owner_user_id
          and event.subject_id = old.id;

        if found and v_event_status <> 'completed' then
            perform private.atlas_release_ai_subject_creation_v1(
                old.owner_user_id,
                old.id
            );
        end if;

        return old;
    end if;

    return coalesce(new, old);
end;
$$;

revoke all on function private.atlas_owned_subject_ai_usage_guard_v1()
    from public, anon, authenticated;
