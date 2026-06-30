/**
 * Seed knockout-stage fixture rows into the `fixtures` table as results become known.
 *
 * Called:
 *   1. From /api/sync/scores after any fixture transitions to "completed"
 *   2. From /api/sync/seed-fixtures (every-4h fallback cron)
 *
 * Strategy:
 *   R32 (M73–M88) – resolve from live group standings once both group slots are confirmed.
 *   R16–Final     – cascade from completed R32/R16/QF/SF results via winner lookup.
 *   3rd-place R32 slots – greedy bipartite assignment once all 12 groups are done.
 */

import { getSupabaseAdminClient } from "@/lib/supabase/server";

// ─── Constants ────────────────────────────────────────────────────────────────

const TOURNAMENT_ID = "00000000-0000-4000-8000-000000002026";

// Deterministic fixture IDs matching the seed script pattern
function fixtureId(matchNumber: number) {
  return `30000000-0000-4000-8000-${String(matchNumber).padStart(12, "0")}`;
}

type GroupSlot = { type: "group"; code: string; rank: number };
type ThirdSlot  = { type: "third"; pool: string[] };   // eligible groups for this 3rd-place slot
type WinnerSlot = { type: "winner"; match: number };
type RunnerUpSlot = { type: "runner_up"; match: number };

type Slot = GroupSlot | ThirdSlot | WinnerSlot | RunnerUpSlot;

type FixtureSlot = {
  matchNumber: number;
  stage: string;
  home: Slot;
  away: Slot;
};

const R32: FixtureSlot[] = [
  { matchNumber: 73, stage: "round_of_32", home: { type: "group", code: "A", rank: 2 }, away: { type: "group", code: "B", rank: 2 } },
  { matchNumber: 74, stage: "round_of_32", home: { type: "group", code: "E", rank: 1 }, away: { type: "third", pool: ["A","B","C","D","F"] } },
  { matchNumber: 75, stage: "round_of_32", home: { type: "group", code: "F", rank: 1 }, away: { type: "group", code: "C", rank: 2 } },
  { matchNumber: 76, stage: "round_of_32", home: { type: "group", code: "C", rank: 1 }, away: { type: "group", code: "F", rank: 2 } },
  { matchNumber: 77, stage: "round_of_32", home: { type: "group", code: "I", rank: 1 }, away: { type: "third", pool: ["C","D","F","G","H"] } },
  { matchNumber: 78, stage: "round_of_32", home: { type: "group", code: "E", rank: 2 }, away: { type: "group", code: "I", rank: 2 } },
  { matchNumber: 79, stage: "round_of_32", home: { type: "group", code: "A", rank: 1 }, away: { type: "third", pool: ["C","E","F","H","I"] } },
  { matchNumber: 80, stage: "round_of_32", home: { type: "group", code: "L", rank: 1 }, away: { type: "third", pool: ["E","H","I","J","K"] } },
  { matchNumber: 81, stage: "round_of_32", home: { type: "group", code: "D", rank: 1 }, away: { type: "third", pool: ["B","E","F","I","J"] } },
  { matchNumber: 82, stage: "round_of_32", home: { type: "group", code: "G", rank: 1 }, away: { type: "third", pool: ["A","E","H","I","J"] } },
  { matchNumber: 83, stage: "round_of_32", home: { type: "group", code: "K", rank: 2 }, away: { type: "group", code: "L", rank: 2 } },
  { matchNumber: 84, stage: "round_of_32", home: { type: "group", code: "H", rank: 1 }, away: { type: "group", code: "J", rank: 2 } },
  { matchNumber: 85, stage: "round_of_32", home: { type: "group", code: "B", rank: 1 }, away: { type: "third", pool: ["E","F","G","I","J"] } },
  { matchNumber: 86, stage: "round_of_32", home: { type: "group", code: "J", rank: 1 }, away: { type: "group", code: "H", rank: 2 } },
  { matchNumber: 87, stage: "round_of_32", home: { type: "group", code: "K", rank: 1 }, away: { type: "third", pool: ["D","E","I","J","L"] } },
  { matchNumber: 88, stage: "round_of_32", home: { type: "group", code: "D", rank: 2 }, away: { type: "group", code: "G", rank: 2 } },
];

