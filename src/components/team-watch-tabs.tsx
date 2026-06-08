"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Clock3, MapPin } from "lucide-react";
import type { Match } from "@/lib/mock-data";
import type { RecentTeamMatch } from "@/lib/pulse90-data";

type TeamWatchTabsProps = {
  history: RecentTeamMatch[];
  matches: Match[];
  story: string;
};

const tabs = [
  { id: "watch", label: "Watch" },
  { id: "history", label: "Team History" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function TeamWatchTabs({ history, matches, story }: TeamWatchTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("watch");

  return (
    <section className="min-w-0 rounded-[24px] border border-[#10131a]/10 bg-white/88 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full bg-[#10131a]/5 p-1">
          {tabs.map((tab) => (
            <button
              className={`rounded-full px-3 py-2 text-xs font-black transition ${
                activeTab === tab.id
                  ? "bg-[#10131a] text-white shadow-sm"
                  : "text-[#10131a]/58 hover:text-[#10131a]"
              }`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="rounded-full bg-[#10131a]/5 px-3 py-1 text-xs font-black text-[#10131a]/55">
          {activeTab === "watch"
            ? `${matches.length} tracked`
            : `${history.length} recent`}
        </span>
      </div>

      {activeTab === "watch" ? (
        <WatchPanel matches={matches} story={story} />
      ) : null}
      {activeTab === "history" ? <TeamHistoryPanel history={history} /> : null}
    </section>
  );
}

function WatchPanel({ matches, story }: { matches: Match[]; story: string }) {
  return (
    <div className="mt-4 space-y-4">
      <UpcomingMatchRail matches={matches} />
      {story ? <WorldCupStoryPanel story={story} /> : null}
    </div>
  );
}

function UpcomingMatchRail({ matches }: { matches: Match[] }) {
  return (
    <div className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-2">
      {matches.map((match) => (
        <CompactTeamMatchCard match={match} key={match.matchNumber} />
      ))}
    </div>
  );
}

function CompactTeamMatchCard({ match }: { match: Match }) {
  return (
    <Link
      className="grid w-[245px] shrink-0 snap-start gap-3 rounded-[20px] border border-[#10131a]/10 bg-white p-3 text-[#10131a] shadow-sm transition hover:-translate-y-0.5 hover:border-cobalt/45 sm:w-[280px]"
      href={`/matches/${match.matchNumber}`}
    >
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-black text-[#10131a]/58">
        {match.date ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-stadium px-2 py-1">
            <CalendarDays className="size-3 text-cobalt" />
            {match.date}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 rounded-full bg-stadium px-2 py-1">
          <Clock3 className="size-3 text-cobalt" />
          {match.minute ?? match.time}
        </span>
      </div>
      <div>
        <span className="rounded-full bg-[#10131a]/5 px-2 py-1 text-[10px] font-black text-[#10131a]/62">
          {match.tag}
        </span>
        <h3 className="mt-3 line-clamp-2 text-lg font-black leading-tight">
          {match.home} vs {match.away}
        </h3>
        <p className="mt-2 text-xs font-bold text-[#10131a]/54">
          {match.group} / {match.place}
        </p>
      </div>
      <div className="rounded-2xl bg-stadium px-3 py-2 text-xs font-bold leading-5 text-[#10131a]/62">
        <div className="flex gap-2">
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-cobalt" />
          <p>
            <span className="block font-black text-[#10131a]">{match.venue}</span>
            {match.place}
          </p>
        </div>
      </div>
      <p className="line-clamp-3 border-l border-cobalt/45 pl-3 text-xs font-bold leading-5 text-[#10131a]/66">
        {match.implication}
      </p>
    </Link>
  );
}

function TeamHistoryPanel({ history }: { history: RecentTeamMatch[] }) {
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const pageCount = Math.ceil(history.length / pageSize);
  const pageStart = page * pageSize;
  const visibleHistory = history.slice(pageStart, pageStart + pageSize);

  if (!history.length) {
    return (
      <p className="mt-4 rounded-2xl bg-stadium p-4 text-sm font-bold leading-6 text-[#10131a]/58">
        Recent team history is not loaded for this team yet.
      </p>
    );
  }

  const form = history.slice(0, 5).map((match) => match.result);

  return (
    <div className="mt-4">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-black uppercase tracking-[0.18em] text-[#10131a]/52">
          Recent form
        </span>
        {form.map((result, index) => (
          <span className={`grid size-8 place-items-center rounded-full text-xs font-black ${resultClass(result)}`} key={`${result}-${index}`}>
            {result}
          </span>
        ))}
      </div>
      <div className="grid gap-3">
        {visibleHistory.map((match) => (
          <article
            className="rounded-[20px] border border-[#10131a]/8 bg-white p-4 shadow-sm"
            key={`${match.date}-${match.home}-${match.away}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-black text-[#10131a]/55">
                  <span>{match.date}</span>
                  <span className="rounded-full bg-stadium px-2 py-1">
                    {match.competition}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-black leading-tight text-[#10131a]">
                  {match.home} {match.homeScore}-{match.awayScore} {match.away}
                </h3>
                <p className="mt-1 text-xs font-bold text-[#10131a]/52">
                  {match.location}
                </p>
              </div>
              <span className={`grid size-9 place-items-center rounded-full text-sm font-black ${resultClass(match.result)}`}>
                {match.result}
              </span>
            </div>

            {match.goals.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {match.goals.map((goal, index) => (
                  <span
                    className="rounded-full bg-[#10131a]/5 px-2.5 py-1 text-[11px] font-black text-[#10131a]/64"
                    key={`${goal.scorer}-${goal.minute}-${index}`}
                  >
                    {goal.minute ? `${goal.minute}' ` : ""}
                    {goal.scorer}
                    {goal.penalty ? " pen" : ""}
                    {goal.ownGoal ? " OG" : ""}
                  </span>
                ))}
              </div>
            ) : match.homeScore + match.awayScore > 0 ? (
              <p className="mt-3 rounded-2xl bg-stadium px-3 py-2 text-xs font-bold text-[#10131a]/52">
                Scorer data pending from source.
              </p>
            ) : null}
          </article>
        ))}
      </div>
      {pageCount > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-black text-[#10131a]/50">
            Showing {pageStart + 1}-{Math.min(pageStart + pageSize, history.length)} of{" "}
            {history.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              className="rounded-full bg-[#10131a]/5 px-3 py-2 text-xs font-black text-[#10131a]/64 transition hover:bg-[#10131a]/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage((current) => Math.max(0, current - 1))}
              type="button"
            >
              Prev
            </button>
            <span className="rounded-full bg-white px-3 py-2 text-xs font-black text-[#10131a]/60">
              {page + 1} / {pageCount}
            </span>
            <button
              className="rounded-full bg-[#10131a]/5 px-3 py-2 text-xs font-black text-[#10131a]/64 transition hover:bg-[#10131a]/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={page === pageCount - 1}
              onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function WorldCupStoryPanel({ story }: { story: string }) {
  return (
    <div className="mt-4 rounded-[20px] bg-white p-4">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
        World Cup story
      </h2>
      <p className="mt-4 text-sm leading-7 text-[#10131a]/62">{story}</p>
    </div>
  );
}

function resultClass(result: RecentTeamMatch["result"]) {
  if (result === "W") {
    return "bg-emerald-100 text-emerald-800";
  }

  if (result === "L") {
    return "bg-red-100 text-red-800";
  }

  return "bg-sky-100 text-sky-800";
}
