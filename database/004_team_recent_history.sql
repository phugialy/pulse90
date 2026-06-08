-- Recent national-team history since Qatar 2022.
-- Source import stores one row per historical match and one row per goal scorer.
-- Note: public.team_recent_matches already exists as a per-team form table
-- from 002_group_scoring_engine.sql, so these raw source tables use distinct names.

drop table if exists public.team_recent_goals;

create table if not exists public.team_history_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.tournaments(id) on delete set null,
  source text not null,
  source_match_key text not null,
  match_date date not null,
  competition text not null,
  city text,
  country text,
  neutral boolean not null default false,
  home_team_name text not null,
  away_team_name text not null,
  home_team_id uuid references public.teams(id) on delete set null,
  away_team_id uuid references public.teams(id) on delete set null,
  home_score int not null,
  away_score int not null,
  imported_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, source_match_key)
);

create table if not exists public.team_history_goals (
  id uuid primary key default gen_random_uuid(),
  history_match_id uuid not null references public.team_history_matches(id) on delete cascade,
  tournament_id uuid references public.tournaments(id) on delete set null,
  source text not null,
  source_goal_key text not null,
  team_id uuid references public.teams(id) on delete set null,
  team_name text not null,
  scorer text not null,
  minute int,
  own_goal boolean not null default false,
  penalty boolean not null default false,
  imported_at timestamptz not null default now(),
  unique (source, source_goal_key)
);

create index if not exists team_history_matches_date_idx
  on public.team_history_matches (match_date desc);

create index if not exists team_history_matches_home_team_idx
  on public.team_history_matches (home_team_id, match_date desc);

create index if not exists team_history_matches_away_team_idx
  on public.team_history_matches (away_team_id, match_date desc);

create index if not exists team_history_matches_competition_idx
  on public.team_history_matches (competition, match_date desc);

create index if not exists team_history_goals_match_idx
  on public.team_history_goals (history_match_id, minute);

create index if not exists team_history_goals_team_idx
  on public.team_history_goals (team_id, scorer);

alter table public.team_history_matches enable row level security;
alter table public.team_history_goals enable row level security;

grant select on public.team_history_matches, public.team_history_goals to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'team_history_matches'
      and policyname = 'public_read'
  ) then
    create policy public_read on public.team_history_matches
      for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'team_history_goals'
      and policyname = 'public_read'
  ) then
    create policy public_read on public.team_history_goals
      for select using (true);
  end if;
end $$;
