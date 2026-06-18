import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulse90",
    short_name: "Pulse90",
    description: "A daily World Cup watch desk for fixtures, groups, and match context.",
    start_url: "/",
    display: "standalone",
    background_color: "#10131a",
    theme_color: "#10131a",
    orientation: "portrait",
    categories: ["sports", "news", "utilities"],
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
      { src: "/apple-icon", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon", sizes: "512x512", type: "image/png", purpose: "any maskable" },
    ],
  };
}
