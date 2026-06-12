export type MatchStatus = "live" | "scheduled" | "completed";

export type Match = {
  matchNumber: number;
  status: MatchStatus;
  minute?: string;
  date?: string;
  time: string;
  home: string;
  homeFlagAssetUrl?: string | null;
  homeFlagEmoji?: string;
  homeSlug?: string | null;
  homeTeamId?: string | null;
  away: string;
  awayFlagAssetUrl?: string | null;
  awayFlagEmoji?: string;
  awaySlug?: string | null;
  awayTeamId?: string | null;
  fixtureId?: string;
  score?: string;
  place: string;
  venue: string;
  stage: string;
  group: string;
  tag: string;
  reason: string;
  stakes: string;
  implication: string;
  heat: number;
};

export const liveMatches: Match[] = [
  {
    matchNumber: 31,
    status: "live",
    minute: "78'",
    time: "Live",
    home: "Japan",
    away: "Germany",
    score: "1-1",
    place: "Dallas",
    venue: "AT&T Stadium",
    stage: "Group stage",
    group: "Group F",
    tag: "Command pick",
    reason: "Highest stakes: elimination swing",
    stakes: "Germany need a win to avoid depending on the other match.",
    implication: "If Japan win, they control the group. A draw leaves Germany scoreboard watching.",
    heat: 96,
  },
  {
    matchNumber: 32,
    status: "live",
    minute: "73'",
    time: "Live",
    home: "Tunisia",
    away: "Sweden",
    score: "2-1",
    place: "Seattle",
    venue: "Lumen Field",
    stage: "Group stage",
    group: "Group F",
    tag: "Upset watch",
    reason: "Upset in progress",
    stakes: "Tunisia are five minutes from flipping the group path.",
    implication: "A Tunisia win makes Germany's result even more dangerous.",
    heat: 88,
  },
  {
    matchNumber: 18,
    status: "live",
    minute: "66'",
    time: "Live",
    home: "Mexico",
    away: "Canada",
    score: "0-0",
    place: "Mexico City",
    venue: "Estadio Azteca",
    stage: "Group stage",
    group: "Group A",
    tag: "Pressure match",
    reason: "Host pressure",
    stakes: "Mexico qualify with a win, but a draw leaves the door open.",
    implication: "Canada can turn the final group day into chaos if they steal this.",
    heat: 74,
  },
];

export const todayMatches: Match[] = [
  ...liveMatches,
  {
    matchNumber: 36,
    status: "scheduled",
    time: "1:00 PM",
    home: "Brazil",
    away: "Morocco",
    place: "Miami",
    venue: "Hard Rock Stadium",
    stage: "Group stage",
    group: "Group C",
    tag: "Star watch",
    reason: "Group control",
    stakes: "Brazil can lock the group. Morocco need at least a draw to keep control.",
    implication: "If Morocco lose, their final match becomes a must-win.",
    heat: 82,
  },
  {
    matchNumber: 37,
    status: "scheduled",
    time: "4:00 PM",
    home: "USA",
    away: "Korea Republic",
    place: "Los Angeles",
    venue: "SoFi Stadium",
    stage: "Group stage",
    group: "Group D",
    tag: "Host pressure",
    reason: "Qualification chance",
    stakes: "USA qualify with a win and avoid a harder bracket path.",
    implication: "A draw keeps both alive but settles nothing.",
    heat: 86,
  },
  {
    matchNumber: 38,
    status: "scheduled",
    time: "7:00 PM",
    home: "Argentina",
    away: "Denmark",
    place: "Toronto",
    venue: "BMO Field",
    stage: "Group stage",
    group: "Group H",
    tag: "Match to plan around",
    reason: "Top spot pressure",
    stakes: "Denmark need a result. Argentina can lock first place.",
    implication: "A Denmark win changes the Round of 32 side of the bracket.",
    heat: 91,
  },
];

export const tomorrowMatches = [
  {
    slot: "Best drama",
    match: "Spain vs Uruguay",
    time: "2:00 PM",
    note: "Both can qualify, but the loser likely gets a brutal knockout path.",
  },
  {
    slot: "Upset watch",
    match: "Ghana vs France",
    time: "5:00 PM",
    note: "France are favored, but Ghana's counterattack makes this uncomfortable.",
  },
  {
    slot: "Star watch",
    match: "England vs Egypt",
    time: "8:00 PM",
    note: "A clean England win changes the MVP conversation around their midfield.",
  },
];

