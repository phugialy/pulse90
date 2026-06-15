import type { MetadataRoute } from "next";
import { getSupabaseReadClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pulse90.loxys.co";

const staticRoutes = [
  { url: "/", priority: 1.0, changeFrequency: "hourly" as const },
  { url: "/fixtures", priority: 0.8, changeFrequency: "daily" as const },
  { url: "/results", priority: 0.8, changeFrequency: "hourly" as const },
  { url: "/groups", priority: 0.7, changeFrequency: "daily" as const },
  { url: "/teams", priority: 0.7, changeFrequency: "weekly" as const },
  { url: "/predictions", priority: 0.6, changeFrequency: "daily" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getSupabaseReadClient();

  const [fixtureResult, teamResult] = await Promise.all([
    supabase
      ? supabase
          .from("fixtures")
          .select("match_number, updated_at")
          .order("match_number", { ascending: true })
      : Promise.resolve({ data: null, error: null }),
    supabase
      ? supabase
          .from("teams")
          .select("slug, updated_at")
          .order("slug", { ascending: true })
      : Promise.resolve({ data: null, error: null }),
  ]);

  const matchRoutes: MetadataRoute.Sitemap = (fixtureResult.data ?? []).map(
    (row: { match_number: number; updated_at: string | null }) => ({
      url: `${SITE_URL}/matches/${row.match_number}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    }),
  );

  const teamRoutes: MetadataRoute.Sitemap = (teamResult.data ?? []).map(
    (row: { slug: string; updated_at: string | null }) => ({
      url: `${SITE_URL}/teams/${row.slug}`,
      lastModified: row.updated_at ? new Date(row.updated_at) : new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    }),
  );

  return [
    ...staticRoutes.map(({ url, priority, changeFrequency }) => ({
      url: `${SITE_URL}${url}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
    ...matchRoutes,
    ...teamRoutes,
  ];
}
