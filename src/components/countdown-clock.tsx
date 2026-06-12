"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function CountdownClock({
  target,
  matchNumber,
  home,
  away,
}: {
  target: string;
  matchNumber: number;
  home: string;
  away: string;
}) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setDiff(new Date(target).getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  if (diff === null || diff <= 0) return null;

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);

  return (
    <Link
      className="block rounded-[24px] border border-[#10131a]/10 bg-white p-5 shadow-sm transition hover:border-cobalt/30"
      href={`/matches/${matchNumber}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#10131a]/55">
        Next kickoff
      </p>
      <p className="mt-1 truncate text-sm font-bold text-[#10131a]/70">
        {home} vs {away}
      </p>
      <p className="mt-3 tabular-nums text-4xl font-black tracking-tight text-cobalt">
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </p>
    </Link>
  );
}
