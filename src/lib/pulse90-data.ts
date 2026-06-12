import { getSupabaseReadClient } from "@/lib/supabase/server";
import {
  getMatch,
  getTeam,
  liveMatches,
  predictions,
  type Match,
  type Prediction,
  type Team,
  teams,
  todayMatches,
  tomorrowMatches,
  updates,
} from "@/lib/mock-data";

type FixtureCardRow = {
  id: string;
  match_number: number;
  status: "scheduled" | "live" | "completed" | "postponed" | "cancelled";
  minute: number | null;
  starts_at: string;
  stage: string;
  group_code: string | null;
  home_score: number | null;
  away_score: number | null;
  importance_score: number | null;
  importance_reason: string | null;
  stakes: string | null;
  implication: string | null;
  home_team: string | null;
  home_team_slug: string | null;
  away_team: string | null;
  away_team_slug: string | null;
  venue: string | null;
  host_city: string | null;
};

type UpdateRow = {
  label?: string;
  update_type: string;
  title: string;
  summary: string;
  impact: string | null;
};

type PredictionRow = {
  prediction_type: string;
  label: string;
  movement_label: string | null;
  movement_value: number | null;
};

type TeamPathRow = {
  id: string;
  slug: string;
  name: string;
  group_code: string | null;
  status: string;
  identity: string | null;
  coach: string | null;
  captain: string | null;
  qualification_status: string | null;
  next_match_number: number | null;
  next_match_starts_at: string | null;
  next_opponent: string | null;
};

type PlayerRow = {
  name: string;
  known_as: string | null;
  position: string;
  roster_role: string | null;
  shirt_number: number | null;
  club: string | null;
  status: string;
};

type HistoryGoalRow = {
  team_name: string;
  scorer: string;
  minute: number | null;
  own_goal: boolean;
  penalty: boolean;
};

type HistoryMatchRow = {
  match_date: string;
  competition: string;
  city: string | null;
  country: string | null;
  home_team_name: string;
  away_team_name: string;
  home_score: number;
  away_score: number;
  team_history_goals?: HistoryGoalRow[];
};

type SquadPlayer = {
  name: string;
  position: string;
  positionCode: string;
  shirtNumber: number | null;
  club: string;
  status: string;
};

export type RecentTeamGoal = {
  minute: number | null;
  ownGoal: boolean;
  penalty: boolean;
  scorer: string;
  team: string;
};

export type RecentTeamMatch = {
  away: string;
  awayScore: number;
  competition: string;
  date: string;
  location: string;
  goals: RecentTeamGoal[];
  home: string;
  homeScore: number;
  result: "D" | "L" | "W";
};

export type MatchCenterGroupRow = {
  fifaCode: string;
  flagAssetUrl: string | null;
  flagEmoji: string;
  goalDifference: number;
  name: string;
  played: number;
  points: number;
  rank: number;
  slug: string;
};

export type MatchCenterTeam = {
  flagAssetUrl: string | null;
  flagEmoji: string;
  group: string;
  history: RecentTeamMatch[];
  name: string;
  slug: string;
  squad: SquadPlayer[];
};

export type MatchEvent = {
  eventType: string;
  minute: number | null;
  stoppageMinute: number | null;
  title: string;
  teamId: string | null;
  importance: number;
};

export type ActiveGroupTeam = {
  slug: string;
  name: string;
  fifaCode: string;
  flagEmoji: string;
  flagAssetUrl: string | null;
  played: number;
  goalDifference: number;
  points: number;
  rank: number;
};

export type ActiveGroup = {
  groupCode: string;
  teams: ActiveGroupTeam[];
};

export type DirectoryTeam = {
  confederation: string;
  flagAssetUrl: string | null;
  flagEmoji: string;
  group: string;
  name: string;
  region: string;
  slug: string;
};

type AppTeam = Team & {
  squad: SquadPlayer[];
};

type TeamRow = {
  id: string;
  slug: string;
  name: string;
  fifa_code: string;
  flag_asset_url?: string | null;
  flag_emoji?: string | null;
  group_code: string | null;
  confederation: string;
  status: string;
};

type FixtureTeamFlagRow = {
  id: string;
  slug: string;
  fifa_code: string;
  flag_asset_url?: string | null;
  flag_emoji?: string | null;
};

type FixtureTeamFlag = {
  id: string;
  assetUrl: string | null;
  emoji: string;
};

export type VoteTally = {
  homeVotes: number;
  drawVotes: number;
  awayVotes: number;
  total: number;
};

export type PlayerPrediction = {
  label: string;
};

export type MatchPredictions = {
  matchWinner: string | null;
  goalScorers: PlayerPrediction[];
  cardWatch: PlayerPrediction[];
};

export type GoldenBootEntry = {
  name: string;
  goals: number;
};

export type UpcomingMatchPrediction = {
  fixtureId: string;
  matchNumber: number;
  startsAt: string;
  date: string;
  time: string;
  home: string;
  homeFlagEmoji: string;
  homeFlagAssetUrl: string | null;
  away: string;
  awayFlagEmoji: string;
  awayFlagAssetUrl: string | null;
  matchWinner: string | null;
  goalScorers: string[];
  cardWatch: string[];
};

