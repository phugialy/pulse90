export const dynamic = "force-dynamic";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { PageIntro } from "@/components/ui";
import { getResultsPage, type ResultMatch } from "@/lib/pulse90-data";

export default async function ResultsPage() {
  const results = await getResultsPage();

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro
          kicker="Match results"
          title="Every result so far."
          detail="Most recent first. Tap any match to open the full match center."
        />

        {results.length === 0 ? (
          <div className="mt-10 rounded-[24px] border border-[#10131a]/10 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-[#10131a]/50">
              Results will appear here as matches are played.
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm">
            <div className="divide-y divide-[#10131a]/6">
              {results.map((r) => (
                <ResultRow key={r.matchNumber} result={r} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function ResultRow({ result }: { result: ResultMatch }) {
  const homeWon = result.homeScore > result.awayScore;
  const awayWon = result.awayScore > result.homeScore;

  return (
    <Link
      href={`/matches/${result.matchNumber}`}
      className="block px-5 py-4 transition hover:bg-[#10131a]/[0.025] sm:px-6"
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#10131a]/40">
            {result.group}
          </span>
          <span className="text-[10px] text-[#10131a]/25">·</span>
          <span className="text-[10px] font-bold text-[#10131a]/38">{result.date}</span>
        </div>
        <span className="rounded-full bg-[#10131a]/6 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#10131a]/50">
          FT
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <TeamFlag flagAssetUrl={result.homeFlagAssetUrl} flagEmoji={result.homeFlagEmoji} name={result.home} />
          <span className={`truncate font-black ${homeWon ? "text-[#10131a]" : "text-[#10131a]/30"}`}>
            {result.home}
          </span>
        </div>

        <span className="shrink-0 text-xl font-black tabular-nums text-[#10131a]">
          {result.homeScore}&ensp;–&ensp;{result.awayScore}
        </span>

        <div className="flex items-center justify-end gap-2.5 min-w-0">
          <span className={`truncate text-right font-black ${awayWon ? "text-[#10131a]" : "text-[#10131a]/30"}`}>
            {result.away}
          </span>
          <TeamFlag flagAssetUrl={result.awayFlagAssetUrl} flagEmoji={result.awayFlagEmoji} name={result.away} />
        </div>
      </div>

      {result.goals.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {result.goals.map((goal, i) => (
            <span key={i} className="text-xs font-bold text-[#10131a]/45">
              {goal.eventType === "own_goal" ? "🔴" : "⚽"}{" "}
              {goal.scorer}
              {goal.minute !== null && (
                <span className="text-[#10131a]/28"> {goal.minute}&apos;</span>
              )}
              {goal.eventType === "own_goal" && <span className="text-[#10131a]/28"> (og)</span>}
              {goal.eventType === "penalty_goal" && <span className="text-[#10131a]/28"> (pen)</span>}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

function TeamFlag({
  flagAssetUrl,
  flagEmoji,
  name,
}: {
  flagAssetUrl?: string | null;
  flagEmoji?: string;
  name: string;
}) {
  if (flagAssetUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={`${name} flag`}
        className="h-4 w-[22px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-[#10131a]/10"
        src={flagAssetUrl}
      />
    );
  }
  return <span className="shrink-0 text-sm leading-none">{flagEmoji ?? "🏳"}</span>;
}
