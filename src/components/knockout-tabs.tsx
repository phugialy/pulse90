"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";

export type SeedTeam = {
  fifaCode: string;
  flagAssetUrl: string | null;
  flagEmoji: string;
  name: string;
  played: number;
  points: number;
  slug: string;
};

export type Seed = {
  label: string;
  team: SeedTeam | null;
  isThirdPlaceSlot: boolean;
};

export type RoundOf32Slot = {
  matchNumber: number;
  home: Seed;
  away: Seed;
};

type ChainMatch = {
  matchNumber: number;
  stage: "Best of 16" | "Best of 8" | "Semi-final" | "Third place" | "Final";
  home: string;
  away: string;
};

const top16Matches: ChainMatch[] = [
  { matchNumber: 89, stage: "Best of 16", home: "Winner 74", away: "Winner 77" },
  { matchNumber: 90, stage: "Best of 16", home: "Winner 73", away: "Winner 75" },
  { matchNumber: 91, stage: "Best of 16", home: "Winner 76", away: "Winner 78" },
  { matchNumber: 92, stage: "Best of 16", home: "Winner 79", away: "Winner 80" },
  { matchNumber: 93, stage: "Best of 16", home: "Winner 83", away: "Winner 84" },
  { matchNumber: 94, stage: "Best of 16", home: "Winner 81", away: "Winner 82" },
  { matchNumber: 95, stage: "Best of 16", home: "Winner 86", away: "Winner 88" },
  { matchNumber: 96, stage: "Best of 16", home: "Winner 85", away: "Winner 87" },
  { matchNumber: 97, stage: "Best of 8", home: "Winner 89", away: "Winner 90" },
  { matchNumber: 98, stage: "Best of 8", home: "Winner 93", away: "Winner 94" },
  { matchNumber: 99, stage: "Best of 8", home: "Winner 91", away: "Winner 92" },
  { matchNumber: 100, stage: "Best of 8", home: "Winner 95", away: "Winner 96" },
  { matchNumber: 101, stage: "Semi-final", home: "Winner 97", away: "Winner 98" },
  { matchNumber: 102, stage: "Semi-final", home: "Winner 99", away: "Winner 100" },
  { matchNumber: 103, stage: "Third place", home: "Runner-up 101", away: "Runner-up 102" },
  { matchNumber: 104, stage: "Final", home: "Winner 101", away: "Winner 102" },
];

const top16ByMatch = new Map<number, ChainMatch>(
  top16Matches.map((match) => [match.matchNumber, match]),
);

