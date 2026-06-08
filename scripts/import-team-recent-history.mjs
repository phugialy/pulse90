import fs from "node:fs";
import crypto from "node:crypto";
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
const source = "martj42_international_results";
const resultsUrl =
  "https://raw.githubusercontent.com/martj42/international_results/master/results.csv";
const goalscorersUrl =
  "https://raw.githubusercontent.com/martj42/international_results/master/goalscorers.csv";
const startDate = "2022-11-20";
const endDate = new Date().toISOString().slice(0, 10);
const dryRun = process.argv.includes("--dry-run");

const aliases = {
  "Bosnia and Herzegovina": ["Bosnia and Herzegovina", "Bosnia-Herzegovina"],
  Curacao: ["Curacao", "Curaçao"],
  "Czechia": ["Czechia", "Czech Republic"],
  "DR Congo": ["DR Congo", "Congo DR", "Democratic Republic of Congo"],
  Iran: ["Iran", "IR Iran"],
  "Ivory Coast": ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
  "South Korea": ["South Korea", "Korea Republic"],
  Turkiye: ["Turkiye", "Turkey", "Türkiye"],
  "United States": ["United States", "USA", "United States of America"],
};

function cleanText(value) {
  return String(value ?? "")
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [headers, ...records] = rows;
  return records
    .filter((record) => record.length === headers.length)
    .map((record) =>
      Object.fromEntries(headers.map((header, index) => [header, cleanText(record[index])])),
    );
}

async function fetchCsv(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Pulse90 recent-history importer (+local development)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return parseCsv(await response.text());
}

async function failOnError(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }

  return result.data;
}

function boolValue(value) {
  return value === "TRUE";
}

function sourceMatchKey(row) {
  return [
    row.date,
    row.home_team,
    row.away_team,
    row.tournament,
    row.home_score,
    row.away_score,
  ].join("|");
}

function sourceGoalKey(row, index) {
  return [
    row.date,
    row.home_team,
    row.away_team,
    row.team,
    row.scorer,
    row.minute || "NA",
    row.own_goal,
    row.penalty,
    index,
  ].join("|");
}

function matchLookupKey(row) {
  return [row.date, row.home_team, row.away_team].join("|");
}

