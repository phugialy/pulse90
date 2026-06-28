"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { Clock3, MapPin } from "lucide-react";

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
  qualificationStatus: string;
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
    qualificationStatus: string;
  } | null;
  isThirdPlaceSlot: boolean;
};

export type R32Slot = {
  matchNumber: number;
  home: KnockoutSeed;
  away: KnockoutSeed;
  startsAt?: string;
  venue?: string | null;
  hostCity?: string | null;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
};

const knockoutMatches: Record<number, { stage: "R16" | "QF" | "SF" | "3P" | "F"; home: string; away: string }> = {
  89:  { stage: "R16", home: "Winner M74", away: "Winner M77" },
  90:  { stage: "R16", home: "Winner M73", away: "Winner M75" },
  91:  { stage: "R16", home: "Winner M76", away: "Winner M78" },
  92:  { stage: "R16", home: "Winner M79", away: "Winner M80" },
  93:  { stage: "R16", home: "Winner M83", away: "Winner M84" },
  94:  { stage: "R16", home: "Winner M81", away: "Winner M82" },
  95:  { stage: "R16", home: "Winner M86", away: "Winner M88" },
  96:  { stage: "R16", home: "Winner M85", away: "Winner M87" },
  97:  { stage: "QF",  home: "Winner M89", away: "Winner M90" },
  98:  { stage: "QF",  home: "Winner M93", away: "Winner M94" },
  99:  { stage: "QF",  home: "Winner M91", away: "Winner M92" },
  100: { stage: "QF",  home: "Winner M95", away: "Winner M96" },
  101: { stage: "SF",  home: "Winner M97", away: "Winner M98" },
  102: { stage: "SF",  home: "Winner M99", away: "Winner M100" },
  103: { stage: "3P",  home: "Runner-up M101", away: "Runner-up M102" },
  104: { stage: "F",   home: "Winner M101", away: "Winner M102" },
};

const TABS = ["Round of 32", "Top 16", "Groups"] as const;
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

// ─── Knockout match card (shared: R32 + bracket) ─────────────────────────────

