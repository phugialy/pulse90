import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#f7d149",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
      >
        <span
          style={{
            color: "#10131a",
            fontSize: 14,
            fontWeight: 900,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "-0.5px",
            marginTop: 1,
          }}
        >
          90
        </span>
      </div>
    ),
    { ...size },
  );
}
