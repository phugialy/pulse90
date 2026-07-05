import { getSupabaseAdminClient } from "@/lib/supabase/server";

const TOURNAMENT_ID = "00000000-0000-4000-8000-000000002026";

function fixtureId(matchNumber: number) {
  return `30000000-0000-4000-8000-${String(matchNumber).padStart(12, "0")}`;
}

type Stage =
  | "round_of_32"
  | "round_of_16"
  | "quarter_final"
  | "semi_final"
  | "third_place"
  | "final";

type ActualFixture = {
  awayPlaceholder?: string;
  awayScore?: number | null;
  awayPenaltyScore?: number | null;
  awaySlug: string | null;
  homePlaceholder?: string;
  homeScore?: number | null;
  homePenaltyScore?: number | null;
  homeSlug: string | null;
  matchNumber: number;
  stage: Stage;
  startsAt: string;
  status: "scheduled" | "live" | "completed";
  venueName: string;
  winnerSlug?: string | null;
};

const ACTUAL_FIXTURES: ActualFixture[] = [
  { matchNumber: 73, stage: "round_of_32", startsAt: "2026-06-28T20:00:00Z", venueName: "SoFi Stadium", homeSlug: "south-africa", awaySlug: "canada", status: "completed", homeScore: 0, awayScore: 1, winnerSlug: "canada" },
  { matchNumber: 76, stage: "round_of_32", startsAt: "2026-06-29T17:00:00Z", venueName: "NRG Stadium", homeSlug: "brazil", awaySlug: "japan", status: "completed", homeScore: 2, awayScore: 1, winnerSlug: "brazil" },
  { matchNumber: 74, stage: "round_of_32", startsAt: "2026-06-29T20:30:00Z", venueName: "Gillette Stadium", homeSlug: "germany", awaySlug: "paraguay", status: "completed", homeScore: 1, awayScore: 1, homePenaltyScore: 3, awayPenaltyScore: 4, winnerSlug: "paraguay" },
  { matchNumber: 75, stage: "round_of_32", startsAt: "2026-06-30T01:00:00Z", venueName: "Estadio BBVA", homeSlug: "netherlands", awaySlug: "morocco", status: "completed", homeScore: 1, awayScore: 1, homePenaltyScore: 2, awayPenaltyScore: 3, winnerSlug: "morocco" },
  { matchNumber: 78, stage: "round_of_32", startsAt: "2026-06-30T17:00:00Z", venueName: "AT&T Stadium", homeSlug: "ivory-coast", awaySlug: "norway", status: "completed", homeScore: 1, awayScore: 2, winnerSlug: "norway" },
  { matchNumber: 77, stage: "round_of_32", startsAt: "2026-06-30T21:00:00Z", venueName: "MetLife Stadium", homeSlug: "france", awaySlug: "sweden", status: "completed", homeScore: 3, awayScore: 0, winnerSlug: "france" },
  { matchNumber: 79, stage: "round_of_32", startsAt: "2026-07-01T01:00:00Z", venueName: "Estadio Azteca", homeSlug: "mexico", awaySlug: "ecuador", status: "completed", homeScore: 2, awayScore: 0, winnerSlug: "mexico" },
  { matchNumber: 80, stage: "round_of_32", startsAt: "2026-07-01T17:00:00Z", venueName: "Mercedes-Benz Stadium", homeSlug: "england", awaySlug: "dr-congo", status: "completed", homeScore: 2, awayScore: 1, winnerSlug: "england" },
  { matchNumber: 81, stage: "round_of_32", startsAt: "2026-07-02T00:00:00Z", venueName: "Levi's Stadium", homeSlug: "usa", awaySlug: "bosnia-and-herzegovina", status: "completed", homeScore: 2, awayScore: 0, winnerSlug: "usa" },
  { matchNumber: 82, stage: "round_of_32", startsAt: "2026-07-02T18:00:00Z", venueName: "Lumen Field", homeSlug: "belgium", awaySlug: "senegal", status: "completed", homeScore: 3, awayScore: 2, winnerSlug: "belgium" },
  { matchNumber: 84, stage: "round_of_32", startsAt: "2026-07-02T19:00:00Z", venueName: "SoFi Stadium", homeSlug: "spain", awaySlug: "austria", status: "completed", homeScore: 3, awayScore: 0, winnerSlug: "spain" },
  { matchNumber: 83, stage: "round_of_32", startsAt: "2026-07-02T23:00:00Z", venueName: "BMO Field", homeSlug: "portugal", awaySlug: "croatia", status: "completed", homeScore: 2, awayScore: 1, winnerSlug: "portugal" },
  { matchNumber: 85, stage: "round_of_32", startsAt: "2026-07-03T03:00:00Z", venueName: "BC Place", homeSlug: "switzerland", awaySlug: "algeria", status: "completed", homeScore: 2, awayScore: 0, winnerSlug: "switzerland" },
  { matchNumber: 88, stage: "round_of_32", startsAt: "2026-07-03T18:00:00Z", venueName: "AT&T Stadium", homeSlug: "australia", awaySlug: "egypt", status: "completed", homeScore: 1, awayScore: 1, homePenaltyScore: 2, awayPenaltyScore: 4, winnerSlug: "egypt" },
  { matchNumber: 86, stage: "round_of_32", startsAt: "2026-07-03T22:00:00Z", venueName: "Hard Rock Stadium", homeSlug: "argentina", awaySlug: "cape-verde", status: "completed", homeScore: 3, awayScore: 2, winnerSlug: "argentina" },
  { matchNumber: 87, stage: "round_of_32", startsAt: "2026-07-04T01:30:00Z", venueName: "Arrowhead Stadium", homeSlug: "colombia", awaySlug: "ghana", status: "completed", homeScore: 1, awayScore: 0, winnerSlug: "colombia" },
  { matchNumber: 90, stage: "round_of_16", startsAt: "2026-07-04T17:00:00Z", venueName: "NRG Stadium", homeSlug: "canada", awaySlug: "morocco", status: "completed", homeScore: 0, awayScore: 3, winnerSlug: "morocco" },
  { matchNumber: 89, stage: "round_of_16", startsAt: "2026-07-04T21:00:00Z", venueName: "Lincoln Financial Field", homeSlug: "paraguay", awaySlug: "france", status: "completed", homeScore: 0, awayScore: 1, winnerSlug: "france" },
  { matchNumber: 91, stage: "round_of_16", startsAt: "2026-07-05T20:00:00Z", venueName: "MetLife Stadium", homeSlug: "brazil", awaySlug: "norway", status: "completed", homeScore: 1, awayScore: 2, winnerSlug: "norway" },
  { matchNumber: 92, stage: "round_of_16", startsAt: "2026-07-06T00:00:00Z", venueName: "Estadio Azteca", homeSlug: "mexico", awaySlug: "england", status: "scheduled" },
  { matchNumber: 93, stage: "round_of_16", startsAt: "2026-07-06T19:00:00Z", venueName: "AT&T Stadium", homeSlug: "portugal", awaySlug: "spain", status: "scheduled" },
  { matchNumber: 94, stage: "round_of_16", startsAt: "2026-07-07T00:00:00Z", venueName: "Lumen Field", homeSlug: "usa", awaySlug: "belgium", status: "scheduled" },
  { matchNumber: 95, stage: "round_of_16", startsAt: "2026-07-07T16:00:00Z", venueName: "Mercedes-Benz Stadium", homeSlug: "argentina", awaySlug: "egypt", status: "scheduled" },
  { matchNumber: 96, stage: "round_of_16", startsAt: "2026-07-07T20:00:00Z", venueName: "BC Place", homeSlug: "switzerland", awaySlug: "colombia", status: "scheduled" },
  { matchNumber: 97, stage: "quarter_final", startsAt: "2026-07-09T20:00:00Z", venueName: "Gillette Stadium", homeSlug: "france", awaySlug: "morocco", status: "scheduled" },
  { matchNumber: 98, stage: "quarter_final", startsAt: "2026-07-10T19:00:00Z", venueName: "SoFi Stadium", homeSlug: null, awaySlug: null, homePlaceholder: "Winner M93", awayPlaceholder: "Winner M94", status: "scheduled" },
  { matchNumber: 99, stage: "quarter_final", startsAt: "2026-07-11T21:00:00Z", venueName: "Hard Rock Stadium", homeSlug: "norway", awaySlug: null, awayPlaceholder: "Winner M92", status: "scheduled" },
  { matchNumber: 100, stage: "quarter_final", startsAt: "2026-07-12T01:00:00Z", venueName: "Arrowhead Stadium", homeSlug: null, awaySlug: null, homePlaceholder: "Winner M95", awayPlaceholder: "Winner M96", status: "scheduled" },
  { matchNumber: 101, stage: "semi_final", startsAt: "2026-07-14T19:00:00Z", venueName: "AT&T Stadium", homeSlug: null, awaySlug: null, homePlaceholder: "Winner M97", awayPlaceholder: "Winner M98", status: "scheduled" },
  { matchNumber: 102, stage: "semi_final", startsAt: "2026-07-15T19:00:00Z", venueName: "Mercedes-Benz Stadium", homeSlug: null, awaySlug: null, homePlaceholder: "Winner M99", awayPlaceholder: "Winner M100", status: "scheduled" },
  { matchNumber: 103, stage: "third_place", startsAt: "2026-07-18T21:00:00Z", venueName: "Hard Rock Stadium", homeSlug: null, awaySlug: null, homePlaceholder: "Runner-up M101", awayPlaceholder: "Runner-up M102", status: "scheduled" },
  { matchNumber: 104, stage: "final", startsAt: "2026-07-19T19:00:00Z", venueName: "MetLife Stadium", homeSlug: null, awaySlug: null, homePlaceholder: "Winner M101", awayPlaceholder: "Winner M102", status: "scheduled" },
];

