"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

function FlagImg({ src, emoji, alt }: { src: string | null | undefined; emoji: string; alt: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img alt={alt} className="h-5 w-7 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-[#10131a]/10" loading="lazy" src={src} />
    );
  }
  return <span className="text-lg leading-none">{emoji}</span>;
}

export function CountdownClock({
  target,
  matchNumber,
  home,
  away,
  homeFlagEmoji = "🏳",
  homeFlagAssetUrl,
  awayFlagEmoji = "🏳",
  awayFlagAssetUrl,
}: {
  target: string;
  matchNumber: number;
  home: string;
  away: string;
  homeFlagEmoji?: string;
  homeFlagAssetUrl?: string | null;
  awayFlagEmoji?: string;
  awayFlagAssetUrl?: string | null;
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
      <div className="mt-2 flex items-center gap-2">
        <FlagImg src={homeFlagAssetUrl} emoji={homeFlagEmoji} alt={home} />
        <span className="truncate text-sm font-bold text-[#10131a]/70">{home}</span>
        <span className="text-xs font-bold text-[#10131a]/35">vs</span>
        <FlagImg src={awayFlagAssetUrl} emoji={awayFlagEmoji} alt={away} />
        <span className="truncate text-sm font-bold text-[#10131a]/70">{away}</span>
      </div>
      <p className="mt-3 tabular-nums text-4xl font-black tracking-tight text-cobalt">
        {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </p>
    </Link>
  );
}
