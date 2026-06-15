import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Pulse90 — World Cup 2026 Watch Desk";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#10131a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background accent circles */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.07)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.05)",
            display: "flex",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "#10131a",
              border: "3px solid #3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                color: "#3b82f6",
                fontSize: 30,
                fontWeight: 900,
                letterSpacing: "-1px",
              }}
            >
              90
            </span>
          </div>
          <span
            style={{
              color: "#ffffff",
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            Pulse90
          </span>
        </div>

        {/* Tagline */}
        <div
          style={{
            color: "rgba(255,255,255,0.50)",
            fontSize: 30,
            fontWeight: 700,
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            marginBottom: 20,
          }}
        >
          World Cup 2026 Watch Desk
        </div>

        {/* Slogan pill */}
        <div
          style={{
            display: "flex",
            background: "rgba(59,130,246,0.12)",
            border: "1px solid rgba(59,130,246,0.3)",
            borderRadius: 100,
            padding: "10px 28px",
          }}
        >
          <span
            style={{
              color: "#60a5fa",
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Open once. Know what matters.
          </span>
        </div>

        {/* URL watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            color: "rgba(255,255,255,0.20)",
            fontSize: 18,
            fontWeight: 600,
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          pulse90.loxys.co
        </div>
      </div>
    ),
    { ...size },
  );
}