function KnockoutSlot({ seed }: { seed: KnockoutSeed }) {
  if (!seed.team) {
    return (
      <div
        className={`flex min-h-[44px] items-center justify-between gap-3 rounded-xl border px-3 py-2.5 ${
          seed.isThirdPlaceSlot
            ? "border-emerald-400/25 bg-emerald-400/8"
            : "border-white/8 bg-white/5"
        }`}
      >
        <span className={`text-xs font-black ${seed.isThirdPlaceSlot ? "text-emerald-300/70" : "text-white/38"}`}>
          {seed.label}
        </span>
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${seed.isThirdPlaceSlot ? "bg-emerald-400/50" : "bg-white/15"}`} />
      </div>
    );
  }

  const isLocked = seed.team.qualificationStatus === "advancing" && seed.team.played >= 3;
  const isLeading = seed.team.qualificationStatus === "advancing" && seed.team.played < 3;

  if (isLocked) {
    return (
      <Link
        href={`/teams/${seed.team.slug}`}
        className="flex min-h-[44px] items-center justify-between gap-2.5 rounded-xl border border-[#f7d149] bg-[#f7d149]/15 px-3 py-2.5 shadow-[0_0_14px_rgba(247,209,73,0.15)] transition hover:bg-[#f7d149]/25"
      >
        <span className="flex min-w-0 items-center gap-2">
          <FlagMark alt={`${seed.team.name} flag`} fallback={seed.team.flagEmoji} src={seed.team.flagAssetUrl} />
          <span className="truncate text-xs font-black text-[#f7d149]">{seed.team.name}</span>
        </span>
        <span className="shrink-0 rounded-full bg-[#f7d149]/20 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-[#f7d149]">
          LOCKED
        </span>
      </Link>
    );
  }

  if (isLeading) {
    return (
      <Link
        href={`/teams/${seed.team.slug}`}
        className="flex min-h-[44px] items-center justify-between gap-2.5 rounded-xl border border-sky-400/35 bg-sky-400/8 px-3 py-2.5 transition hover:bg-sky-400/15"
      >
        <span className="flex min-w-0 items-center gap-2">
          <FlagMark alt={`${seed.team.name} flag`} fallback={seed.team.flagEmoji} src={seed.team.flagAssetUrl} />
          <span className="truncate text-xs font-black text-sky-300">{seed.team.name}</span>
        </span>
        <span className="shrink-0 text-[10px] font-black tabular-nums text-sky-400/70">
          {seed.team.points}pt
        </span>
      </Link>
    );
  }

  // Fallback — team known but status unclear
  return (
    <Link
      href={`/teams/${seed.team.slug}`}
      className="flex min-h-[44px] items-center justify-between gap-2.5 rounded-xl border border-white/12 bg-white/5 px-3 py-2.5 transition hover:bg-white/10"
    >
      <span className="flex min-w-0 items-center gap-2">
        <FlagMark alt={`${seed.team.name} flag`} fallback={seed.team.flagEmoji} src={seed.team.flagAssetUrl} />
        <span className="truncate text-xs font-black text-white/70">{seed.team.name}</span>
      </span>
      <span className="shrink-0 text-[10px] font-black tabular-nums text-white/38">
        {seed.team.points}pt
      </span>
    </Link>
  );
}

function formatR32Date(isoStr: string): string {
  const d = new Date(isoStr);
  return (
    d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  );
}

function R32MatchCard({ slot }: { slot: R32Slot }) {
  const bothLocked =
    slot.home.team?.qualificationStatus === "advancing" && slot.home.team.played >= 3 &&
    slot.away.team?.qualificationStatus === "advancing" && slot.away.team.played >= 3;
  const anyKnown = slot.home.team || slot.away.team;
  const isLive = slot.status === "live";
  const isCompleted = slot.status === "completed";
  const hasScore = slot.homeScore != null && slot.awayScore != null;

  return (
    <article className={`flex flex-col gap-1.5 rounded-[20px] border p-3.5 ${
      bothLocked
        ? "border-[#f7d149]/25 bg-[#f7d149]/5 shadow-[0_0_20px_rgba(247,209,73,0.10)]"
        : anyKnown
          ? "border-sky-400/20 bg-sky-400/4"
          : "border-white/8 bg-white/4"
    }`}>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/35">
          Round of 32
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${
          bothLocked ? "bg-[#f7d149]/20 text-[#f7d149]" : anyKnown ? "bg-sky-400/15 text-sky-300" : "bg-white/8 text-white/35"
        }`}>
          M{slot.matchNumber}
        </span>
      </div>
      <KnockoutSlot seed={slot.home} />
      <div className="flex items-center gap-2 px-1">
        {isLive && hasScore ? (
          <>
            <div className="h-px flex-1 bg-red-500/20" />
            <span className="text-sm font-black text-white">
              {slot.homeScore} – {slot.awayScore}
            </span>
            <span className="animate-pulse text-[9px] font-black uppercase tracking-wide text-red-400">
              LIVE
            </span>
            <div className="h-px flex-1 bg-red-500/20" />
          </>
        ) : isCompleted && hasScore ? (
          <>
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-sm font-black text-white/70">
              {slot.homeScore} – {slot.awayScore}
            </span>
            <div className="h-px flex-1 bg-white/8" />
          </>
        ) : (
          <>
            <div className="h-px flex-1 bg-white/8" />
            <span className="text-[9px] font-black text-white/20">VS</span>
            <div className="h-px flex-1 bg-white/8" />
          </>
        )}
      </div>
      <KnockoutSlot seed={slot.away} />
      {slot.startsAt && (
        <div className="mt-1 flex items-center gap-1.5 overflow-hidden rounded-xl border border-white/6 bg-white/5 px-2.5 py-1.5">
          <Clock3 className="size-3 shrink-0 text-white/30" />
          <span className="text-[10px] font-bold text-white/40">
            {formatR32Date(slot.startsAt)}
          </span>
          {slot.venue && (
            <>
              <span className="mx-0.5 text-white/15">·</span>
              <MapPin className="size-3 shrink-0 text-white/30" />
              <span className="truncate text-[10px] font-bold text-white/40">{slot.venue}</span>
            </>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Elimination tracker ──────────────────────────────────────────────────────

function EliminationBoard({ groups }: { groups: Group[] }) {
  type TeamEntry = GroupTeam & { groupCode: string };
  const thirdPlace: TeamEntry[] = [];
  const eliminated: TeamEntry[] = [];

  for (const group of groups) {
    for (const team of group.teams) {
      if (team.played === 0) continue;
      if (team.qualificationStatus === "third_place_watch") {
        thirdPlace.push({ ...team, groupCode: group.groupCode });
      } else if (team.qualificationStatus === "in_danger" && team.played >= 3) {
        eliminated.push({ ...team, groupCode: group.groupCode });
      }
    }
  }

  if (thirdPlace.length === 0 && eliminated.length === 0) return null;

  // Rank by points → GD; top 8 are currently on track to advance
  thirdPlace.sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
  const cutoff = 8;

  return (
    <div className="mt-4 overflow-hidden rounded-[24px] bg-[#10131a] shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_12px_40px_rgba(16,19,26,0.35)]">
      <div className="divide-y divide-white/6">

        {/* 3rd place race — 8 spots up for grabs */}
        {thirdPlace.length > 0 && (
          <div className="px-4 py-3">
            <div className="mb-2.5 flex items-baseline gap-2">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-sky-400">
                3rd Place Race · {thirdPlace.length} teams
              </p>
              <span className="text-[9px] font-bold text-white/28">8 spots · live ranking</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {thirdPlace.map((team, i) => {
                const advancing = i < cutoff;
                return (
                  <Link
                    href={`/teams/${team.slug}`}
                    key={team.slug}
                    className={`flex items-center gap-2 rounded-xl border px-2.5 py-1.5 transition ${
                      advancing
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/18"
                        : "border-amber-500/20 bg-amber-500/8 text-amber-200 hover:bg-amber-500/15"
                    }`}
                  >
                    <span className={`text-[9px] font-black tabular-nums ${advancing ? "text-emerald-400/60" : "text-amber-400/50"}`}>
                      #{i + 1}
                    </span>
                    <FlagMark alt={team.name} fallback={team.flagEmoji} src={team.flagAssetUrl} />
                    <span className="text-xs font-black">{team.name}</span>
                    <span className="text-[10px] font-bold opacity-55">{team.points}pt</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Eliminated */}
        {eliminated.length > 0 && (
          <div className="px-4 py-3">
            <p className="mb-2.5 text-[9px] font-black uppercase tracking-[0.22em] text-red-400">
              Eliminated · {eliminated.length}
            </p>
            <div className="flex flex-wrap gap-2">
              {eliminated.map((team) => (
                <Link
                  href={`/teams/${team.slug}`}
                  key={team.slug}
                  className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/8 px-2.5 py-1.5 text-red-300 transition hover:bg-red-500/15"
                >
                  <FlagMark alt={team.name} fallback={team.flagEmoji} src={team.flagAssetUrl} />
                  <span className="text-xs font-black">{team.name}</span>
                  <span className="text-[10px] font-bold opacity-50">G{team.groupCode}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Round of 32 view ─────────────────────────────────────────────────────────

function Round32View({ slots, groups }: { slots: R32Slot[]; groups: Group[] }) {
  const locked = slots.filter(
    (s) =>
      s.home.team?.qualificationStatus === "advancing" && s.home.team.played >= 3 &&
      s.away.team?.qualificationStatus === "advancing" && s.away.team.played >= 3,
  ).length;
  const seeded = slots.filter((s) => s.home.team || s.away.team).length;

  return (
    <div>
      <div className="overflow-hidden rounded-[28px] bg-[#10131a] shadow-[0_0_0_1px_rgba(247,209,73,0.12),0_24px_60px_rgba(16,19,26,0.45)]">
        {/* Header */}
        <div
          className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
          style={{ background: "linear-gradient(135deg, #1a2e50 0%, #10131a 100%)" }}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f7d149]">
              FIFA World Cup 2026
            </p>
            <h2 className="mt-1 text-2xl font-black text-white">Round of 32</h2>
            <p className="mt-0.5 text-sm font-bold text-white/35">
              16 matches · seeds auto-fill from group results
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className={`shrink-0 rounded-full border px-4 py-2 text-xs font-black ${
              locked === 16
                ? "border-[#f7d149]/40 bg-[#f7d149]/10 text-[#f7d149]"
                : "border-white/12 bg-white/5 text-white/45"
            }`}>
              {locked} / 16 matches confirmed
            </span>
            {seeded > locked && (
              <span className="rounded-full border border-sky-400/25 bg-sky-400/8 px-3 py-1 text-[10px] font-black text-sky-300">
                {seeded - locked} match{seeded - locked !== 1 ? "es" : ""} with leading teams
              </span>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {slots.map((slot) => (
            <R32MatchCard key={slot.matchNumber} slot={slot} />
          ))}
        </div>
      </div>

      <EliminationBoard groups={groups} />
    </div>
  );
}

// ─── Top 16 bracket ───────────────────────────────────────────────────────────

const stageColors = {
  R16: { card: "border-white/10 bg-white/5",       label: "text-white/40",        dot: "bg-white/20" },
  QF:  { card: "border-sky-400/25 bg-sky-400/8",   label: "text-sky-300",         dot: "bg-sky-400/50" },
  SF:  { card: "border-amber-400/30 bg-amber-400/10", label: "text-amber-300",    dot: "bg-amber-400/60" },
  "3P":{ card: "border-emerald-400/25 bg-emerald-400/8", label: "text-emerald-300", dot: "bg-emerald-400/50" },
  F:   { card: "border-[#f7d149] bg-[#f7d149]/15 shadow-[0_0_28px_rgba(247,209,73,0.18)]", label: "text-[#f7d149]", dot: "bg-[#f7d149]" },
};

function BracketCard({ matchNumber }: { matchNumber: number }) {
  const m = knockoutMatches[matchNumber];
  if (!m) return null;
  const colors = stageColors[m.stage];
  const stageTag = m.stage === "F" ? "Final" : m.stage === "3P" ? "3rd Place" : m.stage === "SF" ? "Semi-final" : m.stage === "QF" ? "Quarter-final" : "Round of 16";

  return (
    <article className={`rounded-2xl border p-3 ${colors.card}`}>
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${colors.label}`}>
          {stageTag}
        </span>
        <span className="rounded-full bg-white/8 px-2 py-0.5 text-[9px] font-black text-white/40">
          M{matchNumber}
        </span>
      </div>
      {[m.home, m.away].map((label, i) => (
        <div
          key={i}
          className="mt-1 flex min-h-[36px] items-center gap-2 rounded-xl border border-white/8 bg-white/5 px-2.5 py-2"
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors.dot}`} />
          <span className="truncate text-[11px] font-black text-white/55">{label}</span>
        </div>
      ))}
    </article>
  );
}

function BracketConnector({ side }: { side: "right" | "left" | "both" }) {
  return (
    <>
      {side !== "left" && (
        <span className="absolute right-0 top-1/2 hidden h-px w-3 translate-x-full bg-[#f7d149]/30 xl:block" />
      )}
      {side !== "right" && (
        <span className="absolute left-0 top-1/2 hidden h-px w-3 -translate-x-full bg-[#f7d149]/30 xl:block" />
      )}
    </>
  );
}

function BracketColumn({ label, color, children, spread = false }: {
  label: string; color: string; children: React.ReactNode; spread?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${spread ? "content-around" : ""}`}>
      <p className={`text-center text-[9px] font-black uppercase tracking-[0.2em] ${color}`}>
        {label}
      </p>
      {children}
    </div>
  );
}

function Top16View() {
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#10131a] shadow-[0_0_0_1px_rgba(247,209,73,0.12),0_24px_60px_rgba(16,19,26,0.45)]">
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
        style={{ background: "linear-gradient(135deg, #1a2e50 0%, #10131a 100%)" }}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f7d149]">
            FIFA World Cup 2026
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">Knockout Bracket</h2>
          <p className="mt-0.5 text-sm font-bold text-white/35">
            Round of 16 · Quarter-finals · Semi-finals · Final
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "R16", color: "text-white/50 border-white/15 bg-white/5" },
            { label: "QF",  color: "text-sky-300 border-sky-400/25 bg-sky-400/10" },
            { label: "SF",  color: "text-amber-300 border-amber-400/25 bg-amber-400/10" },
            { label: "Final", color: "text-[#f7d149] border-[#f7d149]/40 bg-[#f7d149]/10" },
          ].map(({ label, color }) => (
            <span key={label} className={`rounded-full border px-3 py-1 text-[10px] font-black ${color}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Bracket */}
      <div className="overflow-x-auto p-4 pb-6">
        <div className="grid min-w-[820px] grid-cols-[1.1fr_1fr_1fr_1fr_1.1fr] gap-3">

          {/* R16 left */}
          <BracketColumn label="Round of 16" color="text-white/35">
            {[89, 90, 93, 94].map((n) => (
              <div key={n} className="relative">
                <BracketConnector side="right" />
                <BracketCard matchNumber={n} />
              </div>
            ))}
          </BracketColumn>

          {/* QF left */}
          <BracketColumn label="Quarter-final" color="text-sky-400/70" spread>
            {[97, 98].map((n) => (
              <div key={n} className="relative">
                <BracketConnector side="both" />
                <BracketCard matchNumber={n} />
              </div>
            ))}
          </BracketColumn>

          {/* Centre: SF + Final + 3rd */}
          <BracketColumn label="Semi-final / Final" color="text-amber-400/70" spread>
            <div className="relative">
              <BracketConnector side="both" />
              <BracketCard matchNumber={101} />
            </div>
            <BracketCard matchNumber={104} />
            <BracketCard matchNumber={103} />
            <div className="relative">
              <BracketConnector side="both" />
              <BracketCard matchNumber={102} />
            </div>
          </BracketColumn>

          {/* QF right */}
          <BracketColumn label="Quarter-final" color="text-sky-400/70" spread>
            {[99, 100].map((n) => (
              <div key={n} className="relative">
                <BracketConnector side="both" />
                <BracketCard matchNumber={n} />
              </div>
            ))}
          </BracketColumn>

          {/* R16 right */}
          <BracketColumn label="Round of 16" color="text-white/35">
            {[91, 92, 95, 96].map((n) => (
              <div key={n} className="relative">
                <BracketConnector side="left" />
                <BracketCard matchNumber={n} />
              </div>
            ))}
          </BracketColumn>

        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function StandingsTabs({ groups, roundOf32Slots }: {
  groups: Group[];
  roundOf32Slots: R32Slot[];
}) {
  const [tab, setTab] = useState<Tab>("Round of 32");

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
      {tab === "Round of 32" && <Round32View slots={roundOf32Slots} groups={groups} />}
      {tab === "Top 16" && <Top16View />}
    </div>
  );
}
