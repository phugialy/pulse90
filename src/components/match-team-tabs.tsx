"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, Users } from "lucide-react";
import type { MatchCenterTeam, RecentTeamMatch } from "@/lib/pulse90-data";

type MatchTeamTabsProps = {
  awayTeam: MatchCenterTeam | null;
  homeTeam: MatchCenterTeam | null;
};

export function MatchTeamTabs({ awayTeam, homeTeam }: MatchTeamTabsProps) {
  const teams = [homeTeam, awayTeam].filter((team): team is MatchCenterTeam =>
    Boolean(team),
  );
  const [activeSlug, setActiveSlug] = useState(teams[0]?.slug ?? "");
  const activeTeam = teams.find((team) => team.slug === activeSlug) ?? teams[0];

  if (!activeTeam) {
    return null;
  }

  return (
    <section className="min-w-0 rounded-[24px] border border-[#10131a]/10 bg-white/88 p-3 shadow-sm">
      <div className="grid grid-cols-2 gap-2 rounded-[20px] bg-[#10131a]/5 p-1">
        {teams.map((team) => {
          const active = team.slug === activeTeam.slug;
          const theme = teamTheme(team.slug);

          return (
            <button
              className={`min-w-0 rounded-2xl px-3 py-3 text-left transition ${
                active
                  ? "text-white shadow-sm"
                  : "border border-[#10131a]/8 bg-white/70 text-[#10131a]/58"
              }`}
              key={team.slug}
              onClick={() => setActiveSlug(team.slug)}
              style={{
                background: active
                  ? `linear-gradient(135deg, ${theme.dark}, ${theme.mid})`
                  : `linear-gradient(135deg, ${theme.soft}, rgba(255,255,255,0.86))`,
                borderColor: active ? theme.ring : undefined,
              }}
              type="button"
            >
              <span className="block truncate text-xs font-black uppercase tracking-[0.18em]">
                {team.group}
              </span>
              <span className="mt-1 block truncate text-lg font-black">
                {team.name}
              </span>
            </button>
          );
        })}
      </div>

      <TeamMatchPanel team={activeTeam} />
    </section>
  );
}

