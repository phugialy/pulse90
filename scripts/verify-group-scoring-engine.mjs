import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.join(process.cwd(), ".env.local");
const env = Object.fromEntries(
  fs
    .readFileSync(envPath, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const tournamentId = "00000000-0000-4000-8000-000000002026";

async function failOnError(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }

  return result.data;
}

await failOnError(
  "recalculate standings",
  await supabase.rpc("recalculate_group_standings", {
    p_tournament_id: tournamentId,
  }),
);

const standings = await failOnError(
  "read standings",
  await supabase
    .from("standings")
    .select("group_code, team_id, played, goals_for, goals_against, goal_difference, points, rank")
    .eq("tournament_id", tournamentId)
    .order("group_code", { ascending: true })
    .order("rank", { ascending: true })
    .limit(8),
);

const projection = await failOnError(
  "read live projection",
  await supabase
    .from("live_group_projection_view")
    .select("group_code, fifa_code, flag_emoji, played, goal_difference, points, projected_rank")
    .eq("tournament_id", tournamentId)
    .order("group_code", { ascending: true })
    .order("projected_rank", { ascending: true })
    .limit(8),
);

console.log(
  JSON.stringify(
    {
      ok: true,
      standingsRowsChecked: standings.length,
      projectionRowsChecked: projection.length,
      sampleProjection: projection,
    },
    null,
    2,
  ),
);
