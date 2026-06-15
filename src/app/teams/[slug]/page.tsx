import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TeamWatchTabs } from "@/components/team-watch-tabs";
import { PageIntro } from "@/components/ui";
import { getTeamPath } from "@/lib/pulse90-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { team } = await getTeamPath(slug);
  if (!team) return {};
  const title = `${team.name} · ${team.group}`;
  const description = team.need ?? `Follow ${team.name}'s path through World Cup 2026 — fixtures, results, and group standing.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
    alternates: { canonical: `/teams/${slug}` },
  };
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { team, matches, history } = await getTeamPath(slug);
  const nextMatch = matches.find((m) => m.status === "scheduled");

  if (!team) {
    notFound();
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <section className="min-w-0 space-y-5">
          <PageIntro
            kicker={`${team.group} / ${team.status}`}
            title={`${team.name} path`}
            detail={team.need}
          />
          <section className="rounded-[28px] border border-[#10131a]/10 bg-white shadow-sm p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-cobalt">
              Immediate context
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#10131a]">{team.next}</h2>
            <p className="mt-4 text-base leading-7 text-[#10131a]/62">
              {team.identity}
            </p>
          </section>
          <TeamWatchTabs history={history} matches={matches} story={team.history} />
        </section>
        <aside className="min-w-0 space-y-5">
          {nextMatch && (
            <section className="rounded-[24px] border border-cobalt/20 bg-cobalt/5 p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-cobalt" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cobalt">
                  Match prediction
                </p>
              </div>
              <p className="mt-3 font-black text-[#10131a]">
                {nextMatch.home} vs {nextMatch.away}
              </p>
              <p className="mt-1 text-xs font-bold text-[#10131a]/55">
                {nextMatch.date} · {nextMatch.time}
              </p>
              <p className="mt-3 text-sm leading-5 text-[#10131a]/62">
                Goal scorers and card watch picks available for this fixture.
              </p>
              <Link
                className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-cobalt px-4 py-2 text-xs font-black text-white transition hover:bg-cobalt/80"
                href={`/matches/${nextMatch.matchNumber}`}
              >
                View predictions
                <ArrowUpRight className="size-3.5" />
              </Link>
            </section>
          )}
          <section className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
              People
            </h2>
            <p className="mt-4 text-sm text-[#10131a]/55">Coach</p>
            <p className="font-black text-[#10131a]">{team.coach}</p>
            <p className="mt-4 text-sm text-[#10131a]/55">Captain</p>
            <p className="font-black text-[#10131a]">{team.captain}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {team.keyPlayers.map((player) => (
                <span
                  className="rounded-full bg-[#10131a]/5 px-3 py-1 text-sm font-bold text-[#10131a]/75"
                  key={player}
                >
                  {player}
                </span>
              ))}
            </div>
          </section>
          <section className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
                Squad
              </h2>
              <span className="rounded-full bg-[#10131a]/5 px-3 py-1 text-xs font-black text-cobalt">
                {team.squad.length} players
              </span>
            </div>
            <div className="mt-4 max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {team.squad.length ? (
                team.squad.map((player) => (
                  <article
                    className="grid grid-cols-[34px_42px_1fr] items-center gap-3 rounded-2xl bg-stadium p-3 text-sm"
                    key={`${player.shirtNumber}-${player.name}`}
                  >
                    <span className="font-mono text-xs font-black text-cobalt">
                      {player.shirtNumber ?? "--"}
                    </span>
                    <span className="rounded-full bg-white px-2 py-1 text-center text-[11px] font-black text-[#10131a]/62">
                      {player.positionCode}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-black text-[#10131a]">
                        {player.name}
                      </span>
                      <span className="block truncate text-xs font-bold text-[#10131a]/52">
                        {player.club}
                      </span>
                    </span>
                  </article>
                ))
              ) : (
                <p className="rounded-2xl bg-stadium p-4 text-sm font-bold leading-6 text-[#10131a]/58">
                  Squad import has not been loaded for this team yet.
                </p>
              )}
            </div>
          </section>
        </aside>
        <div className="lg:col-span-2">
          <TeamShape squad={team.squad} teamSlug={team.slug} />
        </div>
      </div>
    </AppShell>
  );
}

type TeamPathData = Awaited<ReturnType<typeof getTeamPath>>;
type SquadPlayer = NonNullable<TeamPathData["team"]>["squad"][number];

function TeamShape({
  squad,
  teamSlug,
}: {
  squad: SquadPlayer[];
  teamSlug: string;
}) {
  const groups = groupSquad(squad);
  const formation = formationForTeam(teamSlug);
  const usedByRole = { DF: 0, FW: 0, GK: 0, MF: 0 };
  const mainXi = formation.slots
    .map((slot) => {
      const player = groups[slot.role][usedByRole[slot.role]];
      usedByRole[slot.role] += 1;

      return player ? { ...slot, player } : null;
    })
    .filter((slot): slot is FormationSlot & { player: SquadPlayer } => slot !== null);
  const mainIds = new Set(mainXi.map((slot) => playerKey(slot.player)));
  const bench = squad.filter((player) => !mainIds.has(playerKey(player)));

  return (
    <section className="rounded-[28px] border border-[#10131a]/10 bg-[#061f4a] p-5 text-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f7d149]">
            Team shape
          </p>
          <h2 className="mt-2 text-3xl font-black">
            {formation.name} predicted formation
          </h2>
        </div>
        <span className="rounded-full border border-white/14 bg-white/8 px-3 py-1 text-xs font-black text-white/68">
          Predicted XI
        </span>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_320px]">
        <PitchMap slots={mainXi} />

        <div className="rounded-[24px] border border-white/12 bg-white/7 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#f7d149]">
              Bench reserve
            </h3>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/68">
              {bench.length}
            </span>
          </div>
          <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-1">
            {bench.map((player) => (
              <PlayerPill player={player} key={playerKey(player)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PitchMap({
  slots,
}: {
  slots: Array<FormationSlot & { player: SquadPlayer }>;
}) {
  return (
    <div
      className="overflow-x-auto rounded-[24px] border border-white/12 bg-[#0f4b2f] shadow-[inset_0_0_80px_rgba(0,0,0,0.24)]"
      data-pitch-map
    >
      <div className="relative min-h-[620px] min-w-[760px] overflow-hidden p-4">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute inset-x-[12%] bottom-0 h-[22%] rounded-t-[30px] border border-white/28 border-b-0" />
        <div className="absolute inset-x-[34%] bottom-0 h-[9%] rounded-t-xl border border-white/28 border-b-0" />
        <div className="absolute inset-x-[12%] top-0 h-[22%] rounded-b-[30px] border border-white/16 border-t-0" />
        <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/18" />
        <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/28" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/18" />

        <div className="relative h-[580px]">
          {slots.map((slot) => (
            <div
              className="absolute -translate-x-1/2 -translate-y-1/2"
              key={`${slot.role}-${slot.x}-${slot.y}-${playerKey(slot.player)}`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
            >
              <PlayerNode player={slot.player} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerNode({ player }: { player: SquadPlayer }) {
  const roleStyle = roleStyles[toFormationRole(player.positionCode)];

  return (
    <div
      className={`grid w-[96px] place-items-center rounded-full border px-2.5 py-2 text-center shadow-[0_10px_24px_rgba(0,0,0,0.22)] sm:w-[118px] sm:px-3 ${roleStyle.node}`}
      data-player-node
    >
      <span className={`grid size-7 place-items-center rounded-full font-mono text-xs font-black ${roleStyle.number}`}>
        {player.shirtNumber ?? "--"}
      </span>
      <span className="mt-1 line-clamp-2 text-xs font-black leading-tight">
        {player.name}
      </span>
      <span className={`mt-1 rounded-full px-2 py-0.5 text-[10px] font-black ${roleStyle.badge}`}>
        {player.positionCode}
      </span>
    </div>
  );
}

function PlayerPill({ player }: { player: SquadPlayer }) {
  return (
    <div className="grid grid-cols-[28px_36px_1fr] items-center gap-2 rounded-2xl bg-white/8 p-2 text-sm">
      <span className="font-mono text-xs font-black text-[#f7d149]">
        {player.shirtNumber ?? "--"}
      </span>
      <span className="rounded-full bg-white/10 px-2 py-1 text-center text-[10px] font-black text-white/62">
        {player.positionCode}
      </span>
      <span className="min-w-0 truncate font-black">{player.name}</span>
    </div>
  );
}

function groupSquad(squad: SquadPlayer[]) {
  return {
    GK: squad.filter((player) => player.positionCode === "GK"),
    DF: squad.filter((player) => player.positionCode === "DF"),
    MF: squad.filter((player) => player.positionCode === "MF"),
    FW: squad.filter((player) => player.positionCode === "FW"),
  };
}

type FormationRole = "DF" | "FW" | "GK" | "MF";

function toFormationRole(positionCode: string): FormationRole {
  return ["DF", "FW", "GK", "MF"].includes(positionCode)
    ? (positionCode as FormationRole)
    : "FW";
}

type FormationSlot = {
  role: FormationRole;
  x: number;
  y: number;
};

const roleStyles: Record<
  FormationRole,
  { badge: string; node: string; number: string }
> = {
  DF: {
    badge: "bg-emerald-950/12 text-emerald-950/62",
    node: "border-emerald-100/55 bg-emerald-300/95 text-emerald-950",
    number: "bg-emerald-950 text-emerald-100",
  },
  FW: {
    badge: "bg-red-950/12 text-red-950/62",
    node: "border-red-100/55 bg-red-300/95 text-red-950",
    number: "bg-red-950 text-red-100",
  },
  GK: {
    badge: "bg-amber-950/12 text-amber-950/62",
    node: "border-amber-100/65 bg-amber-300/95 text-amber-950",
    number: "bg-amber-950 text-amber-100",
  },
  MF: {
    badge: "bg-sky-950/12 text-sky-950/62",
    node: "border-sky-100/55 bg-sky-300/95 text-sky-950",
    number: "bg-sky-950 text-sky-100",
  },
};

const formationPresets: Record<string, { name: string; slots: FormationSlot[] }> = {
  "3-5-2": {
    name: "3-5-2",
    slots: [
      { role: "FW", x: 38, y: 15 },
      { role: "FW", x: 62, y: 15 },
      { role: "MF", x: 16, y: 34 },
      { role: "MF", x: 36, y: 38 },
      { role: "MF", x: 50, y: 31 },
      { role: "MF", x: 64, y: 38 },
      { role: "MF", x: 84, y: 34 },
      { role: "DF", x: 30, y: 62 },
      { role: "DF", x: 50, y: 68 },
      { role: "DF", x: 70, y: 62 },
      { role: "GK", x: 50, y: 90 },
    ],
  },
  "3-4-3": {
    name: "3-4-3",
    slots: [
      { role: "FW", x: 25, y: 15 },
      { role: "FW", x: 50, y: 12 },
      { role: "FW", x: 75, y: 15 },
      { role: "MF", x: 18, y: 40 },
      { role: "MF", x: 40, y: 42 },
      { role: "MF", x: 60, y: 42 },
      { role: "MF", x: 82, y: 40 },
      { role: "DF", x: 30, y: 68 },
      { role: "DF", x: 50, y: 72 },
      { role: "DF", x: 70, y: 68 },
      { role: "GK", x: 50, y: 90 },
    ],
  },
  "4-2-3-1": {
    name: "4-2-3-1",
    slots: [
      { role: "FW", x: 50, y: 13 },
      { role: "MF", x: 20, y: 30 },
      { role: "MF", x: 50, y: 27 },
      { role: "MF", x: 80, y: 30 },
      { role: "MF", x: 38, y: 48 },
      { role: "MF", x: 62, y: 48 },
      { role: "DF", x: 18, y: 68 },
      { role: "DF", x: 39, y: 72 },
      { role: "DF", x: 61, y: 72 },
      { role: "DF", x: 82, y: 68 },
      { role: "GK", x: 50, y: 90 },
    ],
  },
  "4-2-4": {
    name: "4-2-4",
    slots: [
      { role: "FW", x: 16, y: 18 },
      { role: "FW", x: 38, y: 13 },
      { role: "FW", x: 62, y: 13 },
      { role: "FW", x: 84, y: 18 },
      { role: "MF", x: 40, y: 45 },
      { role: "MF", x: 60, y: 45 },
      { role: "DF", x: 18, y: 68 },
      { role: "DF", x: 39, y: 72 },
      { role: "DF", x: 61, y: 72 },
      { role: "DF", x: 82, y: 68 },
      { role: "GK", x: 50, y: 90 },
    ],
  },
  "4-3-3": {
    name: "4-3-3",
    slots: [
      { role: "FW", x: 25, y: 15 },
      { role: "FW", x: 50, y: 12 },
      { role: "FW", x: 75, y: 15 },
      { role: "MF", x: 30, y: 40 },
      { role: "MF", x: 50, y: 34 },
      { role: "MF", x: 70, y: 40 },
      { role: "DF", x: 18, y: 68 },
      { role: "DF", x: 39, y: 72 },
      { role: "DF", x: 61, y: 72 },
      { role: "DF", x: 82, y: 68 },
      { role: "GK", x: 50, y: 90 },
    ],
  },
  "4-4-2": {
    name: "4-4-2",
    slots: [
      { role: "FW", x: 38, y: 14 },
      { role: "FW", x: 62, y: 14 },
      { role: "MF", x: 18, y: 42 },
      { role: "MF", x: 40, y: 45 },
      { role: "MF", x: 60, y: 45 },
      { role: "MF", x: 82, y: 42 },
      { role: "DF", x: 18, y: 68 },
      { role: "DF", x: 39, y: 72 },
      { role: "DF", x: 61, y: 72 },
      { role: "DF", x: 82, y: 68 },
      { role: "GK", x: 50, y: 90 },
    ],
  },
  "5-2-3": {
    name: "5-2-3",
    slots: [
      { role: "FW", x: 25, y: 15 },
      { role: "FW", x: 50, y: 12 },
      { role: "FW", x: 75, y: 15 },
      { role: "MF", x: 40, y: 44 },
      { role: "MF", x: 60, y: 44 },
      { role: "DF", x: 14, y: 68 },
      { role: "DF", x: 32, y: 72 },
      { role: "DF", x: 50, y: 74 },
      { role: "DF", x: 68, y: 72 },
      { role: "DF", x: 86, y: 68 },
      { role: "GK", x: 50, y: 90 },
    ],
  },
  "5-4-1": {
    name: "5-4-1",
    slots: [
      { role: "FW", x: 50, y: 13 },
      { role: "MF", x: 18, y: 38 },
      { role: "MF", x: 40, y: 42 },
      { role: "MF", x: 60, y: 42 },
      { role: "MF", x: 82, y: 38 },
      { role: "DF", x: 14, y: 68 },
      { role: "DF", x: 32, y: 72 },
      { role: "DF", x: 50, y: 74 },
      { role: "DF", x: 68, y: 72 },
      { role: "DF", x: 86, y: 68 },
      { role: "GK", x: 50, y: 90 },
    ],
  },
};

const researchedFormationBySlug: Record<string, keyof typeof formationPresets> = {
  algeria: "4-2-3-1",
  argentina: "4-3-3",
  australia: "5-4-1",
  austria: "4-2-3-1",
  belgium: "4-3-3",
  "bosnia-and-herzegovina": "4-4-2",
  brazil: "4-2-4",
  canada: "4-4-2",
  "cape-verde": "4-3-3",
  colombia: "4-2-3-1",
  croatia: "4-2-3-1",
  curacao: "4-3-3",
  czechia: "3-4-3",
  "dr-congo": "4-3-3",
  ecuador: "4-2-3-1",
  egypt: "4-3-3",
  england: "4-2-3-1",
  france: "4-2-3-1",
  germany: "4-2-3-1",
  ghana: "4-2-3-1",
  haiti: "4-4-2",
  iran: "4-2-3-1",
  iraq: "4-4-2",
  "ivory-coast": "4-3-3",
  japan: "3-4-3",
  jordan: "5-2-3",
  mexico: "4-3-3",
  morocco: "4-2-3-1",
  netherlands: "4-2-3-1",
  "new-zealand": "4-2-3-1",
  norway: "4-3-3",
  panama: "3-4-3",
  paraguay: "4-2-3-1",
  portugal: "4-3-3",
  qatar: "4-2-3-1",
  "saudi-arabia": "4-2-3-1",
  scotland: "4-3-3",
  senegal: "4-3-3",
  "south-africa": "4-3-3",
  "south-korea": "4-3-3",
  spain: "4-3-3",
  sweden: "4-3-3",
  switzerland: "4-2-3-1",
  tunisia: "4-3-3",
  turkiye: "4-2-3-1",
  uruguay: "4-2-3-1",
  usa: "3-4-3",
  uzbekistan: "5-2-3",
};

function formationForTeam(teamSlug: string) {
  return formationPresets[researchedFormationBySlug[teamSlug] ?? "4-3-3"];
}

function playerKey(player: SquadPlayer) {
  return `${player.shirtNumber}-${player.name}`;
}