function stageLabel(stage: string): string {
  const labels: Record<string, string> = {
    final: "Final",
    quarter_final: "Quarter Final",
    round_of_16: "Best of 16",
    round_of_32: "Best of 32",
    semi_final: "Semi Final",
    third_place: "Third Place",
  };

  return labels[stage] ?? stage.replace(/_/g, " ");
}

type SeedResult = { created: number; skipped: number; errors: string[] };

type ExistingFixture = {
  away_penalty_score: number | null;
  away_score: number | null;
  home_penalty_score: number | null;
  home_score: number | null;
  minute: number | null;
  match_number: number;
  status: "scheduled" | "live" | "completed" | "postponed" | "cancelled";
  winner_team_id: string | null;
};

export async function seedKnockoutFixtures(): Promise<SeedResult> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { created: 0, skipped: 0, errors: ["No admin client"] };

  const result: SeedResult = { created: 0, skipped: 0, errors: [] };

  const [teamResult, venueResult, existingResult] = await Promise.all([
    supabase.from("teams").select("id, slug, name").eq("tournament_id", TOURNAMENT_ID),
    supabase.from("venues").select("id, name").eq("tournament_id", TOURNAMENT_ID),
    supabase
      .from("fixtures")
      .select("match_number, status, minute, home_score, away_score, home_penalty_score, away_penalty_score, winner_team_id")
      .eq("tournament_id", TOURNAMENT_ID)
      .gte("match_number", 73)
      .lte("match_number", 104),
  ]);

  if (teamResult.error) return { created: 0, skipped: 0, errors: [teamResult.error.message] };
  if (venueResult.error) return { created: 0, skipped: 0, errors: [venueResult.error.message] };
  if (existingResult.error) return { created: 0, skipped: 0, errors: [existingResult.error.message] };

  const teams = new Map((teamResult.data ?? []).map((team: { id: string; slug: string; name: string }) => [team.slug, team]));
  const venues = new Map((venueResult.data ?? []).map((venue: { id: string; name: string }) => [venue.name, venue.id]));
  const existing = new Map(
    ((existingResult.data ?? []) as ExistingFixture[]).map((fixture) => [fixture.match_number, fixture]),
  );
  const fallbackVenueId = (venueResult.data ?? [])[0]?.id;

  if (!fallbackVenueId) return { created: 0, skipped: 0, errors: ["No venues found"] };

  for (const fixture of ACTUAL_FIXTURES) {
    const homeTeam = fixture.homeSlug ? teams.get(fixture.homeSlug) : null;
    const awayTeam = fixture.awaySlug ? teams.get(fixture.awaySlug) : null;
    const winnerTeam = fixture.winnerSlug ? teams.get(fixture.winnerSlug) : null;
    const homeName = homeTeam?.name ?? fixture.homePlaceholder ?? "TBD";
    const awayName = awayTeam?.name ?? fixture.awayPlaceholder ?? "TBD";
    const venueId = venues.get(fixture.venueName) ?? fallbackVenueId;
    const current = existing.get(fixture.matchNumber);
    const preserveResult = current?.status === "live" || current?.status === "completed";

    const { error } = await supabase.from("fixtures").upsert(
      {
        id: fixtureId(fixture.matchNumber),
        tournament_id: TOURNAMENT_ID,
        match_number: fixture.matchNumber,
        stage: fixture.stage,
        group_code: null,
        venue_id: venueId,
        home_team_id: homeTeam?.id ?? null,
        away_team_id: awayTeam?.id ?? null,
        home_placeholder: fixture.homePlaceholder ?? (homeTeam ? null : homeName),
        away_placeholder: fixture.awayPlaceholder ?? (awayTeam ? null : awayName),
        starts_at: fixture.startsAt,
        status: preserveResult ? current.status : fixture.status,
        minute: preserveResult ? current.minute : null,
        home_score: preserveResult ? current.home_score : (fixture.homeScore ?? null),
        away_score: preserveResult ? current.away_score : (fixture.awayScore ?? null),
        home_penalty_score: preserveResult ? current.home_penalty_score : (fixture.homePenaltyScore ?? null),
        away_penalty_score: preserveResult ? current.away_penalty_score : (fixture.awayPenaltyScore ?? null),
        winner_team_id: preserveResult ? current.winner_team_id : (winnerTeam?.id ?? null),
        importance_score:
          fixture.stage === "final" ? 99 :
          fixture.stage === "semi_final" ? 95 :
          fixture.stage === "quarter_final" ? 90 :
          fixture.stage === "round_of_16" ? 85 : 80,
        importance_reason: `${homeName} vs ${awayName} - ${stageLabel(fixture.stage)}`,
        stakes:
          fixture.status === "completed"
            ? `${winnerTeam?.name ?? "Winner"} advanced from ${stageLabel(fixture.stage)}.`
            : `${homeName} face ${awayName} in ${stageLabel(fixture.stage)}.`,
        implication:
          fixture.status === "completed"
            ? "Result is final; bracket path has updated."
            : "Winner advances; loser exits the tournament.",
        source_updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) {
      result.errors.push(`M${fixture.matchNumber}: ${error.message}`);
    } else {
      result.created++;
    }
  }

  return result;
}
