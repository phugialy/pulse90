-- Pulse90 group-stage scoring engine
-- Run after 001_initial_schema.sql.

create extension if not exists pgcrypto;

alter table public.teams
  add column if not exists flag_emoji text,
  add column if not exists flag_asset_url text,
  add column if not exists primary_color text,
  add column if not exists secondary_color text;

update public.teams
set flag_emoji = case fifa_code
  when 'ALG' then '🇩🇿'
  when 'ARG' then '🇦🇷'
  when 'AUS' then '🇦🇺'
  when 'AUT' then '🇦🇹'
  when 'BEL' then '🇧🇪'
  when 'BIH' then '🇧🇦'
  when 'BRA' then '🇧🇷'
  when 'CAN' then '🇨🇦'
  when 'CIV' then '🇨🇮'
  when 'COD' then '🇨🇩'
  when 'COL' then '🇨🇴'
  when 'CPV' then '🇨🇻'
  when 'CRO' then '🇭🇷'
  when 'CUW' then '🇨🇼'
  when 'CZE' then '🇨🇿'
  when 'ECU' then '🇪🇨'
  when 'EGY' then '🇪🇬'
  when 'ENG' then '🏴'
  when 'ESP' then '🇪🇸'
  when 'FRA' then '🇫🇷'
  when 'GER' then '🇩🇪'
  when 'GHA' then '🇬🇭'
  when 'HAI' then '🇭🇹'
  when 'IRN' then '🇮🇷'
  when 'IRQ' then '🇮🇶'
  when 'JOR' then '🇯🇴'
  when 'JPN' then '🇯🇵'
  when 'KOR' then '🇰🇷'
  when 'KSA' then '🇸🇦'
  when 'MAR' then '🇲🇦'
  when 'MEX' then '🇲🇽'
  when 'NED' then '🇳🇱'
  when 'NOR' then '🇳🇴'
  when 'NZL' then '🇳🇿'
  when 'PAN' then '🇵🇦'
  when 'PAR' then '🇵🇾'
  when 'POR' then '🇵🇹'
  when 'QAT' then '🇶🇦'
  when 'RSA' then '🇿🇦'
  when 'SCO' then '🏴'
  when 'SEN' then '🇸🇳'
  when 'SUI' then '🇨🇭'
  when 'SWE' then '🇸🇪'
  when 'TUN' then '🇹🇳'
  when 'TUR' then '🇹🇷'
  when 'URU' then '🇺🇾'
  when 'USA' then '🇺🇸'
  when 'UZB' then '🇺🇿'
  else flag_emoji
end
where flag_emoji is null;

update public.teams
set flag_asset_url = case fifa_code
  when 'ALG' then 'https://flagcdn.com/w80/dz.png'
  when 'ARG' then 'https://flagcdn.com/w80/ar.png'
  when 'AUS' then 'https://flagcdn.com/w80/au.png'
  when 'AUT' then 'https://flagcdn.com/w80/at.png'
  when 'BEL' then 'https://flagcdn.com/w80/be.png'
  when 'BIH' then 'https://flagcdn.com/w80/ba.png'
  when 'BRA' then 'https://flagcdn.com/w80/br.png'
  when 'CAN' then 'https://flagcdn.com/w80/ca.png'
  when 'CIV' then 'https://flagcdn.com/w80/ci.png'
  when 'COD' then 'https://flagcdn.com/w80/cd.png'
  when 'COL' then 'https://flagcdn.com/w80/co.png'
  when 'CPV' then 'https://flagcdn.com/w80/cv.png'
  when 'CRO' then 'https://flagcdn.com/w80/hr.png'
  when 'CUW' then 'https://flagcdn.com/w80/cw.png'
  when 'CZE' then 'https://flagcdn.com/w80/cz.png'
  when 'ECU' then 'https://flagcdn.com/w80/ec.png'
  when 'EGY' then 'https://flagcdn.com/w80/eg.png'
  when 'ENG' then 'https://flagcdn.com/w80/gb-eng.png'
  when 'ESP' then 'https://flagcdn.com/w80/es.png'
  when 'FRA' then 'https://flagcdn.com/w80/fr.png'
  when 'GER' then 'https://flagcdn.com/w80/de.png'
  when 'GHA' then 'https://flagcdn.com/w80/gh.png'
  when 'HAI' then 'https://flagcdn.com/w80/ht.png'
  when 'IRN' then 'https://flagcdn.com/w80/ir.png'
  when 'IRQ' then 'https://flagcdn.com/w80/iq.png'
  when 'JOR' then 'https://flagcdn.com/w80/jo.png'
  when 'JPN' then 'https://flagcdn.com/w80/jp.png'
  when 'KOR' then 'https://flagcdn.com/w80/kr.png'
  when 'KSA' then 'https://flagcdn.com/w80/sa.png'
  when 'MAR' then 'https://flagcdn.com/w80/ma.png'
  when 'MEX' then 'https://flagcdn.com/w80/mx.png'
  when 'NED' then 'https://flagcdn.com/w80/nl.png'
  when 'NOR' then 'https://flagcdn.com/w80/no.png'
  when 'NZL' then 'https://flagcdn.com/w80/nz.png'
  when 'PAN' then 'https://flagcdn.com/w80/pa.png'
  when 'PAR' then 'https://flagcdn.com/w80/py.png'
  when 'POR' then 'https://flagcdn.com/w80/pt.png'
  when 'QAT' then 'https://flagcdn.com/w80/qa.png'
  when 'RSA' then 'https://flagcdn.com/w80/za.png'
  when 'SCO' then 'https://flagcdn.com/w80/gb-sct.png'
  when 'SEN' then 'https://flagcdn.com/w80/sn.png'
  when 'SUI' then 'https://flagcdn.com/w80/ch.png'
  when 'SWE' then 'https://flagcdn.com/w80/se.png'
  when 'TUN' then 'https://flagcdn.com/w80/tn.png'
  when 'TUR' then 'https://flagcdn.com/w80/tr.png'
  when 'URU' then 'https://flagcdn.com/w80/uy.png'
  when 'USA' then 'https://flagcdn.com/w80/us.png'
  when 'UZB' then 'https://flagcdn.com/w80/uz.png'
  else flag_asset_url
