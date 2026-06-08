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

const venues = [
  ["azteca", "Estadio Azteca", "Mexico City", "CDMX", "Mexico", "America/Mexico_City", 19.3029, -99.1504, 87523],
  ["akron", "Estadio Akron", "Zapopan", "Jalisco", "Mexico", "America/Mexico_City", 20.6818, -103.4623, 48071],
  ["bbva", "Estadio BBVA", "Guadalupe", "Nuevo Leon", "Mexico", "America/Monterrey", 25.6682, -100.2446, 53500],
  ["bmo-field", "BMO Field", "Toronto", "Ontario", "Canada", "America/Toronto", 43.6332, -79.4186, 45000],
  ["bc-place", "BC Place", "Vancouver", "British Columbia", "Canada", "America/Vancouver", 49.2768, -123.1119, 54500],
  ["lumen-field", "Lumen Field", "Seattle", "Washington", "United States", "America/Los_Angeles", 47.5952, -122.3316, 68740],
  ["levis-stadium", "Levi's Stadium", "Santa Clara", "California", "United States", "America/Los_Angeles", 37.403, -121.97, 68500],
  ["sofi-stadium", "SoFi Stadium", "Inglewood", "California", "United States", "America/Los_Angeles", 33.9535, -118.3392, 70240],
  ["gillette-stadium", "Gillette Stadium", "Foxborough", "Massachusetts", "United States", "America/New_York", 42.0909, -71.2643, 65878],
  ["metlife-stadium", "MetLife Stadium", "East Rutherford", "New Jersey", "United States", "America/New_York", 40.8135, -74.0745, 82500],
  ["lincoln-financial-field", "Lincoln Financial Field", "Philadelphia", "Pennsylvania", "United States", "America/New_York", 39.9008, -75.1675, 67594],
  ["hard-rock-stadium", "Hard Rock Stadium", "Miami Gardens", "Florida", "United States", "America/New_York", 25.958, -80.2389, 64767],
  ["mercedes-benz-stadium", "Mercedes-Benz Stadium", "Atlanta", "Georgia", "United States", "America/New_York", 33.7554, -84.4008, 71000],
  ["nrg-stadium", "NRG Stadium", "Houston", "Texas", "United States", "America/Chicago", 29.6847, -95.4107, 72220],
  ["arrowhead-stadium", "Arrowhead Stadium", "Kansas City", "Missouri", "United States", "America/Chicago", 39.049, -94.4839, 76416],
  ["att-stadium", "AT&T Stadium", "Arlington", "Texas", "United States", "America/Chicago", 32.7473, -97.0945, 80000],
].map(([slug, name, host_city, region, country, timezone, latitude, longitude, capacity], index) => ({
  id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  tournament_id: tournamentId,
  slug,
  name,
  host_city,
  region,
  country,
  timezone,
  latitude,
  longitude,
  capacity,
}));

