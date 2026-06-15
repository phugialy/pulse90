import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#10131a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          border: "2px solid #3b82f6",
        }}
      >
        <span
          style={{
            color: "#3b82f6",
            fontSize: 13,
            fontWeight: 900,
            fontFamily: "system-ui, sans-serif",
            letterSpacing: "-0.5px",
          }}
        >
          90
        </span>
      </div>
    ),
    { ...size },
  );
}