const KNOCKOUT: FixtureSlot[] = [
  // Round of 16
  { matchNumber: 89,  stage: "round_of_16",   home: { type: "winner", match: 74 }, away: { type: "winner", match: 77 } },
  { matchNumber: 90,  stage: "round_of_16",   home: { type: "winner", match: 73 }, away: { type: "winner", match: 75 } },
  { matchNumber: 91,  stage: "round_of_16",   home: { type: "winner", match: 76 }, away: { type: "winner", match: 78 } },
  { matchNumber: 92,  stage: "round_of_16",   home: { type: "winner", match: 79 }, away: { type: "winner", match: 80 } },
  { matchNumber: 93,  stage: "round_of_16",   home: { type: "winner", match: 83 }, away: { type: "winner", match: 84 } },
  { matchNumber: 94,  stage: "round_of_16",   home: { type: "winner", match: 81 }, away: { type: "winner", match: 82 } },
  { matchNumber: 95,  stage: "round_of_16",   home: { type: "winner", match: 86 }, away: { type: "winner", match: 88 } },
  { matchNumber: 96,  stage: "round_of_16",   home: { type: "winner", match: 85 }, away: { type: "winner", match: 87 } },
  // Quarter-finals
  { matchNumber: 97,  stage: "quarter_final", home: { type: "winner", match: 89 }, away: { type: "winner", match: 90 } },
  { matchNumber: 98,  stage: "quarter_final", home: { type: "winner", match: 93 }, away: { type: "winner", match: 94 } },
  { matchNumber: 99,  stage: "quarter_final", home: { type: "winner", match: 91 }, away: { type: "winner", match: 92 } },
  { matchNumber: 100, stage: "quarter_final", home: { type: "winner", match: 95 }, away: { type: "winner", match: 96 } },
  // Semi-finals
  { matchNumber: 101, stage: "semi_final",    home: { type: "winner",    match: 97 }, away: { type: "winner",    match: 98 } },
  { matchNumber: 102, stage: "semi_final",    home: { type: "winner",    match: 99 }, away: { type: "winner",    match: 100 } },
  // 3rd place + Final
  { matchNumber: 103, stage: "third_place",   home: { type: "runner_up", match: 101 }, away: { type: "runner_up", match: 102 } },
  { matchNumber: 104, stage: "final",         home: { type: "winner",    match: 101 }, away: { type: "winner",    match: 102 } },
];

// Real R32 schedule: 1 game Jun 28, then 3/day Jun 29–Jul 3.
const MANUAL_STARTS_AT: Record<number, string> = {
  73: "2026-06-28T20:00:00Z",  // South Africa vs Canada
  76: "2026-06-29T16:00:00Z",  // Brazil vs Japan
  74: "2026-06-29T20:30:00Z",  // Germany vs Paraguay
  75: "2026-06-30T01:00:00Z",  // Netherlands vs Morocco
  78: "2026-06-30T17:00:00Z",  // Ivory Coast vs Norway
  77: "2026-06-30T21:00:00Z",  // France vs Sweden
  79: "2026-07-01T01:00:00Z",  // Mexico vs Ecuador
  80: "2026-07-01T17:00:00Z",  // England vs DR Congo
  81: "2026-07-01T21:00:00Z",  // USA vs Bosnia-Herzegovina
  82: "2026-07-02T01:00:00Z",  // Belgium vs Senegal
  83: "2026-07-02T17:00:00Z",  // Portugal vs Croatia
  84: "2026-07-02T21:00:00Z",  // Spain vs Austria
  85: "2026-07-03T01:00:00Z",  // Switzerland vs Algeria
  86: "2026-07-03T17:00:00Z",  // Argentina vs Cabo Verde
  87: "2026-07-03T21:00:00Z",  // Colombia vs Ghana
  88: "2026-07-04T01:00:00Z",  // Australia vs Egypt
  89: "2026-07-07T19:00:00Z",
  90: "2026-07-07T23:00:00Z",
  91: "2026-07-08T19:00:00Z",
  92: "2026-07-08T23:00:00Z",
  93: "2026-07-09T19:00:00Z",
  94: "2026-07-09T23:00:00Z",
  95: "2026-07-10T19:00:00Z",
  96: "2026-07-10T23:00:00Z",
  97: "2026-07-11T19:00:00Z",
  98: "2026-07-11T23:00:00Z",
  99: "2026-07-12T19:00:00Z",
  100: "2026-07-12T23:00:00Z",
  101: "2026-07-15T19:00:00Z",
  102: "2026-07-16T19:00:00Z",
  103: "2026-07-19T15:00:00Z",
  104: "2026-07-19T19:00:00Z",
};

