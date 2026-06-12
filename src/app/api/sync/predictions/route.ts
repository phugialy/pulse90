import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Position weight tables
// Positions may come in as abbreviations (ST, CB) or full words (Striker, Defender)
// ---------------------------------------------------------------------------

function posWeight(position: string, table: Record<string, number>, fallback: number): number {
  const p = position.toUpperCase().replace(/[\s-]/g, "");
  for (const [key, val] of Object.entries(table)) {
    if (p.includes(key)) return val;
  }
  return fallback;
}

// Goal-likelihood weights by position token
const GOAL_POS: Record<string, number> = {
  ST: 1.0, STRIKER: 1.0, CENTREFORWARD: 1.0, FORWARD: 0.9,
  RW: 0.8, LW: 0.8, WINGER: 0.8,
  CAM: 0.65, ATTACKINGMID: 0.65,
  CM: 0.35, CENTRALMID: 0.35, MID: 0.3,
  CDM: 0.15, DEFENSIVEMID: 0.15,
  RB: 0.1, LB: 0.1, FULLBACK: 0.1,
  RWB: 0.1, LWB: 0.1, WINGBACK: 0.1,
  CB: 0.07, CENTREB: 0.07, DEFEND: 0.08,
  GK: 0.01, GOALKEEPER: 0.01,
};

// Card-likelihood weights by position token
const CARD_POS: Record<string, number> = {
  CB: 1.0, CENTREB: 1.0,
  RWB: 0.85, LWB: 0.85, WINGBACK: 0.85,
  RB: 0.85, LB: 0.85, FULLBACK: 0.85, DEFEND: 0.8,
  CDM: 0.8, DEFENSIVEMID: 0.8,
  CM: 0.55, CENTRALMID: 0.55, MID: 0.5,
  CAM: 0.35, ATTACKINGMID: 0.35,
  RW: 0.3, LW: 0.3, WINGER: 0.3,
  ST: 0.2, STRIKER: 0.2, FORWARD: 0.2, CENTREFORWARD: 0.2,
  GK: 0.4, GOALKEEPER: 0.4,
};

function goalWeight(pos: string) { return posWeight(pos, GOAL_POS, 0.3); }
function cardWeight(pos: string) { return posWeight(pos, CARD_POS, 0.4); }

// ---------------------------------------------------------------------------
// Scoring formula
// WC events count 3× vs historical (more relevant context)
// base 0.3 ensures positional ranking even for zero-history players
// ---------------------------------------------------------------------------

function computeScore(
  posW: number,
  wcEvents: number,
  wcGames: number,
  histEvents: number,
  histGames: number,
): number {
  const totalGames = wcGames * 3 + histGames;
  const rate = totalGames > 0 ? (wcEvents * 3 + histEvents) / totalGames : 0;
  return Math.min(posW * (0.3 + rate * 0.7), 1.0);
}

// Extract "Player Name" from "Player Name 9'" or "Player Name 90+3'"
function extractName(title: string): string {
  return title.replace(/\s+\d+(?:\+\d+)?'$/, "").trim();
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    const qs = request.nextUrl.searchParams.get("secret");
    if (auth !== `Bearer ${cronSecret}` && qs !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "No admin DB client" }, { status: 503 });
  }

  // ------------------------------------------------------------------
  // Resolve active tournament dynamically
  // ------------------------------------------------------------------
  const { data: tournament } = await supabase
    .from("tournaments")
    .select("id")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!tournament) {
    return NextResponse.json({ error: "No tournament found" }, { status: 404 });
  }

  // ------------------------------------------------------------------
  // Find scheduled fixtures in the next 24 hours
  // ------------------------------------------------------------------
  const now = new Date();
  const cutoff = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const { data: fixtures } = await supabase
    .from("fixtures")
    .select("id, match_number, starts_at, home_team_id, away_team_id")
    .eq("status", "scheduled")
    .eq("tournament_id", tournament.id)
    .gte("starts_at", now.toISOString())
    .lte("starts_at", cutoff.toISOString())
    .limit(20);

  if (!fixtures || fixtures.length === 0) {
    return NextResponse.json({
      status: "skipped",
      reason: "No scheduled fixtures in the next 24 hours",
      durationMs: Date.now() - startedAt,
    });
  }

  // ------------------------------------------------------------------
  // Compute predictions for each fixture
  // ------------------------------------------------------------------
  let fixturesProcessed = 0;

  for (const fixture of fixtures as FixtureRow[]) {
    await processFixture(supabase, fixture, tournament.id);
    fixturesProcessed++;
  }

  return NextResponse.json({
    status: "ok",
    timestamp: now.toISOString(),
    fixturesProcessed,
    durationMs: Date.now() - startedAt,
  });
}

