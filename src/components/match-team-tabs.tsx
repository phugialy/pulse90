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
    <section className="overflow-hidden rounded-[28px] border border-[#10131a]/10 bg-white shadow-sm">
      <div className="border-b border-[#10131a]/8 px-5 py-4">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#10131a]/55">
          Lineups &amp; team info
        </p>
      </div>
      <div className="grid divide-y divide-[#10131a]/8 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        {homeTeam && (
          <TeamPanel team={homeTeam} teamEvents={homeEvents} side="home" />
        )}
        {awayTeam && (
          <TeamPanel team={awayTeam} teamEvents={awayEvents} side="away" />
        )}
      </div>
    </section>
  );
}

// ─── per-team panel ───────────────────────────────────────────────────────────

type TeamPanelProps = {
  team: MatchCenterTeam;
  teamEvents: MatchEvent[];
  side: "home" | "away";
};

function TeamPanel({ team, teamEvents, side }: TeamPanelProps) {
  const [tab, setTab] = useState<"lineup" | "history">("lineup");
  const theme = teamTheme(team.slug);
  const hasLineup = Boolean(team.startingXi?.length && team.formation);

  return (
    <div className="flex flex-col p-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cobalt">
            {team.group}
          </p>
          <h3 className="mt-0.5 truncate text-xl font-black text-[#10131a]">{team.name}</h3>
          {team.formation && (
            <span
              className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-[11px] font-black text-white"
              style={{ background: theme.dark }}
            >
              {team.formation}
            </span>
          )}
        </div>
        <Link
          className="shrink-0 rounded-full px-3 py-2 text-xs font-black text-white shadow-sm transition hover:opacity-80"
          href={`/teams/${team.slug}`}
          style={{ background: `linear-gradient(135deg, ${theme.dark}, ${theme.mid})` }}
        >
          Team page →
        </Link>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex rounded-full bg-[#10131a]/5 p-1 w-fit gap-1">
        <button
          onClick={() => setTab("lineup")}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
            tab === "lineup" ? "bg-[#10131a] text-white shadow-sm" : "text-[#10131a]/55 hover:text-[#10131a]"
          }`}
          type="button"
        >
          {hasLineup ? "Formation" : "Squad"}
        </button>
        <button
          onClick={() => setTab("history")}
          className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
            tab === "history" ? "bg-[#10131a] text-white shadow-sm" : "text-[#10131a]/55 hover:text-[#10131a]"
          }`}
          type="button"
        >
          Last 4 matches
        </button>
      </div>

      {/* Content */}
      <div className="mt-4 flex-1">
        {tab === "lineup" ? (
          hasLineup ? (
            <FormationPitch
              formation={team.formation!}
              startingXi={team.startingXi!}
              squad={team.squad}
              teamEvents={teamEvents}
              theme={theme}
            />
          ) : (
            <SquadList squad={team.squad} teamEvents={teamEvents} theme={theme} />
          )
        ) : (
          <HistoryList history={team.history} />
        )}
      </div>
    </div>
  );
}

// ─── formation pitch ──────────────────────────────────────────────────────────

function parseFormation(f: string): number[] {
  // "4-3-3" → [1, 4, 3, 3]  (GK row prepended)
  return [1, ...f.split("-").map(Number).filter((n) => !isNaN(n) && n > 0)];
}

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

type Theme = ReturnType<typeof teamTheme>;

