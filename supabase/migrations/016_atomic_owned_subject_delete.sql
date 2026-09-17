-- Atlas atomic My Subject deletion.
--
-- A committed My Subject can be referenced by named learner Session Subjects,
-- Shared Session Subjects, and the account-level My Subjects library. Deletion
-- must remove those references in the same transaction as the subject row so
-- Atlas cannot leave cloud-owned dangling references behind.

create or replace function public.atlas_delete_owned_subject_v1(
    p_subject_id text,
    p_expected_revision integer default null
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
    v_uid uuid := auth.uid();
    v_subject_id text := btrim(coalesce(p_subject_id, ''));
    v_current_revision integer;
    v_deleted_count integer := 0;
    v_library_updated integer := 0;
    v_learners_updated integer := 0;
    v_shared_updated integer := 0;
begin
    if v_uid is null then
        raise exception using
            errcode = '42501',
            message = 'Atlas subject deletion requires a signed-in account.';
    end if;

    if v_subject_id = '' then
        raise exception using
            errcode = '22023',
            message = 'Atlas subject deletion requires a subject id.';
    end if;

    if p_expected_revision is not null and p_expected_revision < 1 then
        raise exception using
            errcode = '22023',
            message = 'Atlas subject deletion requires a positive expected revision.';
    end if;

    select revision
    into v_current_revision
    from public.owned_subjects
    where owner_user_id = v_uid
      and id = v_subject_id
    for update;

    if not found then
        return jsonb_build_object(
            'ok', true,
            'deleted', false,
            'reason', 'not-found'
        );
    end if;

    if p_expected_revision is not null
       and v_current_revision <> p_expected_revision then
        return jsonb_build_object(
            'ok', false,
            'deleted', false,
            'conflict', true,
            'actualRevision', v_current_revision
        );
    end if;

    update public.learner_sessions learner
    set
        subject_refs = (
            select coalesce(
                jsonb_agg(entry.ref order by entry.ord),
                '[]'::jsonb
            )
            from jsonb_array_elements(
                case
                    when jsonb_typeof(learner.subject_refs) = 'array'
                        then learner.subject_refs
                    else '[]'::jsonb
                end
            ) with ordinality as entry(ref, ord)
            where not (
                entry.ref->>'kind' = 'my-subject'
                and entry.ref->>'id' = v_subject_id
            )
        ),
        revision = learner.revision + 1,
        updated_at = now()
    where learner.owner_user_id = v_uid
      and exists (
          select 1
          from jsonb_array_elements(
              case
                  when jsonb_typeof(learner.subject_refs) = 'array'
                      then learner.subject_refs
                  else '[]'::jsonb
              end
          ) ref
          where ref->>'kind' = 'my-subject'
            and ref->>'id' = v_subject_id
      );

    get diagnostics v_learners_updated = row_count;

    update public.shared_continuity_state shared
    set
        subject_refs = (
            select coalesce(
                jsonb_agg(entry.ref order by entry.ord),
                '[]'::jsonb
            )
            from jsonb_array_elements(
                case
                    when jsonb_typeof(shared.subject_refs) = 'array'
                        then shared.subject_refs
                    else '[]'::jsonb
                end
            ) with ordinality as entry(ref, ord)
            where not (
                entry.ref->>'kind' = 'my-subject'
                and entry.ref->>'id' = v_subject_id
            )
        ),
        revision = shared.revision + 1,
        updated_at = now()
    where shared.owner_user_id = v_uid
      and exists (
          select 1
          from jsonb_array_elements(
              case
                  when jsonb_typeof(shared.subject_refs) = 'array'
                      then shared.subject_refs
                  else '[]'::jsonb
              end
          ) ref
          where ref->>'kind' = 'my-subject'
            and ref->>'id' = v_subject_id
      );

    get diagnostics v_shared_updated = row_count;

    update public.subject_library_state library_row
    set
        state = jsonb_set(
            jsonb_set(
                coalesce(library_row.state, '{}'::jsonb),
                '{order}',
                (
                    select coalesce(
                        jsonb_agg(entry.item order by entry.ord),
                        '[]'::jsonb
                    )
                    from jsonb_array_elements(
                        case
                            when jsonb_typeof(library_row.state->'order') = 'array'
                                then library_row.state->'order'
                            else '[]'::jsonb
                        end
                    ) with ordinality as entry(item, ord)
                    where entry.item <> to_jsonb(v_subject_id)
                ),
                true
            ),
            '{library}',
            coalesce(library_row.state->'library', '{}'::jsonb)
                || jsonb_build_object(
                    'subjects',
                    coalesce(
                        library_row.state->'library'->'subjects',
                        '{}'::jsonb
                    ) - v_subject_id
                ),
            true
        ),
        revision = library_row.revision + 1,
        updated_at = now()
    where library_row.owner_user_id = v_uid
      and (
          coalesce(library_row.state->'library'->'subjects', '{}'::jsonb)
              ? v_subject_id
          or exists (
              select 1
              from jsonb_array_elements(
                  case
                      when jsonb_typeof(library_row.state->'order') = 'array'
                          then library_row.state->'order'
                      else '[]'::jsonb
                  end
              ) item
              where item = to_jsonb(v_subject_id)
          )
      );

    get diagnostics v_library_updated = row_count;

    delete from public.owned_subjects
    where owner_user_id = v_uid
      and id = v_subject_id;

    get diagnostics v_deleted_count = row_count;

    if v_deleted_count <> 1 then
        raise exception using
            errcode = 'P0001',
            message = 'Atlas could not complete subject deletion safely.';
    end if;

    return jsonb_build_object(
        'ok', true,
        'deleted', true,
        'cleaned', jsonb_build_object(
            'learnerSessions', v_learners_updated,
            'shared', v_shared_updated,
            'library', v_library_updated
        )
    );
end;
$$;

revoke all on function public.atlas_delete_owned_subject_v1(text, integer)
    from public;
revoke all on function public.atlas_delete_owned_subject_v1(text, integer)
    from anon;
grant execute on function public.atlas_delete_owned_subject_v1(text, integer)
    to authenticated;
