import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { seedKnockoutFixtures } from "@/lib/seed-knockout-fixtures";

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
  period_display: string | null;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string;
  away_team_id: string;
};

type EspnSummaryRosterEntry = {
  starter: boolean;
  athlete: { displayName: string };
  position: { abbreviation: string };
  formationPlace?: string;
};

type EspnSummary = {
  rosters?: Array<{
    team: { id: string };
    roster?: EspnSummaryRosterEntry[];
    formation?: string;
  }>;
};

type TeamRow = {
  id: string;
  fifa_code: string;
  name: string;
};

type EspnCompetitor = {
  homeAway: "home" | "away";
  score: string;
  winner?: boolean;
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

async function fetchEspnSummary(espnEventId: string): Promise<EspnSummary | null> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${espnEventId}`;
    const resp = await fetch(url, {
      headers: { "User-Agent": "pulse90-sync/1.0" },
      cache: "no-store",
    });
    if (!resp.ok) return null;
    return (await resp.json()) as EspnSummary;
  } catch {
    return null;
  }
}

async function fetchEspnScores(): Promise<EspnEvent[]> {
  const base = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

  // Fetch today + last 4 days so R32 matches (spanning Jun 28–Jul 4) are always
  // covered even after they drop off the "yesterday" window. ESPN's scoreboard
  // endpoint accepts any historical date, so this is safe and fast.
  const today = new Date();
  const fmt = (d: Date) =>
    `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;

  const urls: string[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    urls.push(`${base}?dates=${fmt(d)}`);
  }

  const results = await Promise.allSettled(
    urls.map((url) =>
      fetch(url, { headers: { "User-Agent": "pulse90-sync/1.0" }, cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { events: [] }))
        .then((d: { events?: EspnEvent[] }) => d.events ?? [])
        .catch(() => [] as EspnEvent[]),
    ),
  );

  const seen = new Set<string>();
  const events: EspnEvent[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") {
      for (const e of r.value) {
        if (!seen.has(e.id)) { seen.add(e.id); events.push(e); }
      }
    }
  }
  return events;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toPeriodDisplay(espn: EspnStatus): string | null {
  return espn.type.name === "STATUS_HALFTIME" ? "HT" : null;
}

function deriveFormation(players: EspnSummaryRosterEntry[]): string {
  const starters = players.filter((p) => p.starter);
  let df = 0, mf = 0, fw = 0;
  for (const p of starters) {
    const abbr = p.position.abbreviation;
    if (["CB","LB","RB","LWB","RWB","SW","FB","D","DF"].includes(abbr)) df++;
    else if (["CDM","CM","CAM","LM","RM","DM","AM","M","MF"].includes(abbr)) mf++;
    else if (["ST","CF","LW","RW","SS","FW","F"].includes(abbr)) fw++;
  }
  if (df + mf + fw < 9) return "4-3-3";
  return `${df}-${mf}-${fw}`;
}

function toOurStatus(
  espn: EspnStatus,
): "scheduled" | "live" | "completed" | "postponed" | "cancelled" {
  if (espn.type.completed) return "completed";
  const n = espn.type.name;
  if (n === "STATUS_POSTPONED") return "postponed";
  if (n === "STATUS_CANCELED") return "cancelled";
  // Treat any non-scheduled status as live — ESPN may return unexpected
  // in-progress type names (STATUS_SECOND_HALF, STATUS_EXTRA_TIME, etc.)
  // that we haven't explicitly listed. Defaulting to "scheduled" caused
  // the DB to store scores with wrong status.
  if (n === "STATUS_SCHEDULED") return "scheduled";
  return "live";
}

function parseMinute(clock: string, period: number): number | null {
  if (!clock) return null;
  const base = parseInt(clock.split(":")[0], 10);
  if (isNaN(base)) return null;
  if (period === 2) return Math.max(45, base);
  return base;
}

