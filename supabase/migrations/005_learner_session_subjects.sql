-- ============================================================
-- Atlas Cloud Foundation — 005
-- Named learner Session Subjects continuity
-- ============================================================

alter table public.learner_sessions
    add column if not exists subject_refs jsonb
        not null
        default '[]'::jsonb;

alter table public.learner_sessions
    add column if not exists subject_refs_migrated boolean
        not null
        default false;

alter table public.learner_sessions
    drop constraint if exists learner_sessions_subject_refs_is_array;

alter table public.learner_sessions
    add constraint learner_sessions_subject_refs_is_array
        check (jsonb_typeof(subject_refs) = 'array');

-- Existing learner rows intentionally remain subject_refs_migrated = false.
-- The first legacy browser that still has named-learner Session Subjects
-- can safely claim those refs into the account. New learner rows created
-- after this migration are marked migrated by the application.

-- Verify
select
    column_name,
    data_type,
    is_nullable,
    column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'learner_sessions'
  and column_name in (
      'subject_refs',
      'subject_refs_migrated'
  )
order by ordinal_position;
