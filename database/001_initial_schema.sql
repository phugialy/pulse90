-- Pulse90 initial Supabase/Postgres schema
-- Apply this in the Supabase SQL editor or through a migration once the project is connected.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.tournaments (
  id uuid primary key default gen_random_uuid(),
  fifa_id text,
  name text not null,
  slug text not null unique,
  year int not null,
  host_countries text[] not null default '{}',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  team_count int not null,
  group_count int not null,
  matches_count int not null,
  group_stage_advancement text,
  status text not null check (status in ('scheduled', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  fifa_code text not null,
  slug text not null,
  name text not null,
  short_name text not null,
  country text not null,
  confederation text not null,
  flag_url text,
  badge_url text,
  group_code text,
  current_rank int,
  coach text,
  captain text,
  qualification_path text,
  identity text,
  status text not null check (status in ('qualified', 'active', 'in_danger', 'eliminated', 'champion')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, fifa_code),
  unique (tournament_id, slug)
);

create table if not exists public.team_history (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  team_code text not null,
  tournament_id uuid references public.tournaments(id) on delete set null,
  appearances int not null default 0,
  best_finish text,
  titles int not null default 0,
  finals int not null default 0,
  last_appearance_year int,
  summary text,
  notable_moments jsonb not null default '[]'::jsonb,
  rivalries text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  name text not null,
  slug text not null,
  host_city text not null,
  region text,
  country text not null,
  timezone text not null,
  latitude numeric(9, 6) not null,
  longitude numeric(9, 6) not null,
  capacity int,
  hero_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, slug)
);

create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  match_number int not null,
  stage text not null check (
    stage in ('group', 'round_of_32', 'round_of_16', 'quarter_final', 'semi_final', 'third_place', 'final')
  ),
  group_code text,
  venue_id uuid not null references public.venues(id),
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  home_placeholder text,
  away_placeholder text,
  starts_at timestamptz not null,
  status text not null check (status in ('scheduled', 'live', 'completed', 'postponed', 'cancelled')),
  minute int,
  home_score int,
  away_score int,
  home_penalty_score int,
  away_penalty_score int,
  winner_team_id uuid references public.teams(id),
  importance_score int not null default 50 check (importance_score between 0 and 100),
  importance_reason text,
  stakes text,
  implication text,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, match_number)
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  slug text not null,
  position text not null,
  shirt_number int,
  birth_date date,
  club text,
  image_url text,
  status text not null check (status in ('squad', 'injured', 'suspended', 'withdrawn')),
  is_key_player boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tournament_id, team_id, slug)
);

create table if not exists public.standings (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  group_code text not null,
  played int not null default 0,
  won int not null default 0,
  drawn int not null default 0,
  lost int not null default 0,
  goals_for int not null default 0,
  goals_against int not null default 0,
  goal_difference int not null default 0,
  points int not null default 0,
  rank int,
  qualification_status text,
  updated_at timestamptz not null default now(),
  unique (tournament_id, team_id)
);

