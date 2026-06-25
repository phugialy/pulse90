export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { StandingsTabs, type R32Slot, type KnockoutSeed } from "@/components/standings-tabs";
import { getGroupsBoard } from "@/lib/pulse90-data";

export const metadata: Metadata = {
  title: "Standings",
  description: "Group tables, Round of 32 seeds, and Round of 16 path for FIFA World Cup 2026.",
};

const roundOf32Matchups: { matchNumber: number; home: string; away: string }[] = [
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
  teams: Array<{
    fifaCode: string;
    flagAssetUrl: string | null;
    flagEmoji: string;
    goalDifference: number;
    name: string;
    played: number;
    points: number;
    rank: number | null;
    slug: string;
    qualificationStatus: string;
  }>;
};

function buildSeed(slotLabel: string, groups: Map<string, GroupBoard>): KnockoutSeed {
  const seeded = slotLabel.match(/^([A-L])([12])$/);

  if (!seeded) {
    return { label: slotLabel, team: null, isThirdPlaceSlot: true };
  }

  const [, groupCode, rankText] = seeded;
  const rank = Number(rankText);
  const team = groups.get(groupCode)?.teams.find((t) => t.rank === rank);

  return {
    label: slotLabel,
    team: team && team.played > 0
      ? {
          slug: team.slug,
          name: team.name,
          fifaCode: team.fifaCode,
          flagEmoji: team.flagEmoji,
          flagAssetUrl: team.flagAssetUrl,
          played: team.played,
          points: team.points,
          qualificationStatus: team.qualificationStatus,
        }
      : null,
    isThirdPlaceSlot: false,
  };
}

export default async function GroupsPage() {
  const { groups } = await getGroupsBoard();

  const groupMap = new Map(groups.map((g) => [g.groupCode, g]));
  const roundOf32Slots: R32Slot[] = roundOf32Matchups.map((m) => ({
    matchNumber: m.matchNumber,
    home: buildSeed(m.home, groupMap),
    away: buildSeed(m.away, groupMap),
  }));

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <StandingsTabs groups={groups} roundOf32Slots={roundOf32Slots} />
      </div>
    </AppShell>
  );
}