function FormationPitch({
  formation,
  startingXi,
  squad,
  teamEvents,
  theme,
}: {
  formation: string;
  startingXi: string[];
  squad: MatchCenterTeam["squad"];
  teamEvents: MatchEvent[];
  theme: Theme;
}) {
  const rows = parseFormation(formation);
  const goalEvents = teamEvents.filter(
    (e) => e.eventType === "goal" || e.eventType === "penalty_goal" || e.eventType === "own_goal",
  );
  const yellowEvents = teamEvents.filter((e) => e.eventType === "yellow_card");
  const redEvents = teamEvents.filter((e) => e.eventType === "red_card");

  // Assign starting XI to rows (GK first in startingXi)
  let idx = 0;
  const rowPlayers = rows.map((count) => {
    const slice = startingXi.slice(idx, idx + count);
    idx += count;
    return slice;
  });

  // Find top scorer for highlight
  const goalCounts = startingXi.map((name) =>
    goalEvents.filter((e) => matchesEvent(name, e.title)).length,
  );
  const maxGoals = Math.max(0, ...goalCounts);

  // Shirt number lookup from squad
  const shirtMap = new Map(
    squad.map((p) => [p.name.toLowerCase(), p.shirtNumber]),
  );
  function shirtFor(name: string) {
    const exact = shirtMap.get(name.toLowerCase());
    if (exact !== undefined) return exact;
    // Partial match
    for (const [key, num] of shirtMap) {
      if (key.includes(name.toLowerCase()) || name.toLowerCase().includes(key.split(" ").slice(-1)[0])) {
        return num;
      }
    }
    return null;
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{ background: "linear-gradient(180deg, #1a4d2e 0%, #2a6b3f 50%, #1a4d2e 100%)" }}
    >
      {/* Pitch markings */}
      <PitchMarkings />

      {/* Player rows — rendered bottom-to-top (GK at bottom, forwards at top) */}
      <div className="relative z-10 flex flex-col-reverse gap-1 px-3 py-5">
        {rowPlayers.map((players, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-around py-2">
            {players.map((name, i) => {
              const goals = goalEvents.filter((e) => matchesEvent(name, e.title)).length;
              const yellow = yellowEvents.some((e) => matchesEvent(name, e.title));
              const red = redEvents.some((e) => matchesEvent(name, e.title));
              const isTop = maxGoals > 0 && goals === maxGoals;
              const shirt = shirtFor(name);
              const lastName = name.split(" ").slice(-1)[0];

              return (
                <div key={i} className="flex flex-col items-center gap-1" style={{ minWidth: 52 }}>
                  <div className="relative">
                    {/* Card badge top-left */}
                    {(yellow || red) && (
                      <span className="absolute -left-1 -top-1 z-10 text-[10px] leading-none">
                        {red ? "🟥" : "🟨"}
                      </span>
                    )}
                    {/* Goal badge top-right */}
                    {goals > 0 && (
                      <span className="absolute -right-1 -top-1 z-10 text-[10px] leading-none">
                        {"⚽".repeat(Math.min(goals, 2))}
                      </span>
                    )}
                    {/* Player circle */}
                    <div
                      className="flex size-10 items-center justify-center rounded-full text-xs font-black text-white shadow-md ring-2"
                      style={{
                        background: `linear-gradient(135deg, ${theme.dark}, ${theme.mid})`,
                        outline: isTop ? "2px solid rgba(250,204,21,0.9)" : "2px solid rgba(255,255,255,0.3)",
                      }}
                    >
                      {shirt ?? (rowIdx === 0 ? "GK" : "#")}
                    </div>
                  </div>
                  <span className="max-w-[56px] truncate text-center text-[10px] font-black leading-none text-white drop-shadow">
                    {lastName}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function PitchMarkings() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* Center line */}
      <div className="absolute inset-x-4 top-1/2 h-px -translate-y-px bg-white/20" />
      {/* Center circle */}
      <div className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      {/* Top penalty box */}
      <div className="absolute inset-x-8 top-3 h-10 rounded-sm border border-white/15" />
      {/* Bottom penalty box */}
      <div className="absolute inset-x-8 bottom-3 h-10 rounded-sm border border-white/15" />
    </div>
  );
}

// ─── squad fallback list ──────────────────────────────────────────────────────

function SquadList({
  squad,
  teamEvents,
  theme,
}: {
  squad: MatchCenterTeam["squad"];
  teamEvents: MatchEvent[];
  theme: Theme;
}) {
  const goalEvents = teamEvents.filter(
    (e) => e.eventType === "goal" || e.eventType === "penalty_goal" || e.eventType === "own_goal",
  );
  const yellowEvents = teamEvents.filter((e) => e.eventType === "yellow_card");
  const redEvents = teamEvents.filter((e) => e.eventType === "red_card");

  const goalCounts = squad.map((p) =>
    goalEvents.filter((e) => matchesEvent(p.name, e.title)).length,
  );
  const maxGoals = Math.max(0, ...goalCounts);

  if (!squad.length) {
    return (
      <p className="rounded-2xl bg-stadium p-3 text-sm font-bold text-[#10131a]/56">
        Squad data not loaded yet.
      </p>
    );
  }

  return (
    <div className="max-h-[400px] space-y-1.5 overflow-y-auto pr-1">
      {squad.map((player, i) => {
        const goals = goalCounts[i];
        const yellow = yellowEvents.some((e) => matchesEvent(player.name, e.title));
        const red = redEvents.some((e) => matchesEvent(player.name, e.title));
        const isTop = maxGoals > 0 && goals === maxGoals;

        return (
          <article
            key={`${player.shirtNumber}-${player.name}`}
            className="grid grid-cols-[32px_40px_1fr_auto] items-center gap-2.5 rounded-2xl border p-2.5 text-sm"
            style={{
              background: isTop
                ? "linear-gradient(135deg, rgba(250,204,21,0.18), rgba(255,255,255,0.9))"
                : goals > 0
                ? "linear-gradient(135deg, rgba(250,204,21,0.07), rgba(255,255,255,0.92))"
                : "rgba(255,255,255,0.7)",
              borderColor: isTop ? "rgba(250,204,21,0.45)" : theme.ring,
            }}
          >
            <span className="font-mono text-xs font-black text-cobalt">
              {player.shirtNumber ?? "--"}
            </span>
            <span className={`rounded-full px-1.5 py-0.5 text-center text-[10px] font-black ${playerRoleClass(player.positionCode, player.position)}`}>
              {player.positionCode}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-[#10131a]">{player.name}</span>
              <span className="block truncate text-[11px] font-bold text-[#10131a]/48">{player.club}</span>
            </span>
            <span className="flex shrink-0 items-center gap-0.5 text-sm leading-none">
              {goals > 0 && "⚽".repeat(Math.min(goals, 3))}
              {yellow && "🟨"}
              {red && "🟥"}
            </span>
          </article>
        );
      })}
    </div>
  );
}

// ─── history list ─────────────────────────────────────────────────────────────

function HistoryList({ history }: { history: RecentTeamMatch[] }) {
  const recent = history.slice(0, 4);

  if (!recent.length) {
    return (
      <p className="rounded-2xl bg-stadium p-3 text-sm font-bold text-[#10131a]/56">
        Recent match history not loaded yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-3 flex items-center gap-2">
        <Shield className="size-4 text-cobalt" />
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#10131a]/55">
          Last {recent.length} matches
        </span>
      </div>
      {recent.map((match) => (
        <article
          key={`${match.date}-${match.home}-${match.away}`}
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#10131a]/8 bg-stadium p-3"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-black text-[#10131a]/45">
              {match.date} · {match.competition}
            </p>
            <p className="mt-0.5 truncate text-sm font-black text-[#10131a]">
              {match.home} {match.homeScore}–{match.awayScore} {match.away}
            </p>
            {match.goals.length > 0 && (
              <p className="mt-0.5 truncate text-[11px] font-bold text-[#10131a]/50">
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

function teamTheme(slug: string) {
  const themes: Record<string, { dark: string; mid: string; ring: string; soft: string }> = {
    argentina: { dark: "#5aa7d8", mid: "#ffffff", ring: "rgba(90,167,216,0.28)", soft: "rgba(90,167,216,0.14)" },
    brazil: { dark: "#10843f", mid: "#f7d149", ring: "rgba(16,132,63,0.26)", soft: "rgba(16,132,63,0.13)" },
    canada: { dark: "#d71920", mid: "#991b1b", ring: "rgba(215,25,32,0.24)", soft: "rgba(215,25,32,0.1)" },
    czechia: { dark: "#11457e", mid: "#d7141a", ring: "rgba(17,69,126,0.22)", soft: "rgba(17,69,126,0.1)" },
    france: { dark: "#0b2f78", mid: "#e33d30", ring: "rgba(11,47,120,0.24)", soft: "rgba(11,47,120,0.11)" },
    germany: { dark: "#10131a", mid: "#d4a017", ring: "rgba(212,160,23,0.24)", soft: "rgba(212,160,23,0.12)" },
    japan: { dark: "#bc002d", mid: "#7f1d1d", ring: "rgba(188,0,45,0.2)", soft: "rgba(188,0,45,0.09)" },
    mexico: { dark: "#006847", mid: "#ce1126", ring: "rgba(0,104,71,0.24)", soft: "rgba(0,104,71,0.12)" },
    morocco: { dark: "#c1272d", mid: "#006233", ring: "rgba(193,39,45,0.22)", soft: "rgba(193,39,45,0.1)" },
    netherlands: { dark: "#f36c21", mid: "#123c7c", ring: "rgba(243,108,33,0.22)", soft: "rgba(243,108,33,0.11)" },
    portugal: { dark: "#006600", mid: "#c8102e", ring: "rgba(0,102,0,0.22)", soft: "rgba(0,102,0,0.1)" },
    "south-africa": { dark: "#007a4d", mid: "#ffb612", ring: "rgba(0,122,77,0.24)", soft: "rgba(0,122,77,0.12)" },
    "south-korea": { dark: "#003478", mid: "#c60c30", ring: "rgba(0,52,120,0.22)", soft: "rgba(0,52,120,0.1)" },
    spain: { dark: "#aa151b", mid: "#f1bf00", ring: "rgba(170,21,27,0.22)", soft: "rgba(170,21,27,0.1)" },
    "united-states": { dark: "#1f3f8b", mid: "#b31942", ring: "rgba(31,63,139,0.22)", soft: "rgba(31,63,139,0.1)" },
    usa: { dark: "#1f3f8b", mid: "#b31942", ring: "rgba(31,63,139,0.22)", soft: "rgba(31,63,139,0.1)" },
  };
  return themes[slug] ?? { dark: "#10131a", mid: "#0b5cff", ring: "rgba(11,92,255,0.18)", soft: "rgba(11,92,255,0.09)" };
}

function playerRoleClass(code: string, position: string) {
  const label = `${code} ${position}`.toLowerCase();
  if (label.includes("gk") || label.includes("goal")) return "bg-amber-200 text-amber-950";
  if (label.includes("fw") || label.includes("forward") || label.includes("striker") || label.includes("wing")) return "bg-red-100 text-red-800";
  if (label.includes("mf") || label.includes("mid")) return "bg-sky-100 text-sky-800";
  if (label.includes("df") || label.includes("def")) return "bg-emerald-100 text-emerald-800";
  return "bg-white text-[#10131a]/62";
}

function resultClass(result: RecentTeamMatch["result"]) {
  if (result === "W") return "bg-emerald-100 text-emerald-800";
  if (result === "L") return "bg-red-100 text-red-800";
  return "bg-sky-100 text-sky-800";
}