create table if not exists public.match_events (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  team_id uuid references public.teams(id),
  player_id uuid references public.players(id),
  event_type text not null,
  minute int,
  stoppage_minute int,
  title text not null,
  description text,
  importance int not null default 1 check (importance between 1 and 5),
  created_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  fixture_id uuid references public.fixtures(id) on delete cascade,
  prediction_type text not null,
  subject_type text not null,
  subject_id uuid,
  predicted_team_id uuid references public.teams(id),
  predicted_player_id uuid references public.players(id),
  probability numeric(5, 4) check (probability >= 0 and probability <= 1),
  label text not null,
  rationale text,
  movement_label text,
  movement_value numeric(6, 3),
  model_version text,
  source text not null check (source in ('editorial', 'model', 'community')),
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.updates (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  update_type text not null,
  title text not null,
  summary text not null,
  impact text,
  before_data jsonb,
  after_data jsonb,
  source_url text,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  source_name text not null,
  source_url text not null,
  payload_hash text not null,
  payload jsonb not null,
  imported_at timestamptz not null default now(),
  unique (source_name, payload_hash)
);

create table if not exists public.job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  status text not null check (status in ('running', 'success', 'failed', 'skipped')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms int,
  records_read int,
  records_changed int,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists tournaments_year_idx on public.tournaments (year);
create index if not exists tournaments_status_idx on public.tournaments (status);
create index if not exists teams_tournament_idx on public.teams (tournament_id);
create index if not exists teams_group_idx on public.teams (tournament_id, group_code);
create index if not exists team_history_team_code_idx on public.team_history (team_code);
create index if not exists team_history_tournament_idx on public.team_history (tournament_id);
create index if not exists venues_tournament_idx on public.venues (tournament_id);
create index if not exists venues_city_idx on public.venues (host_city);
create index if not exists fixtures_tournament_idx on public.fixtures (tournament_id);
create index if not exists fixtures_start_idx on public.fixtures (starts_at);
create index if not exists fixtures_stage_idx on public.fixtures (tournament_id, stage);
create index if not exists fixtures_status_start_idx on public.fixtures (status, starts_at);
create index if not exists fixtures_venue_start_idx on public.fixtures (venue_id, starts_at);
create index if not exists fixtures_home_team_idx on public.fixtures (home_team_id);
create index if not exists fixtures_away_team_idx on public.fixtures (away_team_id);
create index if not exists fixtures_importance_idx on public.fixtures (tournament_id, status, importance_score desc);
create index if not exists players_team_idx on public.players (team_id);
create index if not exists players_tournament_idx on public.players (tournament_id);
create index if not exists players_key_idx on public.players (team_id, is_key_player);
create index if not exists standings_group_rank_idx on public.standings (tournament_id, group_code, rank);
create index if not exists standings_team_idx on public.standings (team_id);
create index if not exists match_events_fixture_idx on public.match_events (fixture_id);
create index if not exists match_events_fixture_minute_idx on public.match_events (fixture_id, minute);
create index if not exists match_events_importance_idx on public.match_events (importance);
create index if not exists predictions_tournament_idx on public.predictions (tournament_id);
create index if not exists predictions_fixture_idx on public.predictions (fixture_id);
create index if not exists predictions_type_idx on public.predictions (prediction_type);
create index if not exists predictions_valid_idx on public.predictions (valid_from, valid_until);
create index if not exists updates_tournament_time_idx on public.updates (tournament_id, published_at desc);
create index if not exists updates_entity_idx on public.updates (entity_type, entity_id);
create index if not exists source_snapshots_tournament_source_idx on public.source_snapshots (tournament_id, source_name);
create index if not exists source_snapshots_imported_at_idx on public.source_snapshots (imported_at desc);
create index if not exists job_runs_name_started_idx on public.job_runs (job_name, started_at desc);
create index if not exists job_runs_status_idx on public.job_runs (status);

drop trigger if exists set_tournaments_updated_at on public.tournaments;
create trigger set_tournaments_updated_at before update on public.tournaments
for each row execute function public.set_updated_at();

drop trigger if exists set_teams_updated_at on public.teams;
create trigger set_teams_updated_at before update on public.teams
for each row execute function public.set_updated_at();

drop trigger if exists set_venues_updated_at on public.venues;
create trigger set_venues_updated_at before update on public.venues
for each row execute function public.set_updated_at();

drop trigger if exists set_fixtures_updated_at on public.fixtures;
create trigger set_fixtures_updated_at before update on public.fixtures
for each row execute function public.set_updated_at();

drop trigger if exists set_players_updated_at on public.players;
create trigger set_players_updated_at before update on public.players
for each row execute function public.set_updated_at();

alter table public.tournaments enable row level security;
alter table public.teams enable row level security;
alter table public.team_history enable row level security;
alter table public.venues enable row level security;
alter table public.fixtures enable row level security;
alter table public.players enable row level security;
alter table public.standings enable row level security;
alter table public.match_events enable row level security;
alter table public.predictions enable row level security;
alter table public.updates enable row level security;
alter table public.source_snapshots enable row level security;
alter table public.job_runs enable row level security;

grant usage on schema public to anon, authenticated;
grant select on
  public.tournaments,
  public.teams,
  public.team_history,
  public.venues,
  public.fixtures,
  public.players,
  public.standings,
  public.match_events,
  public.predictions,
  public.updates
to anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'tournaments',
    'teams',
    'team_history',
    'venues',
    'fixtures',
    'players',
    'standings',
    'match_events',
    'predictions',
    'updates'
  ]
  loop
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'public_read'
    ) then
      execute format(
        'create policy public_read on public.%I for select to anon, authenticated using (true)',
        table_name
      );
    end if;
  end loop;
