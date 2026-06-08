"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import type { DirectoryTeam } from "@/lib/pulse90-data";

type TeamsDirectoryProps = {
  teams: DirectoryTeam[];
};

const allRegion = "All";

export function TeamsDirectory({ teams }: TeamsDirectoryProps) {
  const [region, setRegion] = useState(allRegion);
  const [query, setQuery] = useState("");
  const regions = useMemo(
    () => [
      allRegion,
      ...Array.from(new Set(teams.map((team) => team.region))).sort((a, b) =>
        a.localeCompare(b),
      ),
    ],
    [teams],
  );
  const countsByRegion = useMemo(() => {
    const counts = new Map<string, number>([[allRegion, teams.length]]);
    for (const team of teams) {
      counts.set(team.region, (counts.get(team.region) ?? 0) + 1);
    }
    return counts;
  }, [teams]);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredTeams = teams.filter((team) => {
    const matchesRegion = region === allRegion || team.region === region;
    const matchesQuery =
      !normalizedQuery ||
      team.name.toLowerCase().includes(normalizedQuery) ||
      team.group.toLowerCase().includes(normalizedQuery) ||
      team.region.toLowerCase().includes(normalizedQuery);

    return matchesRegion && matchesQuery;
  });

  return (
    <div className="mt-6 grid gap-5 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-[24px] border border-[#10131a]/10 bg-white/88 p-4 shadow-sm lg:sticky lg:top-24 lg:self-start">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#10131a]/55">
          Region
        </h2>
        <div className="mt-4 grid gap-2">
          {regions.map((item) => (
            <button
              className={`flex items-center justify-between rounded-2xl px-3 py-2 text-left text-sm font-black transition ${
                region === item
                  ? "bg-[#10131a] text-white"
                  : "bg-[#10131a]/5 text-[#10131a]/64 hover:bg-[#10131a]/8"
              }`}
              key={item}
              onClick={() => setRegion(item)}
              type="button"
            >
              <span>{item}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] ${
                  region === item ? "bg-white/14 text-white/72" : "bg-white text-cobalt"
                }`}
              >
                {countsByRegion.get(item) ?? 0}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="min-w-0">
        <div className="rounded-[24px] border border-[#10131a]/10 bg-white/88 p-3 shadow-sm">
          <label className="flex items-center gap-3 rounded-2xl bg-stadium px-4 py-3">
            <Search className="size-5 shrink-0 text-cobalt" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#10131a] outline-none placeholder:text-[#10131a]/40"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search teams, groups, or regions"
              type="search"
              value={query}
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredTeams.map((team) => (
            <Link
              className="group flex min-h-[118px] items-center gap-4 rounded-[22px] border border-[#10131a]/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cobalt/40"
              href={`/teams/${team.slug}`}
              key={team.slug}
            >
              <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-stadium">
                {team.flagAssetUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={`${team.name} flag`}
                    className="h-full w-full object-cover"
                    src={team.flagAssetUrl}
                  />
                ) : (
                  <span className="text-2xl">{team.flagEmoji}</span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xl font-black text-[#10131a]">
                  {team.name}
                </span>
                <span className="mt-2 flex flex-wrap gap-2 text-xs font-black">
                  <span className="rounded-full bg-[#10131a]/5 px-2.5 py-1 text-cobalt">
                    {team.group}
                  </span>
                  <span className="rounded-full bg-[#10131a]/5 px-2.5 py-1 text-[#10131a]/54">
                    {team.region}
                  </span>
                </span>
              </span>
            </Link>
          ))}
        </div>

        {!filteredTeams.length ? (
          <p className="mt-4 rounded-[22px] border border-[#10131a]/10 bg-white p-5 text-sm font-bold text-[#10131a]/58">
            No teams match that filter.
          </p>
        ) : null}
      </section>
    </div>
  );
}
