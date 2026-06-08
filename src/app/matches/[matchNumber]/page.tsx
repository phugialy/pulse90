import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MatchTeamTabs } from "@/components/match-team-tabs";
import { PageIntro, StatusPill } from "@/components/ui";
import {
  getMatchCenter,
  type MatchCenterGroupRow,
} from "@/lib/pulse90-data";
import { CalendarDays, Clock3, MapPin, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}) {
  const { matchNumber } = await params;
  const { awayTeam, groupTable, homeTeam, match } = await getMatchCenter(matchNumber);

  if (!match) {
    notFound();
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
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

            <div className="mt-6 flex flex-wrap gap-2">
              {match.date ? <StatusPill icon={CalendarDays}>{match.date}</StatusPill> : null}
              <StatusPill icon={Clock3}>{match.minute ?? match.time}</StatusPill>
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
          </section>

          <MatchTeamTabs awayTeam={awayTeam} homeTeam={homeTeam} />
        </section>

        <aside className="min-w-0 space-y-5">
          <GroupTable group={match.group} rows={groupTable} />
          <section className="rounded-[24px] border border-lime-200/20 bg-lime-300 p-5 text-black">
            <p className="text-sm font-black uppercase tracking-[0.18em]">
              Why it matters
            </p>
            <p className="mt-4 text-2xl font-black leading-tight">
              {match.reason}
            </p>
          </section>
        </aside>
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
