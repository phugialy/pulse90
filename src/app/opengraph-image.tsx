import { ImageResponse } from "next/og";
import { getSupabaseReadClient } from "@/lib/supabase/server";

export const alt = "Pulse90 — World Cup 2026 Live Scores & Match Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 120;

type OGMatch = {
  group: string;
  homeName: string;
  homeFlag: string;
  awayName: string;
  awayFlag: string;
  score: string;
  badge: string;
  badgeColor: string;
  isLive: boolean;
};

const FALLBACK: OGMatch[] = [
  { homeName: "Argentina", homeFlag: "🇦🇷", awayName: "France", awayFlag: "🇫🇷", score: "vs", badge: "Group C", badgeColor: "#3b82f6", group: "Group C", isLive: false },
  { homeName: "Brazil", homeFlag: "🇧🇷", awayName: "Germany", awayFlag: "🇩🇪", score: "vs", badge: "Group A", badgeColor: "#3b82f6", group: "Group A", isLive: false },
  { homeName: "Spain", homeFlag: "🇪🇸", awayName: "England", awayFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", score: "vs", badge: "Group B", badgeColor: "#3b82f6", group: "Group B", isLive: false },
];

function fmtTime(iso: string) {
  const d = new Date(iso);
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function groupLabel(groupCode: string | null, stage: string) {
  if (groupCode) return `Group ${groupCode}`;
  const map: Record<string, string> = {
    round_of_32: "Round of 32", quarter_final: "Quarter-final",
    semi_final: "Semi-final", final: "Final",
  };
  return map[stage] ?? stage;
}

async function fetchMatches(): Promise<OGMatch[]> {
  try {
    const supabase = getSupabaseReadClient();
    if (!supabase) return FALLBACK;

    const [{ data: fixtures }, { data: teamRows }] = await Promise.all([
      supabase
        .from("fixture_cards_view")
        .select("match_number, stage, group_code, home_team, away_team, home_team_id, away_team_id, home_score, away_score, status, starts_at, minute")
        .in("status", ["live", "completed", "scheduled"])
        .order("starts_at", { ascending: false })
        .limit(30),
      supabase.from("teams").select("id, flag_emoji"),
    ]);

    if (!fixtures?.length) return FALLBACK;

    const flagMap = new Map((teamRows ?? []).map((t: { id: string; flag_emoji: string | null }) => [t.id, t.flag_emoji ?? "🏳"]));

    const now = Date.now();

    const live = fixtures.filter((f) => f.status === "live");
    const completed = fixtures
      .filter((f) => f.status === "completed")
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
    const upcoming = fixtures
      .filter((f) => f.status === "scheduled" && new Date(f.starts_at).getTime() > now)
      .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

    const picks = [...live, ...completed, ...upcoming].slice(0, 3);
    if (!picks.length) return FALLBACK;

    return picks.map((f) => {
      const isLive = f.status === "live";
      const isCompleted = f.status === "completed";
      const hasScore = f.home_score != null && f.away_score != null;
      return {
        group: groupLabel(f.group_code, f.stage),
        homeName: f.home_team ?? "Home",
        homeFlag: flagMap.get(f.home_team_id ?? "") ?? "🏳",
        awayName: f.away_team ?? "Away",
        awayFlag: flagMap.get(f.away_team_id ?? "") ?? "🏳",
        score: hasScore ? `${f.home_score} – ${f.away_score}` : "vs",
        badge: isLive ? (f.minute ? `${f.minute}'` : "LIVE") : isCompleted ? "FT" : fmtTime(f.starts_at),
        badgeColor: isLive ? "#f87171" : isCompleted ? "#6b7280" : "#60a5fa",
        isLive,
      };
    });
  } catch {
    return FALLBACK;
  }
}

export default async function Image() {
  const matches = await fetchMatches();

  return new ImageResponse(
    (
      <div
        style={{
          background: "#10131a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "48px 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow — red if any live, else subtle blue */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: matches.some((m) => m.isLive)
              ? "rgba(239,68,68,0.06)"
              : "rgba(59,130,246,0.05)",
            display: "flex",
          }}
        />

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52, height: 52, borderRadius: "50%", background: "#f7d149",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <span style={{ color: "#10131a", fontSize: 20, fontWeight: 900, letterSpacing: "-0.5px" }}>90</span>
            </div>
            <span style={{ color: "#ffffff", fontSize: 40, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}>
              Pulse90
            </span>
          </div>
          <div
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 100, padding: "10px 22px",
            }}
          >
            <span style={{ fontSize: 22 }}>⚽</span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 18, fontWeight: 800, letterSpacing: "0.04em" }}>
              FIFA World Cup 2026
            </span>
          </div>
        </div>

        {/* Match rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 36, flex: 1 }}>
          {matches.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                background: m.isLive ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.045)",
                border: m.isLive ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "18px 28px",
                gap: 0,
              }}
            >
              {/* Group */}
              <span
                style={{
                  color: "rgba(255,255,255,0.35)", fontSize: 13, fontWeight: 800,
                  letterSpacing: "0.12em", textTransform: "uppercase", width: 90,
                  display: "flex", flexShrink: 0,
                }}
              >
                {m.group}
              </span>

              {/* Home */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, justifyContent: "flex-end" }}>
                <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 22, fontWeight: 800 }}>{m.homeName}</span>
                <span style={{ fontSize: 32 }}>{m.homeFlag}</span>
              </div>

              {/* Score */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 28px", minWidth: 120 }}>
                <span
                  style={{
                    color: m.isLive ? "#f87171" : "rgba(255,255,255,0.90)",
                    fontSize: m.isLive ? 30 : 26,
                    fontWeight: 900, letterSpacing: "-1px", lineHeight: 1,
                  }}
                >
                  {m.score}
                </span>
              </div>

              {/* Away */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <span style={{ fontSize: 32 }}>{m.awayFlag}</span>
                <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 22, fontWeight: 800 }}>{m.awayName}</span>
              </div>

              {/* Badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, width: 90, justifyContent: "flex-end" }}>
                {m.isLive && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", display: "flex" }} />
                )}
                <span style={{ color: m.badgeColor, fontSize: 14, fontWeight: 900, letterSpacing: "0.08em" }}>
                  {m.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 28 }}>
          <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 15, fontWeight: 700, letterSpacing: "0.04em" }}>
            Live scores · Group standings · All 104 matches · Match context
          </span>
          <span style={{ color: "rgba(255,255,255,0.20)", fontSize: 15, fontWeight: 600 }}>
            pulse90.loxys.co
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
