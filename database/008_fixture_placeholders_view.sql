-- Expose knockout placeholder labels through the shared fixture card view.
-- This lets unresolved knockout matches render "Winner M89" / seed labels instead of plain TBD.

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
  ht.name AS home_team,
  ht.slug AS home_team_slug,
  f.home_placeholder,
  at.name AS away_team,
  at.slug AS away_team_slug,
  f.away_placeholder,
  v.name AS venue,
  v.host_city,
  v.timezone,
  t.slug AS tournament_slug
FROM public.fixtures f
JOIN public.tournaments t ON t.id = f.tournament_id
JOIN public.venues v ON v.id = f.venue_id
LEFT JOIN public.teams ht ON ht.id = f.home_team_id
LEFT JOIN public.teams at ON at.id = f.away_team_id;

GRANT SELECT ON public.fixture_cards_view TO anon, authenticated;