const ESPN_NAME_ALIASES: Record<string, string> = {
  "south korea": "korea republic",
  "czechia": "czech republic",
  "north korea": "dpr korea",
  "ivory coast": "cote d'ivoire",
  "cote d'ivoire": "ivory coast",
  "côte d'ivoire": "ivory coast",
  "republic of ireland": "ireland",
  "trinidad and tobago": "trinidad",
  "cape verde": "cape verde islands",
  "dr congo": "congo dr",
  "congo dr": "dr congo",
  "democratic republic of congo": "congo",
};

function matchesTeam(espnTeam: EspnCompetitor["team"], our: TeamRow): boolean {
  const abbr = espnTeam.abbreviation.toUpperCase();
  const displayLower = espnTeam.displayName.toLowerCase();
  const ourCode = our.fifa_code.toUpperCase();
  const ourNameLower = our.name.toLowerCase();
  const ourFirstWord = ourNameLower.split(" ")[0];

  if (abbr === ourCode) return true;
  if (displayLower === ourNameLower) return true;
  if (ourFirstWord.length > 3 && displayLower.includes(ourFirstWord)) return true;

  const alias = ESPN_NAME_ALIASES[ourNameLower];
  if (alias && displayLower.includes(alias)) return true;

  return false;
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
  // 48h lookback catches matches that kicked off in US evening (yesterday UTC)
  const backfillCutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  // ------------------------------------------------------------------
  // Parallel queries: active fixtures (score sync) + completed today (event backfill)
  //                 + completed fixtures with null scores (score backfill)
  // ------------------------------------------------------------------
  const [windowResult, completedResult, nullScoreResult] = await Promise.all([
    supabase
      .from("fixtures")
      .select(
        "id, tournament_id, match_number, starts_at, status, group_code, minute, period_display, home_score, away_score, home_team_id, away_team_id",
      )
      .in("status", ["live", "scheduled"])
      .lte("starts_at", preMatchCutoff.toISOString())
      .order("starts_at", { ascending: true }),
    supabase
      .from("fixtures")
      .select("id, home_team_id, away_team_id, match_number")
      .eq("status", "completed")
      .gte("starts_at", backfillCutoff.toISOString()),
    // Backfill: completed matches that were auto-completed without scores (ESPN mismatch)
    supabase
      .from("fixtures")
      .select("id, home_team_id, away_team_id, match_number")
      .eq("status", "completed")
      .is("home_score", null),
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
  const nullScoreFixtures = (nullScoreResult.data ?? []) as Pick<
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
  // Smart skip: nothing in score window AND no event backfill AND no null scores
  // ------------------------------------------------------------------
  if (windowFixtures.length === 0 && completedNeedingEvents.length === 0 && nullScoreFixtures.length === 0) {
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
    ...nullScoreFixtures,
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
    const newPeriodDisplay = toPeriodDisplay(espnEvt.status);

    const homeScoreVal = isNaN(newHomeScore!) ? null : newHomeScore;
    const awayScoreVal = isNaN(newAwayScore!) ? null : newAwayScore;

    // Detect penalty shootout winner via ESPN's winner flag on each competitor.
    // Only applies to completed knockout matches (match_number >= 74) that ended level.
    let homePenalties: number | null = null;
    let awayPenalties: number | null = null;
    const isKnockout = fixture.match_number >= 74;
    if (
      newStatus === "completed" &&
      isKnockout &&
      homeScoreVal !== null &&
      awayScoreVal !== null &&
      homeScoreVal === awayScoreVal
    ) {
      if (hComp?.winner) { homePenalties = 1; awayPenalties = 0; }
      else if (aComp?.winner) { homePenalties = 0; awayPenalties = 1; }
    }

    const scoreChanged =
      homeScoreVal !== fixture.home_score ||
      awayScoreVal !== fixture.away_score ||
      newStatus !== fixture.status ||
      newMinute !== fixture.minute ||
      newPeriodDisplay !== fixture.period_display;

    if (scoreChanged) {
      await supabase
        .from("fixtures")
        .update({
          home_score: homeScoreVal,
          away_score: awayScoreVal,
          ...(homePenalties !== null ? { home_penalties: homePenalties, away_penalties: awayPenalties } : {}),
          status: newStatus,
          minute: newMinute,
          period_display: newPeriodDisplay,
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

    // Sync match events during live play and on completion.
    // ESPN details are cumulative, so we replace when count changes.
    if ((newStatus === "live" || newStatus === "completed") && (comp?.details?.length ?? 0) > 0) {
      const espnIdToTeamId = new Map<string, string>();
      if (hComp) espnIdToTeamId.set(hComp.team.id, fixture.home_team_id);
      if (aComp) espnIdToTeamId.set(aComp.team.id, fixture.away_team_id);
      const eventsToInsert = buildMatchEvents(fixture.id, comp!.details!, espnIdToTeamId);
      if (eventsToInsert.length > 0) {
        const { count: dbCount } = await supabase
          .from("match_events")
          .select("id", { count: "exact", head: true })
          .eq("fixture_id", fixture.id);
        if ((dbCount ?? 0) !== eventsToInsert.length) {
          await supabase.from("match_events").delete().eq("fixture_id", fixture.id);
          await supabase.from("match_events").insert(eventsToInsert);
        }
      }
    }
  }

  // ------------------------------------------------------------------
  // Auto-complete stuck "live" fixtures ESPN has already removed from feed
  // 90 min game + 15 min break + ~10 min stoppage + 15 min buffer = 130 min
  // ------------------------------------------------------------------
  const autoCompleteMs = 130 * 60 * 1000;
  const stuckLive = windowFixtures.filter(
    (f) => f.status === "live" && new Date(f.starts_at).getTime() + autoCompleteMs < now.getTime(),
  );
  for (const fixture of stuckLive) {
    await supabase
      .from("fixtures")
      .update({ status: "completed", updated_at: now.toISOString() })
      .eq("id", fixture.id);
    updated.push({
      matchNumber: fixture.match_number,
      home: fixture.home_score,
      away: fixture.away_score,
      status: "completed",
      minute: fixture.minute,
    });
  }

  // ------------------------------------------------------------------
  // Auto-promote: scheduled fixtures past kickoff that ESPN couldn't match
  // Prevents status getting stuck at 'scheduled' when ESPN matching fails.
  // ------------------------------------------------------------------
  const autoPromote = windowFixtures.filter(
    (f) => f.status === "scheduled" && new Date(f.starts_at).getTime() + 60_000 < now.getTime(),
  );
  for (const fixture of autoPromote) {
    await supabase
      .from("fixtures")
      .update({ status: "live", updated_at: now.toISOString() })
      .eq("id", fixture.id);
    updated.push({
      matchNumber: fixture.match_number,
      home: fixture.home_score,
      away: fixture.away_score,
      status: "live (auto-promoted)",
      minute: fixture.minute,
    });
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
  // Score backfill: completed fixtures with null scores — ESPN matched them now
  // (happens when a match was auto-completed before ESPN name matching worked,
  //  or when ESPN data only becomes available after the match ends)
  // ------------------------------------------------------------------
  let scoresBackfilled = 0;

  for (const fixture of nullScoreFixtures) {
    const homeTeam = teamMap.get(fixture.home_team_id);
    const awayTeam = teamMap.get(fixture.away_team_id);
    if (!homeTeam || !awayTeam) continue;

    const espnEvt = findEspnEvent(espnEvents, homeTeam, awayTeam);
    if (!espnEvt) continue;

    const comp = espnEvt.competitions[0];
    const hComp = comp?.competitors.find((c) => c.homeAway === "home");
    const aComp = comp?.competitors.find((c) => c.homeAway === "away");

    const homeScoreVal = hComp ? parseInt(hComp.score, 10) : NaN;
    const awayScoreVal = aComp ? parseInt(aComp.score, 10) : NaN;
    if (isNaN(homeScoreVal) || isNaN(awayScoreVal)) continue;

    let homePenalties: number | null = null;
    let awayPenalties: number | null = null;
    const isKnockout = fixture.match_number >= 74;
    if (isKnockout && homeScoreVal === awayScoreVal) {
      if (hComp?.winner) { homePenalties = 1; awayPenalties = 0; }
      else if (aComp?.winner) { homePenalties = 0; awayPenalties = 1; }
    }

    await supabase
      .from("fixtures")
      .update({
        home_score: homeScoreVal,
        away_score: awayScoreVal,
        ...(homePenalties !== null ? { home_penalties: homePenalties, away_penalties: awayPenalties } : {}),
        source_updated_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", fixture.id);

    scoresBackfilled++;
    updated.push({
      matchNumber: fixture.match_number,
      home: homeScoreVal,
      away: awayScoreVal,
      status: "completed",
      minute: null,
    });
  }

  // ------------------------------------------------------------------
  // Lineup sync: one-shot per fixture from ESPN summary endpoint
  // Skip fixtures that already have both team lineups stored (count >= 2)
  // ------------------------------------------------------------------
  let lineupsUpserted = 0;

  for (const fixture of windowFixtures) {
    const homeTeam = teamMap.get(fixture.home_team_id);
    const awayTeam = teamMap.get(fixture.away_team_id);
    if (!homeTeam || !awayTeam) continue;

    const espnEvt = findEspnEvent(espnEvents, homeTeam, awayTeam);
    if (!espnEvt) continue;

    const { count: lineupCount } = await supabase
      .from("fixture_lineups")
      .select("id", { count: "exact", head: true })
      .eq("fixture_id", fixture.id)
      .not("starting_xi", "is", null);

    if ((lineupCount ?? 0) >= 2) continue;

    const summary = await fetchEspnSummary(espnEvt.id);
    if (!summary?.rosters?.length) continue;

    const comp = espnEvt.competitions[0];
    const hComp = comp?.competitors.find((c) => c.homeAway === "home");
    const aComp = comp?.competitors.find((c) => c.homeAway === "away");
    const espnIdToTeamId = new Map<string, string>();
    if (hComp) espnIdToTeamId.set(hComp.team.id, fixture.home_team_id);
    if (aComp) espnIdToTeamId.set(aComp.team.id, fixture.away_team_id);

    const startsAt = new Date(fixture.starts_at);
    const dateStr = startsAt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    const sourceLabel = `${homeTeam.name} vs ${awayTeam.name} · ${dateStr}`;

    for (const teamData of summary.rosters) {
      const ourTeamId = espnIdToTeamId.get(teamData.team.id);
      if (!ourTeamId) continue;

      const roster = teamData.roster ?? [];
      const starters = roster
        .filter((p) => p.starter)
        .sort((a, b) => parseInt(a.formationPlace ?? "99") - parseInt(b.formationPlace ?? "99"));
      if (starters.length < 11) continue;

      const formation = teamData.formation ?? deriveFormation(roster);
      const startingXi = starters.map((p) => p.athlete.displayName);

      await supabase
        .from("fixture_lineups")
        .upsert(
          {
            fixture_id: fixture.id,
            team_id: ourTeamId,
            formation,
            starting_xi: startingXi,
            source_label: sourceLabel,
            espn_event_id: espnEvt.id,
            updated_at: now.toISOString(),
          },
          { onConflict: "fixture_id,team_id" },
        );
      lineupsUpserted++;
    }
  }

  // ------------------------------------------------------------------
  // Seed knockout fixtures when any match just completed (or backfilled)
  // ------------------------------------------------------------------
  const anyCompleted = updated.some((u) => u.status === "completed") || scoresBackfilled > 0;
  let seedResult: { created: number; skipped: number; errors: string[] } | null = null;
  if (anyCompleted) {
    seedResult = await seedKnockoutFixtures();
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
      scoresBackfilled,
      lineupsUpserted,
      knockoutFixturesSeeded: seedResult?.created ?? 0,
    },
  });

  return NextResponse.json({
    status: "ok",
    timestamp: now.toISOString(),
    activeFixtures: windowFixtures.length,
    updated,
    eventsBackfilled,
    scoresBackfilled,
    lineupsUpserted,
    knockoutFixturesSeeded: seedResult?.created ?? 0,
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
