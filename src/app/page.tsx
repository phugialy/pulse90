export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { InstallAppCta } from "@/components/install-app-cta";
import {
  GroupSnapshot,
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
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <section className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <PageIntro
              kicker="World Cup 2026 watch desk"
              title="Open once. Know what matters."
            />
            <div className="flex gap-2 rounded-full border border-[#10131a]/10 bg-white/88 shadow-sm p-1">
              <button className="rounded-full bg-white px-4 py-2 text-sm font-black text-black">
                My time
              </button>
              <button className="rounded-full px-4 py-2 text-sm font-bold text-[#10131a]/60">
                Venue time
              </button>
            </div>
          </div>

          <ResultsRibbon matches={dashboard.results} />
          <PriorityMatch match={priorityMatch} />
          <WatchFlow
            matches={dashboard.todayMatches}
            items={dashboard.tomorrowMatches}
          />
        </section>

        <aside className="min-w-0 space-y-5">
          <LiveStack matches={dashboard.liveMatches} />
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