export function KnockoutTabs({ roundOf32Slots }: { roundOf32Slots: RoundOf32Slot[] }) {
  const [activeTab, setActiveTab] = useState<"round32" | "top16">("round32");

  return (
    <div className="relative min-h-[620px] overflow-hidden rounded-[24px] border border-white/18 bg-[#061f4a] p-4">
      <div className="mb-4 inline-flex rounded-full border border-white/14 bg-white/8 p-1">
        {[
          ["round32", "Round 32"],
          ["top16", "Top 16"],
        ].map(([value, label]) => (
          <button
            className={`h-9 rounded-full px-4 text-sm font-black transition ${
              activeTab === value
                ? "bg-[#f7d149] text-[#071426]"
                : "text-white/64 hover:bg-white/10 hover:text-white"
            }`}
            key={value}
            onClick={() => setActiveTab(value as "round32" | "top16")}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "round32" ? (
        <Round32Board roundOf32Slots={roundOf32Slots} />
      ) : (
        <Top16Bracket />
      )}
    </div>
  );
}

function Round32Board({ roundOf32Slots }: { roundOf32Slots: RoundOf32Slot[] }) {
  const columns = [
    roundOf32Slots.slice(0, 4),
    roundOf32Slots.slice(4, 8),
    roundOf32Slots.slice(8, 12),
    roundOf32Slots.slice(12, 16),
  ];

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[760px] gap-3 xl:grid-cols-4">
        {columns.map((column, columnIndex) => (
          <div className="grid gap-3" key={columnIndex}>
            <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/48">
              Path {columnIndex + 1}
            </p>
            {column.map((matchup, index) => (
              <BracketMatch
                index={columnIndex * 4 + index}
                matchup={matchup}
                key={matchup.matchNumber}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketMatch({
  index,
  matchup,
}: {
  index: number;
  matchup: RoundOf32Slot;
}) {
  return (
    <article className="rounded-2xl border border-white/12 bg-white/7 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f7d149]">
          Best of 32
        </p>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/58">
          Slot {index + 1}
        </span>
      </div>
      <div className="grid gap-2">
        <SeedSlot seed={matchup.home} />
        <SeedSlot seed={matchup.away} />
      </div>
    </article>
  );
}

function ChainMatchCard({ matchup }: { matchup: ChainMatch }) {
  return (
    <article
      className={`rounded-2xl border p-3 ${
        matchup.stage === "Final"
          ? "border-[#f7d149] bg-[#f7d149]/18"
          : "border-white/12 bg-white/7"
      }`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#f7d149]">
          {matchup.stage}
        </p>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-black text-white/68">
          Slot {matchup.matchNumber - 88}
        </span>
      </div>
      <div className="grid gap-2">
        <ChainSlot label={matchup.home} />
        <ChainSlot label={matchup.away} />
      </div>
    </article>
  );
}

function Top16Bracket() {
  const getMatch = (matchNumber: number) => {
    const matchup = top16ByMatch.get(matchNumber);

    if (!matchup) {
      throw new Error(`Missing knockout match ${matchNumber}`);
    }

    return matchup;
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[900px] grid-cols-[1.05fr_1fr_1.05fr_1fr_1.05fr] gap-3">
        <BracketColumn label="Best of 16">
          {[89, 90, 93, 94].map((matchNumber) => (
            <BranchNode
              connector="right"
              key={matchNumber}
              matchup={getMatch(matchNumber)}
            />
          ))}
        </BracketColumn>

        <BracketColumn label="Best of 8" spread>
          {[97, 98].map((matchNumber) => (
            <BranchNode
              connector="both"
              key={matchNumber}
              matchup={getMatch(matchNumber)}
            />
          ))}
        </BracketColumn>

        <BracketColumn label="Final Path" spread>
          <BranchNode connector="both" matchup={getMatch(101)} />
          <ChainMatchCard matchup={getMatch(104)} />
          <ChainMatchCard matchup={getMatch(103)} />
        </BracketColumn>

        <BracketColumn label="Best of 8" spread>
          {[99, 100].map((matchNumber) => (
            <BranchNode
              connector="both"
              key={matchNumber}
              matchup={getMatch(matchNumber)}
            />
          ))}
        </BracketColumn>

        <BracketColumn label="Best of 16">
          {[91, 92, 95, 96].map((matchNumber) => (
            <BranchNode
              connector="left"
              key={matchNumber}
              matchup={getMatch(matchNumber)}
            />
          ))}
        </BracketColumn>
      </div>
    </div>
  );
}

function BracketColumn({
  children,
  label,
  spread = false,
}: {
  children: React.ReactNode;
  label: string;
  spread?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${spread ? "content-around" : ""}`}>
      <p className="text-center text-[11px] font-black uppercase tracking-[0.18em] text-white/48">
        {label}
      </p>
      {children}
    </div>
  );
}

function BranchNode({
  connector,
  matchup,
}: {
  connector: "left" | "right" | "both";
  matchup: ChainMatch;
}) {
  return (
    <div className="relative">
      {connector !== "left" ? (
        <span className="absolute right-0 top-1/2 hidden h-px w-3 translate-x-full bg-[#f7d149]/44 xl:block" />
      ) : null}
      {connector !== "right" ? (
        <span className="absolute left-0 top-1/2 hidden h-px w-3 -translate-x-full bg-[#f7d149]/44 xl:block" />
      ) : null}
      <ChainMatchCard matchup={matchup} />
    </div>
  );
}

function ChainSlot({ label }: { label: string }) {
  return (
    <div
      aria-label={label}
      className="flex min-h-9 items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-black text-white/68"
      title={label}
    >
      <span className="h-2 w-20 rounded-full bg-white/12" />
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white/24" />
    </div>
  );
}

function SeedSlot({ seed }: { seed: Seed }) {
  if (!seed.team) {
    return (
      <div className="flex min-h-9 items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-black text-white/62">
        <span>{seed.label}</span>
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            seed.isThirdPlaceSlot ? "bg-[#24b26b]" : "bg-white/24"
          }`}
        />
      </div>
    );
  }

  return (
    <Link
      className="flex h-10 items-center justify-between gap-2 rounded-lg border border-[#f7d149] bg-[#f7d149] px-2.5 text-xs font-black text-[#10131a] shadow-[0_0_18px_rgba(247,209,73,0.28)]"
      href={`/teams/${seed.team.slug}`}
    >
      <span className="flex min-w-0 items-center gap-1.5">
        <FlagMark
          alt={`${seed.team.name} flag`}
          fallback={seed.team.flagEmoji}
          src={seed.team.flagAssetUrl}
          tone="dark"
        />
        <span className="truncate">{seed.team.fifaCode}</span>
      </span>
      <span className="tabular-nums">{seed.team.points} pts</span>
    </Link>
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
