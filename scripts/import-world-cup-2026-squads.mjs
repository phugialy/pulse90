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
const squadIndexUrl = "https://worldcupranking.com/world-cup-2026/squads/";
const sourceName = "worldcupranking_fifa_squad_mirror";

const positionLabel = {
  GK: "Goalkeeper",
  DF: "Defender",
  MF: "Midfielder",
  FW: "Forward",
};

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&ccedil;/g, "ç")
    .replace(/&Ccedil;/g, "Ç")
    .replace(/&eacute;/g, "é")
    .replace(/&Eacute;/g, "É")
    .replace(/&aacute;/g, "á")
    .replace(/&Aacute;/g, "Á")
    .replace(/&iacute;/g, "í")
    .replace(/&Iacute;/g, "Í")
    .replace(/&oacute;/g, "ó")
    .replace(/&Oacute;/g, "Ó")
    .replace(/&uacute;/g, "ú")
    .replace(/&Uacute;/g, "Ú")
    .replace(/&ntilde;/g, "ñ")
    .replace(/&Ntilde;/g, "Ñ");
}

function cleanText(value) {
  return decodeHtml(value)
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripTags(value) {
  return cleanText(value.replace(/<[^>]+>/g, ""));
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function failOnError(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }

  return result.data;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Pulse90 squad importer (+local development)",
    },
  });

  if (!response.ok) {
    throw new Error(`Fetch failed ${response.status} for ${url}`);
  }

  return response.text();
}

function parseSquadLinks(indexHtml) {
  const links = [];
  const linkPattern = /<a href="([^"]*\/world-cup-2026\/squads\/[^"]+)">([^<]+)<\/a>\s+—\s+26 players/g;
  let match;

  while ((match = linkPattern.exec(indexHtml))) {
    links.push({
      url: new URL(match[1], squadIndexUrl).toString(),
      teamName: decodeHtml(match[2]).trim(),
    });
  }

  return links;
}

function parseTeamCode(html) {
  const codeMatch = html.match(/FIFA\s+([A-Z]{3})\s+·/);
  return codeMatch?.[1] ?? null;
}

function parseCoach(html) {
  const coachMatch = html.match(/Head coach:\s*([^<\n]+)/);
  return coachMatch ? decodeHtml(coachMatch[1]).trim() : null;
}

function parsePlayers(html, teamCode, sourceUrl) {
  const tbody = html.match(/<tbody>([\s\S]*?)<\/tbody>/)?.[1];

  if (!tbody) {
    return [];
  }

  return [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((rowMatch) => {
    const cells = [...rowMatch[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((cell) =>
      stripTags(cell[1]),
    );
    const [shirtNumber, positionCode, nameOnShirt, club] = cells;
    const number = Number(shirtNumber);

    return {
      shirtNumber: number,
      position: positionLabel[positionCode] ?? positionCode,
      rosterRole: positionCode,
      name: cleanText(nameOnShirt),
      knownAs: cleanText(nameOnShirt),
      slug: `${String(number).padStart(2, "0")}-${slugify(nameOnShirt)}`,
      club: cleanText(club),
      nationality: teamCode,
      sourceUrl,
    };
  });
}

const startedAt = Date.now();
const jobRun = await failOnError(
  "create job run",
  await supabase
    .from("job_runs")
    .insert({
      job_name: "import_world_cup_2026_squads",
      status: "running",
      metadata: { source_name: sourceName, source_url: squadIndexUrl },
    })
    .select("id")
    .single(),
);

try {
  const teams = await failOnError(
    "read teams",
    await supabase
      .from("teams")
      .select("id, fifa_code, name")
      .eq("tournament_id", tournamentId),
  );
  const teamsByCode = new Map(teams.map((team) => [team.fifa_code, team]));
  const indexHtml = await fetchText(squadIndexUrl);
  const squadLinks = parseSquadLinks(indexHtml);
  const players = [];
  const coachUpdates = [];
  const unmatched = [];

  for (const squadLink of squadLinks) {
    const html = await fetchText(squadLink.url);
    const teamCode = parseTeamCode(html);
    const team = teamCode ? teamsByCode.get(teamCode) : null;

    if (!teamCode || !team) {
      unmatched.push({ teamName: squadLink.teamName, teamCode, url: squadLink.url });
      continue;
    }

    const coach = parseCoach(html);
    if (coach) {
      coachUpdates.push({ id: team.id, coach });
    }

    for (const player of parsePlayers(html, teamCode, squadLink.url)) {
      players.push({
        tournament_id: tournamentId,
        team_id: team.id,
        name: player.name,
        known_as: player.knownAs,
        slug: player.slug,
        position: player.position,
        shirt_number: player.shirtNumber,
        club: player.club,
        nationality: player.nationality,
        roster_role: player.rosterRole,
        status: "squad",
        source_url: player.sourceUrl,
        source_updated_at: "2026-06-03T00:00:00Z",
      });
    }
  }

  if (unmatched.length) {
    throw new Error(`Unmatched teams: ${JSON.stringify(unmatched)}`);
  }

  for (let index = 0; index < players.length; index += 500) {
    await failOnError(
      `upsert players batch ${index / 500 + 1}`,
      await supabase
        .from("players")
        .upsert(players.slice(index, index + 500), {
          onConflict: "tournament_id,team_id,slug",
        }),
    );
  }

  for (const update of coachUpdates) {
    await failOnError(
      `update coach ${update.id}`,
      await supabase.from("teams").update({ coach: update.coach }).eq("id", update.id),
    );
  }

  await failOnError(
    "create roster update",
    await supabase.from("updates").insert({
      tournament_id: tournamentId,
      entity_type: "players",
      update_type: "squad_import",
      title: "All official squads imported",
      summary: `${players.length} player roster records imported from the published squad list mirror.`,
      impact: "Team pages can now show roster data.",
      source_url: squadIndexUrl,
      after_data: {
        players: players.length,
        teams: squadLinks.length,
        source_name: sourceName,
      },
    }),
  );

  await failOnError(
    "finish job run",
    await supabase
      .from("job_runs")
      .update({
        status: "success",
        finished_at: new Date().toISOString(),
        duration_ms: Date.now() - startedAt,
        records_read: players.length,
        records_changed: players.length,
        metadata: {
          source_name: sourceName,
          source_url: squadIndexUrl,
          teams: squadLinks.length,
        },
      })
      .eq("id", jobRun.id),
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        teams: squadLinks.length,
        players: players.length,
      },
      null,
      2,
    ),
  );
} catch (error) {
  await supabase
    .from("job_runs")
    .update({
      status: "failed",
      finished_at: new Date().toISOString(),
      duration_ms: Date.now() - startedAt,
      error_message: error instanceof Error ? error.message : String(error),
    })
    .eq("id", jobRun.id);

  throw error;
}
