"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupTeam = {
  slug: string;
  name: string;
  fifaCode: string;
  flagEmoji: string;
  flagAssetUrl: string | null;
  played: number;
  goalDifference: number;
  points: number;
  rank: number | null;
};

type Group = {
  groupCode: string;
  teams: GroupTeam[];
};

export type KnockoutSeed = {
  label: string;
  team: {
    slug: string;
    name: string;
    fifaCode: string;
    flagEmoji: string;
    flagAssetUrl: string | null;
    played: number;
    points: number;
  } | null;
  isThirdPlaceSlot: boolean;
};

export type R32Slot = {
  matchNumber: number;
  home: KnockoutSeed;
  away: KnockoutSeed;
};

const top16: { matchNumber: number; home: string; away: string }[] = [
  { matchNumber: 89, home: "Winner M74", away: "Winner M77" },
  { matchNumber: 90, home: "Winner M73", away: "Winner M75" },
  { matchNumber: 91, home: "Winner M76", away: "Winner M78" },
  { matchNumber: 92, home: "Winner M79", away: "Winner M80" },
  { matchNumber: 93, home: "Winner M83", away: "Winner M84" },
  { matchNumber: 94, home: "Winner M81", away: "Winner M82" },
  { matchNumber: 95, home: "Winner M86", away: "Winner M88" },
  { matchNumber: 96, home: "Winner M85", away: "Winner M87" },
];

const TABS = ["Groups", "Round of 32", "Top 16"] as const;
type Tab = (typeof TABS)[number];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function FlagMark({ alt, fallback, src }: { alt: string; fallback: string; src: string | null }) {
  if (!src) return <span className="text-base leading-none">{fallback}</span>;
  return (
    <img
      alt={alt}
      className="h-4 w-6 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-[#10131a]/10"
      loading="lazy"
      src={src}
    />
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="inline-flex w-full overflow-hidden rounded-[20px] border border-[#10131a]/10 bg-[#f8faf4] p-1 shadow-sm sm:w-auto">
      {TABS.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`flex-1 rounded-[14px] px-5 py-2.5 text-sm font-black transition sm:flex-none ${
            active === t
              ? "bg-[#10131a] text-white shadow-sm"
              : "text-[#10131a]/55 hover:bg-[#10131a]/5 hover:text-[#10131a]"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── Groups view ──────────────────────────────────────────────────────────────

function GroupsView({ groups }: { groups: Group[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {groups.map((group) => (
        <article
          className="rounded-[24px] border border-[#10131a]/10 bg-[#f8faf4]/90 p-5 shadow-sm"
          key={group.groupCode}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#10131a]">Group {group.groupCode}</h2>
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
                  <FlagMark alt={`${team.name} flag`} fallback={team.flagEmoji} src={team.flagAssetUrl} />
                  <span className="font-black text-[#10131a]">{team.name}</span>
                  <span className="ml-2 text-xs font-bold text-[#10131a]/42">{team.fifaCode}</span>
                </span>
                <span className="text-right font-bold text-[#10131a]/60">{team.played}</span>
                <span className="text-right font-bold text-[#10131a]/60">
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </span>
                <span className="text-right font-black text-cobalt">{team.points}</span>
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

// ─── Knockout match card ──────────────────────────────────────────────────────

function KnockoutSlotFilled({
  seed,
  isHome,
}: {
  seed: KnockoutSeed;
  isHome: boolean;
}) {
  if (!seed.team) {
    return (
      <div
        className={`flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 ${
          seed.isThirdPlaceSlot
            ? "border-emerald-400/30 bg-emerald-400/6"
            : "border-[#10131a]/8 bg-white/60"
        }`}
      >
        <span className="text-sm font-black text-[#10131a]/42">{seed.label}</span>
        <span className={`h-2 w-2 shrink-0 rounded-full ${seed.isThirdPlaceSlot ? "bg-emerald-400" : "bg-[#10131a]/15"}`} />
      </div>
    );
  }

  return (
    <Link
      href={`/teams/${seed.team.slug}`}
      className="flex min-h-[52px] items-center justify-between gap-3 rounded-2xl border border-[#f7d149] bg-[#f7d149] px-4 py-3 shadow-[0_0_18px_rgba(247,209,73,0.2)] transition hover:brightness-105"
    >
      <span className="flex min-w-0 items-center gap-2">
        <FlagMark alt={`${seed.team.name} flag`} fallback={seed.team.flagEmoji} src={seed.team.flagAssetUrl} />
        <span className="truncate text-sm font-black text-[#10131a]">{seed.team.name}</span>
        <span className="text-xs font-bold text-[#10131a]/55">{seed.team.fifaCode}</span>
      </span>
      <span className="shrink-0 text-sm font-black tabular-nums text-[#10131a]">
        {seed.team.points} pts
      </span>
    </Link>
  );
}

function R32MatchCard({ slot }: { slot: R32Slot }) {
  const bothKnown = slot.home.team && slot.away.team;
  return (
    <article className="flex flex-col gap-2 rounded-[22px] border border-[#10131a]/8 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10131a]/35">
          Round of 32
        </span>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
            bothKnown
              ? "bg-lime text-[#10131a]"
              : "bg-[#10131a]/5 text-[#10131a]/40"
          }`}
        >
          M{slot.matchNumber}
        </span>
      </div>
      <KnockoutSlotFilled seed={slot.home} isHome={true} />
      <div className="flex items-center gap-3 px-1">
        <div className="h-px flex-1 bg-[#10131a]/8" />
        <span className="text-[10px] font-black text-[#10131a]/28">VS</span>
        <div className="h-px flex-1 bg-[#10131a]/8" />
      </div>
      <KnockoutSlotFilled seed={slot.away} isHome={false} />
    </article>
  );
}