end;
$$;

drop view if exists public.team_path_view;
drop view if exists public.fixture_cards_view;

create view public.fixture_cards_view with (security_invoker = true) as
select
  f.id,
  f.match_number,
  f.status,
  f.minute,
  f.starts_at,
  f.stage,
  f.group_code,
  f.home_score,
  f.away_score,
  f.importance_score,
  f.importance_reason,
  f.stakes,
  f.implication,
  ht.name as home_team,
  ht.slug as home_team_slug,
  at.name as away_team,
  at.slug as away_team_slug,
  v.name as venue,
  v.host_city,
  v.timezone,
  t.slug as tournament_slug
from public.fixtures f
join public.tournaments t on t.id = f.tournament_id
join public.venues v on v.id = f.venue_id
left join public.teams ht on ht.id = f.home_team_id
left join public.teams at on at.id = f.away_team_id;

create view public.team_path_view with (security_invoker = true) as
select
  team.id,
  team.slug,
  team.name,
  team.group_code,
  team.status,
  team.identity,
  team.coach,
  team.captain,
  standing.rank,
  standing.points,
  standing.qualification_status,
  next_fixture.match_number as next_match_number,
  next_fixture.starts_at as next_match_starts_at,
  case
    when next_fixture.home_team_id = team.id then away_team.name
    else home_team.name
  end as next_opponent
from public.teams team
left join public.standings standing on standing.team_id = team.id
left join lateral (
  select fixture.*
  from public.fixtures fixture
  where fixture.tournament_id = team.tournament_id
    and fixture.status in ('scheduled', 'live')
    and (fixture.home_team_id = team.id or fixture.away_team_id = team.id)
  order by fixture.starts_at asc
  limit 1
) next_fixture on true
left join public.teams home_team on home_team.id = next_fixture.home_team_id
left join public.teams away_team on away_team.id = next_fixture.away_team_id;

grant select on public.fixture_cards_view, public.team_path_view to anon, authenticated;

insert into public.tournaments (
  id, fifa_id, name, slug, year, host_countries, starts_at, ends_at,
  team_count, group_count, matches_count, group_stage_advancement, status
) values (
  '00000000-0000-4000-8000-000000002026',
  'fifa-world-cup-2026',
  '2026 FIFA World Cup',
  'world-cup-2026',
  2026,
  array['Canada', 'Mexico', 'United States'],
  '2026-06-11T00:00:00Z',
  '2026-07-19T00:00:00Z',
  48,
  12,
  104,
  'Top two from each group plus best third-place teams advance',
  'scheduled'
) on conflict (slug) do update set
  year = excluded.year,
  team_count = excluded.team_count,
  group_count = excluded.group_count,
  matches_count = excluded.matches_count,
  updated_at = now();

insert into public.venues (
  id, tournament_id, name, slug, host_city, region, country, timezone, latitude, longitude, capacity
) values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000002026', 'AT&T Stadium', 'att-stadium', 'Dallas', 'Texas', 'United States', 'America/Chicago', 32.747300, -97.094500, 80000),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000002026', 'Lumen Field', 'lumen-field', 'Seattle', 'Washington', 'United States', 'America/Los_Angeles', 47.595200, -122.331600, 68740),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000002026', 'Estadio Azteca', 'estadio-azteca', 'Mexico City', 'CDMX', 'Mexico', 'America/Mexico_City', 19.302900, -99.150400, 87523),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000002026', 'Hard Rock Stadium', 'hard-rock-stadium', 'Miami', 'Florida', 'United States', 'America/New_York', 25.958000, -80.238900, 64767),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000002026', 'SoFi Stadium', 'sofi-stadium', 'Los Angeles', 'California', 'United States', 'America/Los_Angeles', 33.953500, -118.339200, 70240),
  ('10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000002026', 'BMO Field', 'bmo-field', 'Toronto', 'Ontario', 'Canada', 'America/Toronto', 43.633200, -79.418600, 45000)
on conflict (tournament_id, slug) do update set
  name = excluded.name,
  host_city = excluded.host_city,
  updated_at = now();

