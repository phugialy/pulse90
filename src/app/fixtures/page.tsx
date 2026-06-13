import { AppShell } from "@/components/app-shell";
import { PageIntro } from "@/components/ui";
import { getFixtureExplorer, type ResultMatch } from "@/lib/pulse90-data";
import type { Match } from "@/lib/mock-data";
import { CalendarDays, Clock3, MapPin, ArrowUpRight, Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FixturesPage() {
  const { upcoming, results } = await getFixtureExplorer();
  const nextMatch = upcoming[0] ?? null;
  const fixtureList = upcoming.slice(1);

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro
          kicker="Fixture explorer"
          title="Fixtures, fast."
          detail="Closest match first, then a compact schedule you can scan by flag, kickoff, and city."
        />

        <div className="mt-6 lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
          {/* Main: upcoming matches */}
          <div className="min-w-0">
            {nextMatch ? <NextFixtureHero match={nextMatch} /> : null}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {fixtureList.map((match) => (
                <FixtureTile match={match} key={match.matchNumber} />
              ))}
            </div>
            {upcoming.length === 0 && (
              <p className="mt-10 text-center text-sm font-bold text-[#10131a]/40">
                No upcoming fixtures scheduled.
              </p>
            )}
          </div>

          {/* Sidebar: results */}
          {results.length > 0 && (
            <aside className="mt-8 lg:mt-0">
              <ResultsColumn results={results} />
            </aside>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ResultsColumn({ results }: { results: ResultMatch[] }) {
  return (
    <div className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-[#10131a]/8 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#10131a]/50">
          Results
        </p>
      </div>
      <div className="divide-y divide-[#10131a]/6">
        {results.map((r) => (
          <ResultCard key={r.matchNumber} result={r} />
        ))}
      </div>
    </div>
  );
}

function ResultCard({ result }: { result: ResultMatch }) {
  const homeWon = result.homeScore > result.awayScore;
  const awayWon = result.awayScore > result.homeScore;

  return (
    <Link
      href={`/matches/${result.matchNumber}`}
      className="block px-4 py-3 transition hover:bg-[#10131a]/[0.025]"
    >
      {/* Header: group + FT */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#10131a]/40">
          {result.group}
        </span>
        <span className="rounded-full bg-[#10131a]/6 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.1em] text-[#10131a]/50">
          FT
        </span>
      </div>

      {/* Score row */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        {/* Home */}
        <div className="flex items-center gap-2 min-w-0">
          <TeamFlag
            flagAssetUrl={result.homeFlagAssetUrl}
            flagEmoji={result.homeFlagEmoji}
            name={result.home}
          />
          <span
            className={`truncate text-sm font-black ${homeWon ? "text-[#10131a]" : "text-[#10131a]/35"}`}
          >
            {result.home}
          </span>
        </div>

        {/* Score */}
        <span className="shrink-0 text-base font-black tabular-nums text-[#10131a]">
          {result.homeScore}&nbsp;–&nbsp;{result.awayScore}
        </span>

        {/* Away */}
        <div className="flex items-center justify-end gap-2 min-w-0">
          <span
            className={`truncate text-right text-sm font-black ${awayWon ? "text-[#10131a]" : "text-[#10131a]/35"}`}
          >
            {result.away}
          </span>
          <TeamFlag
            flagAssetUrl={result.awayFlagAssetUrl}
            flagEmoji={result.awayFlagEmoji}
            name={result.away}
          />
        </div>
      </div>

      {/* Goal events */}
      {result.goals.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {result.goals.map((goal, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px]">
                {goal.eventType === "own_goal" ? "🔴" : "⚽"}
              </span>
              <span className="text-[11px] font-bold text-[#10131a]/55">
                {goal.scorer}
                {goal.minute !== null && (
                  <span className="ml-1 text-[#10131a]/35">{goal.minute}&apos;</span>
                )}
                {goal.eventType === "own_goal" && (
                  <span className="ml-1 text-[#10131a]/35">(og)</span>
                )}
                {goal.eventType === "penalty_goal" && (
                  <span className="ml-1 text-[#10131a]/35">(pen)</span>
                )}
              </span>
            </div>
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

function NextFixtureHero({ match }: { match: Match }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[#10131a]/10 bg-[#10131a] text-white shadow-[0_24px_70px_rgba(25,45,88,0.18)]">
      <div className="grid gap-5 p-5 md:grid-cols-[1fr_300px] md:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-black">
              <Trophy className="size-3.5" />
              {match.status === "live" ? "Live now" : "Next up"}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/70">
              {match.group}
            </span>
          </div>

          <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <FixtureTeamFlag match={match} side="home" hero />
            <span className="text-center text-2xl font-black text-lime-300 sm:text-4xl">
              {match.score ?? "vs"}
            </span>
            <FixtureTeamFlag match={match} side="away" hero />
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.09] p-4">
          <div className="grid gap-2 text-sm font-black text-white/82">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4 text-lime-300" />
              {match.date ?? "Date TBD"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4 text-lime-300" />
              {match.minute ?? match.time}
            </span>
            <span className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-lime-300" />
              <span>
                {match.venue}
                <span className="block text-white/54">{match.place}</span>
              </span>
            </span>
          </div>
          <p className="mt-4 rounded-2xl bg-white/10 p-3 text-sm font-bold leading-6 text-white/78">
            {match.tag}
          </p>
          <Link
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#10131a] transition hover:bg-lime-300"
            href={`/matches/${match.matchNumber}`}
          >
            Open match
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FixtureTile({ match }: { match: Match }) {
  return (
    <Link
      className="group block rounded-[22px] border border-[#10131a]/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cobalt/40"
      href={`/matches/${match.matchNumber}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#10131a]/5 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-cobalt">
          {match.group}
        </span>
        <ArrowUpRight className="size-4 text-[#10131a]/35 transition group-hover:text-cobalt" />
      </div>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <FixtureTeamFlag match={match} side="home" />
        <span className="text-sm font-black text-[#10131a]/42">
          {match.score ?? "vs"}
        </span>
        <FixtureTeamFlag match={match} side="away" />
      </div>

      <div className="mt-4 grid gap-2 rounded-2xl bg-stadium p-3 text-xs font-black text-[#10131a]/68">
        <span className="inline-flex items-center gap-2">
          <Clock3 className="size-3.5 text-cobalt" />
          {match.date ? `${match.date} / ` : ""}
          {match.minute ?? match.time}
        </span>
        <span className="inline-flex items-center gap-2">
          <MapPin className="size-3.5 text-cobalt" />
          {match.place}
        </span>
      </div>

      <p className="mt-3 truncate text-sm font-black text-[#10131a]">
        {match.tag}
      </p>
    </Link>
  );
}

function FixtureTeamFlag({
  hero = false,
  match,
  side,
}: {
  hero?: boolean;
  match: Match;
  side: "home" | "away";
}) {
  const isHome = side === "home";
  const name = isHome ? match.home : match.away;
  const flagAssetUrl = isHome ? match.homeFlagAssetUrl : match.awayFlagAssetUrl;
  const flagEmoji = isHome ? match.homeFlagEmoji : match.awayFlagEmoji;

  return (
    <div className={`min-w-0 ${isHome ? "text-left" : "text-right"}`}>
      <span
        className={`inline-grid shrink-0 place-items-center overflow-hidden rounded-2xl ${
          hero ? "size-20 bg-white/12 sm:size-24" : "size-12 bg-stadium"
        }`}
      >
        {flagAssetUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt={`${name} flag`}
            className="h-full w-full object-cover"
            src={flagAssetUrl}
          />
        ) : (
          <span className={hero ? "text-4xl" : "text-2xl"}>{flagEmoji ?? ""}</span>
        )}
      </span>
      <span
        className={`mt-2 block truncate font-black ${
          hero
            ? "text-2xl tracking-tight text-white sm:text-4xl"
            : "text-sm text-[#10131a]"
        }`}
      >
        {name}
      </span>
    </div>
  );
}
