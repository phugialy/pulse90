"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import type { MatchCenterTeam, MatchEvent, RecentTeamMatch } from "@/lib/pulse90-data";

// ─── public component ────────────────────────────────────────────────────────

type Props = {
  homeTeam: MatchCenterTeam | null;
  awayTeam: MatchCenterTeam | null;
  events: MatchEvent[];
  homeTeamId: string | null;
  awayTeamId: string | null;
};

export function MatchTeamTabs({ homeTeam, awayTeam, events, homeTeamId, awayTeamId }: Props) {
  if (!homeTeam && !awayTeam) return null;

  const homeEvents = events.filter((e) => e.teamId === homeTeamId);
  const awayEvents = events.filter((e) => e.teamId === awayTeamId);

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#10131a]/10 bg-[#061f4a] shadow-sm">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#f7d149]">
          Lineups &amp; formations
        </p>
      </div>
      <div className="grid divide-y divide-white/8 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {homeTeam && (
          <TeamPanel team={homeTeam} teamEvents={homeEvents} />
        )}
        {awayTeam && (
          <TeamPanel team={awayTeam} teamEvents={awayEvents} />
        )}
      </div>
    </section>
  );
}

// ─── per-team panel ───────────────────────────────────────────────────────────

type TeamPanelProps = {
  team: MatchCenterTeam;
  teamEvents: MatchEvent[];
};

function TeamPanel({ team, teamEvents }: TeamPanelProps) {
  const [tab, setTab] = useState<"lineup" | "history">("lineup");
  const hasStartingXi = Boolean(team.startingXi?.length);
  const formationKey = team.formation ?? researchedFormationBySlug[team.slug] ?? "4-3-3";
  const preset = formationPresets[formationKey] ?? formationPresets["4-3-3"];

  const goalEvents = teamEvents.filter(
    (e) => e.eventType === "goal" || e.eventType === "penalty_goal" || e.eventType === "own_goal",
  );
  const yellowEvents = teamEvents.filter((e) => e.eventType === "yellow_card");
  const redEvents = teamEvents.filter((e) => e.eventType === "red_card");

  // Build slots with player data
  let slots: Array<FormationSlot & { player: SlotPlayer }>;
  if (hasStartingXi && team.startingXi) {
    // Map startingXi in order to preset slots (GK at end of preset, first in startingXi)
    const ordered = [...preset.slots].reverse(); // GK first in reversed order
    slots = team.startingXi.slice(0, ordered.length).map((name, i) => ({
      ...ordered[i],
      player: { name, shirtNumber: shirtFor(name, team.squad), positionCode: ordered[i].role },
    }));
  } else {
    // Fall back: group squad by role, assign in order
    const groups = groupSquad(team.squad);
    const usedByRole: Record<FormationRole, number> = { DF: 0, FW: 0, GK: 0, MF: 0 };
    slots = preset.slots
      .map((slot) => {
        const player = groups[slot.role][usedByRole[slot.role]];
        usedByRole[slot.role] += 1;
        if (!player) return null;
        const sp: FormationSlot & { player: SlotPlayer } = {
          ...slot,
          player: { name: player.name, shirtNumber: player.shirtNumber, positionCode: player.positionCode },
        };
        return sp;
      })
      .filter((s): s is FormationSlot & { player: SlotPlayer } => s !== null);
  }

  const bench = hasStartingXi && team.startingXi
    ? team.squad.filter((p) => !team.startingXi!.some((name) => name.toLowerCase() === p.name.toLowerCase()))
    : team.squad.filter((_, i) => i >= 11);

  return (
    <div className="p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f7d149]">
            {team.group}
          </p>
          <h3 className="mt-0.5 text-xl font-black text-white">{team.name}</h3>
          <p className="mt-1 text-sm font-bold text-white/55">
            {hasStartingXi ? "Starting XI" : "Predicted"} · {preset.name}
          </p>
        </div>
        <Link
          className="shrink-0 rounded-full border border-white/14 bg-white/8 px-3 py-2 text-xs font-black text-white/68 transition hover:bg-white/15"
          href={`/teams/${team.slug}`}
        >
          Team page →
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex rounded-full bg-white/8 p-1 w-fit gap-1">
        <button
          onClick={() => setTab("lineup")}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
            tab === "lineup" ? "bg-white text-[#10131a] shadow-sm" : "text-white/55 hover:text-white"
          }`}
          type="button"
        >
          Formation
        </button>
        <button
          onClick={() => setTab("history")}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
            tab === "history" ? "bg-white text-[#10131a] shadow-sm" : "text-white/55 hover:text-white"
          }`}
          type="button"
        >
          Last 4 matches
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {tab === "lineup" ? (
          <FormationView
            slots={slots}
            bench={bench}
            goalEvents={goalEvents}
            yellowEvents={yellowEvents}
            redEvents={redEvents}
          />
        ) : (
          <HistoryList history={team.history} />
        )}
      </div>
    </div>
  );
}