const groups = {
  A: [
    ["MEX", "mexico", "Mexico", "Mexico", "CONCACAF"],
    ["RSA", "south-africa", "South Africa", "South Africa", "CAF"],
    ["KOR", "south-korea", "South Korea", "South Korea", "AFC"],
    ["CZE", "czechia", "Czechia", "Czechia", "UEFA"],
  ],
  B: [
    ["CAN", "canada", "Canada", "Canada", "CONCACAF"],
    ["BIH", "bosnia-and-herzegovina", "Bosnia and Herzegovina", "Bosnia and Herzegovina", "UEFA"],
    ["QAT", "qatar", "Qatar", "Qatar", "AFC"],
    ["SUI", "switzerland", "Switzerland", "Switzerland", "UEFA"],
  ],
  C: [
    ["BRA", "brazil", "Brazil", "Brazil", "CONMEBOL"],
    ["MAR", "morocco", "Morocco", "Morocco", "CAF"],
    ["HAI", "haiti", "Haiti", "Haiti", "CONCACAF"],
    ["SCO", "scotland", "Scotland", "Scotland", "UEFA"],
  ],
  D: [
    ["USA", "usa", "United States", "United States", "CONCACAF"],
    ["PAR", "paraguay", "Paraguay", "Paraguay", "CONMEBOL"],
    ["AUS", "australia", "Australia", "Australia", "AFC"],
    ["TUR", "turkiye", "Turkiye", "Turkiye", "UEFA"],
  ],
  E: [
    ["GER", "germany", "Germany", "Germany", "UEFA"],
    ["CUW", "curacao", "Curacao", "Curacao", "CONCACAF"],
    ["CIV", "ivory-coast", "Ivory Coast", "Ivory Coast", "CAF"],
    ["ECU", "ecuador", "Ecuador", "Ecuador", "CONMEBOL"],
  ],
  F: [
    ["NED", "netherlands", "Netherlands", "Netherlands", "UEFA"],
    ["JPN", "japan", "Japan", "Japan", "AFC"],
    ["SWE", "sweden", "Sweden", "Sweden", "UEFA"],
    ["TUN", "tunisia", "Tunisia", "Tunisia", "CAF"],
  ],
  G: [
    ["BEL", "belgium", "Belgium", "Belgium", "UEFA"],
    ["EGY", "egypt", "Egypt", "Egypt", "CAF"],
    ["IRN", "iran", "Iran", "Iran", "AFC"],
    ["NZL", "new-zealand", "New Zealand", "New Zealand", "OFC"],
  ],
  H: [
    ["ESP", "spain", "Spain", "Spain", "UEFA"],
    ["CPV", "cape-verde", "Cape Verde", "Cape Verde", "CAF"],
    ["KSA", "saudi-arabia", "Saudi Arabia", "Saudi Arabia", "AFC"],
    ["URU", "uruguay", "Uruguay", "Uruguay", "CONMEBOL"],
  ],
  I: [
    ["FRA", "france", "France", "France", "UEFA"],
    ["SEN", "senegal", "Senegal", "Senegal", "CAF"],
    ["IRQ", "iraq", "Iraq", "Iraq", "AFC"],
    ["NOR", "norway", "Norway", "Norway", "UEFA"],
  ],
  J: [
    ["ARG", "argentina", "Argentina", "Argentina", "CONMEBOL"],
    ["ALG", "algeria", "Algeria", "Algeria", "CAF"],
    ["AUT", "austria", "Austria", "Austria", "UEFA"],
    ["JOR", "jordan", "Jordan", "Jordan", "AFC"],
  ],
  K: [
    ["POR", "portugal", "Portugal", "Portugal", "UEFA"],
    ["COD", "dr-congo", "DR Congo", "DR Congo", "CAF"],
    ["UZB", "uzbekistan", "Uzbekistan", "Uzbekistan", "AFC"],
    ["COL", "colombia", "Colombia", "Colombia", "CONMEBOL"],
  ],
  L: [
    ["ENG", "england", "England", "England", "UEFA"],
    ["CRO", "croatia", "Croatia", "Croatia", "UEFA"],
    ["GHA", "ghana", "Ghana", "Ghana", "CAF"],
    ["PAN", "panama", "Panama", "Panama", "CONCACAF"],
  ],
};

const teamIdentities = {
  mexico: "Host nation pressure, altitude, and the opening-match spotlight.",
  canada: "Host nation energy with transition pace and a demanding group path.",
  usa: "Host nation expectations with athletic pressure and a direct attacking profile.",
  brazil: "Tournament favorite tier with star power and group-control expectations.",
  germany: "Heavyweight standards make every group result feel consequential.",
  japan: "Technically sharp, press-resistant, and dangerous when games open up.",
  argentina: "Champion pedigree with pressure to turn control into another deep run.",
  portugal: "Elite attacking options and a group where control should be expected.",
  england: "High-expectation squad with a route that can become headline-heavy fast.",
  france: "Tournament favorite tier with depth, speed, and knockout-stage expectations.",
  spain: "Possession control and youth quality make them a watch-desk team.",
  morocco: "Compact, emotional, and dangerous when favorites leave transition space.",
};