type MatchCenterTeamRow = {
  id: string;
  slug: string;
  name: string;
  fifa_code: string;
  flag_asset_url?: string | null;
  flag_emoji?: string | null;
  group_code: string | null;
};

type StandingRow = {
  team_id: string;
  group_code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  rank: number | null;
  qualification_status: string | null;
};

type LiveGroupProjectionRow = {
  team_id: string;
  slug: string;
  name: string;
  fifa_code: string;
  flag_emoji: string | null;
  flag_asset_url: string | null;
  group_code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  projected_rank: number;
};

const flagByFifaCode: Record<string, string> = {
  ALG: "🇩🇿",
  ARG: "🇦🇷",
  AUS: "🇦🇺",
  AUT: "🇦🇹",
  BEL: "🇧🇪",
  BIH: "🇧🇦",
  BRA: "🇧🇷",
  CAN: "🇨🇦",
  CIV: "🇨🇮",
  COD: "🇨🇩",
  COL: "🇨🇴",
  CPV: "🇨🇻",
  CRO: "🇭🇷",
  CUW: "🇨🇼",
  CZE: "🇨🇿",
  ECU: "🇪🇨",
  EGY: "🇪🇬",
  ENG: "🏴",
  ESP: "🇪🇸",
  FRA: "🇫🇷",
  GER: "🇩🇪",
  GHA: "🇬🇭",
  HAI: "🇭🇹",
  IRN: "🇮🇷",
  IRQ: "🇮🇶",
  JOR: "🇯🇴",
  JPN: "🇯🇵",
  KOR: "🇰🇷",
  KSA: "🇸🇦",
  MAR: "🇲🇦",
  MEX: "🇲🇽",
  NED: "🇳🇱",
  NOR: "🇳🇴",
  NZL: "🇳🇿",
  PAN: "🇵🇦",
  PAR: "🇵🇾",
  POR: "🇵🇹",
  QAT: "🇶🇦",
  RSA: "🇿🇦",
  SCO: "🏴",
  SEN: "🇸🇳",
  SUI: "🇨🇭",
  SWE: "🇸🇪",
  TUN: "🇹🇳",
  TUR: "🇹🇷",
  URU: "🇺🇾",
  USA: "🇺🇸",
  UZB: "🇺🇿",
};

const flagCodeByFifaCode: Record<string, string> = {
  ALG: "dz",
  ARG: "ar",
  AUS: "au",
  AUT: "at",
  BEL: "be",
  BIH: "ba",
  BRA: "br",
  CAN: "ca",
  CIV: "ci",
  COD: "cd",
  COL: "co",
  CPV: "cv",
  CRO: "hr",
  CUW: "cw",
  CZE: "cz",
  ECU: "ec",
  EGY: "eg",
  ENG: "gb-eng",
  ESP: "es",
  FRA: "fr",
  GER: "de",
  GHA: "gh",
  HAI: "ht",
  IRN: "ir",
  IRQ: "iq",
  JOR: "jo",
  JPN: "jp",
  KOR: "kr",
  KSA: "sa",
  MAR: "ma",
  MEX: "mx",
  NED: "nl",
  NOR: "no",
  NZL: "nz",
  PAN: "pa",
  PAR: "py",
  POR: "pt",
  QAT: "qa",
  RSA: "za",
  SCO: "gb-sct",
  SEN: "sn",
  SUI: "ch",
  SWE: "se",
  TUN: "tn",
  TUR: "tr",
  URU: "uy",
  USA: "us",
  UZB: "uz",
};

function flagFor(code: string, storedFlag?: string | null) {
  return storedFlag ?? flagByFifaCode[code] ?? "🏳";
}

function flagAssetFor(code: string, storedAsset?: string | null) {
  const flagCode = flagCodeByFifaCode[code];

  return storedAsset ?? (flagCode ? `https://flagcdn.com/w80/${flagCode}.png` : null);
}

function regionForConfederation(confederation: string) {
  const regions: Record<string, string> = {
    AFC: "Asia",
    CAF: "Africa",
    CONCACAF: "North America",
    CONMEBOL: "South America",
    OFC: "Oceania",
    UEFA: "Europe",
  };

  return regions[confederation] ?? confederation;
}

function formatKickoff(startsAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Chicago",
  }).format(new Date(startsAt));
}

function formatMatchDate(startsAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "America/Chicago",
  }).format(new Date(startsAt));
}