export const updates = [
  {
    label: "Qualified",
    title: "Portugal are through",
    detail: "Their late winner moved them out of the Group B danger zone.",
    impact: "Locks one Round of 32 slot",
  },
  {
    label: "Group flip",
    title: "Group E got messy",
    detail: "Three teams can still finish first after yesterday's draw.",
    impact: "Tomorrow's early window matters more",
  },
  {
    label: "Prediction",
    title: "Argentina down 7%",
    detail: "Harder bracket path after Denmark's result.",
    impact: "Winner confidence moved from 18% to 11%",
  },
  {
    label: "Elimination watch",
    title: "Germany are walking the edge",
    detail: "A draw keeps them alive, but they need help from Tunisia-Sweden.",
    impact: "Live command center priority",
  },
];

export const teams = [
  {
    slug: "japan",
    name: "Japan",
    group: "Group F",
    status: "Alive, not safe",
    next: "vs Germany, live now",
    need: "Win and they control the group. Draw means scoreboard watching.",
    identity: "Press-resistant, quick wide breaks, dangerous when the game gets stretched.",
    coach: "Hajime Moriyasu",
    captain: "Wataru Endo",
    keyPlayers: ["Kaoru Mitoma", "Takefusa Kubo", "Wataru Endo"],
    history: "Japan keep turning group-stage pressure into uncomfortable nights for bigger names.",
  },
  {
    slug: "usa",
    name: "USA",
    group: "Group D",
    status: "Can qualify today",
    next: "vs Korea Republic, 4:00 PM",
    need: "Win to advance. Draw keeps them ahead but not safe.",
    identity: "Athletic, direct, and most dangerous when the midfield wins second balls.",
    coach: "Mauricio Pochettino",
    captain: "Christian Pulisic",
    keyPlayers: ["Christian Pulisic", "Tyler Adams", "Folarin Balogun"],
    history: "The hosts are carrying the pressure of turning a favorable group into a real run.",
  },
  {
    slug: "morocco",
    name: "Morocco",
    group: "Group C",
    status: "Pressure rising",
    next: "vs Brazil, 1:00 PM",
    need: "Draw is useful. Loss turns the final group match into survival.",
    identity: "Compact, emotional, and lethal when they can attack into open space.",
    coach: "Walid Regragui",
    captain: "Achraf Hakimi",
    keyPlayers: ["Achraf Hakimi", "Sofyan Amrabat", "Youssef En-Nesyri"],
    history: "Their recent World Cup identity is built on making favorites uncomfortable.",
  },
  {
    slug: "germany",
    name: "Germany",
    group: "Group F",
    status: "In danger",
    next: "vs Japan, live now",
    need: "They need a win to stop depending on the other Group F result.",
    identity: "High control, high pressure, and vulnerable when transitions hit behind them.",
    coach: "Julian Nagelsmann",
    captain: "Joshua Kimmich",
    keyPlayers: ["Jamal Musiala", "Florian Wirtz", "Joshua Kimmich"],
    history: "Germany's World Cup standard makes every group-stage wobble feel massive.",
  },
];

export type Team = (typeof teams)[number];

export const predictions = [
  { label: "Winner", subject: "Brazil", movement: "+4%", tone: "up" },
  { label: "MVP", subject: "Jude Bellingham", movement: "+6%", tone: "up" },
  { label: "Dark horse", subject: "Japan", movement: "-3%", tone: "down" },
  { label: "Golden Boot", subject: "Kylian Mbappe", movement: "+2%", tone: "up" },
];

export type Prediction = (typeof predictions)[number];

export const standings = [
  { group: "Group F", rank: 1, team: "Japan", played: 2, points: 4, gd: 2 },
  { group: "Group F", rank: 2, team: "Tunisia", played: 2, points: 4, gd: 1 },
  { group: "Group F", rank: 3, team: "Germany", played: 2, points: 2, gd: 0 },
  { group: "Group F", rank: 4, team: "Sweden", played: 2, points: 1, gd: -3 },
];

export function getMatch(matchNumber: string) {
  return todayMatches.find((match) => String(match.matchNumber) === matchNumber);
}

export function getTeam(slug: string) {
  return teams.find((team) => team.slug === slug);
}