const championHistory = {
  brazil: ["Five-time winners", 5],
  germany: ["Four-time winners", 4],
  argentina: ["Three-time winners", 3],
  uruguay: ["Two-time winners", 2],
  france: ["Two-time winners", 2],
  england: ["1966 winners", 1],
  spain: ["2010 winners", 1],
};

const teams = Object.entries(groups).flatMap(([group, groupTeams], groupIndex) =>
  groupTeams.map(([fifa_code, slug, name, country, confederation], teamIndex) => ({
    id: `20000000-0000-4000-8000-${String(groupIndex * 4 + teamIndex + 1).padStart(12, "0")}`,
    tournament_id: tournamentId,
    fifa_code,
    slug,
    name,
    short_name: name,
    country,
    confederation,
    group_code: group,
    status: "active",
    identity: teamIdentities[slug] ?? `${name} enter Group ${group} with the path now set.`,
  })),
);

const teamByName = new Map(teams.map((team) => [team.name, team]));
const venueBySlug = new Map(venues.map((venue) => [venue.slug, venue]));

const offsetByVenue = {
  azteca: -6,
  akron: -6,
  bbva: -6,
  "bmo-field": -4,
  "bc-place": -7,
  "lumen-field": -7,
  "levis-stadium": -7,
  "sofi-stadium": -7,
  "gillette-stadium": -4,
  "metlife-stadium": -4,
  "lincoln-financial-field": -4,
  "hard-rock-stadium": -4,
  "mercedes-benz-stadium": -4,
  "nrg-stadium": -5,
  "arrowhead-stadium": -5,
  "att-stadium": -5,
};

function startsAt(date, time, venueSlug) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute = 0] = time.split(":").map(Number);
  const offset = offsetByVenue[venueSlug];
  return new Date(Date.UTC(year, month - 1, day, hour - offset, minute)).toISOString();
}