// ─── Round of 32 view ─────────────────────────────────────────────────────────

function Round32View({ slots }: { slots: R32Slot[] }) {
  const resolved = slots.filter((s) => s.home.team || s.away.team).length;
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#10131a]/40">
            FIFA World Cup 2026
          </p>
          <p className="mt-0.5 text-lg font-black text-[#10131a]">
            Round of 32 — 16 matches
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#10131a]/5 px-3 py-1.5 text-xs font-black text-[#10131a]/55">
          {resolved} / 16 seeds locked
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {slots.map((slot) => (
          <R32MatchCard key={slot.matchNumber} slot={slot} />
        ))}
      </div>
    </div>
  );
}

// ─── Top 16 view ──────────────────────────────────────────────────────────────

function Top16MatchCard({ match }: { match: (typeof top16)[number] }) {
  return (
    <article className="flex flex-col gap-2 rounded-[22px] border border-[#10131a]/8 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10131a]/35">
          Round of 16
        </span>
        <span className="rounded-full bg-[#10131a]/5 px-2.5 py-1 text-[10px] font-black text-[#10131a]/40">
          M{match.matchNumber}
        </span>
      </div>
      {[match.home, match.away].map((label, i) => (
        <div
          key={i}
          className="flex min-h-[52px] items-center gap-3 rounded-2xl border border-[#10131a]/8 bg-[#f8faf4]/80 px-4 py-3"
        >
          <span className="h-2 w-2 shrink-0 rounded-full bg-[#10131a]/15" />
          <span className="text-sm font-black text-[#10131a]/45">{label}</span>
        </div>
      ))}
    </article>
  );
}

function Top16View() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#10131a]/40">
            FIFA World Cup 2026
          </p>
          <p className="mt-0.5 text-lg font-black text-[#10131a]">
            Round of 16 — 8 matches
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#10131a]/5 px-3 py-1.5 text-xs font-black text-[#10131a]/55">
          Awaiting R32 results
        </span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {top16.map((match) => (
          <Top16MatchCard key={match.matchNumber} match={match} />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function StandingsTabs({ groups, roundOf32Slots }: {
  groups: Group[];
  roundOf32Slots: R32Slot[];
}) {
  const [tab, setTab] = useState<Tab>("Groups");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#10131a]/38">
            FIFA World Cup 2026
          </p>
          <h1 className="mt-0.5 text-3xl font-black tracking-tight text-[#10131a] sm:text-4xl">
            Standings
          </h1>
        </div>
        <TabBar active={tab} onChange={setTab} />
      </div>

      {/* Content */}
      {tab === "Groups" && <GroupsView groups={groups} />}
      {tab === "Round of 32" && <Round32View slots={roundOf32Slots} />}
      {tab === "Top 16" && <Top16View />}
    </div>
  );
}
