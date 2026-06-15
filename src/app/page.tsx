export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { CountdownClock } from "@/components/countdown-clock";
import { InstallAppCta } from "@/components/install-app-cta";
import { LiveRefresh } from "@/components/live-refresh";
import { WhoWinsVote } from "@/components/who-wins-vote";
import {
  GroupSnapshot,
  LiveMatchBoard,
  LiveStack,
  PageIntro,
  PredictionStrip,
  PriorityMatch,
  ResultsRibbon,
  WatchFlow,
} from "@/components/ui";
import { getTodayDashboard } from "@/lib/pulse90-data";

export default async function Home() {
  const dashboard = await getTodayDashboard();
  const priorityMatch = dashboard.liveMatches[0] ?? dashboard.todayMatches[0];

  return (
    <AppShell>
      <LiveRefresh isLive={dashboard.liveMatches.length > 0} />
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <section className="min-w-0 space-y-5">
          <PageIntro
            kicker="World Cup 2026 watch desk"
            title="Open once. Know what matters."
          />

          {dashboard.liveBoardMatches.length > 0 && (
            <LiveMatchBoard matches={dashboard.liveBoardMatches} />
          )}

          <ResultsRibbon matches={dashboard.results} />
          {dashboard.nextMatch && dashboard.liveMatches.length === 0 && (
            <div className="lg:hidden">
              <CountdownClock
                away={dashboard.nextMatch.away}
                awayFlagAssetUrl={dashboard.nextMatch.awayFlagAssetUrl}
                awayFlagEmoji={dashboard.nextMatch.awayFlagEmoji}
                home={dashboard.nextMatch.home}
                homeFlagAssetUrl={dashboard.nextMatch.homeFlagAssetUrl}
                homeFlagEmoji={dashboard.nextMatch.homeFlagEmoji}
                matchNumber={dashboard.nextMatch.matchNumber}
                target={dashboard.nextMatch.startsAt}
              />
            </div>
          )}
          <PriorityMatch match={priorityMatch} matchWinner={dashboard.priorityMatchWinner} heroLive={dashboard.heroLive} />

          {priorityMatch?.fixtureId &&
            priorityMatch.homeTeamId &&
            priorityMatch.awayTeamId && (
              <WhoWinsVote
                awayFlagEmoji={priorityMatch.awayFlagEmoji}
                awayName={priorityMatch.away}
                awayTeamId={priorityMatch.awayTeamId}
                fixtureId={priorityMatch.fixtureId}
                homeFlagEmoji={priorityMatch.homeFlagEmoji}
                homeName={priorityMatch.home}
                homeTeamId={priorityMatch.homeTeamId}
                initialTally={dashboard.priorityMatchTally}
                status={priorityMatch.status}
              />
            )}

          <WatchFlow
            matches={dashboard.todayMatches}
            items={dashboard.tomorrowMatches}
          />
        </section>

        <aside className="min-w-0 space-y-5">
          <LiveStack matches={dashboard.liveMatches} />
          {dashboard.nextMatch && dashboard.liveMatches.length === 0 && (
            <div className="hidden lg:block">
              <CountdownClock
                away={dashboard.nextMatch.away}
                awayFlagAssetUrl={dashboard.nextMatch.awayFlagAssetUrl}
                awayFlagEmoji={dashboard.nextMatch.awayFlagEmoji}
                home={dashboard.nextMatch.home}
                homeFlagAssetUrl={dashboard.nextMatch.homeFlagAssetUrl}
                homeFlagEmoji={dashboard.nextMatch.homeFlagEmoji}
                matchNumber={dashboard.nextMatch.matchNumber}
                target={dashboard.nextMatch.startsAt}
              />
            </div>
          )}
          <GroupSnapshot groups={dashboard.activeGroups} />
          <InstallAppCta />
          {dashboard.predictions.length > 0 && (
            <PredictionStrip items={dashboard.predictions.slice(0, 3)} />
          )}
        </aside>
      </div>
    </AppShell>
  );
}
