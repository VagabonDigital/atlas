-- Two Keys only. All access is through the authenticated Atlas Worker.
-- No browser role may read state: it includes private puzzles and seat credentials.
create table public.two_keys_sessions (
  id uuid primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  revision bigint not null default 0,
  state jsonb not null check (jsonb_typeof(state) = 'object'),
  created_at timestamptz not null default clock_timestamp(),
  expires_at timestamptz not null default (clock_timestamp() + interval '6 hours')
);
create index two_keys_sessions_owner on public.two_keys_sessions(owner_user_id);
create index two_keys_sessions_expiry on public.two_keys_sessions(expires_at);
alter table public.two_keys_sessions enable row level security;
revoke all on public.two_keys_sessions from public, anon, authenticated;
grant all on public.two_keys_sessions to service_role;

create function public.two_keys_create(p_id uuid, p_owner uuid, p_state jsonb)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  -- Serialize per-owner creation to enforce the quota even across Worker isolates.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_owner::text, 0));
  delete from public.two_keys_sessions where expires_at <= clock_timestamp();
  if exists(select 1 from public.two_keys_sessions where id = p_id and owner_user_id = p_owner) then return; end if;
  if (select count(*) from public.two_keys_sessions where owner_user_id = p_owner) >= 20 then
    raise exception 'Session creation limit reached.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.two_keys_sessions where owner_user_id = p_owner and state->>'phase' <> 'finished') >= 3 then
    raise exception 'Finish an existing game before opening another.' using errcode = 'P0001';
  end if;
  insert into public.two_keys_sessions(id, owner_user_id, state) values(p_id, p_owner, p_state);
end $$;

create function public.two_keys_read(p_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select jsonb_build_object('owner', owner_user_id, 'revision', revision, 'state', state,
    'now', floor(extract(epoch from clock_timestamp()) * 1000))
  from public.two_keys_sessions where id = p_id and expires_at > clock_timestamp();
$$;

create function public.two_keys_commit(p_id uuid, p_revision bigint, p_state jsonb, p_deadline bigint default null)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
  update public.two_keys_sessions set state = p_state, revision = revision + 1
  where id = p_id and revision = p_revision and expires_at > clock_timestamp()
    and (p_deadline is null or floor(extract(epoch from clock_timestamp()) * 1000) < p_deadline);
  get diagnostics changed = row_count;
  return changed = 1;
end $$;

revoke all on function public.two_keys_create(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.two_keys_read(uuid) from public, anon, authenticated;
revoke all on function public.two_keys_commit(uuid, bigint, jsonb, bigint) from public, anon, authenticated;
grant execute on function public.two_keys_create(uuid, uuid, jsonb) to service_role;
grant execute on function public.two_keys_read(uuid) to service_role;
grant execute on function public.two_keys_commit(uuid, bigint, jsonb, bigint) to service_role;