// ---------------------------------------------------------------------------
// Per-fixture processing
// ---------------------------------------------------------------------------

type FixtureRow = {
  id: string;
  match_number: number;
  starts_at: string;
  home_team_id: string;
  away_team_id: string;
};

type PlayerRow = {
  name: string;
  known_as: string | null;
  position: string;
};

type HistMatchRow = {
  team_history_goals: Array<{ scorer: string | null; own_goal: boolean }>;
};

type EventRow = {
  title: string;
  event_type: string;
};

async function processFixture(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  fixture: FixtureRow,
  tournamentId: string,
) {
  const teamIds = [fixture.home_team_id, fixture.away_team_id];

  // Get team info for both sides (current_rank used for match winner model)
  const { data: teams } = await supabase
    .from("teams")
    .select("id, slug, name, current_rank")
    .in("id", teamIds);

  if (!teams || teams.length < 2) return;

  type TeamRow = { id: string; slug: string; name: string; current_rank: number | null };
  const typedTeams = teams as TeamRow[];

  // WC games played per team (denominator for WC event rates)
  const { data: wcFixtures } = await supabase
    .from("fixtures")
    .select("id, home_team_id, away_team_id")
    .eq("status", "completed")
    .eq("tournament_id", tournamentId)
    .or(teamIds.map((id) => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(","));

  const wcGamesByTeam: Record<string, number> = {};
  for (const id of teamIds) wcGamesByTeam[id] = 0;
  for (const f of wcFixtures ?? []) {
    if (wcGamesByTeam[f.home_team_id] !== undefined) wcGamesByTeam[f.home_team_id]++;
    if (wcGamesByTeam[f.away_team_id] !== undefined) wcGamesByTeam[f.away_team_id]++;
  }

  // ------------------------------------------------------------------
  // Match winner: logistic model on FIFA ranking — runs regardless of
  // whether we have player data, so "Our call" always appears.
  // Rank diff > 0 means away team is weaker → home team favored.
  // ------------------------------------------------------------------
  const homeTeam = typedTeams.find((t) => t.id === fixture.home_team_id);
  const awayTeam = typedTeams.find((t) => t.id === fixture.away_team_id);
  const homeRankRaw = homeTeam?.current_rank;
  const awayRankRaw = awayTeam?.current_rank;
  // When both ranks are missing, apply slight home-team edge (WC listed-first advantage).
  // When one or both are set, use the logistic ranking model.
  const pHome =
    homeRankRaw == null && awayRankRaw == null
      ? 0.55
      : 1 / (1 + Math.exp(-0.015 * ((awayRankRaw ?? 50) - (homeRankRaw ?? 50))));
  const winnerTeam = pHome >= 0.5 ? homeTeam : awayTeam;
  const winnerProb = pHome >= 0.5 ? pHome : 1 - pHome;

  // Clear stale model predictions, then insert match_winner first
  await supabase
    .from("predictions")
    .delete()
    .eq("fixture_id", fixture.id)
    .eq("source", "model");

  if (winnerTeam && winnerProb > 0.52) {
    await supabase.from("predictions").insert({
      tournament_id: tournamentId,
      fixture_id: fixture.id,
      prediction_type: "match_winner",
      subject_type: "team",
      probability: winnerProb,
      label: winnerTeam.name,
      source: "model",
      model_version: "v1-ranking",
      valid_until: fixture.starts_at,
    });
  }

  // ------------------------------------------------------------------
  // Player predictions — only if squad data exists
  // ------------------------------------------------------------------
  const allProfiles: PlayerProfile[] = [];

  for (const team of typedTeams) {
    const profiles = await buildTeamProfiles(
      supabase,
      team,
      wcGamesByTeam[team.id] ?? 0,
    );
    allProfiles.push(...profiles);
  }

  if (allProfiles.length === 0) return;

  // Rank and take top 5 for goals and cards (combined across both teams)
  const top5Goals = [...allProfiles]
    .sort((a, b) => b.goalScore - a.goalScore)
    .slice(0, 5);

  const top5Cards = [...allProfiles]
    .sort((a, b) => b.cardScore - a.cardScore)
    .slice(0, 5);

  const rows = [
    ...top5Goals.map((p) => ({
      tournament_id: tournamentId,
      fixture_id: fixture.id,
      prediction_type: "player_goal",
      subject_type: "player",
      probability: p.goalScore,
      label: p.displayName,
      source: "model",
      model_version: "v1-position-weighted",
      valid_until: fixture.starts_at,
    })),
    ...top5Cards.map((p) => ({
      tournament_id: tournamentId,
      fixture_id: fixture.id,
      prediction_type: "player_card",
      subject_type: "player",
      probability: p.cardScore,
      label: p.displayName,
      source: "model",
      model_version: "v1-position-weighted",
      valid_until: fixture.starts_at,
    })),
  ];

  await supabase.from("predictions").insert(rows);
}

// ---------------------------------------------------------------------------
// Build player profiles for one team
// ---------------------------------------------------------------------------

type PlayerProfile = {
  displayName: string;
  goalScore: number;
  cardScore: number;
};

async function buildTeamProfiles(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  team: { id: string; slug: string; name: string },
  wcGamesPlayed: number,
): Promise<PlayerProfile[]> {
  // Fetch squad, WC events, and history in parallel
  const [playersResult, wcEventsResult, histResult] = await Promise.all([
    supabase
      .from("players")
      .select("name, known_as, position, teams!inner(slug)")
      .eq("teams.slug", team.slug),
    supabase
      .from("match_events")
      .select("title, event_type")
      .eq("team_id", team.id)
      .in("event_type", ["goal", "penalty_goal", "yellow_card", "red_card"]),
    supabase
      .from("team_history_matches")
      .select("team_history_goals(scorer, own_goal)")
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`),
  ]);

  const players = (playersResult.data ?? []) as PlayerRow[];
  if (players.length === 0) return [];

  // Aggregate WC goals and cards by player name (lowercased for matching)
  const wcGoals: Record<string, number> = {};
  const wcCards: Record<string, number> = {};
  for (const ev of (wcEventsResult.data ?? []) as EventRow[]) {
    const name = extractName(ev.title).toLowerCase();
    if (!name) continue;
    if (ev.event_type === "goal" || ev.event_type === "penalty_goal") {
      wcGoals[name] = (wcGoals[name] ?? 0) + 1;
    } else if (ev.event_type === "red_card") {
      wcCards[name] = (wcCards[name] ?? 0) + 2; // red = 2 yellow-equivalents
    } else if (ev.event_type === "yellow_card") {
      wcCards[name] = (wcCards[name] ?? 0) + 1;
    }
  }

  // Aggregate historical goals by scorer name
  const histGoals: Record<string, number> = {};
  const histMatches = (histResult.data ?? []) as HistMatchRow[];
  for (const match of histMatches) {
    for (const goal of match.team_history_goals ?? []) {
      if (!goal.own_goal && goal.scorer) {
        const name = goal.scorer.trim().toLowerCase();
        histGoals[name] = (histGoals[name] ?? 0) + 1;
      }
    }
  }
  const histGames = histMatches.length;

  // Build a profile for each player
  return players.map((player) => {
    const displayName = player.known_as ?? player.name;
    // Try exact match then first-word fallback for name linking
    const nameLower = player.name.toLowerCase();
    const knownLower = (player.known_as ?? "").toLowerCase();

    const lookup = (bag: Record<string, number>) => {
      if (bag[nameLower]) return bag[nameLower];
      if (knownLower && bag[knownLower]) return bag[knownLower];
      // First-word fallback
      const first = nameLower.split(" ")[0];
      return Object.entries(bag).find(([k]) => k.includes(first))?.[1] ?? 0;
    };

    const pos = player.position ?? "";
    const goalScore = computeScore(
      goalWeight(pos),
      lookup(wcGoals),
      wcGamesPlayed,
      lookup(histGoals),
      histGames,
    );
    const cardScore = computeScore(
      cardWeight(pos),
      lookup(wcCards),
      wcGamesPlayed,
      0, // no historical card data
      0,
    );

    return { displayName, goalScore, cardScore };
  });
}
