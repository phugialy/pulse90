import { type NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// ---------------------------------------------------------------------------
// Narrative cron
// Generates importance_reason, stakes, and implication copy for fixtures.
// Runs every 4h. Force-refreshes fixtures within 72h of kickoff so copy
// stays current as standings change game-by-game.
// Can also be forced for a specific match:
//   GET /api/sync/narratives?matchNumber=1&secret=CRON_SECRET
// ---------------------------------------------------------------------------

export const maxDuration = 60;

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

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 503 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "No admin DB client" }, { status: 503 });
  }

  const specificMatch = request.nextUrl.searchParams.get("matchNumber");
  const forceRefresh = request.nextUrl.searchParams.get("force") === "1";

  const now = new Date();
  // Window: up to 14 days out so newly seeded knockout fixtures get copy fast
  const cutoff = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  // Fixtures within 72h are force-refreshed even if they already have copy,
  // because standings have changed since the copy was first generated.
  const urgentCutoff = new Date(now.getTime() + 72 * 60 * 60 * 1000);

  let query = supabase
    .from("fixtures")
    .select(`
      id, match_number, starts_at, stage, group_code, status,
      stakes, importance_reason, implication,
      home_team_id, away_team_id
    `)
    .eq("status", "scheduled")
    .gte("starts_at", now.toISOString())
    .lte("starts_at", cutoff.toISOString())
    .order("starts_at", { ascending: true });

  if (specificMatch) {
    query = supabase
      .from("fixtures")
      .select(`
        id, match_number, starts_at, stage, group_code, status,
        stakes, importance_reason, implication,
        home_team_id, away_team_id
      `)
      .eq("match_number", parseInt(specificMatch, 10))
      .limit(1);
  }

  const { data: fixtures, error: fixturesErr } = await query;
  if (fixturesErr || !fixtures?.length) {
    return NextResponse.json({ status: "skipped", reason: "No target fixtures found" });
  }

  // Targets:
  // - Always: fixtures missing any of the three copy fields
  // - Always: fixtures within 72h (force-refresh with current standings)
  // - With force=1: everything in the window
  const targets = forceRefresh
    ? fixtures
    : fixtures.filter((f) => {
        const isUrgent = new Date(f.starts_at) <= urgentCutoff;
        const missingCopy = !f.stakes || !f.importance_reason || !f.implication;
        return missingCopy || isUrgent;
      });

  if (!targets.length) {
    return NextResponse.json({
      status: "skipped",
      reason: "No fixtures need copy refresh. Use ?force=1 to regenerate all.",
    });
  }

  // Fetch all team names in one query
  const teamIds = [...new Set(targets.flatMap((f) => [f.home_team_id, f.away_team_id]))];
  const { data: teamsData } = await supabase
    .from("teams")
    .select("id, name, current_rank, confederation")
    .in("id", teamIds);

  type TeamRow = { id: string; name: string; current_rank: number | null; confederation: string | null };
  const teamMap = new Map<string, TeamRow>(
    (teamsData ?? []).map((t: TeamRow) => [t.id, t]),
  );

  // Fetch live group standings for context (reflects actual played results)
  const groupCodes = [...new Set(targets.map((f) => f.group_code).filter(Boolean))];
  const { data: standingsData } = await supabase
    .from("group_standings")
    .select("team_id, group_code, played, won, drawn, lost, points, goal_difference")
    .in("group_code", groupCodes as string[]);

  type StandingRow = {
    team_id: string; group_code: string; played: number;
    won: number; drawn: number; lost: number; points: number; goal_difference: number;
  };
  const standingsByGroup = new Map<string, StandingRow[]>();
  for (const row of (standingsData ?? []) as StandingRow[]) {
    const list = standingsByGroup.get(row.group_code) ?? [];
    list.push(row);
    standingsByGroup.set(row.group_code, list);
  }

  // Fetch recent WC results for teams (up to 3 per team)
  const { data: recentResults } = await supabase
    .from("fixtures")
    .select("home_team_id, away_team_id, home_score, away_score, status")
    .eq("status", "completed")
    .or(teamIds.map((id) => `home_team_id.eq.${id},away_team_id.eq.${id}`).join(","))
    .order("starts_at", { ascending: false })
    .limit(80);

  type ResultRow = {
    home_team_id: string; away_team_id: string;
    home_score: number | null; away_score: number | null;
  };

  function recentForm(teamId: string): string {
    const results = (recentResults ?? []) as ResultRow[];
    const relevant = results.filter(
      (r) => r.home_team_id === teamId || r.away_team_id === teamId,
    ).slice(0, 3);
    if (!relevant.length) return "no WC results yet";
    return relevant
      .map((r) => {
        const isHome = r.home_team_id === teamId;
        const scored = isHome ? r.home_score : r.away_score;
        const conceded = isHome ? r.away_score : r.home_score;
        const result =
          scored != null && conceded != null
            ? scored > conceded ? "W" : scored < conceded ? "L" : "D"
            : "?";
        return `${result} ${scored ?? "?"}-${conceded ?? "?"}`;
      })
      .join(", ");
  }

  const anthropic = new Anthropic({ apiKey });
  const processed: number[] = [];
  const skipped: number[] = [];

  for (const fixture of targets) {
    const home = teamMap.get(fixture.home_team_id);
    const away = teamMap.get(fixture.away_team_id);
    if (!home || !away) { skipped.push(fixture.match_number); continue; }

    const groupCode = fixture.group_code;
    const groupStandings = groupCode ? (standingsByGroup.get(groupCode) ?? []) : [];

    const standingsText = groupStandings.length
      ? groupStandings
          .sort((a, b) => b.points - a.points || b.goal_difference - a.goal_difference)
          .map((s) => {
            const t = teamMap.get(s.team_id);
            return `${t?.name ?? s.team_id}: P${s.played} W${s.won} D${s.drawn} L${s.lost} GD${s.goal_difference} Pts${s.points}`;
          })
          .join("\n")
      : "Knockout stage match — winner advances";

    const homeForm = recentForm(fixture.home_team_id);
    const awayForm = recentForm(fixture.away_team_id);
    const homeRank = home.current_rank ? `FIFA rank #${home.current_rank}` : "unranked";
    const awayRank = away.current_rank ? `FIFA rank #${away.current_rank}` : "unranked";
    const kickoff = new Date(fixture.starts_at).toLocaleDateString("en-US", {
      weekday: "short", month: "short", day: "numeric",
    });
    const stage = groupCode ? `Group ${groupCode}` : fixture.stage;
    const isKnockout = !groupCode;

    const prompt = `You are a football copywriter for Pulse90, a World Cup 2026 watch desk. Write punchy, human match copy that makes someone who wasn't planning to watch clear their schedule.

MATCH CONTEXT:
- ${home.name} (${homeRank}, ${home.confederation ?? "unknown conf"}) vs ${away.name} (${awayRank}, ${away.confederation ?? "unknown conf"})
- ${stage}, Match #${fixture.match_number}, ${kickoff}
- ${home.name} recent WC form: ${homeForm}
- ${away.name} recent WC form: ${awayForm}
- ${isKnockout ? "Knockout stage: loser goes home, winner advances" : `Current group standings:\n${standingsText}`}

Write three pieces of copy. Return ONLY valid JSON — no markdown, no explanation:

{
  "importance_reason": "One gripping sentence (max 15 words). Lead with the tension, not the teams.",
  "stakes": "Two punchy sentences (max 30 words total). Specific: points positions, qualification scenarios, revenge angles, history.",
  "implication": "One sentence (max 20 words). What does the RESULT mean for each team's tournament path? Be specific about what happens next for winner and loser."
}

Rules:
- No clichés: no 'must-win', 'crucial', 'important', 'clash', 'showdown'
- Name both teams at least once across all three fields
- Use actual form (${homeForm} / ${awayForm}) to color the copy — mention momentum, confidence, or vulnerability
- ${isKnockout ? "For knockout: loser is eliminated, say what the winner earns (which QF slot etc.)" : "For group stage: mention the exact points/standing implications"}`;

    try {
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      });

      const raw = response.content[0].type === "text" ? response.content[0].text.trim() : "";
      const parsed = JSON.parse(raw) as {
        importance_reason?: string;
        stakes?: string;
        implication?: string;
      };

      if (!parsed.importance_reason || !parsed.stakes || !parsed.implication) {
        console.error("narratives: bad JSON for match", fixture.match_number, raw);
        skipped.push(fixture.match_number);
        continue;
      }

      const { error: updateErr } = await supabase
        .from("fixtures")
        .update({
          importance_reason: parsed.importance_reason,
          stakes: parsed.stakes,
          implication: parsed.implication,
          updated_at: now.toISOString(),
        })
        .eq("id", fixture.id);

      if (updateErr) {
        console.error("narratives: DB update failed", fixture.match_number, updateErr.message);
        skipped.push(fixture.match_number);
      } else {
        processed.push(fixture.match_number);
      }
    } catch (err) {
      console.error("narratives: Claude call failed", fixture.match_number, err);
      skipped.push(fixture.match_number);
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: now.toISOString(),
    processed,
    skipped,
    durationMs: Date.now() - startedAt,
  });
}
