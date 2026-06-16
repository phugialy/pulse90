import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TeamRow = { id: string; fifa_code: string; name: string };

type EspnCompetitor = {
  homeAway: "home" | "away";
  team: { id: string; abbreviation: string; displayName: string };
};

type EspnEvent = {
  id: string;
  date: string;
  competitions: Array<{ competitors: EspnCompetitor[] }>;
};

type EspnSummaryRosterEntry = {
  starter: boolean;
  displayName: string;
  position: { abbreviation: string };
};

type EspnSummary = {
  boxscore?: {
    players?: Array<{
      team: { id: string };
      roster?: EspnSummaryRosterEntry[];
    }>;
  };
};

// ---------------------------------------------------------------------------
// ESPN helpers
// ---------------------------------------------------------------------------

async function fetchEspnScoreboardForDate(dateStr: string): Promise<EspnEvent[]> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`;
    const resp = await fetch(url, { headers: { "User-Agent": "pulse90-sync/1.0" }, cache: "no-store" });
    if (!resp.ok) return [];
    const data = (await resp.json()) as { events?: EspnEvent[] };
    return data.events ?? [];
  } catch {
    return [];
  }
}

async function fetchEspnSummary(espnEventId: string): Promise<EspnSummary | null> {
  try {
    const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event=${espnEventId}`;
    const resp = await fetch(url, { headers: { "User-Agent": "pulse90-sync/1.0" }, cache: "no-store" });
    if (!resp.ok) return null;
    return (await resp.json()) as EspnSummary;
  } catch {
    return null;
  }
}

function matchesTeam(espnTeam: EspnCompetitor["team"], our: TeamRow): boolean {
  const abbr = espnTeam.abbreviation.toUpperCase();
  const displayLower = espnTeam.displayName.toLowerCase();
  const ourCode = our.fifa_code.toUpperCase();
  const ourFirstWord = our.name.split(" ")[0].toLowerCase();
  return abbr === ourCode || displayLower.includes(ourFirstWord);
}

function findEspnEvent(events: EspnEvent[], home: TeamRow, away: TeamRow): EspnEvent | undefined {
  return events.find((evt) => {
    const comp = evt.competitions[0];
    if (!comp) return false;
    const hComp = comp.competitors.find((c) => c.homeAway === "home");
    const aComp = comp.competitors.find((c) => c.homeAway === "away");
    if (!hComp || !aComp) return false;
    return matchesTeam(hComp.team, home) && matchesTeam(aComp.team, away);
  });
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

// Shallow-inspect an unknown object — return its keys + first element of any array
function shallowInspect(obj: unknown, depth = 2): unknown {
  if (depth === 0 || obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return { _array_length: obj.length, _first: shallowInspect(obj[0], depth - 1) };
  }
  return Object.fromEntries(
    Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, shallowInspect(v, depth - 1)]),
  );
}