const fixturesRaw = [
  ["A", "2026-06-11", "13:00", "Mexico", "South Africa", "azteca"],
  ["A", "2026-06-11", "20:00", "South Korea", "Czechia", "akron"],
  ["B", "2026-06-12", "15:00", "Canada", "Bosnia and Herzegovina", "bmo-field"],
  ["D", "2026-06-12", "18:00", "United States", "Paraguay", "sofi-stadium"],
  ["B", "2026-06-13", "12:00", "Qatar", "Switzerland", "levis-stadium"],
  ["C", "2026-06-13", "18:00", "Brazil", "Morocco", "gillette-stadium"],
  ["C", "2026-06-13", "21:00", "Haiti", "Scotland", "metlife-stadium"],
  ["D", "2026-06-13", "21:00", "Australia", "Turkiye", "bc-place"],
  ["E", "2026-06-14", "19:00", "Ivory Coast", "Ecuador", "lincoln-financial-field"],
  ["E", "2026-06-14", "12:00", "Germany", "Curacao", "nrg-stadium"],
  ["F", "2026-06-14", "15:00", "Netherlands", "Japan", "att-stadium"],
  ["F", "2026-06-14", "20:00", "Sweden", "Tunisia", "bbva"],
  ["G", "2026-06-15", "18:00", "Iran", "New Zealand", "sofi-stadium"],
  ["G", "2026-06-15", "12:00", "Belgium", "Egypt", "lumen-field"],
  ["H", "2026-06-15", "18:00", "Saudi Arabia", "Uruguay", "hard-rock-stadium"],
  ["H", "2026-06-15", "12:00", "Spain", "Cape Verde", "mercedes-benz-stadium"],
  ["I", "2026-06-16", "15:00", "France", "Senegal", "metlife-stadium"],
  ["I", "2026-06-16", "18:00", "Iraq", "Norway", "gillette-stadium"],
  ["J", "2026-06-16", "20:00", "Argentina", "Algeria", "arrowhead-stadium"],
  ["J", "2026-06-16", "21:00", "Austria", "Jordan", "levis-stadium"],
  ["K", "2026-06-17", "12:00", "Portugal", "DR Congo", "nrg-stadium"],
  ["K", "2026-06-17", "20:00", "Uzbekistan", "Colombia", "azteca"],
  ["L", "2026-06-17", "19:00", "Ghana", "Panama", "bmo-field"],
  ["L", "2026-06-17", "15:00", "England", "Croatia", "att-stadium"],
  ["A", "2026-06-18", "12:00", "Czechia", "South Africa", "mercedes-benz-stadium"],
  ["A", "2026-06-18", "19:00", "Mexico", "South Korea", "akron"],
  ["B", "2026-06-18", "12:00", "Switzerland", "Bosnia and Herzegovina", "sofi-stadium"],
  ["B", "2026-06-18", "15:00", "Canada", "Qatar", "bc-place"],
  ["C", "2026-06-19", "18:00", "Scotland", "Morocco", "lincoln-financial-field"],
  ["C", "2026-06-19", "21:00", "Brazil", "Haiti", "gillette-stadium"],
  ["D", "2026-06-19", "21:00", "Turkiye", "Paraguay", "levis-stadium"],
  ["D", "2026-06-19", "12:00", "United States", "Australia", "lumen-field"],
  ["E", "2026-06-20", "16:00", "Germany", "Ivory Coast", "bmo-field"],
  ["E", "2026-06-20", "19:00", "Ecuador", "Curacao", "arrowhead-stadium"],
  ["F", "2026-06-20", "12:00", "Netherlands", "Sweden", "nrg-stadium"],
  ["F", "2026-06-20", "22:00", "Tunisia", "Japan", "bbva"],
  ["G", "2026-06-21", "12:00", "Belgium", "Iran", "sofi-stadium"],
  ["G", "2026-06-21", "18:00", "New Zealand", "Egypt", "bc-place"],
  ["H", "2026-06-21", "18:00", "Uruguay", "Cape Verde", "hard-rock-stadium"],
  ["H", "2026-06-21", "12:00", "Spain", "Saudi Arabia", "mercedes-benz-stadium"],
  ["I", "2026-06-22", "20:00", "Norway", "Senegal", "metlife-stadium"],
  ["I", "2026-06-22", "17:00", "France", "Iraq", "lincoln-financial-field"],
  ["J", "2026-06-22", "12:00", "Argentina", "Austria", "att-stadium"],
  ["J", "2026-06-22", "20:00", "Jordan", "Algeria", "levis-stadium"],
  ["K", "2026-06-23", "12:00", "Portugal", "Uzbekistan", "nrg-stadium"],
  ["K", "2026-06-23", "20:00", "Colombia", "DR Congo", "akron"],
  ["L", "2026-06-23", "16:00", "England", "Ghana", "gillette-stadium"],
  ["L", "2026-06-23", "19:00", "Panama", "Croatia", "bmo-field"],
  ["A", "2026-06-24", "19:00", "Czechia", "Mexico", "azteca"],
  ["A", "2026-06-24", "19:00", "South Africa", "South Korea", "bbva"],
  ["B", "2026-06-24", "12:00", "Switzerland", "Canada", "bc-place"],
  ["B", "2026-06-24", "12:00", "Bosnia and Herzegovina", "Qatar", "lumen-field"],
  ["C", "2026-06-24", "18:00", "Scotland", "Brazil", "hard-rock-stadium"],
  ["C", "2026-06-24", "18:00", "Morocco", "Haiti", "mercedes-benz-stadium"],
  ["D", "2026-06-25", "19:00", "Turkiye", "United States", "sofi-stadium"],
  ["D", "2026-06-25", "19:00", "Paraguay", "Australia", "levis-stadium"],
  ["E", "2026-06-25", "16:00", "Curacao", "Ivory Coast", "lincoln-financial-field"],
  ["E", "2026-06-25", "16:00", "Ecuador", "Germany", "metlife-stadium"],
  ["F", "2026-06-25", "18:00", "Japan", "Sweden", "att-stadium"],
  ["F", "2026-06-25", "18:00", "Tunisia", "Netherlands", "arrowhead-stadium"],
  ["G", "2026-06-26", "20:00", "Egypt", "Iran", "lumen-field"],
  ["G", "2026-06-26", "20:00", "New Zealand", "Belgium", "bc-place"],
  ["H", "2026-06-26", "19:00", "Cape Verde", "Saudi Arabia", "nrg-stadium"],
  ["H", "2026-06-26", "18:00", "Uruguay", "Spain", "akron"],
  ["I", "2026-06-26", "15:00", "Norway", "France", "gillette-stadium"],
  ["I", "2026-06-26", "15:00", "Senegal", "Iraq", "bmo-field"],
  ["J", "2026-06-27", "21:00", "Algeria", "Austria", "arrowhead-stadium"],
  ["J", "2026-06-27", "21:00", "Jordan", "Argentina", "att-stadium"],
  ["K", "2026-06-27", "19:30", "Colombia", "Portugal", "hard-rock-stadium"],
  ["K", "2026-06-27", "19:30", "DR Congo", "Uzbekistan", "mercedes-benz-stadium"],
  ["L", "2026-06-27", "17:00", "Panama", "England", "metlife-stadium"],
  ["L", "2026-06-27", "17:00", "Croatia", "Ghana", "lincoln-financial-field"],
];

