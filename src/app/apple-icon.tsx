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
          gap: 10,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: "50%",
            background: "#f7d149",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              color: "#10131a",
              fontSize: 58,
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
            color: "#f7d149",
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "5px",
          }}
        >
          PULSE
        </span>
      </div>
    ),
    { ...size },
  );
}
