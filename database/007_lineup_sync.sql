-- Half-time period display on fixtures
ALTER TABLE public.fixtures ADD COLUMN IF NOT EXISTS period_display TEXT;

-- Source metadata on fixture_lineups
ALTER TABLE public.fixture_lineups ADD COLUMN IF NOT EXISTS source_label TEXT;
ALTER TABLE public.fixture_lineups ADD COLUMN IF NOT EXISTS espn_event_id TEXT;

-- Recreate fixture_cards_view to expose period_display
DROP VIEW IF EXISTS public.fixture_cards_view;

CREATE VIEW public.fixture_cards_view WITH (security_invoker = true) AS
SELECT
  f.id,
  f.match_number,
  f.status,
  f.minute,
  f.period_display,
  f.starts_at,
  f.stage,
  f.group_code,
  f.home_score,
  f.away_score,
  f.importance_score,
  f.importance_reason,
  f.stakes,
  f.implication,
  ht.name  AS home_team,
  ht.slug  AS home_team_slug,
  at.name  AS away_team,
  at.slug  AS away_team_slug,
  v.name   AS venue,
  v.host_city,
  v.timezone,
  t.slug   AS tournament_slug
FROM public.fixtures f
JOIN public.tournaments  t  ON t.id = f.tournament_id
JOIN public.venues       v  ON v.id = f.venue_id
LEFT JOIN public.teams  ht  ON ht.id = f.home_team_id
LEFT JOIN public.teams  at  ON at.id = f.away_team_id;

GRANT SELECT ON public.fixture_cards_view TO anon, authenticated;