function fixtureReason(group, home, away, index) {
  if (index === 0) return "Opening match";
  if (["Mexico", "Canada", "United States"].includes(home) || ["Mexico", "Canada", "United States"].includes(away)) {
    return "Host nation watch";
  }
  if (["Brazil", "Argentina", "France", "England", "Spain", "Germany", "Portugal"].includes(home)) {
    return "Favorite watch";
  }
  return `Group ${group} path-setter`;
}

function fixtureStakes(group, home, away, index) {
  if (index < 24) return `${home} and ${away} open Group ${group}; this sets the pressure for the second matchday.`;
  if (index < 48) return `${home} and ${away} enter the middle matchday where group paths start to separate.`;
  return `${home} and ${away} close Group ${group}; simultaneous results can decide qualification and bracket paths.`;
}

function fixtureImplication(group, index) {
  if (index < 24) return `A win creates early control in Group ${group}; a draw keeps the group compact.`;
  if (index < 48) return `This result shapes who can qualify before the final group window.`;
  return `Final group-window result: qualification, elimination, and third-place ranking can all move.`;
}

const fixtures = fixturesRaw.map(([group, date, time, home, away, venueSlug], index) => ({
  id: `30000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  tournament_id: tournamentId,
  match_number: index + 1,
  stage: "group",
  group_code: group,
  venue_id: venueBySlug.get(venueSlug).id,
  home_team_id: teamByName.get(home).id,
  away_team_id: teamByName.get(away).id,
  starts_at: startsAt(date, time, venueSlug),
  status: "scheduled",
  importance_score: index === 0 ? 98 : Math.max(62, 88 - Math.floor(index / 3)),
  importance_reason: fixtureReason(group, home, away, index),
  stakes: fixtureStakes(group, home, away, index),
  implication: fixtureImplication(group, index),
}));

async function failOnError(label, result) {
  if (result.error) {
    throw new Error(`${label}: ${result.error.message}`);
  }
  return result.data;
}

async function main() {
  await failOnError(
    "clear source snapshots",
    await supabase.from("source_snapshots").delete().eq("tournament_id", tournamentId),
  );
  await failOnError("clear job runs", await supabase.from("job_runs").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  await failOnError("clear predictions", await supabase.from("predictions").delete().eq("tournament_id", tournamentId));
  await failOnError("clear updates", await supabase.from("updates").delete().eq("tournament_id", tournamentId));
  await failOnError("clear match events", await supabase.from("match_events").delete().neq("id", "00000000-0000-0000-0000-000000000000"));
  await failOnError("clear standings", await supabase.from("standings").delete().eq("tournament_id", tournamentId));
  await failOnError("clear team history", await supabase.from("team_history").delete().eq("tournament_id", tournamentId));
  await failOnError("clear players", await supabase.from("players").delete().eq("tournament_id", tournamentId));
  await failOnError("clear fixtures", await supabase.from("fixtures").delete().eq("tournament_id", tournamentId));
  await failOnError("clear teams", await supabase.from("teams").delete().eq("tournament_id", tournamentId));
  await failOnError("clear venues", await supabase.from("venues").delete().eq("tournament_id", tournamentId));

  await failOnError(
    "upsert tournament",
    await supabase.from("tournaments").upsert({
      id: tournamentId,
      fifa_id: "fifa-world-cup-2026",
      name: "2026 FIFA World Cup",
      slug: "world-cup-2026",
      year: 2026,
      host_countries: ["Canada", "Mexico", "United States"],
      starts_at: "2026-06-11T00:00:00Z",
      ends_at: "2026-07-19T00:00:00Z",
      team_count: 48,
      group_count: 12,
      matches_count: 104,
      group_stage_advancement: "Top teams and best third-place teams advance under the expanded 48-team format.",
      status: "scheduled",
    }),
  );

  await failOnError("insert venues", await supabase.from("venues").upsert(venues));
  await failOnError("insert teams", await supabase.from("teams").upsert(teams));
  await failOnError("insert fixtures", await supabase.from("fixtures").upsert(fixtures));

  const standings = teams.map((team) => ({
    tournament_id: tournamentId,
    team_id: team.id,
    group_code: team.group_code,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
    rank: null,
    qualification_status: "not_started",
  }));
  await failOnError("insert standings", await supabase.from("standings").upsert(standings));

  const histories = teams.map((team) => {
    const history = championHistory[team.slug];
    return {
      tournament_id: tournamentId,
      team_id: team.id,
      team_code: team.fifa_code,
      appearances: 0,
      titles: history?.[1] ?? 0,
      best_finish: history?.[0] ?? "Tournament history import pending",
      summary: history ? `${team.name}: ${history[0]}.` : `${team.name} are in Group ${team.group_code} for the 2026 tournament.`,
      notable_moments: [],
      rivalries: [],
    };
  });
  await failOnError("insert team history", await supabase.from("team_history").upsert(histories));

  const updates = [
    {
      tournament_id: tournamentId,
      entity_type: "tournament",
      update_type: "schedule_ready",
      title: "Group-stage schedule loaded",
      summary: "All 72 group-stage fixtures are now stored for Pulse90 watch-desk views.",
      impact: "The app can show real upcoming matches instead of prototype data.",
    },
    {
      tournament_id: tournamentId,
      entity_type: "fixture",
      entity_id: fixtures[0].id,
      update_type: "opening_match",
      title: "Mexico vs South Africa opens the tournament",
      summary: "The first match is scheduled for June 11 at Estadio Azteca in Mexico City.",
      impact: "This becomes the first priority match before kickoff.",
    },
    {
      tournament_id: tournamentId,
      entity_type: "team",
      update_type: "groups_ready",
      title: "All 48 teams grouped",
      summary: "Groups A through L are now stored with team paths ready for browsing.",
      impact: "Team directory and team-path pages can use live database records.",
    },
  ];
  await failOnError("insert updates", await supabase.from("updates").insert(updates));

  await failOnError(
    "insert source snapshot",
    await supabase.from("source_snapshots").insert({
      tournament_id: tournamentId,
      source_name: "manual_research_seed",
      source_url: "https://www.fourfourtwo.com/competition/world-cup-2026-fixtures-and-results",
      payload_hash: `real-seed-${Date.now()}`,
      payload: {
        seeded_at: new Date().toISOString(),
        teams: teams.length,
        venues: venues.length,
        fixtures: fixtures.length,
        source_note: "Group-stage fixtures and group/team baseline collected from current public schedule references.",
      },
    }),
  );

  await failOnError(
    "insert job run",
    await supabase.from("job_runs").insert({
      job_name: "seed_real_world_cup_2026",
      status: "success",
      finished_at: new Date().toISOString(),
      records_read: teams.length + venues.length + fixtures.length,
      records_changed: teams.length + venues.length + fixtures.length,
      metadata: { source: "scripts/seed-real-world-cup-2026.mjs" },
    }),
  );

  console.log(
    JSON.stringify(
      {
        seeded: true,
        teams: teams.length,
        venues: venues.length,
        group_stage_fixtures: fixtures.length,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
