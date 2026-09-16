-- Atlas Backup v3 non-empty destination merge semantics.
--
-- Restore remains an authenticated, transaction-scoped import.
-- Stable entity identities (learners, learner continuity, My Subjects,
-- My Versions) are still strict conflicts. Account-level singleton state is
-- merged additively with destination values taking precedence on overlap,
-- so existing account work/preferences are never overwritten or deleted.

create or replace function public.atlas_restore_v3(
    p_backup jsonb,
    p_apply boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
    v_uid uuid := auth.uid();
    v_data jsonb;
    v_conflicts jsonb := '[]'::jsonb;
    v_more jsonb := '[]'::jsonb;
    v_conflict_count integer := 0;
    v_shared_present boolean := false;

    v_source_library jsonb;
    v_dest_library jsonb;
    v_merged_library jsonb;
    v_merged_order jsonb;
    v_merged_categories jsonb;
    v_merged_category_order jsonb;

    v_source_shared_state jsonb;
    v_dest_shared_state jsonb;
    v_merged_shared_state jsonb;
    v_merged_shared_refs jsonb;
    v_merged_recent jsonb;

    v_source_curation jsonb;
    v_dest_curation jsonb;
    v_merged_curation jsonb;
    v_merged_curation_order jsonb;

    v_source_personalization jsonb;
    v_dest_personalization jsonb;
    v_merged_personalization jsonb;
    v_merged_favorites jsonb;

    v_existing_library boolean := false;
    v_existing_shared boolean := false;
    v_existing_curation boolean := false;
    v_existing_personalization boolean := false;

    v_inserted_learners integer := 0;
    v_inserted_learner_continuity integer := 0;
    v_inserted_subjects integer := 0;
    v_inserted_versions integer := 0;
    v_inserted_library integer := 0;
    v_inserted_shared integer := 0;
    v_inserted_curation integer := 0;
    v_inserted_personalization integer := 0;
    v_merged_library_count integer := 0;
    v_merged_shared_count integer := 0;
    v_merged_curation_count integer := 0;
    v_merged_personalization_count integer := 0;
begin
    if v_uid is null then
        raise exception using
            errcode = '42501',
            message = 'Atlas restore requires a signed-in account.';
    end if;

    if jsonb_typeof(p_backup) <> 'object'
       or p_backup->>'format' <> 'atlas-backup'
       or coalesce((p_backup->>'version')::integer, 0) <> 3
       or jsonb_typeof(p_backup->'data') <> 'object' then
        raise exception using
            errcode = '22023',
            message = 'Atlas restore requires a valid Backup v3 package.';
    end if;

    v_data := p_backup->'data';

    if jsonb_typeof(v_data->'learners') <> 'array'
       or jsonb_typeof(v_data->'learnerContinuity') <> 'array'
       or jsonb_typeof(v_data->'shared') <> 'object'
       or jsonb_typeof(v_data->'mySubjects') <> 'object'
       or jsonb_typeof(v_data#>'{mySubjects,subjects}') <> 'array'
       or jsonb_typeof(v_data->'myVersions') <> 'array'
       or jsonb_typeof(v_data->'workspace') <> 'object' then
        raise exception using
            errcode = '22023',
            message = 'Atlas Backup v3 data is incomplete.';
    end if;

    if exists (
        select 1
        from jsonb_array_elements(v_data->'learnerContinuity') continuity
        where not exists (
            select 1
            from jsonb_array_elements(v_data->'learners') learner
            where learner->>'id' = continuity->>'sessionId'
        )
    ) then
        raise exception using
            errcode = '22023',
            message = 'Atlas Backup v3 contains orphan learner continuity.';
    end if;

    if exists (
        select 1
        from jsonb_array_elements(v_data->'learners') learner
        cross join lateral jsonb_array_elements(
            case
                when jsonb_typeof(learner->'subjectRefs') = 'array'
                    then learner->'subjectRefs'
                else '[]'::jsonb
            end
        ) ref
        where ref->>'kind' = 'my-subject'
          and not exists (
              select 1
              from jsonb_array_elements(v_data#>'{mySubjects,subjects}') subject
              where subject->>'id' = ref->>'id'
          )
    ) then
        raise exception using
            errcode = '22023',
            message = 'Atlas Backup v3 contains a learner reference to a missing My Subject.';
    end if;

    if exists (
        select 1
        from jsonb_array_elements(
            case
                when jsonb_typeof(v_data#>'{shared,subjectRefs}') = 'array'
                    then v_data#>'{shared,subjectRefs}'
                else '[]'::jsonb
            end
        ) ref
        where ref->>'kind' = 'my-subject'
          and not exists (
              select 1
              from jsonb_array_elements(v_data#>'{mySubjects,subjects}') subject
              where subject->>'id' = ref->>'id'
          )
    ) then
        raise exception using
            errcode = '22023',
            message = 'Atlas Backup v3 contains a Shared reference to a missing My Subject.';
    end if;

    -- Strict stable-identity conflicts. These are the only durable blockers.
    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'surface', 'learner',
                'id', target.id,
                'reason', 'stable id already exists'
            ) order by target.id
        ),
        '[]'::jsonb
    )
    into v_more
    from public.learner_sessions target
    where target.owner_user_id = v_uid
      and exists (
          select 1
          from jsonb_array_elements(v_data->'learners') item
          where item->>'id' = target.id
      );
    v_conflicts := v_conflicts || v_more;

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'surface', 'learner-continuity',
                'id', target.session_id,
                'reason', 'stable id already exists'
            ) order by target.session_id
        ),
        '[]'::jsonb
    )
    into v_more
    from public.learner_continuity_state target
    where target.owner_user_id = v_uid
      and exists (
          select 1
          from jsonb_array_elements(v_data->'learnerContinuity') item
          where item->>'sessionId' = target.session_id
      );
    v_conflicts := v_conflicts || v_more;

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'surface', 'my-subject',
                'id', target.id,
                'reason', 'stable id already exists'
            ) order by target.id
        ),
        '[]'::jsonb
    )
    into v_more
    from public.owned_subjects target
    where target.owner_user_id = v_uid
      and exists (
          select 1
          from jsonb_array_elements(v_data#>'{mySubjects,subjects}') item
          where item->>'id' = target.id
      );
    v_conflicts := v_conflicts || v_more;

    select coalesce(
        jsonb_agg(
            jsonb_build_object(
                'surface', 'my-version',
                'id', target.content_id,
                'reason', 'stable id already exists'
            ) order by target.content_id
        ),
        '[]'::jsonb
    )
    into v_more
    from public.tutor_content_versions target
    where target.owner_user_id = v_uid
      and exists (
          select 1
          from jsonb_array_elements(v_data->'myVersions') item
          where item->>'contentId' = target.content_id
      );
    v_conflicts := v_conflicts || v_more;

    -- My Subjects library is a singleton row, but its categories have stable ids.
    -- A same-id/different-name custom category is ambiguous and remains explicit.
    v_source_library := v_data#>'{mySubjects,library,state}';
    select state
    into v_dest_library
    from public.subject_library_state
    where owner_user_id = v_uid;
    v_existing_library := found;

    if v_source_library is not null
       and jsonb_typeof(v_source_library) = 'object'
       and v_existing_library then
        select coalesce(
            jsonb_agg(
                jsonb_build_object(
                    'surface', 'my-subject-category',
                    'id', source_category->>'id',
                    'reason', 'category id already exists with a different name'
                ) order by source_category->>'id'
            ),
            '[]'::jsonb
        )
        into v_more
        from jsonb_array_elements(
            case
                when jsonb_typeof(v_source_library#>'{library,categories}') = 'array'
                    then v_source_library#>'{library,categories}'
                else '[]'::jsonb
            end
        ) source_category
        join jsonb_array_elements(
            case
                when jsonb_typeof(v_dest_library#>'{library,categories}') = 'array'
                    then v_dest_library#>'{library,categories}'
                else '[]'::jsonb
            end
        ) dest_category
          on dest_category->>'id' = source_category->>'id'
        where coalesce(dest_category->>'name', '') <> coalesce(source_category->>'name', '');

        v_conflicts := v_conflicts || v_more;
    end if;

    v_shared_present :=
        (v_data#>'{shared,continuity}' is not null
            and jsonb_typeof(v_data#>'{shared,continuity}') <> 'null')
        or coalesce(
            jsonb_array_length(
                case
                    when jsonb_typeof(v_data#>'{shared,subjectRefs}') = 'array'
                        then v_data#>'{shared,subjectRefs}'
                    else '[]'::jsonb
                end
            ),
            0
        ) > 0
        or coalesce((v_data#>>'{shared,subjectRefsMigrated}')::boolean, false);

    select exists(
        select 1
        from public.shared_continuity_state
        where owner_user_id = v_uid
    ) into v_existing_shared;

    select exists(
        select 1
        from public.original_curation_state
        where owner_user_id = v_uid
    ) into v_existing_curation;

    select exists(
        select 1
        from public.hub_personalization_state
        where owner_user_id = v_uid
    ) into v_existing_personalization;

    v_conflict_count := jsonb_array_length(v_conflicts);

    if not p_apply then
        return jsonb_build_object(
            'ok', true,
            'mode', 'preview',
            'conflictCount', v_conflict_count,
            'conflicts', v_conflicts,
            'wouldInsert', jsonb_build_object(
                'learners', jsonb_array_length(v_data->'learners'),
                'learnerContinuity', jsonb_array_length(v_data->'learnerContinuity'),
                'mySubjects', jsonb_array_length(v_data#>'{mySubjects,subjects}'),
                'myVersions', jsonb_array_length(v_data->'myVersions'),
                'library', case
                    when v_source_library is not null
                         and jsonb_typeof(v_source_library) = 'object'
                         and not v_existing_library then 1 else 0 end,
                'shared', case
                    when v_shared_present and not v_existing_shared then 1 else 0 end,
                'originalCuration', case
                    when v_data->'originalCuration' is not null
                         and jsonb_typeof(v_data->'originalCuration') <> 'null'
                         and not v_existing_curation then 1 else 0 end,
                'hubPersonalization', case
                    when v_data->'hubPersonalization' is not null
                         and jsonb_typeof(v_data->'hubPersonalization') <> 'null'
                         and not v_existing_personalization then 1 else 0 end
            ),
            'wouldMerge', jsonb_build_object(
                'library', case
                    when v_source_library is not null
                         and jsonb_typeof(v_source_library) = 'object'
                         and v_existing_library then 1 else 0 end,
                'shared', case
                    when v_shared_present and v_existing_shared then 1 else 0 end,
                'originalCuration', case
                    when v_data->'originalCuration' is not null
                         and jsonb_typeof(v_data->'originalCuration') <> 'null'
                         and v_existing_curation then 1 else 0 end,
                'hubPersonalization', case
                    when v_data->'hubPersonalization' is not null
                         and jsonb_typeof(v_data->'hubPersonalization') <> 'null'
                         and v_existing_personalization then 1 else 0 end
            ),
            'mergePolicy', 'destination-preserving'
        );
    end if;

    if v_conflict_count > 0 then
        raise exception using
            errcode = '23505',
            message = format(
                'Atlas restore found %s existing stable identities. No data was changed.',
                v_conflict_count
            );
    end if;

    insert into public.learner_sessions (
        owner_user_id, id, schema_version, name, revision, memory,
        created_at, updated_at, last_active_at, subject_refs, subject_refs_migrated
    )
    select
        v_uid,
        item->>'id',
        greatest(1, coalesce((item->>'schemaVersion')::integer, 1)),
        item->>'name',
        greatest(1, coalesce((item->>'revision')::integer, 1)),
        coalesce(item->'memory', '{}'::jsonb),
        to_timestamp(coalesce((item->>'createdAt')::double precision, 0) / 1000.0),
        to_timestamp(coalesce((item->>'updatedAt')::double precision, 0) / 1000.0),
        to_timestamp(coalesce((item->>'lastActiveAt')::double precision, 0) / 1000.0),
        case when jsonb_typeof(item->'subjectRefs') = 'array'
            then item->'subjectRefs' else '[]'::jsonb end,
        coalesce((item->>'subjectRefsMigrated')::boolean, false)
    from jsonb_array_elements(v_data->'learners') item;
    get diagnostics v_inserted_learners = row_count;

    insert into public.owned_subjects (
        owner_user_id, id, schema_version, format, metadata, document,
        revision, provenance, created_at, updated_at
    )
    select
        v_uid,
        item->>'id',
        greatest(1, coalesce((item->>'schemaVersion')::integer, 1)),
        coalesce(nullif(item->>'format', ''), 'structured'),
        coalesce(item->'metadata', '{}'::jsonb),
        coalesce(item->'document', '{}'::jsonb),
        greatest(1, coalesce((item->>'revision')::integer, 1)),
        item->'provenance',
        to_timestamp(coalesce((item->>'createdAt')::double precision, 0) / 1000.0),
        to_timestamp(coalesce((item->>'updatedAt')::double precision, 0) / 1000.0)
    from jsonb_array_elements(v_data#>'{mySubjects,subjects}') item;
    get diagnostics v_inserted_subjects = row_count;

    insert into public.learner_continuity_state (
        owner_user_id, session_id, schema_version, revision, state, created_at, updated_at
    )
    select
        v_uid,
        item->>'sessionId',
        greatest(1, coalesce((item->>'schemaVersion')::integer, 1)),
        greatest(1, coalesce((item->>'revision')::integer, 1)),
        coalesce(item->'state', '{}'::jsonb),
        to_timestamp(coalesce((item->>'createdAt')::double precision, 0) / 1000.0),
        to_timestamp(coalesce((item->>'updatedAt')::double precision, 0) / 1000.0)
    from jsonb_array_elements(v_data->'learnerContinuity') item;
    get diagnostics v_inserted_learner_continuity = row_count;

    insert into public.tutor_content_versions (
        owner_user_id, content_id, schema_version, base_content_version,
        revision, overrides, document, created_at, updated_at
    )
    select
        v_uid,
        item->>'contentId',
        greatest(1, coalesce((item->>'schemaVersion')::integer, 2)),
        coalesce(item->>'baseContentVersion', ''),
        greatest(0, coalesce((item->>'revision')::integer, 0)),
        coalesce(item->'overrides', '{}'::jsonb),
        coalesce(item->'document', '{}'::jsonb),
        to_timestamp(coalesce((item->>'updatedAt')::double precision, 0) / 1000.0),
        to_timestamp(coalesce((item->>'updatedAt')::double precision, 0) / 1000.0)
    from jsonb_array_elements(v_data->'myVersions') item;
    get diagnostics v_inserted_versions = row_count;

    -- Merge My Subjects library: destination ordering/categories/placement win
    -- on overlap; all source-only subjects/categories are appended.
    if v_source_library is not null and jsonb_typeof(v_source_library) = 'object' then
        if not v_existing_library then
            insert into public.subject_library_state (
                owner_user_id, schema_version, revision, state, created_at, updated_at
            )
            values (
                v_uid,
                greatest(1, coalesce((v_data#>>'{mySubjects,library,schemaVersion}')::integer, 1)),
                greatest(1, coalesce((v_data#>>'{mySubjects,library,revision}')::integer, 1)),
                v_source_library,
                to_timestamp(coalesce((v_data#>>'{mySubjects,library,createdAt}')::double precision, 0) / 1000.0),
                to_timestamp(coalesce((v_data#>>'{mySubjects,library,updatedAt}')::double precision, 0) / 1000.0)
            );
            v_inserted_library := 1;
        else
            select coalesce(jsonb_agg(item order by group_no, ord), '[]'::jsonb)
            into v_merged_order
            from (
                select item, 0 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_dest_library->'order') = 'array'
                        then v_dest_library->'order' else '[]'::jsonb end
                ) with ordinality as d(item, ord)
                union all
                select item, 1 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_source_library->'order') = 'array'
                        then v_source_library->'order' else '[]'::jsonb end
                ) with ordinality as s(item, ord)
                where not exists (
                    select 1
                    from jsonb_array_elements(
                        case when jsonb_typeof(v_dest_library->'order') = 'array'
                            then v_dest_library->'order' else '[]'::jsonb end
                    ) d2
                    where d2 = s.item
                )
            ) merged;

            select coalesce(jsonb_agg(item order by group_no, ord), '[]'::jsonb)
            into v_merged_categories
            from (
                select item, 0 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_dest_library#>'{library,categories}') = 'array'
                        then v_dest_library#>'{library,categories}' else '[]'::jsonb end
                ) with ordinality as d(item, ord)
                union all
                select item, 1 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_source_library#>'{library,categories}') = 'array'
                        then v_source_library#>'{library,categories}' else '[]'::jsonb end
                ) with ordinality as s(item, ord)
                where not exists (
                    select 1
                    from jsonb_array_elements(
                        case when jsonb_typeof(v_dest_library#>'{library,categories}') = 'array'
                            then v_dest_library#>'{library,categories}' else '[]'::jsonb end
                    ) d2
                    where d2->>'id' = s.item->>'id'
                )
            ) merged;

            select coalesce(jsonb_agg(item order by group_no, ord), '[]'::jsonb)
            into v_merged_category_order
            from (
                select item, 0 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_dest_library#>'{library,categoryOrder}') = 'array'
                        then v_dest_library#>'{library,categoryOrder}' else '[]'::jsonb end
                ) with ordinality as d(item, ord)
                union all
                select item, 1 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_source_library#>'{library,categoryOrder}') = 'array'
                        then v_source_library#>'{library,categoryOrder}' else '[]'::jsonb end
                ) with ordinality as s(item, ord)
                where not exists (
                    select 1
                    from jsonb_array_elements(
                        case when jsonb_typeof(v_dest_library#>'{library,categoryOrder}') = 'array'
                            then v_dest_library#>'{library,categoryOrder}' else '[]'::jsonb end
                    ) d2
                    where d2 = s.item
                )
            ) merged;

            v_merged_library := jsonb_build_object(
                'order', v_merged_order,
                'library', jsonb_build_object(
                    'schemaVersion', greatest(
                        1,
                        coalesce((v_dest_library#>>'{library,schemaVersion}')::integer, 1),
                        coalesce((v_source_library#>>'{library,schemaVersion}')::integer, 1)
                    ),
                    'defaultCategoryId', coalesce(
                        nullif(v_dest_library#>>'{library,defaultCategoryId}', ''),
                        nullif(v_source_library#>>'{library,defaultCategoryId}', ''),
                        'default'
                    ),
                    'categories', v_merged_categories,
                    'categoryOrder', v_merged_category_order,
                    'subjects',
                        coalesce(v_source_library#>'{library,subjects}', '{}'::jsonb)
                        || coalesce(v_dest_library#>'{library,subjects}', '{}'::jsonb)
                )
            );

            update public.subject_library_state
            set schema_version = greatest(
                    schema_version,
                    coalesce((v_data#>>'{mySubjects,library,schemaVersion}')::integer, 1)
                ),
                revision = revision + 1,
                state = v_merged_library,
                updated_at = now()
            where owner_user_id = v_uid;
            v_merged_library_count := 1;
        end if;
    end if;

    -- Merge Shared continuity. Existing destination entries win on the same
    -- registry/ledger/handoff key; source-only entries are imported.
    if v_shared_present then
        v_source_shared_state := coalesce(
            v_data#>'{shared,continuity,state}',
            '{"handoffs":{},"ledgerEntries":{},"schemaVersion":1,"sessionStates":{},"recentActivity":[],"languageReviewCompletedThrough":-1}'::jsonb
        );

        if not v_existing_shared then
            insert into public.shared_continuity_state (
                owner_user_id, schema_version, revision, state, created_at, updated_at,
                subject_refs, subject_refs_migrated
            )
            values (
                v_uid,
                greatest(1, coalesce((v_data#>>'{shared,continuity,schemaVersion}')::integer, 1)),
                greatest(1, coalesce((v_data#>>'{shared,continuity,revision}')::integer, 1)),
                v_source_shared_state,
                to_timestamp(coalesce((v_data#>>'{shared,continuity,createdAt}')::double precision, extract(epoch from now()) * 1000) / 1000.0),
                to_timestamp(coalesce((v_data#>>'{shared,continuity,updatedAt}')::double precision, extract(epoch from now()) * 1000) / 1000.0),
                case when jsonb_typeof(v_data#>'{shared,subjectRefs}') = 'array'
                    then v_data#>'{shared,subjectRefs}' else '[]'::jsonb end,
                coalesce((v_data#>>'{shared,subjectRefsMigrated}')::boolean, false)
            );
            v_inserted_shared := 1;
        else
            select state
            into v_dest_shared_state
            from public.shared_continuity_state
            where owner_user_id = v_uid;

            select coalesce(jsonb_agg(item order by ts desc), '[]'::jsonb)
            into v_merged_recent
            from (
                select distinct item,
                    coalesce((item->>'timestamp')::bigint, 0) as ts
                from jsonb_array_elements(
                    (case when jsonb_typeof(v_dest_shared_state->'recentActivity') = 'array'
                        then v_dest_shared_state->'recentActivity' else '[]'::jsonb end)
                    ||
                    (case when jsonb_typeof(v_source_shared_state->'recentActivity') = 'array'
                        then v_source_shared_state->'recentActivity' else '[]'::jsonb end)
                ) item
                order by ts desc
                limit 50
            ) recent;

            v_merged_shared_state := jsonb_build_object(
                'schemaVersion', greatest(
                    1,
                    coalesce((v_dest_shared_state->>'schemaVersion')::integer, 1),
                    coalesce((v_source_shared_state->>'schemaVersion')::integer, 1)
                ),
                'sessionStates',
                    coalesce(v_source_shared_state->'sessionStates', '{}'::jsonb)
                    || coalesce(v_dest_shared_state->'sessionStates', '{}'::jsonb),
                'ledgerEntries',
                    coalesce(v_source_shared_state->'ledgerEntries', '{}'::jsonb)
                    || coalesce(v_dest_shared_state->'ledgerEntries', '{}'::jsonb),
                'handoffs',
                    coalesce(v_source_shared_state->'handoffs', '{}'::jsonb)
                    || coalesce(v_dest_shared_state->'handoffs', '{}'::jsonb),
                'recentActivity', v_merged_recent,
                'languageReviewCompletedThrough', greatest(
                    coalesce((v_source_shared_state->>'languageReviewCompletedThrough')::bigint, -1),
                    coalesce((v_dest_shared_state->>'languageReviewCompletedThrough')::bigint, -1)
                )
            );

            select coalesce(jsonb_agg(item order by group_no, ord), '[]'::jsonb)
            into v_merged_shared_refs
            from (
                select item, 0 as group_no, ord
                from public.shared_continuity_state current_row,
                jsonb_array_elements(
                    case when jsonb_typeof(current_row.subject_refs) = 'array'
                        then current_row.subject_refs else '[]'::jsonb end
                ) with ordinality as d(item, ord)
                where current_row.owner_user_id = v_uid
                union all
                select item, 1 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_data#>'{shared,subjectRefs}') = 'array'
                        then v_data#>'{shared,subjectRefs}' else '[]'::jsonb end
                ) with ordinality as s(item, ord)
                where not exists (
                    select 1
                    from public.shared_continuity_state current_row,
                    jsonb_array_elements(
                        case when jsonb_typeof(current_row.subject_refs) = 'array'
                            then current_row.subject_refs else '[]'::jsonb end
                    ) d2
                    where current_row.owner_user_id = v_uid
                      and d2 = s.item
                )
            ) merged;

            update public.shared_continuity_state
            set schema_version = greatest(
                    schema_version,
                    coalesce((v_data#>>'{shared,continuity,schemaVersion}')::integer, 1)
                ),
                revision = revision + 1,
                state = v_merged_shared_state,
                subject_refs = v_merged_shared_refs,
                subject_refs_migrated = subject_refs_migrated
                    or coalesce((v_data#>>'{shared,subjectRefsMigrated}')::boolean, false),
                updated_at = now()
            where owner_user_id = v_uid;
            v_merged_shared_count := 1;
        end if;
    end if;

    -- Merge Atlas Original curation. Destination item state and destination
    -- ordering win on overlap; source-only items/order entries are appended.
    if v_data->'originalCuration' is not null
       and jsonb_typeof(v_data->'originalCuration') <> 'null' then
        v_source_curation := coalesce(v_data#>'{originalCuration,state}', '{}'::jsonb);

        if not v_existing_curation then
            insert into public.original_curation_state (
                owner_user_id, schema_version, revision, state, created_at, updated_at
            )
            values (
                v_uid,
                greatest(1, coalesce((v_data#>>'{originalCuration,schemaVersion}')::integer, 2)),
                greatest(1, coalesce((v_data#>>'{originalCuration,revision}')::integer, 1)),
                v_source_curation,
                to_timestamp(coalesce((v_data#>>'{originalCuration,createdAt}')::double precision, 0) / 1000.0),
                to_timestamp(coalesce((v_data#>>'{originalCuration,updatedAt}')::double precision, 0) / 1000.0)
            );
            v_inserted_curation := 1;
        else
            select state
            into v_dest_curation
            from public.original_curation_state
            where owner_user_id = v_uid;

            select coalesce(jsonb_agg(item order by group_no, ord), '[]'::jsonb)
            into v_merged_curation_order
            from (
                select item, 0 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_dest_curation->'order') = 'array'
                        then v_dest_curation->'order' else '[]'::jsonb end
                ) with ordinality as d(item, ord)
                union all
                select item, 1 as group_no, ord
                from jsonb_array_elements(
                    case when jsonb_typeof(v_source_curation->'order') = 'array'
                        then v_source_curation->'order' else '[]'::jsonb end
                ) with ordinality as s(item, ord)
                where not exists (
                    select 1
                    from jsonb_array_elements(
                        case when jsonb_typeof(v_dest_curation->'order') = 'array'
                            then v_dest_curation->'order' else '[]'::jsonb end
                    ) d2
                    where d2 = s.item
                )
            ) merged;

            v_merged_curation := jsonb_build_object(
                'schemaVersion', greatest(
                    2,
                    coalesce((v_dest_curation->>'schemaVersion')::integer, 2),
                    coalesce((v_source_curation->>'schemaVersion')::integer, 2)
                ),
                'items',
                    coalesce(v_source_curation->'items', '{}'::jsonb)
                    || coalesce(v_dest_curation->'items', '{}'::jsonb),
                'order', v_merged_curation_order
            );

            update public.original_curation_state
            set schema_version = greatest(
                    schema_version,
                    coalesce((v_data#>>'{originalCuration,schemaVersion}')::integer, 2)
                ),
                revision = revision + 1,
                state = v_merged_curation,
                updated_at = now()
            where owner_user_id = v_uid;
            v_merged_curation_count := 1;
        end if;
    end if;

    -- Merge Hub personalization. Destination image wins for a session id.
    -- Favourites stay destination-first, source-only additions fill up to 12.
    if v_data->'hubPersonalization' is not null
       and jsonb_typeof(v_data->'hubPersonalization') <> 'null' then
        v_source_personalization := coalesce(v_data#>'{hubPersonalization,state}', '{}'::jsonb);

        if not v_existing_personalization then
            insert into public.hub_personalization_state (
                owner_user_id, schema_version, revision, state, created_at, updated_at
            )
            values (
                v_uid,
                greatest(1, coalesce((v_data#>>'{hubPersonalization,schemaVersion}')::integer, 1)),
                greatest(1, coalesce((v_data#>>'{hubPersonalization,revision}')::integer, 1)),
                v_source_personalization,
                to_timestamp(coalesce((v_data#>>'{hubPersonalization,createdAt}')::double precision, 0) / 1000.0),
                to_timestamp(coalesce((v_data#>>'{hubPersonalization,updatedAt}')::double precision, 0) / 1000.0)
            );
            v_inserted_personalization := 1;
        else
            select state
            into v_dest_personalization
            from public.hub_personalization_state
            where owner_user_id = v_uid;

            select coalesce(jsonb_agg(item order by group_no, ord), '[]'::jsonb)
            into v_merged_favorites
            from (
                select item, group_no, ord
                from (
                    select item, 0 as group_no, ord
                    from jsonb_array_elements(
                        case when jsonb_typeof(v_dest_personalization->'favoriteImages') = 'array'
                            then v_dest_personalization->'favoriteImages' else '[]'::jsonb end
                    ) with ordinality as d(item, ord)
                    union all
                    select item, 1 as group_no, ord
                    from jsonb_array_elements(
                        case when jsonb_typeof(v_source_personalization->'favoriteImages') = 'array'
                            then v_source_personalization->'favoriteImages' else '[]'::jsonb end
                    ) with ordinality as s(item, ord)
                    where not exists (
                        select 1
                        from jsonb_array_elements(
                            case when jsonb_typeof(v_dest_personalization->'favoriteImages') = 'array'
                                then v_dest_personalization->'favoriteImages' else '[]'::jsonb end
                        ) d2
                        where d2 = s.item
                    )
                ) all_favorites
                order by group_no, ord
                limit 12
            ) merged;

            v_merged_personalization := jsonb_build_object(
                'schemaVersion', greatest(
                    1,
                    coalesce((v_dest_personalization->>'schemaVersion')::integer, 1),
                    coalesce((v_source_personalization->>'schemaVersion')::integer, 1)
                ),
                'sessionImages',
                    coalesce(v_source_personalization->'sessionImages', '{}'::jsonb)
                    || coalesce(v_dest_personalization->'sessionImages', '{}'::jsonb),
                'favoriteImages', v_merged_favorites
            );

            update public.hub_personalization_state
            set schema_version = greatest(
                    schema_version,
                    coalesce((v_data#>>'{hubPersonalization,schemaVersion}')::integer, 1)
                ),
                revision = revision + 1,
                state = v_merged_personalization,
                updated_at = now()
            where owner_user_id = v_uid;
            v_merged_personalization_count := 1;
        end if;
    end if;

    return jsonb_build_object(
        'ok', true,
        'mode', 'apply',
        'conflictCount', 0,
        'conflicts', '[]'::jsonb,
        'inserted', jsonb_build_object(
            'learners', v_inserted_learners,
            'learnerContinuity', v_inserted_learner_continuity,
            'mySubjects', v_inserted_subjects,
            'myVersions', v_inserted_versions,
            'library', v_inserted_library,
            'shared', v_inserted_shared,
            'originalCuration', v_inserted_curation,
            'hubPersonalization', v_inserted_personalization
        ),
        'merged', jsonb_build_object(
            'library', v_merged_library_count,
            'shared', v_merged_shared_count,
            'originalCuration', v_merged_curation_count,
            'hubPersonalization', v_merged_personalization_count
        ),
        'mergePolicy', 'destination-preserving'
    );
end;
$$;

revoke all on function public.atlas_restore_v3(jsonb, boolean) from public;
revoke all on function public.atlas_restore_v3(jsonb, boolean) from anon;
grant execute on function public.atlas_restore_v3(jsonb, boolean) to authenticated;
