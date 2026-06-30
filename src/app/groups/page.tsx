export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { StandingsTabs, type R32Slot, type KnockoutFixtureSlot, type KnockoutSeed } from "@/components/standings-tabs";
import { getGroupsBoard, getKnockoutFixtures } from "@/lib/pulse90-data";

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

type KnockoutFixtureTeam = {
  slug: string;
  name: string;
  fifaCode: string;
  flagEmoji: string;
  flagAssetUrl: string | null;
} | null;

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

function buildFixtureSeed(
  slotLabel: string,
  fixtureTeam: KnockoutFixtureTeam,
  groups: Map<string, GroupBoard>,
): KnockoutSeed {
  if (fixtureTeam) {
    return {
      label: slotLabel,
      team: {
        slug: fixtureTeam.slug,
        name: fixtureTeam.name,
        fifaCode: fixtureTeam.fifaCode,
        flagEmoji: fixtureTeam.flagEmoji,
        flagAssetUrl: fixtureTeam.flagAssetUrl,
        played: 3,
        points: 0,
        qualificationStatus: "advancing",
      },
      isThirdPlaceSlot: slotLabel.includes("3rd"),
    };
  }

  return buildSeed(slotLabel, groups);
}

export default async function GroupsPage() {
  const [{ groups }, knockoutFixtures] = await Promise.all([
    getGroupsBoard(),
    getKnockoutFixtures(),
  ]);

  const groupMap = new Map(groups.map((g) => [g.groupCode, g]));
  const roundOf32Slots: R32Slot[] = roundOf32Matchups.map((m) => {
    const fixture = knockoutFixtures.get(m.matchNumber);
    return {
      matchNumber: m.matchNumber,
      home: buildFixtureSeed(m.home, fixture?.home ?? null, groupMap),
      away: buildFixtureSeed(m.away, fixture?.away ?? null, groupMap),
      startsAt: fixture?.startsAt,
      venue: fixture?.venue,
      hostCity: fixture?.hostCity,
      status: fixture?.status,
      homeScore: fixture?.homeScore,
      awayScore: fixture?.awayScore,
      homePenalties: fixture?.homePenalties,
      awayPenalties: fixture?.awayPenalties,
    };
  });
  const knockoutSlots: KnockoutFixtureSlot[] = Array.from(knockoutFixtures.values())
    .filter((fixture) => fixture.matchNumber >= 89)
    .map((fixture) => ({
      matchNumber: fixture.matchNumber,
      stage: fixture.stage,
      startsAt: fixture.startsAt,
      venue: fixture.venue,
      hostCity: fixture.hostCity,
      status: fixture.status,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      homePenalties: fixture.homePenalties,
      awayPenalties: fixture.awayPenalties,
      home: fixture.home,
      away: fixture.away,
      homePlaceholder: fixture.homePlaceholder,
      awayPlaceholder: fixture.awayPlaceholder,
    }));

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <StandingsTabs groups={groups} knockoutSlots={knockoutSlots} roundOf32Slots={roundOf32Slots} />
      </div>
    </AppShell>
  );
}
