-- fixture_lineups: stores formation and starting XI per team per fixture
-- Run in Supabase SQL editor before using formation display on match pages

create table if not exists fixture_lineups (
  id          uuid primary key default gen_random_uuid(),
  fixture_id  uuid not null,
  team_id     uuid not null,
  formation   text,        -- e.g. '4-3-3'
  starting_xi text[],      -- player names in order (GK first)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(fixture_id, team_id)
);

create index if not exists fixture_lineups_fixture_idx on fixture_lineups(fixture_id);

alter table fixture_lineups enable row level security;

create policy "public_read_fixture_lineups" on fixture_lineups
  for select using (true);

-- Example insert (replace UUIDs with real fixture/team IDs):
-- insert into fixture_lineups (fixture_id, team_id, formation, starting_xi) values
--   ('...fixture-uuid...', '...team-uuid...', '4-3-3',
--    array['Pickford','Alexander-Arnold','Stones','Maguire','Shaw',
--          'Rice','Bellingham','Saka','Foden','Rashford','Kane']);
