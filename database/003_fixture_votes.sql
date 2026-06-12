create table if not exists public.fixture_votes (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  picked_team_id uuid references public.teams(id),
  voter_session text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists fixture_votes_session_fixture_idx
  on public.fixture_votes (fixture_id, voter_session);

create index if not exists fixture_votes_fixture_idx
  on public.fixture_votes (fixture_id);

alter table public.fixture_votes enable row level security;

create policy "anyone can read votes"
  on public.fixture_votes for select
  to anon, authenticated
  using (true);

create policy "anyone can vote"
  on public.fixture_votes for insert
  to anon, authenticated
  with check (true);

grant select, insert on public.fixture_votes to anon, authenticated;
