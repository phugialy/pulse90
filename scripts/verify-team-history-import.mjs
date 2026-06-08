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

async function failOnError(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }

  return result;
}

const matchCount = await failOnError(
  "count history matches",
  await supabase
    .from("team_history_matches")
    .select("id", { count: "exact", head: true }),
);

const goalCount = await failOnError(
  "count history goals",
  await supabase
    .from("team_history_goals")
    .select("id", { count: "exact", head: true }),
);

const mexicoRows = await failOnError(
  "sample Mexico history",
  await supabase
    .from("team_history_matches")
    .select(
      "match_date,competition,home_team_name,away_team_name,home_score,away_score,city,country",
    )
    .or("home_team_name.eq.Mexico,away_team_name.eq.Mexico")
    .order("match_date", { ascending: false })
    .limit(5),
);

const scorerRows = await failOnError(
  "sample goals",
  await supabase
    .from("team_history_goals")
    .select("team_name,scorer,minute,own_goal,penalty,team_history_matches(match_date,home_team_name,away_team_name)")
    .eq("team_name", "Mexico")
    .order("minute", { ascending: true })
    .limit(5),
);

console.log(
  JSON.stringify(
    {
      matches: matchCount.count,
      goals: goalCount.count,
      mexicoRecentMatches: mexicoRows.data,
      mexicoGoalSamples: scorerRows.data,
    },
    null,
    2,
  ),
);
