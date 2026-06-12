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
  team: { abbreviation: string; displayName: string };
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
  competitions: Array<{ competitors: EspnCompetitor[] }>;
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
      // Never serve stale data for live scores
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
  // ESPN format: "43:00", "90:00+5" etc.
  const base = parseInt(clock.split(":")[0], 10);
  if (isNaN(base)) return null;
  // Second half — floor at 45
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

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  // ------------------------------------------------------------------
  // Auth: Vercel cron sends Authorization: Bearer <CRON_SECRET>
  // Also accept ?secret= for manual dev calls when CRON_SECRET is set.
  // If CRON_SECRET is not set (local dev), skip the check entirely.
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

  // ------------------------------------------------------------------
  // Find fixtures that are live OR scheduled but already started
  // (covers catch-up: matches that completed while the sync was down)
  // "scheduled" + starts_at <= now+5min = kickoff imminent or already past
  // The DB trigger handles standings the moment we write the score.
  // ------------------------------------------------------------------
  const { data: windowFixtures, error: windowError } = await supabase
    .from("fixtures")
    .select(
      "id, tournament_id, match_number, starts_at, status, group_code, minute, home_score, away_score, home_team_id, away_team_id",
    )
    .in("status", ["live", "scheduled"])
    .lte("starts_at", preMatchCutoff.toISOString())
    .order("starts_at", { ascending: true });

  if (windowError) {
    await writeJobRun(supabase, {
      job_name: "score_sync",
      status: "failed",
      started_at: new Date(startedAt).toISOString(),
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      records_read: 0,
      records_changed: 0,
      error_message: windowError.message,
      metadata: {},
    });
    return NextResponse.json({ error: windowError.message }, { status: 500 });
  }

  // ------------------------------------------------------------------
  // Smart skip: nothing in window — report next match time and bail
  // ------------------------------------------------------------------
  if (!windowFixtures || windowFixtures.length === 0) {
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
  const teamIds = [
    ...new Set(
      (windowFixtures as FixtureRow[]).flatMap((f) => [
        f.home_team_id,
        f.away_team_id,
      ]),
    ),
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
  // Update each fixture in the window.
  // Writing home_score/away_score/status fires the DB trigger
  // recalculate_group_standings_on_fixture_change automatically —
  // no application-level standings work needed.
  // ------------------------------------------------------------------
  type UpdateRecord = {
    matchNumber: number;
    home: number | null;
    away: number | null;
    status: string;
    minute: number | null;
  };
  const updated: UpdateRecord[] = [];

  for (const fixture of windowFixtures as FixtureRow[]) {
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

    // Skip if nothing changed
    if (
      homeScoreVal === fixture.home_score &&
      awayScoreVal === fixture.away_score &&
      newStatus === fixture.status &&
      newMinute === fixture.minute
    ) {
      continue;
    }

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
    },
  });

  return NextResponse.json({
    status: "ok",
    timestamp: now.toISOString(),
    activeFixtures: windowFixtures.length,
    updated,
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
