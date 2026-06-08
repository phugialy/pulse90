-- Pulse90 lineup storage for last-used formation and matchday XI data.
-- Run after 002_group_scoring_engine.sql when lineup imports are ready.

create table if not exists public.team_lineups (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  fixture_id uuid references public.fixtures(id) on delete set null,
  formation text not null,
  lineup_type text not null default 'last_used'
    check (lineup_type in ('last_used', 'confirmed', 'projected')),
  source_name text,
  source_url text,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, fixture_id, lineup_type)
);

create table if not exists public.team_lineup_players (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.team_lineups(id) on delete cascade,
  player_id uuid references public.players(id) on delete set null,
  player_name text not null,
  shirt_number int,
  position_code text not null,
  lineup_role text not null check (lineup_role in ('starter', 'bench', 'reserve')),
  sort_order int not null default 0,
  x numeric(4, 3),
  y numeric(4, 3),
  created_at timestamptz not null default now(),
  unique (lineup_id, lineup_role, sort_order)
);

create index if not exists team_lineups_team_latest_idx
  on public.team_lineups (team_id, lineup_type, source_updated_at desc);

create index if not exists team_lineup_players_lineup_idx
  on public.team_lineup_players (lineup_id, lineup_role, sort_order);

drop trigger if exists set_team_lineups_updated_at on public.team_lineups;
create trigger set_team_lineups_updated_at before update on public.team_lineups
for each row execute function public.set_updated_at();

alter table public.team_lineups enable row level security;
alter table public.team_lineup_players enable row level security;

grant select on public.team_lineups, public.team_lineup_players to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'team_lineups'
      and policyname = 'public_read'
  ) then
    create policy public_read on public.team_lineups
      for select to anon, authenticated using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'team_lineup_players'
      and policyname = 'public_read'
  ) then
    create policy public_read on public.team_lineup_players
      for select to anon, authenticated using (true);
  end if;
end;
$$;

drop view if exists public.latest_team_lineups_view;

create view public.latest_team_lineups_view with (security_invoker = true) as
select distinct on (lineup.team_id)
  lineup.id,
  lineup.tournament_id,
  lineup.team_id,
  lineup.fixture_id,
  lineup.formation,
  lineup.lineup_type,
  lineup.source_name,
  lineup.source_url,
  lineup.source_updated_at
from public.team_lineups lineup
where lineup.lineup_type in ('last_used', 'confirmed')
order by lineup.team_id, lineup.source_updated_at desc nulls last, lineup.created_at desc;

grant select on public.latest_team_lineups_view to anon, authenticated;
