"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { GoldenBootPlayer } from "@/lib/pulse90-data";

type SortKey = "goals" | "per_game";
type StageKey = "all" | "group" | "knockout";

function FlagImg({ src, emoji, alt, size = "sm" }: {
  src: string | null | undefined;
  emoji: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}) {
  const cls =
    size === "lg" ? "h-9 w-14 rounded object-cover shadow ring-1 ring-black/10" :
    size === "md" ? "h-6 w-9 rounded object-cover shadow-sm ring-1 ring-black/10" :
    "h-4 w-6 rounded-[3px] object-cover shadow-sm ring-1 ring-black/10";
  if (src) return <img src={src} alt={alt} className={`${cls} shrink-0`} />;
  return <span className={size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-base"}>{emoji}</span>;
}

function stageLabel(stage: string) {
  const map: Record<string, string> = {
    group: "GS", round_of_32: "R32", quarter_final: "QF", semi_final: "SF", final: "F",
  };
  return map[stage] ?? "GS";
}

function GoalDots({ player, max = 6 }: { player: GoldenBootPlayer; max?: number }) {
  const shown = player.timeline.slice(0, max);
  const extra = player.timeline.length - max;
  return (
    <div className="flex items-center gap-1">
      {shown.map((g, i) => (
        <span
          key={i}
          title={`vs ${g.opponent} ${g.minute ?? ""}' ${g.isPenalty ? "(P)" : ""}`}
          className={`inline-flex size-2.5 shrink-0 rounded-full ${g.isPenalty ? "bg-amber-300" : "bg-amber-400"}`}
        />
      ))}
      {extra > 0 && (
        <span className="text-[10px] font-black text-[#10131a]/35">+{extra}</span>
      )}
    </div>
  );
}

function LeaderHero({ player }: { player: GoldenBootPlayer }) {
  const perGame = (player.goalCount / Math.max(player.teamMatchesPlayed, 1)).toFixed(2);
  return (
    <div className="overflow-hidden rounded-[28px] bg-[#10131a] shadow-[0_0_0_2px_rgba(251,191,36,0.55),0_0_70px_rgba(251,191,36,0.12),0_24px_70px_rgba(16,19,26,0.4)]">
      {/* Top bar */}
      <div className="flex items-center justify-between bg-amber-400 px-6 py-2.5">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-amber-900">
          🏆 Golden Boot Leader
        </span>
        <span className="rounded-full bg-amber-900/15 px-3 py-1 text-xs font-black text-amber-900">
          Rank #1
        </span>
      </div>

      <div className="p-6">
        {/* Player identity */}
        <div className="flex items-center gap-4">
          <FlagImg src={player.flagAssetUrl} emoji={player.flagEmoji} alt={player.teamName} size="lg" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
              {player.name}
            </p>
            <p className="mt-0.5 text-sm font-bold text-white/45">
              {player.teamName} · {player.confederation}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-6xl font-black tabular-nums text-amber-400 drop-shadow-[0_0_24px_rgba(251,191,36,0.45)] sm:text-7xl">
              {player.goalCount}
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400/55">
              goals
            </p>
          </div>
        </div>

        {/* Stat chips */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Penalties", value: player.penaltyCount },
            { label: "Games", value: player.teamMatchesPlayed },
            { label: "Per game", value: perGame },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-white/5 p-3 text-center">
              <p className="text-xl font-black text-white">{value}</p>
              <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-white/35">{label}</p>
            </div>
          ))}
        </div>

        {/* Goal timeline pills */}
        {player.timeline.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {player.timeline.map((g, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 text-xs font-bold text-white/55"
              >
                <span className={`size-1.5 rounded-full ${g.isPenalty ? "bg-amber-300" : "bg-amber-400"}`} />
                {stageLabel(g.stage)} vs {g.opponent}
                {g.minute != null ? ` ${g.minute}${g.stoppageMinute ? `+${g.stoppageMinute}` : ""}'` : ""}
                {g.isPenalty ? " (P)" : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumCard({ player }: { player: GoldenBootPlayer }) {
  const isSecond = player.rank === 2;
  const accent = isSecond ? "text-slate-400" : "text-amber-700";
  const border = isSecond
    ? "shadow-[0_0_0_1.5px_rgba(148,163,184,0.35)]"
    : "shadow-[0_0_0_1.5px_rgba(180,120,60,0.4)]";

  return (
    <div className={`overflow-hidden rounded-[22px] bg-[#10131a] p-5 ${border}`}>
      <div className="flex items-center gap-3">
        <span className={`w-6 shrink-0 text-2xl font-black tabular-nums ${accent}`}>
          {player.rank}
        </span>
        <FlagImg src={player.flagAssetUrl} emoji={player.flagEmoji} alt={player.teamName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">{player.name}</p>
          <p className="text-xs font-bold text-white/40">{player.teamName}</p>
        </div>
        <p className={`shrink-0 text-3xl font-black tabular-nums ${accent}`}>{player.goalCount}</p>
      </div>
      {player.timeline.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {player.timeline.map((g, i) => (
            <span key={i} className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] font-bold text-white/40">
              vs {g.opponent}{g.minute != null ? ` ${g.minute}'` : ""}{g.isPenalty ? " P" : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerRow({ player, isExpanded, onToggle }: {
  player: GoldenBootPlayer;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const perGame = (player.goalCount / Math.max(player.teamMatchesPlayed, 1)).toFixed(2);
  return (
    <div className="border-b border-[#10131a]/6 last:border-none">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-amber-50/60 active:bg-amber-50"
      >
        <span className="w-6 shrink-0 text-sm font-black tabular-nums text-[#10131a]/25">
          {player.rank}
        </span>
        <FlagImg src={player.flagAssetUrl} emoji={player.flagEmoji} alt={player.teamName} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-[#10131a]">{player.name}</p>
          <p className="text-xs font-bold text-[#10131a]/40">{player.teamName}</p>
        </div>
        <GoalDots player={player} />
        <span className="w-7 shrink-0 text-right text-lg font-black tabular-nums text-[#10131a]">
          {player.goalCount}
        </span>
        <span
          className={`ml-1 shrink-0 text-xs text-[#10131a]/30 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {isExpanded && (
        <div className="mx-4 mb-3 overflow-hidden rounded-2xl bg-[#10131a]/4 p-3">
          <div className="grid gap-1.5 sm:grid-cols-2">
            {player.timeline.map((g, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className={`size-2 shrink-0 rounded-full ${g.isPenalty ? "bg-amber-400" : "bg-amber-500"}`} />
                <span className="font-bold text-[#10131a]/65">
                  {stageLabel(g.stage)} · vs {g.opponent}
                </span>
                <span className="ml-auto font-black text-[#10131a]/45">
                  {g.minute ?? "—"}{g.stoppageMinute ? `+${g.stoppageMinute}` : ""}′
                  {g.isPenalty ? " (P)" : ""}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-3 border-t border-[#10131a]/8 pt-2 text-[10px] font-black uppercase tracking-widest text-[#10131a]/30">
            <span>{player.teamMatchesPlayed} games played</span>
            <span>{perGame} per game</span>
            {player.penaltyCount > 0 && <span>{player.penaltyCount} from spot</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export function GoldenBootBoard({ players, hasLiveGame }: {
  players: GoldenBootPlayer[];
  hasLiveGame: boolean;
}) {
  const [sortBy, setSortBy] = useState<SortKey>("goals");
  const [stageFilter, setStageFilter] = useState<StageKey>("all");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const processed = useMemo(() => {
    let list = players.map((p) => {
      const timeline =
        stageFilter === "all" ? p.timeline :
        stageFilter === "group" ? p.timeline.filter((g) => g.stage === "group") :
        p.timeline.filter((g) => g.stage !== "group");
      return { ...p, goalCount: timeline.length, timeline };
    }).filter((p) => p.goalCount > 0);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.teamName.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) =>
      sortBy === "per_game"
        ? b.goalCount / Math.max(b.teamMatchesPlayed, 1) - a.goalCount / Math.max(a.teamMatchesPlayed, 1)
        : b.goalCount - a.goalCount || a.name.localeCompare(b.name),
    );

    return list.map((p, i) => ({ ...p, rank: i + 1 }));
  }, [players, sortBy, stageFilter, search]);

  const isFiltered = stageFilter !== "all" || search.trim() !== "";
  const leader = !isFiltered ? processed[0] ?? null : null;
  const podium = !isFiltered ? processed.slice(1, 3) : [];
  const tableRows = !isFiltered ? processed.slice(3) : processed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#10131a]/38">
            FIFA World Cup 2026
          </p>
          <h1 className="mt-0.5 text-3xl font-black tracking-tight text-[#10131a] sm:text-4xl">
            Golden Boot Watch
          </h1>
          <p className="mt-1 text-sm font-bold text-[#10131a]/45">
            Top scorers · updated every 2 min during matches
          </p>
        </div>
        {hasLiveGame && (
          <span className="flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-white" />
            </span>
            Live
          </span>
        )}
      </div>

      {/* Empty state */}
      {players.length === 0 && (
        <div className="rounded-[24px] border border-[#10131a]/8 bg-white p-12 text-center shadow-sm">
          <p className="text-4xl">⚽</p>
          <p className="mt-3 text-base font-black text-[#10131a]">No goals yet</p>
          <p className="mt-1 text-sm font-bold text-[#10131a]/45">
            The race begins when the first match kicks off.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#10131a] px-5 py-2.5 text-sm font-black text-white hover:opacity-80 transition"
          >
            Watch Desk →
          </Link>
        </div>
      )}

      {/* Leader hero */}
      {leader && <LeaderHero player={leader} />}

      {/* Podium */}
      {podium.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {podium.map((p) => <PodiumCard key={p.name} player={p} />)}
        </div>
      )}

      {/* Filters */}
      {players.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Stage */}
          <div className="flex rounded-full border border-[#10131a]/10 bg-[#f8faf4] p-1">
            {(["all", "group", "knockout"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  stageFilter === s
                    ? "bg-[#10131a] text-white"
                    : "text-[#10131a]/55 hover:text-[#10131a]"
                }`}
              >
                {s === "all" ? "All stages" : s === "group" ? "Group stage" : "Knockouts"}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex rounded-full border border-[#10131a]/10 bg-[#f8faf4] p-1">
            {(["goals", "per_game"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                  sortBy === s
                    ? "bg-[#10131a] text-white"
                    : "text-[#10131a]/55 hover:text-[#10131a]"
                }`}
              >
                {s === "goals" ? "By goals" : "Per game"}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            className="min-w-[140px] flex-1 rounded-full border border-[#10131a]/10 bg-white px-4 py-1.5 text-sm font-bold text-[#10131a] placeholder:text-[#10131a]/28 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            placeholder="Search player or team…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setExpanded(null); }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-xs font-black text-[#10131a]/40 hover:text-[#10131a]"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Leaderboard table */}
      {tableRows.length > 0 && (
        <div className="overflow-hidden rounded-[22px] border border-[#10131a]/8 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-[#10131a]/8 px-4 py-2.5">
            <span className="w-6 text-[10px] font-black uppercase tracking-widest text-[#10131a]/28">#</span>
            <span className="flex-1 text-[10px] font-black uppercase tracking-widest text-[#10131a]/28">Player</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#10131a]/28">
              {sortBy === "per_game" ? "Per game" : "Goals"}
            </span>
            <span className="w-5" />
          </div>
          {tableRows.map((p) => (
            <PlayerRow
              key={p.name}
              player={p}
              isExpanded={expanded === p.name}
              onToggle={() => setExpanded((prev) => (prev === p.name ? null : p.name))}
            />
          ))}
        </div>
      )}

      {/* No search results */}
      {isFiltered && processed.length === 0 && players.length > 0 && (
        <div className="rounded-[22px] border border-[#10131a]/8 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-black text-[#10131a]/50">No scorers match your filter</p>
          <button
            onClick={() => { setSearch(""); setStageFilter("all"); }}
            className="mt-3 text-xs font-black text-cobalt hover:opacity-70"
          >
            Clear filters
          </button>
        </div>
      )}

      {processed.length > 0 && (
        <p className="text-center text-xs font-bold text-[#10131a]/28">
          {processed.length} scorer{processed.length !== 1 ? "s" : ""} · own goals excluded
        </p>
      )}
    </div>
  );
}
