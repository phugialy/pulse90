import { AppShell } from "@/components/app-shell";
import { MatchCard, PageIntro } from "@/components/ui";
import { getFixtureExplorer } from "@/lib/pulse90-data";

const filters = ["All", "Live", "Today", "Group F", "Host cities", "High stakes"];

export default async function FixturesPage() {
  const { matches } = await getFixtureExplorer();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro
          kicker="Fixture explorer"
          title="Schedule without the homework."
          detail="Filter by status, group, team, and city. Each card keeps the stakes visible so the schedule does not become a plain list."
        />
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
          {filters.map((filter, index) => (
            <button
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-black ${
                index === 0
                  ? "bg-lime-300 text-black"
                  : "border border-[#10131a]/10 bg-white/88 shadow-sm text-[#10131a]/65"
              }`}
              key={filter}
            >
              {filter}
            </button>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <MatchCard match={match} key={match.matchNumber} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