end
where flag_asset_url is null;

alter table public.players
  add column if not exists fifa_player_id text,
  add column if not exists known_as text,
  add column if not exists nationality text,
  add column if not exists height_cm int,
  add column if not exists preferred_foot text,
  add column if not exists roster_role text,
  add column if not exists source_url text,
  add column if not exists source_updated_at timestamptz;

alter table public.players
  drop constraint if exists players_status_check;

alter table public.players
  add constraint players_status_check
  check (status in ('squad', 'injured', 'suspended', 'withdrawn', 'replacement'));

create unique index if not exists players_fifa_player_idx
  on public.players (tournament_id, fifa_player_id)
  where fifa_player_id is not null;

alter table public.match_events
  add column if not exists source_event_id text,
  add column if not exists source_url text,
  add column if not exists source_updated_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists match_events_source_event_idx
  on public.match_events (fixture_id, source_event_id)
  where source_event_id is not null;

create table if not exists public.team_recent_matches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  opponent_name text not null,
  opponent_fifa_code text,
  played_at date not null,
  competition text not null,
  match_type text not null default 'competitive'
    check (match_type in ('competitive', 'friendly')),
  venue_context text not null default 'neutral'
    check (venue_context in ('home', 'away', 'neutral')),
  goals_for int not null check (goals_for >= 0),
  goals_against int not null check (goals_against >= 0),
  result text generated always as (
    case
      when goals_for > goals_against then 'W'
      when goals_for = goals_against then 'D'
      else 'L'
    end
  ) stored,
  importance_tier int not null default 2 check (importance_tier between 1 and 5),
  source_name text,
  source_url text,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, played_at, opponent_name, competition)
);

create index if not exists team_recent_matches_team_date_idx
  on public.team_recent_matches (team_id, played_at desc);

drop trigger if exists set_team_recent_matches_updated_at on public.team_recent_matches;
create trigger set_team_recent_matches_updated_at before update on public.team_recent_matches
for each row execute function public.set_updated_at();

alter table public.team_recent_matches enable row level security;

grant select on public.team_recent_matches to anon, authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'team_recent_matches'
      and policyname = 'public_read'
  ) then
    create policy public_read on public.team_recent_matches
      for select to anon, authenticated using (true);
  end if;
end;
$$;