function isCompletedInWindow(row) {
  return (
    row.date >= startDate &&
    row.date <= endDate &&
    row.home_score !== "NA" &&
    row.away_score !== "NA"
  );
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function main() {
  const teams = await failOnError(
    "load teams",
    await supabase
      .from("teams")
      .select("id,name,slug,fifa_code")
      .eq("tournament_id", tournamentId),
  );

  const teamBySourceName = new Map();
  for (const team of teams) {
    for (const name of aliases[team.name] ?? [team.name]) {
      teamBySourceName.set(name, team);
    }
  }

  const [results, goalscorers] = await Promise.all([
    fetchCsv(resultsUrl),
    fetchCsv(goalscorersUrl),
  ]);

  const relevantMatches = results.filter((row) => {
    if (!isCompletedInWindow(row)) {
      return false;
    }

    return teamBySourceName.has(row.home_team) || teamBySourceName.has(row.away_team);
  });

  const matchRows = relevantMatches.map((row) => {
    const homeTeam = teamBySourceName.get(row.home_team);
    const awayTeam = teamBySourceName.get(row.away_team);

    return {
      tournament_id: tournamentId,
      source,
      source_match_key: sourceMatchKey(row),
      match_date: row.date,
      competition: row.tournament,
      city: row.city || null,
      country: row.country || null,
      neutral: boolValue(row.neutral),
      home_team_name: row.home_team,
      away_team_name: row.away_team,
      home_team_id: homeTeam?.id ?? null,
      away_team_id: awayTeam?.id ?? null,
      home_score: Number(row.home_score),
      away_score: Number(row.away_score),
      updated_at: new Date().toISOString(),
    };
  });

  if (dryRun) {
    const goalMatchKeys = new Set(relevantMatches.map(matchLookupKey));
    const goalRows = goalscorers.filter((row) => goalMatchKeys.has(matchLookupKey(row)));
    const byTeam = new Map();

    for (const match of relevantMatches) {
      for (const teamName of [match.home_team, match.away_team]) {
        const team = teamBySourceName.get(teamName);
        if (!team) {
          continue;
        }

        const current = byTeam.get(team.name) ?? { goals: 0, matches: 0 };
        current.matches += 1;
        byTeam.set(team.name, current);
      }
    }

    for (const goal of goalRows) {
      const team = teamBySourceName.get(goal.team);
      if (!team) {
        continue;
      }

      const current = byTeam.get(team.name) ?? { goals: 0, matches: 0 };
      current.goals += 1;
      byTeam.set(team.name, current);
    }

    console.log(
      JSON.stringify(
        {
          ok: true,
          dryRun: true,
          source,
          startDate,
          endDate,
          teams: teams.length,
          matches: matchRows.length,
          goals: goalRows.length,
          sampleMatches: matchRows.slice(0, 5),
          topTeamsByMatchCount: [...byTeam.entries()]
            .map(([team, counts]) => ({ team, ...counts }))
            .sort((a, b) => b.matches - a.matches)
            .slice(0, 12),
        },
        null,
        2,
      ),
    );
    return;
  }

  for (const [index, rows] of chunk(matchRows, 500).entries()) {
    await failOnError(
      `upsert recent matches batch ${index + 1}`,
      await supabase
        .from("team_history_matches")
        .upsert(rows, { onConflict: "source,source_match_key" }),
    );
  }

  const persistedMatches = [];
  for (let from = 0; ; from += 1000) {
    const rows = await failOnError(
      "reload recent matches",
      await supabase
        .from("team_history_matches")
        .select("id,source_match_key")
        .eq("source", source)
        .order("match_date", { ascending: true })
        .range(from, from + 999),
    );
    persistedMatches.push(...rows);
    if (rows.length < 1000) {
      break;
    }
  }

  const matchIdByKey = new Map(
    persistedMatches.map((row) => [row.source_match_key, row.id]),
  );
  const relevantMatchByLookupKey = new Map(
    relevantMatches.map((row) => [matchLookupKey(row), row]),
  );

  const goalRows = goalscorers
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => {
      return relevantMatchByLookupKey.has(matchLookupKey(row));
    })
    .map(({ row, index }) => {
      const match = relevantMatchByLookupKey.get(matchLookupKey(row));
      const matchKey = sourceMatchKey(match);
      const team = teamBySourceName.get(row.team);

      return {
        history_match_id: matchIdByKey.get(matchKey),
        tournament_id: tournamentId,
        source,
        source_goal_key: sourceGoalKey(row, index),
        team_id: team?.id ?? null,
        team_name: row.team,
        scorer: row.scorer,
        minute: row.minute ? Number(row.minute) : null,
        own_goal: boolValue(row.own_goal),
        penalty: boolValue(row.penalty),
      };
    })
    .filter((row) => row.history_match_id);

  for (const [index, rows] of chunk(goalRows, 500).entries()) {
    await failOnError(
      `upsert recent goals batch ${index + 1}`,
      await supabase
        .from("team_history_goals")
        .upsert(rows, { onConflict: "source,source_goal_key" }),
    );
  }

  await supabase.from("source_snapshots").insert({
    tournament_id: tournamentId,
    source_name: source,
    source_url: "https://github.com/martj42/international_results",
    payload_hash: crypto
      .createHash("sha256")
      .update(`${source}:${startDate}:${endDate}:${matchRows.length}:${goalRows.length}`)
      .digest("hex"),
    payload: {
      start_date: startDate,
      end_date: endDate,
      results_url: resultsUrl,
      goalscorers_url: goalscorersUrl,
      matches_imported: matchRows.length,
      goals_imported: goalRows.length,
      note: "Completed international matches involving 2026 World Cup teams from Qatar 2022 onward. Future/unplayed rows with NA scores are skipped.",
    },
  });

  await supabase.from("job_runs").insert({
    job_name: "import_team_recent_history",
    status: "success",
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    records_read: results.length + goalscorers.length,
    records_changed: matchRows.length + goalRows.length,
    metadata: {
      matches: matchRows.length,
      goals: goalRows.length,
      start_date: startDate,
      end_date: endDate,
      source,
    },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        source,
        startDate,
        endDate,
        teams: teams.length,
        matches: matchRows.length,
        goals: goalRows.length,
      },
      null,
      2,
    ),
  );
}

main().catch(async (error) => {
  await supabase.from("job_runs").insert({
    job_name: "import_team_recent_history",
    status: "failed",
    started_at: new Date().toISOString(),
    finished_at: new Date().toISOString(),
    error_message: error.message,
    metadata: { message: error.message },
  });
  console.error(error);
  process.exit(1);
});
