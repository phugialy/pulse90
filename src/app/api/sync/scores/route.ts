import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FixtureRow = {
  id: string;
  tournament_id: string;
  match_number: number;
  starts_at: string;
  status: string;
  group_code: string | null;
  minute: number | null;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string;
  away_team_id: string;
};

type TeamRow = {
  id: string;
  fifa_code: string;
  name: string;
};

type EspnCompetitor = {
  homeAway: "home" | "away";
  score: string;
  team: { id: string; abbreviation: string; displayName: string };
};

type EspnDetail = {
  type: { text: string };
  clock: { displayValue: string };
  team: { id: string };
  athletesInvolved?: Array<{ displayName: string }>;
  scoringPlay: boolean;
  ownGoal: boolean;
  penaltyKick: boolean;
  yellowCard: boolean;
  redCard: boolean;
};

type EspnStatus = {
  type: { name: string; completed: boolean };
  displayClock: string;
  period: number;
};

type EspnEvent = {
  id: string;
  date: string;
  status: EspnStatus;
  competitions: Array<{
    competitors: EspnCompetitor[];
    details?: EspnDetail[];
  }>;
};

type MatchEventInsert = {
  fixture_id: string;
  team_id: string | null;
  event_type: string;
  minute: number | null;
  stoppage_minute: number | null;
  title: string;
  importance: number;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Pre-match window: start watching this many minutes before kickoff
const PRE_MATCH_MINUTES = 5;

// Note: standings recalculation is handled automatically by the DB trigger
// recalculate_group_standings_on_fixture_change — no application-level work needed.

// ---------------------------------------------------------------------------
// ESPN fetch
// ---------------------------------------------------------------------------

async function fetchEspnScores(): Promise<EspnEvent[]> {
  const url =
    "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "pulse90-sync/1.0" },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { events?: EspnEvent[] };
    return data.events ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toOurStatus(
  espn: EspnStatus,
): "scheduled" | "live" | "completed" | "postponed" | "cancelled" {
  if (espn.type.completed) return "completed";
  const n = espn.type.name;
  if (
    n === "STATUS_IN_PROGRESS" ||
    n === "STATUS_HALFTIME" ||
    n === "STATUS_END_PERIOD"
  )
    return "live";
  if (n === "STATUS_POSTPONED") return "postponed";
  if (n === "STATUS_CANCELED") return "cancelled";
  return "scheduled";
}

function parseMinute(clock: string, period: number): number | null {
  if (!clock) return null;
  const base = parseInt(clock.split(":")[0], 10);
  if (isNaN(base)) return null;
  if (period === 2) return Math.max(45, base);
  return base;
}

function matchesTeam(espnTeam: EspnCompetitor["team"], our: TeamRow): boolean {
  const abbr = espnTeam.abbreviation.toUpperCase();
  const displayLower = espnTeam.displayName.toLowerCase();
  const ourCode = our.fifa_code.toUpperCase();
  const ourFirstWord = our.name.split(" ")[0].toLowerCase();
  return abbr === ourCode || displayLower.includes(ourFirstWord);
}

function findEspnEvent(
  events: EspnEvent[],
  home: TeamRow,
  away: TeamRow,
): EspnEvent | undefined {
  return events.find((evt) => {
    const comp = evt.competitions[0];
    if (!comp) return false;
    const hComp = comp.competitors.find((c) => c.homeAway === "home");
    const aComp = comp.competitors.find((c) => c.homeAway === "away");
    if (!hComp || !aComp) return false;
    return matchesTeam(hComp.team, home) && matchesTeam(aComp.team, away);
  });
}

function parseDisplayMinute(displayValue: string): {
  minute: number | null;
  stoppageMinute: number | null;
} {
  const cleaned = (displayValue ?? "").replace("'", "").trim();
  const parts = cleaned.split("+");
  const minute = parseInt(parts[0], 10);
  const stoppageRaw = parts.length > 1 ? parseInt(parts[1], 10) : null;
  return {
    minute: isNaN(minute) ? null : minute,
    stoppageMinute: stoppageRaw !== null && !isNaN(stoppageRaw) ? stoppageRaw : null,
  };
}

function buildMatchEvents(
  fixtureId: string,
  details: EspnDetail[],
  espnIdToTeamId: Map<string, string>,
): MatchEventInsert[] {
  const events: MatchEventInsert[] = [];

  for (const detail of details) {
    const playerName = detail.athletesInvolved?.[0]?.displayName ?? "Unknown";
    const teamId = detail.team?.id ? (espnIdToTeamId.get(detail.team.id) ?? null) : null;
    const { minute, stoppageMinute } = parseDisplayMinute(detail.clock.displayValue);
    const minStr =
      minute !== null ? `${minute}${stoppageMinute ? `+${stoppageMinute}` : ""}'` : "";

    if (detail.scoringPlay) {
      events.push({
        fixture_id: fixtureId,
        team_id: teamId,
        event_type: detail.ownGoal
          ? "own_goal"
          : detail.penaltyKick
            ? "penalty_goal"
            : "goal",
        minute,
        stoppage_minute: stoppageMinute,
        title: `${playerName} ${minStr}`.trim(),
        importance: 5,
      });
    } else if (detail.redCard) {
      events.push({
        fixture_id: fixtureId,
        team_id: teamId,
        event_type: "red_card",
        minute,
        stoppage_minute: stoppageMinute,
        title: `${playerName} ${minStr}`.trim(),
        importance: 4,
      });
    } else if (detail.yellowCard) {
      events.push({
        fixture_id: fixtureId,
        team_id: teamId,
        event_type: "yellow_card",
        minute,
        stoppage_minute: stoppageMinute,
        title: `${playerName} ${minStr}`.trim(),
        importance: 2,
      });
    }
  }

  return events;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  // ------------------------------------------------------------------
  // Auth
  // ------------------------------------------------------------------
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");
    const ok =
      authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;
    if (!ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "No admin DB client — SUPABASE_SERVICE_ROLE_KEY missing" },
      { status: 503 },
    );
  }

  const now = new Date();
  const preMatchCutoff = new Date(now.getTime() + PRE_MATCH_MINUTES * 60 * 1000);
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  // ------------------------------------------------------------------
  // Parallel queries: active fixtures (score sync) + completed today (event backfill)
  // ------------------------------------------------------------------
  const [windowResult, completedResult] = await Promise.all([
    supabase
      .from("fixtures")
      .select(
        "id, tournament_id, match_number, starts_at, status, group_code, minute, home_score, away_score, home_team_id, away_team_id",
      )
      .in("status", ["live", "scheduled"])
      .lte("starts_at", preMatchCutoff.toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("fixtures")
      .select("id, home_team_id, away_team_id, match_number")
      .eq("status", "completed")
      .gte("starts_at", startOfDay.toISOString()),
  ]);

  if (windowResult.error) {
    await writeJobRun(supabase, {
      job_name: "score_sync",
      status: "failed",
      started_at: new Date(startedAt).toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      records_read: 0,
      records_changed: 0,
      error_message: windowResult.error.message,
      metadata: {},
    });
    return NextResponse.json({ error: windowResult.error.message }, { status: 500 });
  }

  const windowFixtures = (windowResult.data ?? []) as FixtureRow[];
  const completedToday = (completedResult.data ?? []) as Pick<
    FixtureRow,
    "id" | "home_team_id" | "away_team_id" | "match_number"
  >[];

  // ------------------------------------------------------------------
  // Determine completed fixtures that still need events synced
  // ------------------------------------------------------------------
  let completedNeedingEvents: typeof completedToday = [];
  if (completedToday.length > 0) {
    const { data: hasEvents } = await supabase
      .from("match_events")
      .select("fixture_id")
      .in(
        "fixture_id",
        completedToday.map((f) => f.id),
      );
    const withEventsSet = new Set((hasEvents ?? []).map((e: { fixture_id: string }) => e.fixture_id));
    completedNeedingEvents = completedToday.filter((f) => !withEventsSet.has(f.id));
  }

  // ------------------------------------------------------------------
  // Smart skip: nothing in score window AND no event backfill needed
  // ------------------------------------------------------------------
  if (windowFixtures.length === 0 && completedNeedingEvents.length === 0) {
    const { data: next } = await supabase
      .from("fixtures")
      .select("starts_at, match_number")
      .eq("status", "scheduled")
      .order("starts_at", { ascending: true })
      .limit(1)
      .single();

    const hoursUntilNext = next
      ? (
          (new Date(next.starts_at).getTime() - now.getTime()) /
          3_600_000
        ).toFixed(1)
      : null;

    await writeJobRun(supabase, {
      job_name: "score_sync",
      status: "skipped",
      started_at: new Date(startedAt).toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      records_read: 0,
      records_changed: 0,
      metadata: { hoursUntilNext, nextMatchNumber: next?.match_number ?? null },
    });

    return NextResponse.json({
      status: "skipped",
      reason: "No active match window",
      hoursUntilNext,
      nextMatchNumber: next?.match_number ?? null,
    });
  }

  // ------------------------------------------------------------------
  // Fetch team info for all involved fixtures
  // ------------------------------------------------------------------
  const allFixtureIds = [
    ...windowFixtures,
    ...completedNeedingEvents,
  ];
  const teamIds = [
    ...new Set(allFixtureIds.flatMap((f) => [f.home_team_id, f.away_team_id])),
  ];
  const { data: teamRows } = await supabase
    .from("teams")
    .select("id, fifa_code, name")
    .in("id", teamIds);

  const teamMap = new Map(
    (teamRows ?? []).map((t: TeamRow) => [t.id, t]),
  );

  // ------------------------------------------------------------------
  // Fetch ESPN live scoreboard
  // ------------------------------------------------------------------
  const espnEvents = await fetchEspnScores();

  // ------------------------------------------------------------------
  // Score sync loop — also syncs events for newly completed fixtures
  // ------------------------------------------------------------------
  type UpdateRecord = {
    matchNumber: number;
    home: number | null;
    away: number | null;
    status: string;
    minute: number | null;
  };
  const updated: UpdateRecord[] = [];

  for (const fixture of windowFixtures) {
    const homeTeam = teamMap.get(fixture.home_team_id);
    const awayTeam = teamMap.get(fixture.away_team_id);
    if (!homeTeam || !awayTeam) continue;

    const espnEvt = findEspnEvent(espnEvents, homeTeam, awayTeam);
    if (!espnEvt) continue;

    const comp = espnEvt.competitions[0];
    const hComp = comp?.competitors.find((c) => c.homeAway === "home");
    const aComp = comp?.competitors.find((c) => c.homeAway === "away");

    const newHomeScore = hComp ? parseInt(hComp.score, 10) : null;
    const newAwayScore = aComp ? parseInt(aComp.score, 10) : null;
    const newStatus = toOurStatus(espnEvt.status);
    const newMinute = parseMinute(
      espnEvt.status.displayClock,
      espnEvt.status.period,
    );

    const homeScoreVal = isNaN(newHomeScore!) ? null : newHomeScore;
    const awayScoreVal = isNaN(newAwayScore!) ? null : newAwayScore;

    const scoreChanged =
      homeScoreVal !== fixture.home_score ||
      awayScoreVal !== fixture.away_score ||
      newStatus !== fixture.status ||
      newMinute !== fixture.minute;

    if (scoreChanged) {
      await supabase
        .from("fixtures")
        .update({
          home_score: homeScoreVal,
          away_score: awayScoreVal,
          status: newStatus,
          minute: newMinute,
          source_updated_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", fixture.id);

      updated.push({
        matchNumber: fixture.match_number,
        home: homeScoreVal,
        away: awayScoreVal,
        status: newStatus,
        minute: newMinute,
      });
    }

    // Sync match events when fixture is completed and ESPN has details
    if (newStatus === "completed" && (comp?.details?.length ?? 0) > 0) {
      const espnIdToTeamId = new Map<string, string>();
      if (hComp) espnIdToTeamId.set(hComp.team.id, fixture.home_team_id);
      if (aComp) espnIdToTeamId.set(aComp.team.id, fixture.away_team_id);
      const eventsToInsert = buildMatchEvents(fixture.id, comp!.details!, espnIdToTeamId);
      if (eventsToInsert.length > 0) {
        // Upsert guard: only insert if no events exist (prevents double inserts)
        const { count: existing } = await supabase
          .from("match_events")
          .select("id", { count: "exact", head: true })
          .eq("fixture_id", fixture.id);
        if (!existing) {
          await supabase.from("match_events").insert(eventsToInsert);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Event backfill: completed today fixtures that still need events
  // ------------------------------------------------------------------
  let eventsBackfilled = 0;

  for (const fixture of completedNeedingEvents) {
    const homeTeam = teamMap.get(fixture.home_team_id);
    const awayTeam = teamMap.get(fixture.away_team_id);
    if (!homeTeam || !awayTeam) continue;

    const espnEvt = findEspnEvent(espnEvents, homeTeam, awayTeam);
    if (!espnEvt) continue;

    const comp = espnEvt.competitions[0];
    const details = comp?.details ?? [];
    if (details.length === 0) continue;

    const hComp = comp.competitors.find((c) => c.homeAway === "home");
    const aComp = comp.competitors.find((c) => c.homeAway === "away");
    const espnIdToTeamId = new Map<string, string>();
    if (hComp) espnIdToTeamId.set(hComp.team.id, fixture.home_team_id);
    if (aComp) espnIdToTeamId.set(aComp.team.id, fixture.away_team_id);

    const eventsToInsert = buildMatchEvents(fixture.id, details, espnIdToTeamId);
    if (eventsToInsert.length > 0) {
      await supabase.from("match_events").insert(eventsToInsert);
      eventsBackfilled++;
    }
  }

  // ------------------------------------------------------------------
  // Log the run
  // ------------------------------------------------------------------
  await writeJobRun(supabase, {
    job_name: "score_sync",
    status: "success",
    started_at: new Date(startedAt).toISOString(),
    finished_at: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
    records_read: windowFixtures.length,
    records_changed: updated.length,
    metadata: {
      espnEventsFound: espnEvents.length,
      fixtures: updated,
      eventsBackfilled,
    },
  });

  return NextResponse.json({
    status: "ok",
    timestamp: now.toISOString(),
    activeFixtures: windowFixtures.length,
    updated,
    eventsBackfilled,
    durationMs: Date.now() - startedAt,
  });
}

// ---------------------------------------------------------------------------
// job_runs helper
// ---------------------------------------------------------------------------

type JobRunInsert = {
  job_name: string;
  status: "running" | "success" | "failed" | "skipped";
  started_at: string;
  finished_at: string;
  duration_ms: number;
  records_read: number;
  records_changed: number;
  error_message?: string;
  metadata: Record<string, unknown>;
};

async function writeJobRun(
  supabase: NonNullable<ReturnType<typeof getSupabaseAdminClient>>,
  run: JobRunInsert,
) {
  await supabase.from("job_runs").insert(run);
}
