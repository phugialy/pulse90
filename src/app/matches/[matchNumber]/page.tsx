import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { MatchTeamTabs } from "@/components/match-team-tabs";
import { WhoWinsVote } from "@/components/who-wins-vote";
import { LiveRefresh } from "@/components/live-refresh";
import { PageIntro, StatusPill, WhereToWatch } from "@/components/ui";
import { Sparkles } from "lucide-react";
import {
  getMatchCenter,
  type MatchCenterGroupRow,
  type MatchEvent,
  type MatchPredictions,
} from "@/lib/pulse90-data";
import { CalendarDays, Clock3, MapPin, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}): Promise<Metadata> {
  const { matchNumber } = await params;
  const { match } = await getMatchCenter(matchNumber);
  if (!match) return {};
  const score = match.score ? ` ${match.score} ` : " vs ";
  const title = `${match.home}${score}${match.away} · ${match.group}`;
  const description = match.stakes ?? `${match.home} vs ${match.away} — World Cup 2026 match center with live score, lineups, and group context.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
    alternates: { canonical: `/matches/${matchNumber}` },
  };
}

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}) {
  const { matchNumber } = await params;
  const { awayTeam, awayTeamId, events, fixtureId, groupTable, homeTeam, homeTeamId, match, predictions, voteTally } =
    await getMatchCenter(matchNumber);

  if (!match) {
    notFound();
  }

  return (
    <AppShell>
      <LiveRefresh isLive={match.status === "live"} />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Main 2-column grid */}
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="min-w-0 space-y-5">
            <PageIntro
              kicker={`${match.group} / Match #${match.matchNumber}`}
              title={`${match.home} ${match.score ?? "vs"} ${match.away}`}
              detail={match.stakes}
            />

            <section
              className="overflow-hidden rounded-[28px] border border-[#10131a]/10 bg-white p-5 shadow-sm sm:p-6"
              style={{
                background: matchBackdrop(
                  homeTeam?.slug ?? match.homeSlug,
                  awayTeam?.slug ?? match.awaySlug,
                ),
              }}
            >
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <MatchTeamFace
                  flagAssetUrl={homeTeam?.flagAssetUrl ?? match.homeFlagAssetUrl}
                  flagEmoji={homeTeam?.flagEmoji ?? match.homeFlagEmoji}
                  name={match.home}
                  slug={homeTeam?.slug ?? match.homeSlug}
                />
                <span className="text-center text-2xl font-black text-cobalt sm:text-4xl">
                  {match.score ?? "vs"}
                </span>
                <MatchTeamFace
                  align="right"
                  flagAssetUrl={awayTeam?.flagAssetUrl ?? match.awayFlagAssetUrl}
                  flagEmoji={awayTeam?.flagEmoji ?? match.awayFlagEmoji}
                  name={match.away}
                  slug={awayTeam?.slug ?? match.awaySlug}
                />
              </div>

              {/* Inline goal scorers + cards — shown for live and completed matches */}
              {events.length > 0 && (match.status === "live" || match.status === "completed") && (
                <InlineMatchEvents
                  events={events}
                  homeTeamId={homeTeamId}
                  awayTeamId={awayTeamId}
                  homeFlagEmoji={homeTeam?.flagEmoji ?? match.homeFlagEmoji}
                  awayFlagEmoji={awayTeam?.flagEmoji ?? match.awayFlagEmoji}
                />
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                {match.date ? <StatusPill icon={CalendarDays}>{match.date}</StatusPill> : null}
                <StatusPill icon={Clock3}>
                  {match.status === "completed" ? "FT" : (match.minute ?? match.time)}
                </StatusPill>
                <StatusPill icon={Trophy}>{formatStage(match.stage)}</StatusPill>
                <StatusPill icon={MapPin}>{match.venue}</StatusPill>
                <StatusPill icon={MapPin}>{match.place}</StatusPill>
              </div>

              <div className="mt-6 rounded-2xl bg-white/82 p-4 shadow-sm backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-cobalt">
                  Fixture note
                </p>
                <p className="mt-2 text-xl font-black leading-tight text-[#10131a]">
                  {match.implication}
                </p>
              </div>

              {(predictions.matchWinner || predictions.goalScorers.length > 0) && match.status !== "completed" && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-cobalt px-4 py-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-white/70" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {predictions.matchWinner && (
                        <span className="text-base font-black text-white">
                          Our call: {predictions.matchWinner}
                        </span>
                      )}
                      {predictions.goalScorers.length > 0 && (
                        <span className="text-sm font-bold text-white/70">
                          Top players: {predictions.goalScorers.slice(0, 2).map((p) => p.label).join(" · ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {fixtureId && homeTeamId && awayTeamId && (
              <WhoWinsVote
                awayFlagEmoji={awayTeam?.flagEmoji ?? match.awayFlagEmoji}
                awayName={match.away}
                awayTeamId={awayTeamId}
                fixtureId={fixtureId}
                homeFlagEmoji={homeTeam?.flagEmoji ?? match.homeFlagEmoji}
                homeName={match.home}
                homeTeamId={homeTeamId}
                initialTally={voteTally}
                status={match.status}
              />
            )}

          </section>

          <aside className="min-w-0 space-y-5">
            {match.status === "live" && <WhereToWatch />}
            <GroupTable group={match.group} rows={groupTable} />
            <section className="rounded-[24px] border border-lime-200/20 bg-lime-300 p-5 text-black">
              <p className="text-sm font-black uppercase tracking-[0.18em]">
                Why it matters
              </p>
              <p className="mt-4 text-2xl font-black leading-tight">
                {match.reason}
              </p>
            </section>
            {(predictions.matchWinner || predictions.goalScorers.length > 0 || predictions.cardWatch.length > 0) && (
              <MatchPredictionsPanel events={events} predictions={predictions} status={match.status} />
            )}
          </aside>
        </div>

        {/* Full-width team lineup / formation section */}
        <div className="mt-5">
          <MatchTeamTabs
            awayTeam={awayTeam}
            awayTeamId={awayTeamId}
            events={events}
            homeTeam={homeTeam}
            homeTeamId={homeTeamId}
          />
        </div>
      </div>
    </AppShell>
  );
}

function matchBackdrop(homeSlug?: string | null, awaySlug?: string | null) {
  const home = teamColor(homeSlug);
  const away = teamColor(awaySlug);

  return `linear-gradient(135deg, ${home} 0%, rgba(255,255,255,0.94) 38%, rgba(255,255,255,0.94) 62%, ${away} 100%)`;
}

function teamColor(slug?: string | null) {
  const colors: Record<string, string> = {
    argentina: "rgba(117, 190, 219, 0.24)",
    belgium: "rgba(239, 68, 68, 0.18)",
    brazil: "rgba(34, 197, 94, 0.2)",
    canada: "rgba(220, 38, 38, 0.16)",
    czechia: "rgba(37, 99, 235, 0.16)",
    england: "rgba(239, 68, 68, 0.12)",
    france: "rgba(37, 99, 235, 0.18)",
    germany: "rgba(250, 204, 21, 0.2)",
    japan: "rgba(220, 38, 38, 0.13)",
    mexico: "rgba(22, 163, 74, 0.2)",
    morocco: "rgba(220, 38, 38, 0.15)",
    netherlands: "rgba(249, 115, 22, 0.18)",
    portugal: "rgba(22, 163, 74, 0.18)",
    "south-africa": "rgba(250, 204, 21, 0.22)",
    "south-korea": "rgba(59, 130, 246, 0.16)",
    spain: "rgba(250, 204, 21, 0.22)",
    "united-states": "rgba(37, 99, 235, 0.16)",
    usa: "rgba(37, 99, 235, 0.16)",
  };

  return colors[slug ?? ""] ?? "rgba(11, 92, 255, 0.12)";
}

function MatchTeamFace({
  align = "left",
  flagAssetUrl,
  flagEmoji,
  name,
  slug,
}: {
  align?: "left" | "right";
  flagAssetUrl?: string | null;
  flagEmoji?: string;
  name: string;
  slug?: string | null;
}) {
  const content = (
    <>
      <span className="inline-grid size-16 place-items-center overflow-hidden rounded-2xl bg-stadium sm:size-20">
        {flagAssetUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={`${name} flag`} className="h-full w-full object-cover" src={flagAssetUrl} />
        ) : (
          <span className="text-3xl">{flagEmoji ?? ""}</span>
        )}
      </span>
      <span className="mt-2 block truncate text-2xl font-black tracking-tight text-[#10131a] sm:text-4xl">
        {name}
      </span>
    </>
  );

  return slug ? (
    <Link className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`} href={`/teams/${slug}`}>
      {content}
    </Link>
  ) : (
    <div className={`min-w-0 ${align === "right" ? "text-right" : "text-left"}`}>
      {content}
    </div>
  );
}

function GroupTable({ group, rows }: { group: string; rows: MatchCenterGroupRow[] }) {
  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
        {group} table
      </h2>
      <div className="mt-5 space-y-3">
        {rows.length ? (
          rows.map((row) => (
            <Link
              className="grid grid-cols-[24px_32px_1fr_36px_40px_40px] items-center gap-2 rounded-2xl bg-stadium p-3 text-sm transition hover:bg-cobalt/10"
              href={`/teams/${row.slug}`}
              key={row.slug}
            >
              <span className="font-black text-[#10131a]/45">{row.rank}</span>
              <span className="grid size-7 place-items-center overflow-hidden rounded-lg bg-white">
                {row.flagAssetUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={`${row.name} flag`} className="h-full w-full object-cover" src={row.flagAssetUrl} />
                ) : (
                  <span>{row.flagEmoji}</span>
                )}
              </span>
              <span className="truncate font-black text-[#10131a]">{row.name}</span>
              <span className="text-xs font-bold text-[#10131a]/45">P{row.played}</span>
              <span className="text-[#10131a]/55">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </span>
              <span className="font-black text-cobalt">{row.points}</span>
            </Link>
          ))
        ) : (
          <p className="rounded-2xl bg-stadium p-4 text-sm font-bold text-[#10131a]/58">
            Group table is not loaded yet.
          </p>
        )}
      </div>
    </section>
  );
}

function formatStage(stage: string) {
  return stage === "group" ? "Group stage" : stage;
}

function MatchPredictionsPanel({
  events,
  predictions,
  status,
}: {
  events: MatchEvent[];
  predictions: MatchPredictions;
  status: string;
}) {
  // Names of players who actually scored (lowercased for fuzzy match)
  const actualScorers = new Set(
    events
      .filter((e) => e.eventType === "goal" || e.eventType === "penalty_goal")
      .map((e) => e.title.toLowerCase()),
  );
  const actualCarded = new Set(
    events
      .filter((e) => e.eventType === "yellow_card" || e.eventType === "red_card")
      .map((e) => e.title.toLowerCase()),
  );

  const isLiveOrDone = status === "live" || status === "completed";

  function hitGoal(name: string) {
    if (!isLiveOrDone) return false;
    const n = name.toLowerCase();
    return actualScorers.has(n) || [...actualScorers].some((s) => s.includes(n) || n.includes(s));
  }
  function hitCard(name: string) {
    if (!isLiveOrDone) return false;
    const n = name.toLowerCase();
    return actualCarded.has(n) || [...actualCarded].some((s) => s.includes(n) || n.includes(s));
  }

  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#10131a]/60">
        Pre-match predictions
      </p>
      {predictions.matchWinner && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-cobalt/8 px-3 py-2">
          <Sparkles className="size-3.5 shrink-0 text-cobalt" />
          <p className="text-xs font-black text-cobalt">Our call: {predictions.matchWinner}</p>
        </div>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4">
        {predictions.goalScorers.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-cobalt">
              Likely to score
            </p>
            <ol className="space-y-1.5">
              {predictions.goalScorers.map((p, i) => {
                const correct = hitGoal(p.label);
                return (
                  <li
                    key={i}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold transition ${
                      correct
                        ? "bg-emerald-50 text-emerald-700"
                        : "text-[#10131a]"
                    }`}
                  >
                    <span className="w-3 shrink-0 text-[#10131a]/35">{i + 1}.</span>
                    <span className="flex-1">{p.label}</span>
                    {correct && <span className="text-emerald-500">✓</span>}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        {predictions.cardWatch.length > 0 && (
          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
              Card watch
            </p>
            <ol className="space-y-1.5">
              {predictions.cardWatch.map((p, i) => {
                const correct = hitCard(p.label);
                return (
                  <li
                    key={i}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-bold transition ${
                      correct
                        ? "bg-amber-50 text-amber-700"
                        : "text-[#10131a]"
                    }`}
                  >
                    <span className="w-3 shrink-0 text-[#10131a]/35">{i + 1}.</span>
                    <span className="flex-1">{p.label}</span>
                    {correct && <span className="text-amber-500">✓</span>}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </section>
  );
}

function eventIcon(eventType: string) {
  switch (eventType) {
    case "goal":
      return "⚽";
    case "own_goal":
      return "⚽";
    case "penalty_goal":
      return "⚽";
    case "yellow_card":
      return "🟨";
    case "red_card":
      return "🟥";
    default:
      return "•";
  }
}

function stripMinute(title: string) {
  return title.replace(/\s+\d+(?:\+\d+)?'$/, "").trim() || title;
}

function InlineMatchEvents({
  events,
  homeTeamId,
  awayTeamId,
  homeFlagEmoji,
  awayFlagEmoji,
}: {
  events: MatchEvent[];
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeFlagEmoji?: string;
  awayFlagEmoji?: string;
}) {
  const goals = events.filter(
    (e) => e.eventType === "goal" || e.eventType === "own_goal" || e.eventType === "penalty_goal",
  );
  const cards = events.filter(
    (e) => e.eventType === "yellow_card" || e.eventType === "red_card",
  );

  if (goals.length === 0 && cards.length === 0) return null;

  const homeGoals = goals.filter((e) => e.teamId === homeTeamId);
  const awayGoals = goals.filter((e) => e.teamId === awayTeamId);

  return (
    <div className="mt-5 space-y-3">
      {goals.length > 0 && (
        <div className="grid grid-cols-[1fr_1px_1fr] gap-x-3">
          <div className="space-y-1.5">
            {homeGoals.map((e, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm">
                {homeFlagEmoji && <span className="shrink-0 text-base leading-none">{homeFlagEmoji}</span>}
                <span className="shrink-0">⚽</span>
                <span className="font-black text-[#10131a]">{stripMinute(e.title)}</span>
                {e.eventType === "own_goal" && (
                  <span className="rounded-full bg-[#10131a]/8 px-1.5 py-0.5 text-[10px] font-black text-[#10131a]/50">OG</span>
                )}
                {e.eventType === "penalty_goal" && (
                  <span className="rounded-full bg-cobalt/10 px-1.5 py-0.5 text-[10px] font-black text-cobalt">PEN</span>
                )}
                <span className="ml-auto text-[11px] font-bold text-[#10131a]/40 tabular-nums">
                  {e.title.match(/\d+(?:\+\d+)?'$/)?.[0] ?? ""}
                </span>
              </div>
            ))}
          </div>
          <div className="bg-[#10131a]/10" />
          <div className="space-y-1.5">
            {awayGoals.map((e, i) => (
              <div key={i} className="flex items-center justify-end gap-1.5 text-sm">
                <span className="text-[11px] font-bold text-[#10131a]/40 tabular-nums">
                  {e.title.match(/\d+(?:\+\d+)?'$/)?.[0] ?? ""}
                </span>
                {e.eventType === "own_goal" && (
                  <span className="rounded-full bg-[#10131a]/8 px-1.5 py-0.5 text-[10px] font-black text-[#10131a]/50">OG</span>
                )}
                {e.eventType === "penalty_goal" && (
                  <span className="rounded-full bg-cobalt/10 px-1.5 py-0.5 text-[10px] font-black text-cobalt">PEN</span>
                )}
                <span className="font-black text-[#10131a]">{stripMinute(e.title)}</span>
                <span className="shrink-0">⚽</span>
                {awayFlagEmoji && <span className="shrink-0 text-base leading-none">{awayFlagEmoji}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      {cards.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-t border-[#10131a]/8 pt-3">
          {cards.map((e, i) => {
            const flag = e.teamId === homeTeamId ? homeFlagEmoji : e.teamId === awayTeamId ? awayFlagEmoji : null;
            return (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-full border border-[#10131a]/10 bg-stadium px-2.5 py-1 text-[11px] font-bold text-[#10131a]/70"
              >
                {flag && <span className="leading-none">{flag}</span>}
                {eventIcon(e.eventType)} {stripMinute(e.title)}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
