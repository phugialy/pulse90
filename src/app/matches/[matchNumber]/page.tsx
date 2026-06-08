import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { PageIntro, StatusPill } from "@/components/ui";
import { standings } from "@/lib/mock-data";
import { getMatchCenter } from "@/lib/pulse90-data";
import { CalendarDays, Clock3, Flame, MapPin, Radio, Trophy } from "lucide-react";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchNumber: string }>;
}) {
  const { matchNumber } = await params;
  const { match } = await getMatchCenter(matchNumber);

  if (!match) {
    notFound();
  }

  return (
    <AppShell>
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <section className="space-y-5">
          <PageIntro
            kicker={`${match.group} / Match ${match.matchNumber}`}
            title={`${match.home} ${match.score ?? "vs"} ${match.away}`}
            detail={match.stakes}
          />
          <section className="rounded-[28px] border border-[#10131a]/10 bg-white shadow-sm p-6">
            <div className="flex flex-wrap gap-2">
              <StatusPill icon={match.status === "live" ? Radio : Clock3}>
                {match.minute ?? match.time}
              </StatusPill>
              {match.date ? (
                <StatusPill icon={CalendarDays}>{match.date}</StatusPill>
              ) : null}
              <StatusPill icon={Trophy}>{match.stage}</StatusPill>
              <StatusPill icon={MapPin}>{match.venue}</StatusPill>
              <StatusPill icon={MapPin}>{match.place}</StatusPill>
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-cobalt">
              Result consequences
            </p>
            <p className="mt-3 text-2xl font-black leading-tight text-[#10131a]">
              {match.implication}
            </p>
          </section>
          <section className="rounded-[24px] border border-[#10131a]/10 bg-white/88 shadow-sm p-5">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-cobalt" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
                Turning points
              </h2>
            </div>
            <div className="mt-5 space-y-4">
              {["Early press forced Germany wide", "Japan equalizer changed the live table", "Tunisia goal raised the pressure on this result"].map((event) => (
                <p className="rounded-2xl bg-stadium p-4 text-sm font-bold leading-6 text-[#10131a]/70" key={event}>
                  {event}
                </p>
              ))}
            </div>
          </section>
        </section>
        <aside className="space-y-5">
          <section className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
              Group F live table
            </h2>
            <div className="mt-5 space-y-3">
              {standings.map((row) => (
                <div className="grid grid-cols-[24px_1fr_40px_40px] items-center gap-3 rounded-2xl bg-stadium p-3 text-sm" key={row.team}>
                  <span className="font-black text-[#10131a]/45">{row.rank}</span>
                  <span className="font-black text-[#10131a]">{row.team}</span>
                  <span className="text-[#10131a]/55">{row.gd > 0 ? `+${row.gd}` : row.gd}</span>
                  <span className="font-black text-cobalt">{row.points}</span>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[24px] border border-lime-200/20 bg-lime-300 p-5 text-black">
            <p className="text-sm font-black uppercase tracking-[0.18em]">
              Why it matters
            </p>
            <p className="mt-4 text-2xl font-black leading-tight">
              {match.reason}. This is the match that changes what everyone checks next.
            </p>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}