function slotPlaceholder(slot: Slot): string {
  if (slot.type === "group") return `${slot.code}${slot.rank}`;
  if (slot.type === "third") return `3rd ${slot.pool.join("/")}`;
  if (slot.type === "winner") return `Winner M${slot.match}`;
  return `Runner-up M${slot.match}`;
}

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

// ─── ESPN helpers ─────────────────────────────────────────────────────────────

type EspnEvent = { id: string; date: string; competitions: Array<{ competitors: Array<{ homeAway: "home" | "away"; team: { id: string; displayName: string; abbreviation: string } }> }> };

async function fetchEspnForDate(dateStr: string): Promise<EspnEvent[]> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`;
    const r = await fetch(url, { headers: { "User-Agent": "pulse90-sync/1.0" }, cache: "no-store" });
    if (!r.ok) return [];
    const d = await r.json() as { events?: EspnEvent[] };
    return d.events ?? [];
  } catch { return []; }
}

// Prefetch the full knockout window (Jun 26–Jul 22) in parallel, build a lookup map.
// Key: sorted normalized name pair joined by "|", value: startsAt ISO string.
// Jun 26 start ensures all R32 matches (Jun 28–Jul 3) are covered.
async function buildKnockoutSchedule(): Promise<Map<string, string>> {
  const dateStrs: string[] = [];
  for (let d = new Date("2026-06-26"); d <= new Date("2026-07-22"); d.setDate(d.getDate() + 1)) {
    dateStrs.push(
      `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`,
    );
  }
  const allEvents = await Promise.all(dateStrs.map(fetchEspnForDate));
  const schedule = new Map<string, string>();
  for (const events of allEvents) {
    for (const evt of events) {
      const comp = evt.competitions[0];
      if (!comp) continue;
      const names = comp.competitors.map((c) => c.team.displayName.toLowerCase()).sort();
      const key = names.join("|");
      if (!schedule.has(key)) schedule.set(key, evt.date);
    }
  }
  return schedule;
}

function lookupEspnSchedule(
  homeId: string, awayId: string,
  teamNames: Map<string, string>,
  schedule: Map<string, string>,
): string | null {
  const homeName = teamNames.get(homeId)?.toLowerCase() ?? "";
  const awayName = teamNames.get(awayId)?.toLowerCase() ?? "";
  if (!homeName || !awayName) return null;

  // Exact sorted-name key
  const key = [homeName, awayName].sort().join("|");
  if (schedule.has(key)) return schedule.get(key)!;

  // Partial match on first word (handles name discrepancies)
  const homeFirst = homeName.split(" ")[0];
  const awayFirst = awayName.split(" ")[0];
  for (const [k, date] of schedule) {
    const parts = k.split("|");
    if (parts.some((p) => p.includes(homeFirst)) && parts.some((p) => p.includes(awayFirst))) {
      return date;
    }
  }
  return null;
}

// ─── 3rd-place assignment (greedy bipartite matching) ─────────────────────────

type ThirdTeam = { teamId: string; points: number; goalDifference: number; goalsFor: number; groupCode: string };

function assignThirdPlaceTeams(
  advancing: ThirdTeam[],
  slots: FixtureSlot[],
): Map<number, string> {
  // matchNumber → assigned teamId
  const assignment = new Map<number, string>();
  const assigned = new Set<string>(); // teamIds already placed

  // Sort advancing teams best → worst
  const sorted = [...advancing].sort((a, b) =>
    b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor,
  );

  const thirdSlots = slots
    .filter((s) => s.away.type === "third" || s.home.type === "third")
    .map((s) => ({
      matchNumber: s.matchNumber,
      pool: ((s.home.type === "third" ? s.home : s.away) as ThirdSlot).pool,
      side: s.home.type === "third" ? "home" : "away",
    }));

  for (const team of sorted) {
    if (assigned.has(team.teamId)) continue;
    for (const slot of thirdSlots) {
      if (assignment.has(slot.matchNumber)) continue;       // slot already filled
      if (!slot.pool.includes(team.groupCode)) continue;   // team not eligible here
      assignment.set(slot.matchNumber, team.teamId);
      assigned.add(team.teamId);
      break;
    }
  }

  return assignment;
}

// ─── Main export ──────────────────────────────────────────────────────────────

type SeedResult = { created: number; skipped: number; errors: string[] };

export async function seedKnockoutFixtures(): Promise<SeedResult> {
  const _supabase = getSupabaseAdminClient();
  if (!_supabase) return { created: 0, skipped: 0, errors: ["No admin client"] };
  // Alias so TypeScript treats it as non-null in nested async closures
  const supabase = _supabase;

  const result: SeedResult = { created: 0, skipped: 0, errors: [] };

  // ── Load existing knockout fixtures (M73+) ────────────────────────────────
  const { data: existingRows } = await supabase
    .from("fixtures")
    .select("match_number, home_team_id, away_team_id, home_score, away_score, home_penalties, away_penalties, status")
    .eq("tournament_id", TOURNAMENT_ID)
    .gte("match_number", 73);

  const existing = new Map<number, { homeId: string | null; awayId: string | null; homeScore: number | null; awayScore: number | null; homePenalties: number | null; awayPenalties: number | null; status: string }>();
  for (const row of existingRows ?? []) {
    existing.set(row.match_number, {
      homeId: row.home_team_id,
      awayId: row.away_team_id,
      homeScore: row.home_score,
      awayScore: row.away_score,
      homePenalties: row.home_penalties ?? null,
      awayPenalties: row.away_penalties ?? null,
      status: row.status,
    });
  }

  // Helper: winner of a completed match; handles penalty shootouts via home/away_penalties
  function matchWinner(matchNumber: number): string | null {
    const f = existing.get(matchNumber);
    if (!f || f.status !== "completed" || f.homeScore == null || f.awayScore == null) return null;
    if (f.homeScore > f.awayScore) return f.homeId;
    if (f.awayScore > f.homeScore) return f.awayId;
    // Tied after extra time — use penalty shootout result
    if (f.homePenalties != null && f.awayPenalties != null) {
      if (f.homePenalties > f.awayPenalties) return f.homeId;
      if (f.awayPenalties > f.homePenalties) return f.awayId;
    }
    return null;
  }

  function matchLoser(matchNumber: number): string | null {
    const f = existing.get(matchNumber);
    if (!f || f.status !== "completed" || f.homeScore == null || f.awayScore == null) return null;
    if (f.homeScore > f.awayScore) return f.awayId;
    if (f.awayScore > f.homeScore) return f.homeId;
    // Tied — loser is the one who lost on penalties
    if (f.homePenalties != null && f.awayPenalties != null) {
      if (f.homePenalties > f.awayPenalties) return f.awayId;
      if (f.awayPenalties > f.homePenalties) return f.homeId;
    }
    return null;
  }

  // ── Load group standings (live view, updated by DB trigger on each fixture change) ──
  const { data: standingsRows } = await supabase
    .from("live_group_projection_view")
    .select("team_id, group_code, projected_rank, played, points, goal_difference, goals_for");

  type StandingRow = { team_id: string; group_code: string; projected_rank: number; played: number; points: number; goal_difference: number; goals_for: number };
  const standings = (standingsRows ?? []) as StandingRow[];

  // Build lookup: group → rank → teamId (only if group is complete)
  const groupRankMap = new Map<string, Map<number, string>>();
  const groupPlayedMap = new Map<string, number>(); // group → total played across 4 teams
  for (const s of standings) {
    if (!s.group_code || !s.projected_rank) continue;
    if (!groupRankMap.has(s.group_code)) groupRankMap.set(s.group_code, new Map());
    groupRankMap.get(s.group_code)!.set(s.projected_rank, s.team_id);
    groupPlayedMap.set(s.group_code, (groupPlayedMap.get(s.group_code) ?? 0) + s.played);
  }

  // A group is "done" when all 6 group-stage matches are played (4 teams × 3 games = 12 team-games)
  function groupDone(code: string) { return (groupPlayedMap.get(code) ?? 0) >= 12; }

  // ── 3rd-place slot resolution (only when all 12 groups are done) ──────────
  const allGroupsDone = "ABCDEFGHIJKL".split("").every(groupDone);
  let thirdAssignment = new Map<number, string>(); // matchNumber → teamId

  if (allGroupsDone) {
    const thirdTeams: ThirdTeam[] = standings
      .filter((s) => s.projected_rank === 3)
      .map((s) => ({
        teamId: s.team_id,
        points: s.points,
        goalDifference: s.goal_difference,
        goalsFor: s.goals_for,
        groupCode: s.group_code,
      }))
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor)
      .slice(0, 8); // best 8 advance

    thirdAssignment = assignThirdPlaceTeams(thirdTeams, R32);
  }

  // ── Load team names + ESPN schedule in parallel ───────────────────────────
  const [{ data: teamRows }, { data: venueRows }, espnSchedule] = await Promise.all([
    supabase.from("teams").select("id, name").eq("tournament_id", TOURNAMENT_ID),
    supabase.from("venues").select("id").eq("tournament_id", TOURNAMENT_ID).order("id", { ascending: true }),
    buildKnockoutSchedule(),
  ]);

  const teamNames = new Map<string, string>((teamRows ?? []).map((t: { id: string; name: string }) => [t.id, t.name]));
  const teamNameToId = new Map<string, string>((teamRows ?? []).map((t: { id: string; name: string }) => [t.name.toLowerCase(), t.id]));
  const venueIds = ((venueRows ?? []) as Array<{ id: string }>).map((venue) => venue.id);
  if (venueIds.length === 0) {
    result.errors.push("No venues found for tournament");
    return result;
  }

  function venueForMatch(matchNumber: number) {
    return venueIds[(matchNumber - 1) % venueIds.length];
  }

  // ── ESPN-based 3rd-place team resolution ──────────────────────────────────
  // Finds who the known team (group winner/runner-up) actually played in R32
  // by looking up their match in the ESPN schedule near the match's kickoff time.
  // Returns the opponent's team ID from our DB, or null if not yet scheduled/found.
  function resolveThirdPlaceViaEspn(knownTeamId: string, matchNumber: number): string | null {
    const knownName = teamNames.get(knownTeamId)?.toLowerCase();
    if (!knownName) return null;
    const approxDate = MANUAL_STARTS_AT[matchNumber];
    if (!approxDate) return null;
    const approxTime = new Date(approxDate).getTime();
    const windowMs = 12 * 60 * 60 * 1000; // ±12 h window
    const knownFirst = knownName.split(" ")[0];

    for (const [key, matchDate] of espnSchedule.entries()) {
      if (Math.abs(new Date(matchDate).getTime() - approxTime) > windowMs) continue;
      const parts = key.split("|");
      if (parts.length !== 2) continue;
      const matchIdx = parts.findIndex(
        (p) => p === knownName || p.includes(knownFirst) || knownName.includes(p.split(" ")[0]),
      );
      if (matchIdx === -1) continue;
      const opponentName = parts[1 - matchIdx];
      // Exact match
      const exactId = teamNameToId.get(opponentName);
      if (exactId) return exactId;
      // Partial first-word match
      const opFirst = opponentName.split(" ")[0];
      for (const [dbName, teamId] of teamNameToId) {
        const dbFirst = dbName.split(" ")[0];
        if (dbFirst === opFirst || dbName.includes(opFirst) || opponentName.includes(dbFirst)) {
          return teamId;
        }
      }
    }
    return null;
  }

  // ── Resolve a slot to a teamId ────────────────────────────────────────────
  function resolveSlot(slot: Slot): string | null {
    if (slot.type === "group") {
      if (!groupDone(slot.code)) return null;
      return groupRankMap.get(slot.code)?.get(slot.rank) ?? null;
    }
    if (slot.type === "third") {
      // thirdAssignment is keyed by matchNumber — find which entry this slot belongs to
      // We'll resolve it per fixture below
      return null; // handled separately
    }
    if (slot.type === "winner")   return matchWinner(slot.match);
    if (slot.type === "runner_up") return matchLoser(slot.match);
    return null;
  }

  // ── Insert a new fixture ──────────────────────────────────────────────────
  async function insertFixture(
    matchNumber: number,
    stage: string,
    homeId: string | null,
    awayId: string | null,
    homePlaceholder: string,
    awayPlaceholder: string,
  ) {
    const homeName = homeId ? (teamNames.get(homeId) ?? homePlaceholder) : homePlaceholder;
    const awayName = awayId ? (teamNames.get(awayId) ?? awayPlaceholder) : awayPlaceholder;

    // Fallback approximate dates if ESPN hasn't listed this match yet
    const APPROX: Record<string, string> = {
      round_of_32:   "2026-07-02T18:00:00Z",
      round_of_16:   "2026-07-07T18:00:00Z",
      quarter_final: "2026-07-11T18:00:00Z",
      semi_final:    "2026-07-15T18:00:00Z",
      third_place:   "2026-07-19T15:00:00Z",
      final:         "2026-07-19T19:00:00Z",
    };
    const espnDate = homeId && awayId ? lookupEspnSchedule(homeId, awayId, teamNames, espnSchedule) : null;
    const startsAt = MANUAL_STARTS_AT[matchNumber] ?? espnDate ?? APPROX[stage] ?? "2026-07-10T18:00:00Z";

    const { error } = await supabase.from("fixtures").upsert(
      {
        id: fixtureId(matchNumber),
        tournament_id: TOURNAMENT_ID,
        match_number: matchNumber,
        stage,
        group_code: null,
        venue_id: venueForMatch(matchNumber),
        home_team_id: homeId,
        away_team_id: awayId,
        home_placeholder: homePlaceholder,
        away_placeholder: awayPlaceholder,
        starts_at: startsAt,
        status: "scheduled",
        importance_score: stage === "final" ? 99 : stage === "semi_final" ? 95 : stage === "quarter_final" ? 90 : stage === "round_of_16" ? 85 : 80,
        importance_reason: `${homeName} vs ${awayName} - ${stageLabel(stage)}`,
        stakes: `${homeName} face ${awayName} in ${stageLabel(stage)}.`,
        implication: `Winner advances; loser exits the tournament.`,
      },
      { onConflict: "id" },
    );

    if (error) {
      result.errors.push(`M${matchNumber}: ${error.message}`);
    } else {
      result.created++;
    }
  }

  // ── Process R32 ───────────────────────────────────────────────────────────
  for (const slot of R32) {
    let homeId: string | null = null;
    let awayId: string | null = null;

    if (slot.home.type === "third") {
      // Try ESPN first: find who the known (away) team actually played in R32
      const knownId = slot.away.type !== "third" ? resolveSlot(slot.away) : null;
      homeId =
        (knownId ? resolveThirdPlaceViaEspn(knownId, slot.matchNumber) : null) ??
        thirdAssignment.get(slot.matchNumber) ??
        null;
    } else {
      homeId = resolveSlot(slot.home);
    }

    if (slot.away.type === "third") {
      // Try ESPN first: find who the known (home) team actually played in R32
      const knownId = slot.home.type !== "third" ? resolveSlot(slot.home) : null;
      awayId =
        (knownId ? resolveThirdPlaceViaEspn(knownId, slot.matchNumber) : null) ??
        thirdAssignment.get(slot.matchNumber) ??
        null;
    } else {
      awayId = resolveSlot(slot.away);
    }

    // Skip only when completed with exactly the teams we'd assign — avoids clobbering scores.
    // If teams are wrong (greedy mismatch), re-seed regardless of status so score sync
    // can then find the correct ESPN event and update scores.
    const existingRow = existing.get(slot.matchNumber);
    if (
      existingRow?.status === "completed" &&
      existingRow.homeId === homeId &&
      existingRow.awayId === awayId
    ) {
      result.skipped++;
      continue;
    }

    await insertFixture(
      slot.matchNumber,
      slot.stage,
      homeId,
      awayId,
      slotPlaceholder(slot.home),
      slotPlaceholder(slot.away),
    );
  }

  // ── Process R16 → Final ───────────────────────────────────────────────────
  for (const slot of KNOCKOUT) {
    if (existing.get(slot.matchNumber)?.status === "completed") { result.skipped++; continue; }

    const homeId = resolveSlot(slot.home);
    const awayId = resolveSlot(slot.away);

    await insertFixture(
      slot.matchNumber,
      slot.stage,
      homeId,
      awayId,
      slotPlaceholder(slot.home),
      slotPlaceholder(slot.away),
    );
  }

  return result;
}