// ---------------------------------------------------------------------------
// Route handler — manual backfill trigger
// Hit: /api/sync/lineups?secret=CRON_SECRET&lookbackDays=30
// Add ?debug=1 to inspect raw ESPN summary structure for the first matched event
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");
    if (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "No admin DB client" }, { status: 503 });
  }

  const debug = request.nextUrl.searchParams.get("debug") === "1";

  const lookbackDays = Math.min(
    parseInt(request.nextUrl.searchParams.get("lookbackDays") ?? "30", 10),
    90,
  );
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

  // All completed/live fixtures in the lookback window
  const { data: allFixtures } = await supabase
    .from("fixtures")
    .select("id, starts_at, home_team_id, away_team_id, match_number")
    .in("status", ["live", "completed"])
    .gte("starts_at", since.toISOString())
    .order("starts_at", { ascending: false });

  if (!allFixtures?.length) {
    return NextResponse.json({ status: "ok", message: "No fixtures in window", synced: 0 });
  }

  // Find which fixtures already have both team lineup rows
  const { data: existingLineups } = await supabase
    .from("fixture_lineups")
    .select("fixture_id")
    .in("fixture_id", allFixtures.map((f: { id: string }) => f.id));

  const lineupCountByFixture = new Map<string, number>();
  for (const row of (existingLineups ?? []) as { fixture_id: string }[]) {
    lineupCountByFixture.set(row.fixture_id, (lineupCountByFixture.get(row.fixture_id) ?? 0) + 1);
  }

  const needsLineup = (allFixtures as { id: string; starts_at: string; home_team_id: string; away_team_id: string; match_number: number }[])
    .filter((f) => (lineupCountByFixture.get(f.id) ?? 0) < 2);

  if (!needsLineup.length) {
    return NextResponse.json({ status: "ok", message: "All lineups already filled", synced: 0 });
  }

  // Fetch team metadata for all involved fixtures
  const teamIds = [...new Set(needsLineup.flatMap((f) => [f.home_team_id, f.away_team_id]))];
  const { data: teamRows } = await supabase.from("teams").select("id, fifa_code, name").in("id", teamIds);
  const teamMap = new Map(((teamRows ?? []) as TeamRow[]).map((t) => [t.id, t]));

  // Group fixtures by UTC calendar date so we only call the ESPN scoreboard once per date
  const byDate = new Map<string, typeof needsLineup>();
  for (const f of needsLineup) {
    const d = new Date(f.starts_at);
    const dateStr = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}${String(d.getUTCDate()).padStart(2, "0")}`;
    const arr = byDate.get(dateStr) ?? [];
    arr.push(f);
    byDate.set(dateStr, arr);
  }

  let synced = 0;
  const log: string[] = [];
  const now = new Date();

  for (const [dateStr, fixtures] of byDate) {
    const espnEvents = await fetchEspnScoreboardForDate(dateStr);
    if (!espnEvents.length) {
      log.push(`${dateStr}: no ESPN scoreboard events found`);
      continue;
    }

    for (const fixture of fixtures) {
      const homeTeam = teamMap.get(fixture.home_team_id);
      const awayTeam = teamMap.get(fixture.away_team_id);
      if (!homeTeam || !awayTeam) continue;

      const espnEvt = findEspnEvent(espnEvents, homeTeam, awayTeam);
      if (!espnEvt) {
        log.push(`#${fixture.match_number} ${homeTeam.name} vs ${awayTeam.name}: no ESPN event match`);
        continue;
      }

      const summary = await fetchEspnSummary(espnEvt.id);

      // Debug mode: return raw structure of first summary so we can fix parsing
      if (debug) {
        return NextResponse.json({
          debug: true,
          matchNumber: fixture.match_number,
          espnEventId: espnEvt.id,
          summaryKeys: summary ? Object.keys(summary) : null,
          structure: shallowInspect(summary, 4),
        });
      }

      if (!summary?.boxscore?.players?.length) {
        log.push(`#${fixture.match_number}: ESPN summary returned no boxscore`);
        continue;
      }

      const comp = espnEvt.competitions[0];
      const hComp = comp?.competitors.find((c) => c.homeAway === "home");
      const aComp = comp?.competitors.find((c) => c.homeAway === "away");
      const espnIdToTeamId = new Map<string, string>();
      if (hComp) espnIdToTeamId.set(hComp.team.id, fixture.home_team_id);
      if (aComp) espnIdToTeamId.set(aComp.team.id, fixture.away_team_id);

      const d = new Date(fixture.starts_at);
      const dateLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      const sourceLabel = `${homeTeam.name} vs ${awayTeam.name} · ${dateLabel}`;

      for (const teamData of summary.boxscore.players) {
        const ourTeamId = espnIdToTeamId.get(teamData.team.id);
        if (!ourTeamId) continue;

        const roster = teamData.roster ?? [];
        const starters = roster.filter((p) => p.starter);
        if (starters.length < 11) {
          log.push(`#${fixture.match_number} (team ${ourTeamId}): only ${starters.length} starters in ESPN data`);
          continue;
        }

        const formation = deriveFormation(roster);
        const gk = starters.find((p) => p.position.abbreviation === "GK");
        const outfield = starters.filter((p) => p.position.abbreviation !== "GK");
        const startingXi = [
          ...(gk ? [gk.displayName] : []),
          ...outfield.map((p) => p.displayName),
        ];

        await supabase.from("fixture_lineups").upsert(
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

        synced++;
        log.push(`#${fixture.match_number} ${homeTeam.name} vs ${awayTeam.name}: synced ${formation} (${startingXi.length} players)`);
      }
    }
  }

  return NextResponse.json({
    status: "ok",
    fixturesChecked: needsLineup.length,
    synced,
    log,
  });
}
