import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pulse90 — World Cup 2026 Live Scores & Match Tracker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const matches = [
    { home: "🇩🇪", homeName: "Germany", away: "🇯🇵", awayName: "Japan", score: "2 – 1", badge: "LIVE", badgeColor: "#ef4444", group: "Group E" },
    { home: "🇧🇷", homeName: "Brazil", away: "🇦🇷", awayName: "Argentina", score: "1 – 1", badge: "FT", badgeColor: "#6b7280", group: "Group C" },
    { home: "🇪🇸", homeName: "Spain", away: "🇲🇦", awayName: "Morocco", score: "vs", badge: "18:00", badgeColor: "#3b82f6", group: "Group B" },
  ];

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
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute",
            top: -200,
            right: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.06)",
            display: "flex",
          }}
        />

        {/* Header row: logo + tagline */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#10131a",
                border: "2.5px solid #3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ color: "#3b82f6", fontSize: 18, fontWeight: 900, letterSpacing: "-0.5px" }}>90</span>
            </div>
            <span style={{ color: "#ffffff", fontSize: 40, fontWeight: 900, letterSpacing: "-2px", lineHeight: 1 }}>
              Pulse90
            </span>
          </div>

          {/* Competition badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 100,
              padding: "10px 22px",
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
                background: i === 0 ? "rgba(239,68,68,0.07)" : "rgba(255,255,255,0.045)",
                border: i === 0 ? "1px solid rgba(239,68,68,0.25)" : "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "18px 28px",
                gap: 0,
              }}
            >
              {/* Group label */}
              <span
                style={{
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  width: 90,
                  display: "flex",
                  flexShrink: 0,
                }}
              >
                {m.group}
              </span>

              {/* Home team */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, justifyContent: "flex-end" }}>
                <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 22, fontWeight: 800 }}>{m.homeName}</span>
                <span style={{ fontSize: 32 }}>{m.home}</span>
              </div>

              {/* Score */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0 28px", minWidth: 120 }}>
                <span
                  style={{
                    color: i === 0 ? "#f87171" : "rgba(255,255,255,0.90)",
                    fontSize: i === 0 ? 30 : 26,
                    fontWeight: 900,
                    letterSpacing: "-1px",
                    lineHeight: 1,
                  }}
                >
                  {m.score}
                </span>
              </div>

              {/* Away team */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
                <span style={{ fontSize: 32 }}>{m.away}</span>
                <span style={{ color: "rgba(255,255,255,0.88)", fontSize: 22, fontWeight: 800 }}>{m.awayName}</span>
              </div>

              {/* Status badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 7, width: 90, justifyContent: "flex-end" }}>
                {i === 0 && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#ef4444",
                      display: "flex",
                    }}
                  />
                )}
                <span
                  style={{
                    color: m.badgeColor,
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                  }}
                >
                  {m.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer: description + URL */}
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