insert into public.teams (
  id, tournament_id, fifa_code, slug, name, short_name, country, confederation,
  group_code, coach, captain, identity, status
) values
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000002026', 'JPN', 'japan', 'Japan', 'Japan', 'Japan', 'AFC', 'F', 'Hajime Moriyasu', 'Wataru Endo', 'Press-resistant, quick wide breaks, dangerous when the game gets stretched.', 'active'),
  ('20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000002026', 'GER', 'germany', 'Germany', 'Germany', 'Germany', 'UEFA', 'F', 'Julian Nagelsmann', 'Joshua Kimmich', 'High control, high pressure, and vulnerable when transitions hit behind them.', 'in_danger'),
  ('20000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000002026', 'TUN', 'tunisia', 'Tunisia', 'Tunisia', 'Tunisia', 'CAF', 'F', 'TBD', 'TBD', 'Compact and difficult when they can protect a lead.', 'active'),
  ('20000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000002026', 'SWE', 'sweden', 'Sweden', 'Sweden', 'Sweden', 'UEFA', 'F', 'TBD', 'TBD', 'Structured, physical, and built for tight group games.', 'active'),
  ('20000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000002026', 'MEX', 'mexico', 'Mexico', 'Mexico', 'Mexico', 'CONCACAF', 'A', 'TBD', 'TBD', 'Host pressure and transition urgency define the current path.', 'active'),
  ('20000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000002026', 'CAN', 'canada', 'Canada', 'Canada', 'Canada', 'CONCACAF', 'A', 'TBD', 'TBD', 'Direct running and underdog urgency.', 'active'),
  ('20000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000002026', 'BRA', 'brazil', 'Brazil', 'Brazil', 'Brazil', 'CONMEBOL', 'C', 'TBD', 'TBD', 'Star power with a bracket-control target.', 'qualified'),
  ('20000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000002026', 'MAR', 'morocco', 'Morocco', 'Morocco', 'Morocco', 'CAF', 'C', 'Walid Regragui', 'Achraf Hakimi', 'Compact, emotional, and lethal when they can attack into open space.', 'active'),
  ('20000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000002026', 'USA', 'usa', 'USA', 'USA', 'United States', 'CONCACAF', 'D', 'Mauricio Pochettino', 'Christian Pulisic', 'Athletic, direct, and dangerous when the midfield wins second balls.', 'active'),
  ('20000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000002026', 'KOR', 'korea-republic', 'Korea Republic', 'Korea', 'Korea Republic', 'AFC', 'D', 'TBD', 'TBD', 'Fast, technical, and capable of punishing loose possession.', 'active'),
  ('20000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000002026', 'ARG', 'argentina', 'Argentina', 'Argentina', 'Argentina', 'CONMEBOL', 'H', 'TBD', 'TBD', 'Tournament control with high expectations.', 'qualified'),
  ('20000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000002026', 'DEN', 'denmark', 'Denmark', 'Denmark', 'Denmark', 'UEFA', 'H', 'TBD', 'TBD', 'Organized pressure with a dangerous midfield.', 'active')
on conflict (tournament_id, fifa_code) do update set
  slug = excluded.slug,
  name = excluded.name,
  group_code = excluded.group_code,
  coach = excluded.coach,
  captain = excluded.captain,
  identity = excluded.identity,
  status = excluded.status,
  updated_at = now();

insert into public.fixtures (
  id, tournament_id, match_number, stage, group_code, venue_id, home_team_id, away_team_id,
  starts_at, status, minute, home_score, away_score, importance_score, importance_reason, stakes, implication
) values
  ('30000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000002026', 31, 'group', 'F', '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', '2026-06-17T20:00:00Z', 'live', 78, 1, 1, 96, 'Highest stakes: elimination swing', 'Germany need a win to avoid depending on the other match.', 'If Japan win, they control the group. A draw leaves Germany scoreboard watching.'),
  ('30000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000002026', 32, 'group', 'F', '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000004', '2026-06-17T20:00:00Z', 'live', 73, 2, 1, 88, 'Upset in progress', 'Tunisia are five minutes from flipping the group path.', 'A Tunisia win makes Germany''s result even more dangerous.'),
  ('30000000-0000-4000-8000-000000000018', '00000000-0000-4000-8000-000000002026', 18, 'group', 'A', '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000006', '2026-06-17T19:00:00Z', 'live', 66, 0, 0, 74, 'Host pressure', 'Mexico qualify with a win, but a draw leaves the door open.', 'Canada can turn the final group day into chaos if they steal this.'),
  ('30000000-0000-4000-8000-000000000036', '00000000-0000-4000-8000-000000002026', 36, 'group', 'C', '10000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000008', '2026-06-18T18:00:00Z', 'scheduled', null, null, null, 82, 'Group control', 'Brazil can lock the group. Morocco need at least a draw to keep control.', 'If Morocco lose, their final match becomes a must-win.'),
  ('30000000-0000-4000-8000-000000000037', '00000000-0000-4000-8000-000000002026', 37, 'group', 'D', '10000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000010', '2026-06-18T21:00:00Z', 'scheduled', null, null, null, 86, 'Qualification chance', 'USA qualify with a win and avoid a harder bracket path.', 'A draw keeps both alive but settles nothing.'),
  ('30000000-0000-4000-8000-000000000038', '00000000-0000-4000-8000-000000002026', 38, 'group', 'H', '10000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000011', '20000000-0000-4000-8000-000000000012', '2026-06-19T00:00:00Z', 'scheduled', null, null, null, 91, 'Top spot pressure', 'Denmark need a result. Argentina can lock first place.', 'A Denmark win changes the Round of 32 side of the bracket.')