create or replace function public.recalculate_group_standings(p_tournament_id uuid)
returns void
language plpgsql
as $$
begin
  with team_base as (
    select
      t.tournament_id,
      t.id as team_id,
      t.group_code,
      t.name
    from public.teams t
    where t.tournament_id = p_tournament_id
      and t.group_code is not null
  ),
  group_results as (
    select
      f.tournament_id,
      f.group_code,
      f.home_team_id as team_id,
      f.home_score as goals_for,
      f.away_score as goals_against,
      case when f.home_score > f.away_score then 1 else 0 end as won,
      case when f.home_score = f.away_score then 1 else 0 end as drawn,
      case when f.home_score < f.away_score then 1 else 0 end as lost
    from public.fixtures f
    where f.tournament_id = p_tournament_id
      and f.stage = 'group'
      and f.status = 'completed'
      and f.home_team_id is not null
      and f.away_team_id is not null
      and f.home_score is not null
      and f.away_score is not null

    union all

    select
      f.tournament_id,
      f.group_code,
      f.away_team_id as team_id,
      f.away_score as goals_for,
      f.home_score as goals_against,
      case when f.away_score > f.home_score then 1 else 0 end as won,
      case when f.away_score = f.home_score then 1 else 0 end as drawn,
      case when f.away_score < f.home_score then 1 else 0 end as lost
    from public.fixtures f
    where f.tournament_id = p_tournament_id
      and f.stage = 'group'
      and f.status = 'completed'
      and f.home_team_id is not null
      and f.away_team_id is not null
      and f.home_score is not null
      and f.away_score is not null
  ),
  stats as (
    select
      tb.tournament_id,
      tb.team_id,
      tb.group_code,
      tb.name,
      count(gr.team_id)::int as played,
      coalesce(sum(gr.won), 0)::int as won,
      coalesce(sum(gr.drawn), 0)::int as drawn,
      coalesce(sum(gr.lost), 0)::int as lost,
      coalesce(sum(gr.goals_for), 0)::int as goals_for,
      coalesce(sum(gr.goals_against), 0)::int as goals_against,
      coalesce(sum(gr.goals_for - gr.goals_against), 0)::int as goal_difference,
      coalesce(sum(gr.won * 3 + gr.drawn), 0)::int as points
    from team_base tb
    left join group_results gr on gr.team_id = tb.team_id
    group by tb.tournament_id, tb.team_id, tb.group_code, tb.name
  ),
  ranked as (
    select
      stats.*,
      (row_number() over (
        partition by stats.group_code
        order by
          stats.points desc,
          stats.goal_difference desc,
          stats.goals_for desc,
          stats.name asc
      ))::int as rank
    from stats
  )
  insert into public.standings (
    tournament_id,
    team_id,
    group_code,
    played,
    won,
    drawn,
    lost,
    goals_for,
    goals_against,
    goal_difference,
    points,
    rank,
    qualification_status,
    updated_at
  )
  select
    tournament_id,
    team_id,
    group_code,
    played,
    won,
    drawn,
    lost,
    goals_for,
    goals_against,
    goal_difference,
    points,
    rank,
    case
      when played = 0 then 'not_started'
      when rank <= 2 then 'advancing'
      when rank = 3 then 'third_place_watch'
      else 'in_danger'
    end,
    now()
  from ranked
  on conflict (tournament_id, team_id) do update set
    group_code = excluded.group_code,
    played = excluded.played,
    won = excluded.won,
    drawn = excluded.drawn,
    lost = excluded.lost,
    goals_for = excluded.goals_for,
    goals_against = excluded.goals_against,
    goal_difference = excluded.goal_difference,
    points = excluded.points,
    rank = excluded.rank,
    qualification_status = excluded.qualification_status,
    updated_at = now();
end;
$$;

create or replace function public.recalculate_group_standings_from_fixture()
returns trigger
language plpgsql
as $$
begin
  if (tg_op = 'DELETE') then
    if old.stage = 'group' then
      perform public.recalculate_group_standings(old.tournament_id);
    end if;
    return old;
  end if;

  if new.stage = 'group' then
    perform public.recalculate_group_standings(new.tournament_id);
  end if;

  if tg_op = 'UPDATE'
    and old.tournament_id is distinct from new.tournament_id
    and old.stage = 'group'
  then
    perform public.recalculate_group_standings(old.tournament_id);
  end if;

  return new;
end;
$$;

drop trigger if exists recalculate_group_standings_on_fixture_change on public.fixtures;
create trigger recalculate_group_standings_on_fixture_change
after insert or update of
  tournament_id,
  stage,
  status,
  group_code,
  home_team_id,
  away_team_id,
  home_score,
  away_score
or delete on public.fixtures
for each row execute function public.recalculate_group_standings_from_fixture();

