import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { seedKnockoutFixtures } from "@/lib/seed-knockout-fixtures";

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const startedAt = Date.now();

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");
    const ok = authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;
    if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "No admin DB client — SUPABASE_SERVICE_ROLE_KEY missing" },
      { status: 503 },
    );
  }

  const result = await seedKnockoutFixtures();

  await supabase.from("job_runs").insert({
    job_name: "seed_fixtures",
    status: result.errors.length > 0 ? "failed" : "success",
    started_at: new Date(startedAt).toISOString(),
    finished_at: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
    records_read: result.created + result.skipped,
    records_changed: result.created,
    error_message: result.errors.length > 0 ? result.errors.join("; ") : undefined,
    metadata: result,
  });

  return NextResponse.json({
    status: result.errors.length > 0 ? "partial" : "ok",
    ...result,
    durationMs: Date.now() - startedAt,
  });
}