function mapFixture(
  row: FixtureCardRow,
  teamFlags: Map<string, FixtureTeamFlag> = new Map(),
): Match {
  const home = row.home_team ?? "TBD";
  const away = row.away_team ?? "TBD";
  const status =
    row.status === "live" || row.status === "completed" ? row.status : "scheduled";
  const homeFlag = row.home_team_slug ? teamFlags.get(row.home_team_slug) : undefined;
  const awayFlag = row.away_team_slug ? teamFlags.get(row.away_team_slug) : undefined;

  return {
    fixtureId: row.id,
    matchNumber: row.match_number,
    status,
    minute: row.minute ? `${row.minute}'` : undefined,
    date: formatMatchDate(row.starts_at),
    time: row.status === "live" ? "Live" : formatKickoff(row.starts_at),
    home,
    homeFlagAssetUrl: homeFlag?.assetUrl ?? null,
    homeFlagEmoji: homeFlag?.emoji,
    homeSlug: row.home_team_slug,
    homeTeamId: homeFlag?.id ?? null,
    away,
    awayFlagAssetUrl: awayFlag?.assetUrl ?? null,
    awayFlagEmoji: awayFlag?.emoji,
    awaySlug: row.away_team_slug,
    awayTeamId: awayFlag?.id ?? null,
    score:
      row.home_score === null || row.away_score === null
        ? undefined
        : `${row.home_score}-${row.away_score}`,
    place: row.host_city ?? "TBD",
    venue: row.venue ?? "TBD",
    stage: row.stage,
    group: row.group_code ? `Group ${row.group_code}` : row.stage,
    tag: row.importance_reason ?? "Watch",
    reason: row.importance_reason ?? "Tournament context",
    stakes: row.stakes ?? "Context is being reviewed.",
    implication: row.implication ?? "Result implications will update soon.",
    heat: row.importance_score ?? 50,
  };
}

async function getFixtureTeamFlags() {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return new Map<string, FixtureTeamFlag>();
  }

  const result = await supabase
    .from("teams")
    .select("id, slug, fifa_code, flag_emoji, flag_asset_url");

  if (result.error) {
    return new Map<string, FixtureTeamFlag>();
  }

  return new Map(
    (result.data as FixtureTeamFlagRow[]).map((team) => [
      team.slug,
      {
        id: team.id,
        assetUrl: flagAssetFor(team.fifa_code, team.flag_asset_url),
        emoji: flagFor(team.fifa_code, team.flag_emoji),
      },
    ]),
  );
}

async function getVoteTally(
  supabase: NonNullable<ReturnType<typeof getSupabaseReadClient>>,
  fixtureId: string,
  homeTeamId: string | null,
  awayTeamId: string | null,
): Promise<VoteTally> {
  const { data } = await supabase
    .from("fixture_votes")
    .select("picked_team_id")
    .eq("fixture_id", fixtureId);

  const rows = (data ?? []) as Array<{ picked_team_id: string | null }>;
  return {
    homeVotes: homeTeamId ? rows.filter((r) => r.picked_team_id === homeTeamId).length : 0,
    drawVotes: rows.filter((r) => r.picked_team_id === null).length,
    awayVotes: awayTeamId ? rows.filter((r) => r.picked_team_id === awayTeamId).length : 0,
    total: rows.length,
  };
}

function mapUpdate(row: UpdateRow) {
  return {
    label: row.update_type.replaceAll("_", " "),
    title: row.title,
    detail: row.summary,
    impact: row.impact ?? "Tournament context updated",
  };
}

function mapPrediction(row: PredictionRow): Prediction {
  return {
    label: row.prediction_type.replaceAll("_", " "),
    subject: row.label,
    movement: row.movement_label ?? "0%",
    tone: (row.movement_value ?? 0) >= 0 ? "up" : "down",
  };
}

function mapTomorrowItem(match: Match, index: number) {
  const slots = ["Next up", "Host watch", "Group opener", "Plan around"];

  return {
    slot: slots[index] ?? "Upcoming",
    match: `${match.home} vs ${match.away}`,
    date: match.date,
    time: match.time,
    note: match.stakes,
  };
}

function mapTeam(row: TeamPathRow, squad: SquadPlayer[] = []): AppTeam {
  const next = row.next_opponent
    ? `vs ${row.next_opponent}${row.next_match_starts_at ? `, ${formatKickoff(row.next_match_starts_at)}` : ""}`
    : "Next match pending";

  return {
    slug: row.slug,
    name: row.name,
    group: row.group_code ? `Group ${row.group_code}` : "Group TBD",
    status: row.qualification_status ?? row.status,
    next,
    need:
      row.qualification_status === "in_danger"
        ? "They need a result to avoid depending on other matches."
        : "Current path is being tracked from standings and fixtures.",
    identity: row.identity ?? "Tournament identity will update as data fills in.",
    coach: row.coach ?? "TBD",
    captain: row.captain ?? "TBD",
    keyPlayers: squad.slice(0, 5).map((player) => player.name),
    squad,
    history: "",
  };
}

function mapPlayer(row: PlayerRow): SquadPlayer {
  return {
    name: row.known_as ?? row.name,
    position: row.position,
    positionCode: row.roster_role ?? row.position.slice(0, 2).toUpperCase(),
    shirtNumber: row.shirt_number,
    club: row.club ?? "Club TBD",
    status: row.status,
  };
}