drop view if exists public.live_group_projection_view;

create view public.live_group_projection_view with (security_invoker = true) as
with team_base as (
  select
    t.tournament_id,
    t.id as team_id,
    t.slug,
    t.name,
    t.fifa_code,
    t.flag_emoji,
    t.flag_asset_url,
    t.group_code
  from public.teams t
  where t.group_code is not null
),
group_results as (
  select
    f.tournament_id,
    f.group_code,
    f.home_team_id as team_id,
    f.home_score as goals_for,
    f.away_score as goals_against,
    case when f.home_score > f.away_score then 1 else 0 end as won,
    case when f.home_score = f.away_score then 1 else 0 end as drawn,
    case when f.home_score < f.away_score then 1 else 0 end as lost
  from public.fixtures f
  where f.stage = 'group'
    and f.status in ('live', 'completed')
    and f.home_team_id is not null
    and f.away_team_id is not null
    and f.home_score is not null
    and f.away_score is not null

  union all

  select
    f.tournament_id,
    f.group_code,
    f.away_team_id as team_id,
    f.away_score as goals_for,
    f.home_score as goals_against,
    case when f.away_score > f.home_score then 1 else 0 end as won,
    case when f.away_score = f.home_score then 1 else 0 end as drawn,
    case when f.away_score < f.home_score then 1 else 0 end as lost
  from public.fixtures f
  where f.stage = 'group'
    and f.status in ('live', 'completed')
    and f.home_team_id is not null
    and f.away_team_id is not null
    and f.home_score is not null
    and f.away_score is not null
),
stats as (
  select
    tb.tournament_id,
    tb.group_code,
    tb.team_id,
    tb.slug,
    tb.name,
    tb.fifa_code,
    tb.flag_emoji,
    tb.flag_asset_url,
    count(gr.team_id)::int as played,
    coalesce(sum(gr.won), 0)::int as won,
    coalesce(sum(gr.drawn), 0)::int as drawn,
    coalesce(sum(gr.lost), 0)::int as lost,
    coalesce(sum(gr.goals_for), 0)::int as goals_for,
    coalesce(sum(gr.goals_against), 0)::int as goals_against,
    coalesce(sum(gr.goals_for - gr.goals_against), 0)::int as goal_difference,
    coalesce(sum(gr.won * 3 + gr.drawn), 0)::int as points
  from team_base tb
  left join group_results gr on gr.team_id = tb.team_id
  group by
    tb.tournament_id,
    tb.group_code,
    tb.team_id,
    tb.slug,
    tb.name,
    tb.fifa_code,
    tb.flag_emoji,
    tb.flag_asset_url
)
select
  stats.*,
  (row_number() over (
    partition by stats.tournament_id, stats.group_code
    order by
      stats.points desc,
      stats.goal_difference desc,
      stats.goals_for desc,
      stats.name asc
  ))::int as projected_rank
from stats;

drop view if exists public.team_form_summary_view;

create view public.team_form_summary_view with (security_invoker = true) as
select
  team.id as team_id,
  team.tournament_id,
  team.slug,
  team.name,
  count(recent_match.id)::int as matches_tracked,
  count(*) filter (where recent_match.result = 'W')::int as wins,
  count(*) filter (where recent_match.result = 'D')::int as draws,
  count(*) filter (where recent_match.result = 'L')::int as losses,
  coalesce(sum(recent_match.goals_for), 0)::int as goals_for,
  coalesce(sum(recent_match.goals_against), 0)::int as goals_against,
  coalesce(sum(recent_match.goals_for - recent_match.goals_against), 0)::int as goal_difference,
  jsonb_agg(
    jsonb_build_object(
      'played_at', recent_match.played_at,
      'opponent', recent_match.opponent_name,
      'competition', recent_match.competition,
      'result', recent_match.result,
      'score', recent_match.goals_for || '-' || recent_match.goals_against
    )
    order by recent_match.played_at desc
  ) filter (where recent_match.id is not null) as recent_matches
from public.teams team
left join lateral (
  select *
  from public.team_recent_matches recent
  where recent.team_id = team.id
    and recent.played_at >= (current_date - interval '4 years')
  order by recent.played_at desc
  limit 20
) recent_match on true
group by team.id, team.tournament_id, team.slug, team.name;

grant select on
  public.live_group_projection_view,
  public.team_form_summary_view
to anon, authenticated;

select public.recalculate_group_standings('00000000-0000-4000-8000-000000002026');
