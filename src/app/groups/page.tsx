/* eslint-disable @next/next/no-img-element */
export const dynamic = "force-dynamic";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { KnockoutTabs } from "@/components/knockout-tabs";
import { PageIntro } from "@/components/ui";
import { getGroupsBoard } from "@/lib/pulse90-data";

export default async function GroupsPage() {
  const { groups } = await getGroupsBoard();

  const groupMap = new Map(groups.map((group) => [group.groupCode, group]));
  const roundOf32Slots = roundOf32Matchups.map((matchup) => ({
    ...matchup,
    home: buildSlot(matchup.home, groupMap),
    away: buildSlot(matchup.away, groupMap),
  }));

  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <nav className="rounded-[24px] border border-[#10131a]/10 bg-[#f8faf4]/90 p-3 shadow-sm">
            {[
              ["Tables", "#tables"],
              ["Final Tree", "#final-tree"],
            ].map(([label, href], index) => (
              <a
                className={`block rounded-2xl px-4 py-3 text-sm font-black transition ${
                  index === 0
                    ? "bg-[#10131a] text-white"
                    : "text-[#10131a]/62 hover:bg-stadium hover:text-[#10131a]"
                }`}
                href={href}
                key={label}
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        <div className="min-w-0">
          <section id="tables">
            <PageIntro
              kicker="Groups and knockout path"
              title="The whole tournament board without the headache."
              detail="Group tables first, then the knockout tree. Before kickoff, every table starts even; once results arrive, this becomes the fastest way to read the tournament path."
            />
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map((group) => (
              <article
                className="rounded-[24px] border border-[#10131a]/10 bg-[#f8faf4]/90 p-5 shadow-sm"
                key={group.groupCode}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-[#10131a]">
                    Group {group.groupCode}
                  </h2>
                  <span className="rounded-full bg-lime px-3 py-1 text-xs font-black text-[#10131a]">
                    4 teams
                  </span>
                </div>

                <div className="mt-5 overflow-hidden rounded-2xl border border-[#10131a]/10">
                  <div className="grid grid-cols-[1fr_42px_42px_42px] bg-[#10131a]/5 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-[#10131a]/50">
                    <span>Team</span>
                    <span className="text-right">P</span>
                    <span className="text-right">GD</span>
                    <span className="text-right">Pts</span>
                  </div>
                  {group.teams.map((team) => (
                    <Link
                      className="grid grid-cols-[1fr_42px_42px_42px] items-center border-t border-[#10131a]/10 px-3 py-3 text-sm transition hover:bg-stadium"
                      href={`/teams/${team.slug}`}
                      key={team.slug}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <FlagMark
                          alt={`${team.name} flag`}
                          fallback={team.flagEmoji}
                          src={team.flagAssetUrl}
                        />
                        <span className="font-black text-[#10131a]">{team.name}</span>
                        <span className="ml-2 text-xs font-bold text-[#10131a]/42">
                          {team.fifaCode}
                        </span>
                      </span>
                      <span className="text-right font-bold text-[#10131a]/60">
                        {team.played}
                      </span>
                      <span className="text-right font-bold text-[#10131a]/60">
                        {team.goalDifference > 0
                          ? `+${team.goalDifference}`
                          : team.goalDifference}
                      </span>
                      <span className="text-right font-black text-cobalt">
                        {team.points}
                      </span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </section>

          <section
            id="final-tree"
            className="mt-6 rounded-[28px] border border-[#10131a]/10 bg-[#082f6f] p-5 text-white shadow-[0_22px_70px_rgba(8,47,111,0.22)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f7d149]">
                  Final fixtures tree
                </p>
                <h2 className="mt-2 text-3xl font-black">
                  Official knockout route, data only.
                </h2>
              </div>
              <span className="rounded-full border border-[#f7d149]/50 px-3 py-1 text-xs font-black text-[#f7d149]">
                FIFA slot map
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {groups.map((group) => (
                <GroupMini group={group} key={group.groupCode} />
              ))}
            </div>
            <div className="mt-5">
              <KnockoutTabs roundOf32Slots={roundOf32Slots} />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

const roundOf32Matchups = [
  { matchNumber: 73, home: "A2", away: "B2" },
  { matchNumber: 74, home: "E1", away: "3rd A/B/C/D/F" },
  { matchNumber: 75, home: "F1", away: "C2" },
  { matchNumber: 76, home: "C1", away: "F2" },
  { matchNumber: 77, home: "I1", away: "3rd C/D/F/G/H" },
  { matchNumber: 78, home: "E2", away: "I2" },
  { matchNumber: 79, home: "A1", away: "3rd C/E/F/H/I" },
  { matchNumber: 80, home: "L1", away: "3rd E/H/I/J/K" },
  { matchNumber: 81, home: "D1", away: "3rd B/E/F/I/J" },
  { matchNumber: 82, home: "G1", away: "3rd A/E/H/I/J" },
  { matchNumber: 83, home: "K2", away: "L2" },
  { matchNumber: 84, home: "H1", away: "J2" },
  { matchNumber: 85, home: "B1", away: "3rd E/F/G/I/J" },
  { matchNumber: 86, home: "J1", away: "H2" },
  { matchNumber: 87, home: "K1", away: "3rd D/E/I/J/L" },
  { matchNumber: 88, home: "D2", away: "G2" },
];

type GroupBoard = {
  groupCode: string;
  teams: Array<SeedTeam>;
};

type SeedTeam = {
  fifaCode: string;
  flagAssetUrl: string | null;
  flagEmoji: string;
  goalDifference: number;
  name: string;
  played: number;
  points: number;
  rank: number | null;
  slug: string;
};

function buildSlot(slotLabel: string, groups: Map<string, GroupBoard>) {
  const seededSlot = slotLabel.match(/^([A-L])([12])$/);

  if (!seededSlot) {
    return {
      label: slotLabel,
      team: null,
      isThirdPlaceSlot: true,
    };
  }

  const [, groupCode, rankText] = seededSlot;
  const rank = Number(rankText);
  const team = groups
    .get(groupCode)
    ?.teams.find((candidate) => candidate.rank === rank);

  return {
    label: slotLabel,
    team: team && team.played > 0 ? team : null,
    isThirdPlaceSlot: false,
  };
}

function GroupMini({
  group,
}: {
  group: {
    groupCode: string;
    teams: Array<{
      fifaCode: string;
      flagAssetUrl: string | null;
      flagEmoji: string;
      name: string;
      slug: string;
    }>;
  };
}) {
  return (
    <div className="rounded-2xl border border-[#f7d149]/50 bg-[#0b3f88] p-3">
      <p className="text-sm font-black uppercase tracking-[0.12em] text-white">
        Group {group.groupCode}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {group.teams.map((team) => (
          <Link
            className="inline-flex items-center justify-center gap-1 rounded-full bg-white/10 px-2 py-1 text-center text-xs font-black text-white transition hover:bg-[#f7d149] hover:text-[#071426]"
            href={`/teams/${team.slug}`}
            key={team.fifaCode}
            title={team.name}
          >
            <FlagMark
              alt={`${team.name} flag`}
              fallback={team.flagEmoji}
              src={team.flagAssetUrl}
              tone="dark"
            />
            {team.fifaCode}
          </Link>
        ))}
      </div>
    </div>
  );
}

function FlagMark({
  alt,
  fallback,
  src,
  tone = "light",
}: {
  alt: string;
  fallback: string;
  src: string | null;
  tone?: "light" | "dark";
}) {
  if (!src) {
    return <span className="text-base leading-none">{fallback}</span>;
  }

  return (
    <img
      alt={alt}
      className={`h-4 w-6 shrink-0 rounded-[3px] object-cover shadow-sm ${
        tone === "dark" ? "ring-1 ring-white/20" : "ring-1 ring-[#10131a]/10"
      }`}
      loading="lazy"
      src={src}
    />
  );
}