// ─── formation view (pitch + bench) ──────────────────────────────────────────

type SlotPlayer = { name: string; shirtNumber?: number | null | undefined; positionCode: string };

function FormationView({
  slots,
  bench,
  goalEvents,
  yellowEvents,
  redEvents,
}: {
  slots: Array<FormationSlot & { player: SlotPlayer }>;
  bench: MatchCenterTeam["squad"];
  goalEvents: MatchEvent[];
  yellowEvents: MatchEvent[];
  redEvents: MatchEvent[];
}) {
  return (
    <div className="space-y-3">
      <PitchMap slots={slots} goalEvents={goalEvents} yellowEvents={yellowEvents} redEvents={redEvents} />
      {bench.length > 0 && (
        <div className="rounded-[20px] border border-white/10 bg-white/6 p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#f7d149]">
              Bench reserve
            </p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black text-white/55">
              {bench.length}
            </span>
          </div>
          <div className="max-h-[200px] space-y-1.5 overflow-y-auto pr-1">
            {bench.map((player) => (
              <div
                key={`${player.shirtNumber}-${player.name}`}
                className="grid grid-cols-[28px_36px_1fr] items-center gap-2 rounded-xl bg-white/7 p-2 text-sm"
              >
                <span className="font-mono text-xs font-black text-[#f7d149]">
                  {player.shirtNumber ?? "--"}
                </span>
                <span className="rounded-full bg-white/10 px-2 py-1 text-center text-[10px] font-black text-white/62">
                  {player.positionCode}
                </span>
                <span className="min-w-0 truncate font-black text-white/90">{player.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── pitch map ────────────────────────────────────────────────────────────────

function PitchMap({
  slots,
  goalEvents,
  yellowEvents,
  redEvents,
}: {
  slots: Array<FormationSlot & { player: SlotPlayer }>;
  goalEvents: MatchEvent[];
  yellowEvents: MatchEvent[];
  redEvents: MatchEvent[];
}) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-white/12 bg-[#0f4b2f] shadow-[inset_0_0_60px_rgba(0,0,0,0.28)]">
      <div className="relative min-h-[480px] min-w-[320px] overflow-hidden p-4">
        {/* Grid texture */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Penalty boxes */}
        <div className="absolute inset-x-[12%] bottom-0 h-[22%] rounded-t-[24px] border border-white/25 border-b-0" />
        <div className="absolute inset-x-[34%] bottom-0 h-[9%] rounded-t-lg border border-white/25 border-b-0" />
        <div className="absolute inset-x-[12%] top-0 h-[22%] rounded-b-[24px] border border-white/14 border-t-0" />
        {/* Center */}
        <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/16" />
        <div className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/25" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/16" />

        <div className="relative h-[440px]">
          {slots.map((slot, i) => {
            const goals = goalEvents.filter((e) => matchesEvent(slot.player.name, e.title)).length;
            const yellow = yellowEvents.some((e) => matchesEvent(slot.player.name, e.title));
            const red = redEvents.some((e) => matchesEvent(slot.player.name, e.title));
            const allGoals = goalEvents.filter((e) =>
              slots.some((s) => matchesEvent(s.player.name, e.title)),
            ).length;
            const maxGoals = slots.reduce(
              (max, s) => Math.max(max, goalEvents.filter((e) => matchesEvent(s.player.name, e.title)).length),
              0,
            );
            const isTopScorer = maxGoals > 0 && goals === maxGoals;

            return (
              <div
                key={`${slot.role}-${i}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              >
                <MatchPlayerNode
                  player={slot.player}
                  goals={goals}
                  yellow={yellow}
                  red={red}
                  isTopScorer={isTopScorer}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MatchPlayerNode({
  player,
  goals,
  yellow,
  red,
  isTopScorer,
}: {
  player: SlotPlayer;
  goals: number;
  yellow: boolean;
  red: boolean;
  isTopScorer: boolean;
}) {
  const role = toFormationRole(player.positionCode);
  const roleStyle = roleStyles[role];
  const lastName = player.name.split(" ").slice(-1)[0];

  return (
    <div className="relative">
      {/* Event badges */}
      {(goals > 0 || yellow || red) && (
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 flex gap-0.5 text-[11px] leading-none">
          {goals > 0 && "⚽".repeat(Math.min(goals, 3))}
          {yellow && "🟨"}
          {red && "🟥"}
        </div>
      )}
      <div
        className={`grid w-[80px] place-items-center rounded-full border px-1.5 py-1.5 text-center shadow-[0_6px_16px_rgba(0,0,0,0.28)] sm:w-[96px] ${roleStyle.node} ${isTopScorer ? "ring-2 ring-[#f7d149] ring-offset-1 ring-offset-transparent" : ""}`}
      >
        <span className={`grid size-6 place-items-center rounded-full font-mono text-[11px] font-black ${roleStyle.number}`}>
          {player.shirtNumber ?? "--"}
        </span>
        <span className="mt-0.5 w-full truncate text-[11px] font-black leading-tight px-1">
          {lastName}
        </span>
        <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-black ${roleStyle.badge}`}>
          {player.positionCode}
        </span>
      </div>
    </div>
  );
}

// ─── history list ─────────────────────────────────────────────────────────────

function HistoryList({ history }: { history: RecentTeamMatch[] }) {
  const recent = history.slice(0, 4);

  if (!recent.length) {
    return (
      <p className="rounded-2xl bg-white/8 p-3 text-sm font-bold text-white/55">
        Recent match history not loaded yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center gap-2">
        <Shield className="size-4 text-[#f7d149]" />
        <span className="text-xs font-black uppercase tracking-[0.18em] text-white/55">
          Last {recent.length} matches
        </span>
      </div>
      {recent.map((match) => (
        <article
          key={`${match.date}-${match.home}-${match.away}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/7 p-3"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-black text-white/40">
              {match.date} · {match.competition}
            </p>
            <p className="mt-0.5 truncate text-sm font-black text-white/90">
              {match.home} {match.homeScore}–{match.awayScore} {match.away}
            </p>
            {match.goals.length > 0 && (
              <p className="mt-0.5 truncate text-[11px] font-bold text-white/50">
                {match.goals.map((g) => `${g.scorer}${g.minute ? ` ${g.minute}'` : ""}`).join(", ")}
              </p>
            )}
          </div>
          <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black ${resultClass(match.result)}`}>
            {match.result}
          </span>
        </article>
      ))}
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function stripMinute(s: string) {
  return s.replace(/\s+\d+(\+\d+)?'$/, "").trim();
}

function matchesEvent(playerName: string, eventTitle: string) {
  const p = playerName.toLowerCase();
  const e = stripMinute(eventTitle).toLowerCase();
  return (
    p.includes(e) ||
    e.includes(p) ||
    p.split(" ").some((part) => part.length > 2 && e.includes(part))
  );
}

function shirtFor(name: string, squad: MatchCenterTeam["squad"]): number | null {
  const exact = squad.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (exact) return exact.shirtNumber ?? null;
  const partial = squad.find((p) => {
    const pn = p.name.toLowerCase();
    const n = name.toLowerCase();
    return pn.includes(n) || n.includes(pn);
  });
  return partial?.shirtNumber ?? null;
}

function groupSquad(squad: MatchCenterTeam["squad"]) {
  return {
    GK: squad.filter((p) => p.positionCode === "GK"),
    DF: squad.filter((p) => p.positionCode === "DF"),
    MF: squad.filter((p) => p.positionCode === "MF"),
    FW: squad.filter((p) => p.positionCode === "FW"),
  };
}

function resultClass(result: RecentTeamMatch["result"]) {
  if (result === "W") return "bg-emerald-100 text-emerald-800";
  if (result === "L") return "bg-red-100 text-red-800";
  return "bg-sky-100 text-sky-800";
}

type FormationRole = "DF" | "FW" | "GK" | "MF";

function toFormationRole(positionCode: string): FormationRole {
  return ["DF", "FW", "GK", "MF"].includes(positionCode)
    ? (positionCode as FormationRole)
    : "FW";
}

type FormationSlot = { role: FormationRole; x: number; y: number };

const roleStyles: Record<FormationRole, { badge: string; node: string; number: string }> = {
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