function TeamMatchPanel({ team }: { team: MatchCenterTeam }) {
  const theme = teamTheme(team.slug);

  return (
    <div
      className="mt-4 min-w-0 overflow-hidden rounded-[22px] border p-4"
      style={{
        background: `linear-gradient(160deg, ${theme.soft} 0%, rgba(255,255,255,0.94) 34%, rgba(255,255,255,0.9) 100%)`,
        borderColor: theme.ring,
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cobalt">
            {team.group}
          </p>
          <h2 className="mt-1 truncate text-2xl font-black text-[#10131a]">
            {team.name}
          </h2>
        </div>
        <Link
          className="shrink-0 rounded-full px-3 py-2 text-xs font-black text-white shadow-sm"
          href={`/teams/${team.slug}`}
          style={{ background: `linear-gradient(135deg, ${theme.dark}, ${theme.mid})` }}
        >
          Team
        </Link>
      </div>

      <HistoryBlock history={team.history} theme={theme} />
      <SquadBlock squad={team.squad} theme={theme} />
    </div>
  );
}

function HistoryBlock({
  history,
  theme,
}: {
  history: RecentTeamMatch[];
  theme: ReturnType<typeof teamTheme>;
}) {
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center gap-2">
        <Shield className="size-4 text-cobalt" />
        <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#10131a]/58">
          Last 4 matches
        </h3>
      </div>
      <div className="grid gap-2">
        {history.length ? (
          history.map((match) => (
            <article
              className="rounded-2xl border p-3"
              key={`${match.date}-${match.home}-${match.away}`}
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.72), ${teamThemeForHistory(theme)})`,
                borderColor: theme.ring,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-black text-[#10131a]/48">
                    {match.date} / {match.competition}
                  </p>
                  <p className="mt-1 truncate text-sm font-black text-[#10131a]">
                    {match.home} {match.homeScore}-{match.awayScore} {match.away}
                  </p>
                </div>
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-black ${resultClass(match.result)}`}>
                  {match.result}
                </span>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-stadium p-3 text-sm font-bold text-[#10131a]/56">
            Recent match history is not loaded yet.
          </p>
        )}
      </div>
    </div>
  );
}

function SquadBlock({
  squad,
  theme,
}: {
  squad: MatchCenterTeam["squad"];
  theme: ReturnType<typeof teamTheme>;
}) {
  return (
    <div className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-cobalt" />
          <h3 className="text-xs font-black uppercase tracking-[0.18em] text-[#10131a]/58">
            Players
          </h3>
        </div>
        <span className="rounded-full bg-[#10131a]/5 px-2.5 py-1 text-[11px] font-black text-cobalt">
          {squad.length}
        </span>
      </div>
      <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
        {squad.length ? (
          squad.map((player) => (
            <article
              className="grid grid-cols-[34px_42px_1fr] items-center gap-3 rounded-2xl border p-3 text-sm"
              key={`${player.shirtNumber}-${player.name}`}
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.68), ${teamThemeForHistory(theme)})`,
                borderColor: theme.ring,
              }}
            >
              <span className="font-mono text-xs font-black text-cobalt">
                {player.shirtNumber ?? "--"}
              </span>
              <span
                className={`rounded-full px-2 py-1 text-center text-[11px] font-black ${playerRoleClass(
                  player.positionCode,
                  player.position,
                )}`}
              >
                {player.positionCode}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-black text-[#10131a]">
                  {player.name}
                </span>
                <span className="block truncate text-xs font-bold text-[#10131a]/52">
                  {player.club}
                </span>
              </span>
            </article>
          ))
        ) : (
          <p className="rounded-2xl bg-stadium p-3 text-sm font-bold text-[#10131a]/56">
            Squad import has not been loaded for this team yet.
          </p>
        )}
      </div>
    </div>
  );
}

function teamTheme(slug: string) {
  const themes: Record<
    string,
    { dark: string; mid: string; ring: string; soft: string }
  > = {
    argentina: {
      dark: "#5aa7d8",
      mid: "#ffffff",
      ring: "rgba(90,167,216,0.28)",
      soft: "rgba(90,167,216,0.14)",
    },
    brazil: {
      dark: "#10843f",
      mid: "#f7d149",
      ring: "rgba(16,132,63,0.26)",
      soft: "rgba(16,132,63,0.13)",
    },
    canada: {
      dark: "#d71920",
      mid: "#991b1b",
      ring: "rgba(215,25,32,0.24)",
      soft: "rgba(215,25,32,0.1)",
    },
    czechia: {
      dark: "#11457e",
      mid: "#d7141a",
      ring: "rgba(17,69,126,0.22)",
      soft: "rgba(17,69,126,0.1)",
    },
    france: {
      dark: "#0b2f78",
      mid: "#e33d30",
      ring: "rgba(11,47,120,0.24)",
      soft: "rgba(11,47,120,0.11)",
    },
    germany: {
      dark: "#10131a",
      mid: "#d4a017",
      ring: "rgba(212,160,23,0.24)",
      soft: "rgba(212,160,23,0.12)",
    },
    japan: {
      dark: "#bc002d",
      mid: "#7f1d1d",
      ring: "rgba(188,0,45,0.2)",
      soft: "rgba(188,0,45,0.09)",
    },
    mexico: {
      dark: "#006847",
      mid: "#ce1126",
      ring: "rgba(0,104,71,0.24)",
      soft: "rgba(0,104,71,0.12)",
    },
    morocco: {
      dark: "#c1272d",
      mid: "#006233",
      ring: "rgba(193,39,45,0.22)",
      soft: "rgba(193,39,45,0.1)",
    },
    netherlands: {
      dark: "#f36c21",
      mid: "#123c7c",
      ring: "rgba(243,108,33,0.22)",
      soft: "rgba(243,108,33,0.11)",
    },
    portugal: {
      dark: "#006600",
      mid: "#c8102e",
      ring: "rgba(0,102,0,0.22)",
      soft: "rgba(0,102,0,0.1)",
    },
    "south-africa": {
      dark: "#007a4d",
      mid: "#ffb612",
      ring: "rgba(0,122,77,0.24)",
      soft: "rgba(0,122,77,0.12)",
    },
    "south-korea": {
      dark: "#003478",
      mid: "#c60c30",
      ring: "rgba(0,52,120,0.22)",
      soft: "rgba(0,52,120,0.1)",
    },
    spain: {
      dark: "#aa151b",
      mid: "#f1bf00",
      ring: "rgba(170,21,27,0.22)",
      soft: "rgba(170,21,27,0.1)",
    },
    "united-states": {
      dark: "#1f3f8b",
      mid: "#b31942",
      ring: "rgba(31,63,139,0.22)",
      soft: "rgba(31,63,139,0.1)",
    },
    usa: {
      dark: "#1f3f8b",
      mid: "#b31942",
      ring: "rgba(31,63,139,0.22)",
      soft: "rgba(31,63,139,0.1)",
    },
  };

  return (
    themes[slug] ?? {
      dark: "#10131a",
      mid: "#0b5cff",
      ring: "rgba(11,92,255,0.18)",
      soft: "rgba(11,92,255,0.09)",
    }
  );
}

function teamThemeForHistory(theme: ReturnType<typeof teamTheme>) {
  return theme.soft.replace(/0\.\d+\)/, "0.2)");
}

function playerRoleClass(code: string, position: string) {
  const label = `${code} ${position}`.toLowerCase();

  if (label.includes("gk") || label.includes("goal")) {
    return "bg-amber-200 text-amber-950";
  }

  if (
    label.includes("fw") ||
    label.includes("forward") ||
    label.includes("striker") ||
    label.includes("wing")
  ) {
    return "bg-red-100 text-red-800";
  }

  if (label.includes("mf") || label.includes("mid")) {
    return "bg-sky-100 text-sky-800";
  }

  if (label.includes("df") || label.includes("def")) {
    return "bg-emerald-100 text-emerald-800";
  }

  return "bg-white text-[#10131a]/62";
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