function mapHistoryMatch(row: HistoryMatchRow, teamName: string): RecentTeamMatch {
  const isHome = row.home_team_name === teamName;
  const goalsFor = isHome ? row.home_score : row.away_score;
  const goalsAgainst = isHome ? row.away_score : row.home_score;
  const result = goalsFor > goalsAgainst ? "W" : goalsFor < goalsAgainst ? "L" : "D";

  return {
    away: row.away_team_name,
    awayScore: row.away_score,
    competition: row.competition,
    date: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${row.match_date}T00:00:00Z`)),
    location: [row.city, row.country].filter(Boolean).join(", ") || "Location TBD",
    goals: (row.team_history_goals ?? [])
      .map((goal) => ({
        minute: goal.minute,
        ownGoal: goal.own_goal,
        penalty: goal.penalty,
        scorer: goal.scorer,
        team: goal.team_name,
      }))
      .sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999)),
    home: row.home_team_name,
    homeScore: row.home_score,
    result,
  };
}

function buildActiveGroups(rows: LiveGroupProjectionRow[]): ActiveGroup[] {
  const groupMap = new Map<string, ActiveGroup>();
  for (const row of rows) {
    if (!groupMap.has(row.group_code)) {
      groupMap.set(row.group_code, { groupCode: row.group_code, teams: [] });
    }
    groupMap.get(row.group_code)!.teams.push({
      slug: row.slug,
      name: row.name,
      fifaCode: row.fifa_code,
      flagEmoji: flagFor(row.fifa_code, row.flag_emoji),
      flagAssetUrl: flagAssetFor(row.fifa_code, row.flag_asset_url),
      played: row.played,
      goalDifference: row.goal_difference,
      points: row.points,
      rank: row.projected_rank,
    });
  }
  return Array.from(groupMap.values());
}

function fallbackToday() {
  const emptyTally: VoteTally = { homeVotes: 0, drawVotes: 0, awayVotes: 0, total: 0 };
  return {
    source: "mock" as const,
    liveMatches,
    todayMatches,
    tomorrowMatches,
    updates,
    predictions,
    results: [] as Match[],
    activeGroups: [] as ActiveGroup[],
    nextMatch: null,
    priorityMatchTally: emptyTally,
    priorityMatchWinner: null as string | null,
  };
}

export async function getTodayDashboard() {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return fallbackToday();
  }

  const [fixturesResult, predictionsResult, teamFlags, groupProjectionResult, matchWinnerResult] =
    await Promise.all([
      supabase
        .from("fixture_cards_view")
        .select("*")
        .in("status", ["scheduled", "live", "completed"])
        .order("starts_at", { ascending: true })
        .limit(20),
      supabase
        .from("predictions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8),
      getFixtureTeamFlags(),
      // Only groups that have played at least one match
      supabase
        .from("live_group_projection_view")
        .select("*")
        .gt("played", 0)
        .order("group_code", { ascending: true })
        .order("projected_rank", { ascending: true }),
      supabase
        .from("predictions")
        .select("fixture_id, label")
        .eq("prediction_type", "match_winner"),
    ]);

  if (fixturesResult.error || predictionsResult.error) {
    return fallbackToday();
  }

  const rawRows = fixturesResult.data as FixtureCardRow[];
  const allMapped = rawRows.map((row) => mapFixture(row, teamFlags));

  const results = allMapped.filter((m) => m.status === "completed");
  const mappedLive = allMapped.filter((m) => m.status === "live");
  const upcoming = allMapped.filter((m) => m.status !== "completed");

  // Tomorrow's watch windows: first 4 scheduled fixtures that start after today (UTC)
  const endOfTodayUtc = new Date();
  endOfTodayUtc.setUTCHours(23, 59, 59, 999);
  const notTodayRows = rawRows.filter(
    (row) =>
      row.status === "scheduled" &&
      new Date(row.starts_at) > endOfTodayUtc,
  );
  const tomorrowItems = notTodayRows
    .slice(0, 4)
    .map((row, i) => mapTomorrowItem(mapFixture(row, teamFlags), i));

  const activeGroups = buildActiveGroups(
    (groupProjectionResult.data ?? []) as LiveGroupProjectionRow[],
  );

  // Next upcoming match for countdown clock
  const now = new Date();
  const nextRow = rawRows.find(
    (r) => r.status === "scheduled" && new Date(r.starts_at) > now,
  );
  const nextMatch = nextRow
    ? {
        matchNumber: nextRow.match_number,
        startsAt: nextRow.starts_at,
        home: nextRow.home_team ?? "TBD",
        away: nextRow.away_team ?? "TBD",
        fixtureId: nextRow.id,
      }
    : null;

  // Vote tally for the priority match (first live, or first upcoming)
  const priorityMatch = mappedLive[0] ?? upcoming[0];
  const emptyTally: VoteTally = { homeVotes: 0, drawVotes: 0, awayVotes: 0, total: 0 };
  const priorityMatchTally: VoteTally =
    priorityMatch?.fixtureId && priorityMatch.homeTeamId && priorityMatch.awayTeamId
      ? await getVoteTally(
          supabase,
          priorityMatch.fixtureId,
          priorityMatch.homeTeamId,
          priorityMatch.awayTeamId,
        )
      : emptyTally;

  type MatchWinnerRow = { fixture_id: string; label: string };
  const matchWinnerRows = (matchWinnerResult.data ?? []) as MatchWinnerRow[];
  const priorityMatchWinner =
    matchWinnerRows.find((r) => r.fixture_id === priorityMatch?.fixtureId)?.label ?? null;

  return {
    source: "supabase" as const,
    liveMatches: mappedLive,
    todayMatches: upcoming.length ? upcoming : todayMatches,
    tomorrowMatches: tomorrowItems.length ? tomorrowItems : tomorrowMatches,
    updates: [],
    predictions: (predictionsResult.data as PredictionRow[]).map(mapPrediction),
    results,
    activeGroups,
    nextMatch,
    priorityMatchTally,
    priorityMatchWinner,
  };
}

export async function getFixtureExplorer() {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return { matches: todayMatches };
  }

  const [result, teamFlags] = await Promise.all([
    supabase
      .from("fixture_cards_view")
      .select("*")
      .order("starts_at", { ascending: true })
      .limit(104),
    getFixtureTeamFlags(),
  ]);

  if (result.error) {
    return { matches: todayMatches };
  }

  return {
    matches: (result.data as FixtureCardRow[]).map((row) => mapFixture(row, teamFlags)),
  };
}

export async function getTomorrowPlan() {
  const { matches } = await getFixtureExplorer();

  return {
    items: matches.slice(0, 6).map(mapTomorrowItem),
  };
}

export async function getTeamsDirectory() {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return {
      teams: teams.map((team) => ({
        confederation: "Mixed",
        flagAssetUrl: null,
        flagEmoji: "🏳",
        group: team.group,
        name: team.name,
        region: "All Teams",
        slug: team.slug,
      })),
    };
  }

  const result = await supabase
    .from("teams")
    .select("slug, name, fifa_code, flag_emoji, flag_asset_url, group_code, confederation")
    .order("group_code", { ascending: true })
    .order("name", { ascending: true });

  if (result.error) {
    return { teams: [] as DirectoryTeam[] };
  }

  return {
    teams: (result.data as TeamRow[]).map((team) => ({
      confederation: team.confederation,
      flagAssetUrl: flagAssetFor(team.fifa_code, team.flag_asset_url),
      flagEmoji: flagFor(team.fifa_code, team.flag_emoji),
      group: team.group_code ? `Group ${team.group_code}` : "Group TBD",
      name: team.name,
      region: regionForConfederation(team.confederation),
      slug: team.slug,
    })),
  };
}

export async function getTeamPath(slug: string) {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    const team = getTeam(slug);
    return {
      team: team ? { ...team, squad: [] } : undefined,
      matches: todayMatches,
      history: [] as RecentTeamMatch[],
    };
  }

  const [teamResult, fixturesResult, playersResult] = await Promise.all([
    supabase.from("team_path_view").select("*").eq("slug", slug).single(),
    supabase.from("fixture_cards_view").select("*").limit(104),
    supabase
      .from("players")
      .select("name, known_as, position, roster_role, shirt_number, club, status, teams!inner(slug)")
      .eq("teams.slug", slug)
      .order("shirt_number", { ascending: true }),
  ]);

  if (teamResult.error || fixturesResult.error || !teamResult.data) {
    const team = getTeam(slug);
    return {
      team: team ? { ...team, squad: [] } : undefined,
      matches: todayMatches,
      history: [] as RecentTeamMatch[],
    };
  }

  const squad = playersResult.error
    ? []
    : (playersResult.data as unknown as PlayerRow[]).map(mapPlayer);
  const team = mapTeam(teamResult.data as TeamPathRow, squad);
  const historyResult = await supabase
    .from("team_history_matches")
    .select(
      "match_date, competition, city, country, home_team_name, away_team_name, home_score, away_score, team_history_goals(team_name, scorer, minute, own_goal, penalty)",
    )
    .or(`home_team_id.eq.${teamResult.data.id},away_team_id.eq.${teamResult.data.id}`)
    .order("match_date", { ascending: false })
    .limit(12);
  const matches = (fixturesResult.data as FixtureCardRow[])
    .map((row) => mapFixture(row))
    .filter((match) => match.home === team.name || match.away === team.name);
  const history = historyResult.error
    ? []
    : (historyResult.data as unknown as HistoryMatchRow[]).map((row) =>
        mapHistoryMatch(row, team.name),
      );

  return { team, matches, history };
}

export async function getMatchCenter(matchNumber: string) {
  const supabase = getSupabaseReadClient();

  const emptyTally: VoteTally = { homeVotes: 0, drawVotes: 0, awayVotes: 0, total: 0 };
  const emptyPredictions: MatchPredictions = { matchWinner: null, goalScorers: [], cardWatch: [] };
  const emptyCenter = {
    awayTeam: null,
    awayTeamId: null,
    events: [] as MatchEvent[],
    fixtureId: null as string | null,
    groupTable: [] as MatchCenterGroupRow[],
    homeTeam: null,
    homeTeamId: null,
    predictions: emptyPredictions,
    voteTally: emptyTally,
  };

  if (!supabase) {
    return { ...emptyCenter, match: getMatch(matchNumber) };
  }

  const result = await supabase
    .from("fixture_cards_view")
    .select("*")
    .eq("match_number", Number(matchNumber))
    .single();

  if (result.error || !result.data) {
    return { ...emptyCenter, match: getMatch(matchNumber) };
  }

  const fixture = result.data as FixtureCardRow;
  const teamSlugs = [fixture.home_team_slug, fixture.away_team_slug].filter(
    (slug): slug is string => Boolean(slug),
  );
  const [teamsResult, groupResult, eventsResult, predictionsResult] = await Promise.all([
    supabase
      .from("teams")
      .select("id, slug, name, fifa_code, flag_emoji, flag_asset_url, group_code")
      .in("slug", teamSlugs),
    fixture.group_code
      ? supabase
          .from("live_group_projection_view")
          .select(
            "slug, name, fifa_code, flag_emoji, flag_asset_url, group_code, played, goal_difference, points, projected_rank",
          )
          .eq("group_code", fixture.group_code)
          .order("projected_rank", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from("match_events")
      .select("event_type, minute, stoppage_minute, title, team_id, importance")
      .eq("fixture_id", fixture.id)
      .order("minute", { ascending: true, nullsFirst: false })
      .order("importance", { ascending: false }),
    supabase
      .from("predictions")
      .select("prediction_type, label, probability")
      .eq("fixture_id", fixture.id)
      .in("prediction_type", ["player_goal", "player_card", "match_winner"])
      .order("probability", { ascending: false }),
  ]);
  const teamRows = teamsResult.error ? [] : (teamsResult.data as MatchCenterTeamRow[]);
  const teamFlags = new Map(
    teamRows.map((team) => [
      team.slug,
      {
        id: team.id,
        assetUrl: flagAssetFor(team.fifa_code, team.flag_asset_url),
        emoji: flagFor(team.fifa_code, team.flag_emoji),
      },
    ]),
  );
  const homeTeamRow = teamRows.find((team) => team.slug === fixture.home_team_slug);
  const awayTeamRow = teamRows.find((team) => team.slug === fixture.away_team_slug);
  const [homeTeam, awayTeam, voteTally] = await Promise.all([
    homeTeamRow ? getMatchCenterTeam(supabase, homeTeamRow) : Promise.resolve(null),
    awayTeamRow ? getMatchCenterTeam(supabase, awayTeamRow) : Promise.resolve(null),
    getVoteTally(supabase, fixture.id, homeTeamRow?.id ?? null, awayTeamRow?.id ?? null),
  ]);
  const groupTable = groupResult.error
    ? []
    : (groupResult.data as LiveGroupProjectionRow[]).map((standing) => ({
        fifaCode: standing.fifa_code,
        flagAssetUrl: flagAssetFor(standing.fifa_code, standing.flag_asset_url),
        flagEmoji: flagFor(standing.fifa_code, standing.flag_emoji),
        goalDifference: standing.goal_difference,
        name: standing.name,
        played: standing.played,
        points: standing.points,
        rank: standing.projected_rank,
        slug: standing.slug,
      }));

  type MatchEventRow = {
    event_type: string;
    minute: number | null;
    stoppage_minute: number | null;
    title: string;
    team_id: string | null;
    importance: number;
  };
  const events: MatchEvent[] = eventsResult.error
    ? []
    : (eventsResult.data as MatchEventRow[]).map((row) => ({
        eventType: row.event_type,
        minute: row.minute,
        stoppageMinute: row.stoppage_minute,
        title: row.title,
        teamId: row.team_id,
        importance: row.importance,
      }));

  type PredictionPlayerRow = { prediction_type: string; label: string; probability: number };
  const predRows = (predictionsResult.data ?? []) as PredictionPlayerRow[];
  const matchPredictions: MatchPredictions = {
    matchWinner: predRows.find((r) => r.prediction_type === "match_winner")?.label ?? null,
    goalScorers: predRows
      .filter((r) => r.prediction_type === "player_goal")
      .slice(0, 5)
      .map((r) => ({ label: r.label })),
    cardWatch: predRows
      .filter((r) => r.prediction_type === "player_card")
      .slice(0, 5)
      .map((r) => ({ label: r.label })),
  };

  return {
    awayTeam,
    awayTeamId: awayTeamRow?.id ?? null,
    events,
    fixtureId: fixture.id,
    groupTable,
    homeTeam,
    homeTeamId: homeTeamRow?.id ?? null,
    match: mapFixture(fixture, teamFlags),
    predictions: matchPredictions,
    voteTally,
  };
}

async function getMatchCenterTeam(
  supabase: NonNullable<ReturnType<typeof getSupabaseReadClient>>,
  team: MatchCenterTeamRow,
): Promise<MatchCenterTeam> {
  const [playersResult, historyResult] = await Promise.all([
    supabase
      .from("players")
      .select("name, known_as, position, roster_role, shirt_number, club, status, teams!inner(slug)")
      .eq("teams.slug", team.slug)
      .order("shirt_number", { ascending: true }),
    supabase
      .from("team_history_matches")
      .select(
        "match_date, competition, city, country, home_team_name, away_team_name, home_score, away_score, team_history_goals(team_name, scorer, minute, own_goal, penalty)",
      )
      .or(`home_team_id.eq.${team.id},away_team_id.eq.${team.id}`)
      .order("match_date", { ascending: false })
      .limit(4),
  ]);

  return {
    flagAssetUrl: flagAssetFor(team.fifa_code, team.flag_asset_url),
    flagEmoji: flagFor(team.fifa_code, team.flag_emoji),
    group: team.group_code ? `Group ${team.group_code}` : "Group TBD",
    history: historyResult.error
      ? []
      : (historyResult.data as unknown as HistoryMatchRow[]).map((row) =>
          mapHistoryMatch(row, team.name),
        ),
    name: team.name,
    slug: team.slug,
    squad: playersResult.error
      ? []
      : (playersResult.data as unknown as PlayerRow[]).map(mapPlayer),
  };
}

export async function getUpdatesFeed() {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return { updates: [] };
  }

  const result = await supabase
    .from("updates")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(50);

  if (result.error) {
    return { updates: [] };
  }

  return { updates: (result.data as UpdateRow[]).map(mapUpdate) };
}

export async function getPredictionHub() {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return { predictions: [] };
  }

  const result = await supabase
    .from("predictions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (result.error) {
    return { predictions: [] };
  }

  return { predictions: (result.data as PredictionRow[]).map(mapPrediction) };
}

export async function getPredictionsHub() {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return { goldenBoot: [] as GoldenBootEntry[], upcomingMatches: [] as UpcomingMatchPrediction[], tournamentPredictions: [] as ReturnType<typeof mapPrediction>[] };
  }

  const now = new Date();
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [goldenBootResult, upcomingFixturesResult, teamFlags, editorialResult] = await Promise.all([
    supabase
      .from("match_events")
      .select("title, event_type")
      .in("event_type", ["goal", "penalty_goal"]),
    supabase
      .from("fixture_cards_view")
      .select("*")
      .eq("status", "scheduled")
      .gte("starts_at", now.toISOString())
      .lte("starts_at", weekAhead.toISOString())
      .order("starts_at", { ascending: true })
      .limit(6),
    getFixtureTeamFlags(),
    supabase
      .from("predictions")
      .select("prediction_type, label, movement_label, movement_value")
      .is("fixture_id", null)
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  // Golden boot: aggregate goal events by player name
  type GoalEventRow = { title: string; event_type: string };
  const goalCounts: Record<string, number> = {};
  for (const ev of (goldenBootResult.data ?? []) as GoalEventRow[]) {
    if (ev.title) goalCounts[ev.title] = (goalCounts[ev.title] ?? 0) + 1;
  }
  const goldenBoot: GoldenBootEntry[] = Object.entries(goalCounts)
    .map(([name, goals]) => ({ name, goals }))
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 10);

  // Upcoming match predictions
  const upcomingFixtureRows = (upcomingFixturesResult.data ?? []) as FixtureCardRow[];
  const fixtureIds = upcomingFixtureRows.map((r) => r.id);

  type FixturePredRow = { fixture_id: string; prediction_type: string; label: string; probability: number };
  const upcomingMatches: UpcomingMatchPrediction[] = [];

  if (fixtureIds.length > 0) {
    const fixturePredsResult = await supabase
      .from("predictions")
      .select("fixture_id, prediction_type, label, probability")
      .in("fixture_id", fixtureIds)
      .in("prediction_type", ["player_goal", "player_card", "match_winner"])
      .order("probability", { ascending: false });

    const predsByFixture = new Map<string, FixturePredRow[]>();
    for (const p of (fixturePredsResult.data ?? []) as FixturePredRow[]) {
      const arr = predsByFixture.get(p.fixture_id) ?? [];
      arr.push(p);
      predsByFixture.set(p.fixture_id, arr);
    }

    for (const row of upcomingFixtureRows) {
      const preds = predsByFixture.get(row.id) ?? [];
      const homeFlag = row.home_team_slug ? teamFlags.get(row.home_team_slug) : undefined;
      const awayFlag = row.away_team_slug ? teamFlags.get(row.away_team_slug) : undefined;
      upcomingMatches.push({
        fixtureId: row.id,
        matchNumber: row.match_number,
        startsAt: row.starts_at,
        date: formatMatchDate(row.starts_at),
        time: formatKickoff(row.starts_at),
        home: row.home_team ?? "TBD",
        homeFlagEmoji: homeFlag?.emoji ?? "🏳",
        homeFlagAssetUrl: homeFlag?.assetUrl ?? null,
        away: row.away_team ?? "TBD",
        awayFlagEmoji: awayFlag?.emoji ?? "🏳",
        awayFlagAssetUrl: awayFlag?.assetUrl ?? null,
        matchWinner: preds.find((p) => p.prediction_type === "match_winner")?.label ?? null,
        goalScorers: preds.filter((p) => p.prediction_type === "player_goal").slice(0, 3).map((p) => p.label),
        cardWatch: preds.filter((p) => p.prediction_type === "player_card").slice(0, 3).map((p) => p.label),
      });
    }
  }

  const tournamentPredictions = (editorialResult.data ?? []).map((r) =>
    mapPrediction(r as PredictionRow),
  );

  return { goldenBoot, upcomingMatches, tournamentPredictions };
}

export async function getGroupsBoard() {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    const grouped = teams.reduce<Record<string, typeof teams>>((acc, team) => {
      const groupCode = team.group.replace("Group ", "");
      acc[groupCode] ??= [];
      acc[groupCode].push(team);
      return acc;
    }, {});

    return {
      groups: Object.entries(grouped).map(([groupCode, groupTeams]) => ({
        groupCode,
        teams: groupTeams.map((team, index) => ({
          slug: team.slug,
          name: team.name,
          fifaCode: team.name.slice(0, 3).toUpperCase(),
          flagEmoji: "🏳",
          flagAssetUrl: null,
          played: 0,
          goalDifference: 0,
          points: 0,
          rank: index + 1,
          qualificationStatus: "not_started",
        })),
      })),
    };
  }

  const liveProjectionResult = await supabase
    .from("live_group_projection_view")
    .select("*")
    .order("group_code", { ascending: true })
    .order("projected_rank", { ascending: true });

  if (!liveProjectionResult.error && liveProjectionResult.data?.length) {
    const groups = new Map<
      string,
      Array<{
        slug: string;
        name: string;
        fifaCode: string;
        flagEmoji: string;
        flagAssetUrl: string | null;
        played: number;
        goalDifference: number;
        points: number;
        rank: number | null;
        qualificationStatus: string;
      }>
    >();

    for (const row of liveProjectionResult.data as LiveGroupProjectionRow[]) {
      groups.set(row.group_code, [
        ...(groups.get(row.group_code) ?? []),
        {
          slug: row.slug,
          name: row.name,
          fifaCode: row.fifa_code,
          flagEmoji: flagFor(row.fifa_code, row.flag_emoji),
          flagAssetUrl: flagAssetFor(row.fifa_code, row.flag_asset_url),
          played: row.played,
          goalDifference: row.goal_difference,
          points: row.points,
          rank: row.projected_rank,
          qualificationStatus:
            row.played === 0
              ? "not_started"
              : row.projected_rank <= 2
                ? "advancing"
                : row.projected_rank === 3
                  ? "third_place_watch"
                  : "in_danger",
        },
      ]);
    }

    return {
      groups: Array.from(groups.entries()).map(([groupCode, groupTeams]) => ({
        groupCode,
        teams: groupTeams,
      })),
    };
  }

  const [teamsResult, standingsResult] = await Promise.all([
    supabase
      .from("teams")
      .select("id, slug, name, fifa_code, group_code, confederation, status")
      .order("group_code", { ascending: true })
      .order("name", { ascending: true }),
    supabase.from("standings").select("*"),
  ]);

  if (teamsResult.error || standingsResult.error) {
    return { groups: [] };
  }

  const standingsByTeam = new Map(
    (standingsResult.data as StandingRow[]).map((standing) => [
      standing.team_id,
      standing,
    ]),
  );

  const groups = new Map<
    string,
    Array<{
      slug: string;
      name: string;
      fifaCode: string;
      flagEmoji: string;
      flagAssetUrl: string | null;
      confederation: string;
      played: number;
      goalDifference: number;
      points: number;
      rank: number | null;
      qualificationStatus: string;
    }>
  >();

  for (const team of teamsResult.data as TeamRow[]) {
    const groupCode = team.group_code ?? "TBD";
    const standing = standingsByTeam.get(team.id);
    groups.set(groupCode, [
      ...(groups.get(groupCode) ?? []),
      {
        slug: team.slug,
        name: team.name,
        fifaCode: team.fifa_code,
        flagEmoji: flagFor(team.fifa_code, team.flag_emoji),
        flagAssetUrl: flagAssetFor(team.fifa_code),
        confederation: team.confederation,
        played: standing?.played ?? 0,
        goalDifference: standing?.goal_difference ?? 0,
        points: standing?.points ?? 0,
        rank: standing?.rank ?? null,
        qualificationStatus: standing?.qualification_status ?? "not_started",
      },
    ]);
  }

  return {
    groups: Array.from(groups.entries()).map(([groupCode, groupTeams]) => ({
      groupCode,
      teams: groupTeams.sort((a, b) => {
        const rankA = a.rank ?? 99;
        const rankB = b.rank ?? 99;
        return (
          rankA - rankB ||
          b.points - a.points ||
          b.goalDifference - a.goalDifference ||
          a.name.localeCompare(b.name)
        );
      }),
    })),
  };
}
