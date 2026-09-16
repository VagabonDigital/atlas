-- Atlas Backup v3 safe restore boundary.
--
-- Restore is an authenticated, transaction-scoped merge. It never deletes
-- account data and never overwrites an existing stable identity. Callers must
-- preview first; apply aborts when any conflict exists.
--
-- My Subject ids are account-owned identities. The original global primary key
-- prevented a portable backup from being reconstructed into another account
-- while the source account still existed. Make the key account-scoped, matching
-- the rest of Atlas' ownership model and existing RLS boundary.

alter table public.owned_subjects
    drop constraint if exists owned_subjects_pkey;

alter table public.owned_subjects
    add constraint owned_subjects_pkey
    primary key (owner_user_id, id);

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
    v_inserted_learners integer := 0;
    v_inserted_learner_continuity integer := 0;
    v_inserted_subjects integer := 0;
    v_inserted_versions integer := 0;
    v_inserted_library integer := 0;
    v_inserted_shared integer := 0;
    v_inserted_curation integer := 0;
    v_inserted_personalization integer := 0;
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

    select coalesce(jsonb_agg(jsonb_build_object('surface', 'learner', 'id', target.id, 'reason', 'stable id already exists') order by target.id), '[]'::jsonb)
    into v_more
    from public.learner_sessions target
    where target.owner_user_id = v_uid
      and exists (select 1 from jsonb_array_elements(v_data->'learners') item where item->>'id' = target.id);
    v_conflicts := v_conflicts || v_more;

    select coalesce(jsonb_agg(jsonb_build_object('surface', 'learner-continuity', 'id', target.session_id, 'reason', 'stable id already exists') order by target.session_id), '[]'::jsonb)
    into v_more
    from public.learner_continuity_state target
    where target.owner_user_id = v_uid
      and exists (select 1 from jsonb_array_elements(v_data->'learnerContinuity') item where item->>'sessionId' = target.session_id);
    v_conflicts := v_conflicts || v_more;

    select coalesce(jsonb_agg(jsonb_build_object('surface', 'my-subject', 'id', target.id, 'reason', 'stable id already exists') order by target.id), '[]'::jsonb)
    into v_more
    from public.owned_subjects target
    where target.owner_user_id = v_uid
      and exists (select 1 from jsonb_array_elements(v_data#>'{mySubjects,subjects}') item where item->>'id' = target.id);
    v_conflicts := v_conflicts || v_more;

    select coalesce(jsonb_agg(jsonb_build_object('surface', 'my-version', 'id', target.content_id, 'reason', 'stable id already exists') order by target.content_id), '[]'::jsonb)
    into v_more
    from public.tutor_content_versions target
    where target.owner_user_id = v_uid
      and exists (select 1 from jsonb_array_elements(v_data->'myVersions') item where item->>'contentId' = target.content_id);
    v_conflicts := v_conflicts || v_more;

    if v_data#>'{mySubjects,library}' is not null
       and jsonb_typeof(v_data#>'{mySubjects,library}') <> 'null'
       and exists (select 1 from public.subject_library_state where owner_user_id = v_uid) then
        v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object('surface', 'my-subjects-library', 'id', 'account', 'reason', 'account library already exists'));
    end if;

    v_shared_present :=
        (v_data#>'{shared,continuity}' is not null and jsonb_typeof(v_data#>'{shared,continuity}') <> 'null')
        or coalesce(jsonb_array_length(case when jsonb_typeof(v_data#>'{shared,subjectRefs}') = 'array' then v_data#>'{shared,subjectRefs}' else '[]'::jsonb end), 0) > 0
        or coalesce((v_data#>>'{shared,subjectRefsMigrated}')::boolean, false);

    if v_shared_present and exists (select 1 from public.shared_continuity_state where owner_user_id = v_uid) then
        v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object('surface', 'shared', 'id', 'default', 'reason', 'Shared continuity already exists'));
    end if;

    if v_data->'originalCuration' is not null
       and jsonb_typeof(v_data->'originalCuration') <> 'null'
       and exists (select 1 from public.original_curation_state where owner_user_id = v_uid) then
        v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object('surface', 'original-curation', 'id', 'account', 'reason', 'curation state already exists'));
    end if;

    if v_data->'hubPersonalization' is not null
       and jsonb_typeof(v_data->'hubPersonalization') <> 'null'
       and exists (select 1 from public.hub_personalization_state where owner_user_id = v_uid) then
        v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object('surface', 'hub-personalization', 'id', 'account', 'reason', 'hub personalization already exists'));
    end if;

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
                'library', case when v_data#>'{mySubjects,library}' is not null and jsonb_typeof(v_data#>'{mySubjects,library}') <> 'null' then 1 else 0 end,
                'shared', case when v_shared_present then 1 else 0 end,
                'originalCuration', case when v_data->'originalCuration' is not null and jsonb_typeof(v_data->'originalCuration') <> 'null' then 1 else 0 end,
                'hubPersonalization', case when v_data->'hubPersonalization' is not null and jsonb_typeof(v_data->'hubPersonalization') <> 'null' then 1 else 0 end
            )
        );
    end if;

    if v_conflict_count > 0 then
        raise exception using errcode = '23505', message = format('Atlas restore found %s existing stable identities. No data was changed.', v_conflict_count);
    end if;

    insert into public.learner_sessions (owner_user_id,id,schema_version,name,revision,memory,created_at,updated_at,last_active_at,subject_refs,subject_refs_migrated)
    select v_uid,item->>'id',greatest(1,coalesce((item->>'schemaVersion')::integer,1)),item->>'name',greatest(1,coalesce((item->>'revision')::integer,1)),coalesce(item->'memory','{}'::jsonb),to_timestamp(coalesce((item->>'createdAt')::double precision,0)/1000.0),to_timestamp(coalesce((item->>'updatedAt')::double precision,0)/1000.0),to_timestamp(coalesce((item->>'lastActiveAt')::double precision,0)/1000.0),case when jsonb_typeof(item->'subjectRefs')='array' then item->'subjectRefs' else '[]'::jsonb end,coalesce((item->>'subjectRefsMigrated')::boolean,false)
    from jsonb_array_elements(v_data->'learners') item;
    get diagnostics v_inserted_learners = row_count;

    insert into public.owned_subjects (owner_user_id,id,schema_version,format,metadata,document,revision,provenance,created_at,updated_at)
    select v_uid,item->>'id',greatest(1,coalesce((item->>'schemaVersion')::integer,1)),coalesce(nullif(item->>'format',''),'structured'),coalesce(item->'metadata','{}'::jsonb),coalesce(item->'document','{}'::jsonb),greatest(1,coalesce((item->>'revision')::integer,1)),item->'provenance',to_timestamp(coalesce((item->>'createdAt')::double precision,0)/1000.0),to_timestamp(coalesce((item->>'updatedAt')::double precision,0)/1000.0)
    from jsonb_array_elements(v_data#>'{mySubjects,subjects}') item;
    get diagnostics v_inserted_subjects = row_count;

    insert into public.learner_continuity_state (owner_user_id,session_id,schema_version,revision,state,created_at,updated_at)
    select v_uid,item->>'sessionId',greatest(1,coalesce((item->>'schemaVersion')::integer,1)),greatest(1,coalesce((item->>'revision')::integer,1)),coalesce(item->'state','{}'::jsonb),to_timestamp(coalesce((item->>'createdAt')::double precision,0)/1000.0),to_timestamp(coalesce((item->>'updatedAt')::double precision,0)/1000.0)
    from jsonb_array_elements(v_data->'learnerContinuity') item;
    get diagnostics v_inserted_learner_continuity = row_count;

    insert into public.tutor_content_versions (owner_user_id,content_id,schema_version,base_content_version,revision,overrides,document,created_at,updated_at)
    select v_uid,item->>'contentId',greatest(1,coalesce((item->>'schemaVersion')::integer,2)),coalesce(item->>'baseContentVersion',''),greatest(0,coalesce((item->>'revision')::integer,0)),coalesce(item->'overrides','{}'::jsonb),coalesce(item->'document','{}'::jsonb),to_timestamp(coalesce((item->>'updatedAt')::double precision,0)/1000.0),to_timestamp(coalesce((item->>'updatedAt')::double precision,0)/1000.0)
    from jsonb_array_elements(v_data->'myVersions') item;
    get diagnostics v_inserted_versions = row_count;

    if v_data#>'{mySubjects,library}' is not null and jsonb_typeof(v_data#>'{mySubjects,library}') <> 'null' then
        insert into public.subject_library_state (owner_user_id,schema_version,revision,state,created_at,updated_at)
        values (v_uid,greatest(1,coalesce((v_data#>>'{mySubjects,library,schemaVersion}')::integer,1)),greatest(1,coalesce((v_data#>>'{mySubjects,library,revision}')::integer,1)),coalesce(v_data#>'{mySubjects,library,state}','{}'::jsonb),to_timestamp(coalesce((v_data#>>'{mySubjects,library,createdAt}')::double precision,0)/1000.0),to_timestamp(coalesce((v_data#>>'{mySubjects,library,updatedAt}')::double precision,0)/1000.0));
        v_inserted_library := 1;
    end if;

    if v_shared_present then
        insert into public.shared_continuity_state (owner_user_id,schema_version,revision,state,created_at,updated_at,subject_refs,subject_refs_migrated)
        values (v_uid,greatest(1,coalesce((v_data#>>'{shared,continuity,schemaVersion}')::integer,1)),greatest(1,coalesce((v_data#>>'{shared,continuity,revision}')::integer,1)),coalesce(v_data#>'{shared,continuity,state}','{"handoffs":{},"ledgerEntries":{},"schemaVersion":1,"sessionStates":{},"recentActivity":[],"languageReviewCompletedThrough":-1}'::jsonb),to_timestamp(coalesce((v_data#>>'{shared,continuity,createdAt}')::double precision,extract(epoch from now())*1000)/1000.0),to_timestamp(coalesce((v_data#>>'{shared,continuity,updatedAt}')::double precision,extract(epoch from now())*1000)/1000.0),case when jsonb_typeof(v_data#>'{shared,subjectRefs}')='array' then v_data#>'{shared,subjectRefs}' else '[]'::jsonb end,coalesce((v_data#>>'{shared,subjectRefsMigrated}')::boolean,false));
        v_inserted_shared := 1;
    end if;

    if v_data->'originalCuration' is not null and jsonb_typeof(v_data->'originalCuration') <> 'null' then
        insert into public.original_curation_state (owner_user_id,schema_version,revision,state,created_at,updated_at)
        values (v_uid,greatest(1,coalesce((v_data#>>'{originalCuration,schemaVersion}')::integer,2)),greatest(1,coalesce((v_data#>>'{originalCuration,revision}')::integer,1)),coalesce(v_data#>'{originalCuration,state}','{}'::jsonb),to_timestamp(coalesce((v_data#>>'{originalCuration,createdAt}')::double precision,0)/1000.0),to_timestamp(coalesce((v_data#>>'{originalCuration,updatedAt}')::double precision,0)/1000.0));
        v_inserted_curation := 1;
    end if;

    if v_data->'hubPersonalization' is not null and jsonb_typeof(v_data->'hubPersonalization') <> 'null' then
        insert into public.hub_personalization_state (owner_user_id,schema_version,revision,state,created_at,updated_at)
        values (v_uid,greatest(1,coalesce((v_data#>>'{hubPersonalization,schemaVersion}')::integer,1)),greatest(1,coalesce((v_data#>>'{hubPersonalization,revision}')::integer,1)),coalesce(v_data#>'{hubPersonalization,state}','{}'::jsonb),to_timestamp(coalesce((v_data#>>'{hubPersonalization,createdAt}')::double precision,0)/1000.0),to_timestamp(coalesce((v_data#>>'{hubPersonalization,updatedAt}')::double precision,0)/1000.0));
        v_inserted_personalization := 1;
    end if;

    return jsonb_build_object('ok',true,'mode','apply','conflictCount',0,'conflicts','[]'::jsonb,'inserted',jsonb_build_object('learners',v_inserted_learners,'learnerContinuity',v_inserted_learner_continuity,'mySubjects',v_inserted_subjects,'myVersions',v_inserted_versions,'library',v_inserted_library,'shared',v_inserted_shared,'originalCuration',v_inserted_curation,'hubPersonalization',v_inserted_personalization));
end;
$$;

revoke all on function public.atlas_restore_v3(jsonb, boolean) from public;
revoke all on function public.atlas_restore_v3(jsonb, boolean) from anon;
grant execute on function public.atlas_restore_v3(jsonb, boolean) to authenticated;
