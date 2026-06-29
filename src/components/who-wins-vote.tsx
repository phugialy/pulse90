"use client";

import { useState, useEffect, useTransition } from "react";
import { castVote } from "@/app/actions/vote";
import type { VoteTally } from "@/lib/pulse90-data";

export function WhoWinsVote({
  fixtureId,
  homeTeamId,
  homeName,
  homeFlagEmoji,
  awayTeamId,
  awayName,
  awayFlagEmoji,
  initialTally,
  status,
}: {
  fixtureId: string;
  homeTeamId: string;
  homeName: string;
  homeFlagEmoji?: string | null;
  awayTeamId: string;
  awayName: string;
  awayFlagEmoji?: string | null;
  initialTally: VoteTally;
  status: "scheduled" | "live" | "completed";
}) {
  const [tally, setTally] = useState(initialTally);
  // null = localStorage not loaded yet (avoids SSR mismatch)
  // ""   = loaded, not voted
  // else = voted (team ID or "draw")
  const [voted, setVoted] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    queueMicrotask(() => {
      setVoted(localStorage.getItem(`vote_${fixtureId}`) ?? "");
    });
  }, [fixtureId]);

  function getOrCreateSession(): string {
    let s = localStorage.getItem("pulse90_session");
    if (!s) {
      s = crypto.randomUUID();
      localStorage.setItem("pulse90_session", s);
    }
    return s;
  }

  function handleVote(choice: string | null) {
    if (voted || pending) return;
    const key = choice ?? "draw";
    startTransition(async () => {
      const result = await castVote(
        fixtureId,
        choice,
        getOrCreateSession(),
        homeTeamId,
        awayTeamId,
      );
      setTally(result);
      setVoted(key);
      localStorage.setItem(`vote_${fixtureId}`, key);
    });
  }

  const showTally = (voted !== null && voted !== "") || status === "completed";
  const total = tally.total || 1;
  const homePct = Math.round((tally.homeVotes / total) * 100);
  const drawPct = Math.round((tally.drawVotes / total) * 100);
  const awayPct = 100 - homePct - drawPct;

  // Hide until localStorage loads (avoids vote-button flash on already-voted matches)
  if (voted === null && status !== "completed") return null;

  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#10131a]/55">
        {status === "completed" ? "Community picked" : "Who wins?"}
      </p>

      {showTally ? (
        <div className="mt-4 space-y-3">
          <TallyBar
            emoji={homeFlagEmoji}
            highlight={voted === homeTeamId}
            label={homeName}
            pct={homePct}
          />
          <TallyBar highlight={voted === "draw"} label="Draw" pct={drawPct} />
          <TallyBar
            emoji={awayFlagEmoji}
            highlight={voted === awayTeamId}
            label={awayName}
            pct={awayPct}
          />
          <p className="text-xs font-bold text-[#10131a]/40">
            {tally.total === 0
              ? "No votes yet"
              : `${tally.total.toLocaleString()} vote${tally.total !== 1 ? "s" : ""}`}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2">
          <VoteButton disabled={pending} onClick={() => handleVote(homeTeamId)}>
            <span className="text-lg leading-none">{homeFlagEmoji ?? "🏳"}</span>
            <span className="truncate text-xs">{homeName}</span>
          </VoteButton>
          <VoteButton disabled={pending} onClick={() => handleVote(null)}>
            <span className="text-xs font-black text-[#10131a]/50">—</span>
            <span className="text-xs">Draw</span>
          </VoteButton>
          <VoteButton disabled={pending} onClick={() => handleVote(awayTeamId)}>
            <span className="text-lg leading-none">{awayFlagEmoji ?? "🏳"}</span>
            <span className="truncate text-xs">{awayName}</span>
          </VoteButton>
        </div>
      )}
    </section>
  );
}

function TallyBar({
  label,
  emoji,
  pct,
  highlight,
}: {
  label: string;
  emoji?: string | null;
  pct: number;
  highlight: boolean;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-black text-[#10131a]">
          {emoji ? `${emoji} ` : ""}
          {label}
        </span>
        <span
          className={`text-sm font-black tabular-nums ${highlight ? "text-cobalt" : "text-[#10131a]/55"}`}
        >
          {pct}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-stadium">
        <div
          className={`h-full rounded-full transition-all duration-500 ${highlight ? "bg-cobalt" : "bg-[#10131a]/18"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function VoteButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-[#10131a]/10 bg-stadium p-3 font-black text-[#10131a] transition hover:border-cobalt/40 hover:bg-cobalt/8 hover:text-cobalt disabled:cursor-not-allowed disabled:opacity-50"
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