on conflict (tournament_id, match_number) do update set
  status = excluded.status,
  minute = excluded.minute,
  home_score = excluded.home_score,
  away_score = excluded.away_score,
  importance_score = excluded.importance_score,
  importance_reason = excluded.importance_reason,
  stakes = excluded.stakes,
  implication = excluded.implication,
  updated_at = now();

insert into public.standings (
  tournament_id, team_id, group_code, played, won, drawn, lost, goals_for, goals_against, goal_difference, points, rank, qualification_status
) values
  ('00000000-0000-4000-8000-000000002026', '20000000-0000-4000-8000-000000000001', 'F', 2, 1, 1, 0, 3, 1, 2, 4, 1, 'alive'),
  ('00000000-0000-4000-8000-000000002026', '20000000-0000-4000-8000-000000000003', 'F', 2, 1, 1, 0, 3, 2, 1, 4, 2, 'alive'),
  ('00000000-0000-4000-8000-000000002026', '20000000-0000-4000-8000-000000000002', 'F', 2, 0, 2, 0, 2, 2, 0, 2, 3, 'in_danger'),
  ('00000000-0000-4000-8000-000000002026', '20000000-0000-4000-8000-000000000004', 'F', 2, 0, 1, 1, 1, 4, -3, 1, 4, 'in_danger')
on conflict (tournament_id, team_id) do update set
  played = excluded.played,
  points = excluded.points,
  rank = excluded.rank,
  qualification_status = excluded.qualification_status,
  updated_at = now();

insert into public.updates (
  tournament_id, entity_type, update_type, title, summary, impact, published_at
) values
  ('00000000-0000-4000-8000-000000002026', 'team', 'qualified', 'Portugal are through', 'Their late winner moved them out of the Group B danger zone.', 'Locks one Round of 32 slot', now() - interval '2 hours'),
  ('00000000-0000-4000-8000-000000002026', 'standing', 'group_flip', 'Group E got messy', 'Three teams can still finish first after yesterday''s draw.', 'Tomorrow''s early window matters more', now() - interval '90 minutes'),
  ('00000000-0000-4000-8000-000000002026', 'prediction', 'movement', 'Argentina down 7%', 'Harder bracket path after Denmark''s result.', 'Winner confidence moved from 18% to 11%', now() - interval '45 minutes'),
  ('00000000-0000-4000-8000-000000002026', 'team', 'elimination_watch', 'Germany are walking the edge', 'A draw keeps them alive, but they need help from Tunisia-Sweden.', 'Live command center priority', now() - interval '20 minutes')
on conflict do nothing;

insert into public.predictions (
  tournament_id, prediction_type, subject_type, predicted_team_id, label, rationale, movement_label, movement_value, source
) values
  ('00000000-0000-4000-8000-000000002026', 'winner', 'team', '20000000-0000-4000-8000-000000000007', 'Brazil', 'Bracket path improved after the current group state.', '+4%', 0.04, 'editorial'),
  ('00000000-0000-4000-8000-000000002026', 'dark_horse', 'team', '20000000-0000-4000-8000-000000000001', 'Japan', 'Still dangerous, but a draw keeps pressure high.', '-3%', -0.03, 'editorial')
on conflict do nothing;
