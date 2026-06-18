import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        {/* Outer ring */}
        <div
          style={{
            position: "relative",
            width: 148,
            height: 148,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            border: "5px solid #3b82f6",
            background: "rgba(59,130,246,0.06)",
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: 62,
              fontWeight: 900,
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "-2px",
              lineHeight: 1,
              marginTop: 4,
            }}
          >
            90
          </span>
        </div>
        <span
          style={{
            color: "#3b82f6",
            fontSize: 18,
            fontWeight: 800,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "5px",
            marginTop: 10,
          }}
        >
          PULSE
        </span>
      </div>
    ),
    { ...size },
  );
}
