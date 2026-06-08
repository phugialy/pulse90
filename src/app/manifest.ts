import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pulse90",
    short_name: "Pulse90",
    description: "A daily World Cup watch desk for fixtures, groups, and match context.",
    start_url: "/",
    display: "standalone",
    background_color: "#edf4f8",
    theme_color: "#10131a",
    orientation: "portrait",
    categories: ["sports", "news", "utilities"],
  };
}
