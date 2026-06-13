import Link from "next/link";
import { ArrowUpRight, Sparkles, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageIntro } from "@/components/ui";
import { getPredictionsHub, type UpcomingMatchPrediction } from "@/lib/pulse90-data";

export const dynamic = "force-dynamic";

function FlagImg({
  src,
  emoji,
  alt,
}: {
  src: string | null | undefined;
  emoji: string;
  alt: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        className="h-5 w-7 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-[#10131a]/10"
        loading="lazy"
        src={src}
      />
    );
  }
  return <span className="text-base leading-none">{emoji}</span>;
}

export default async function PredictionsPage() {
  const { goldenBoot, upcomingMatches, tournamentPredictions } = await getPredictionsHub();

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageIntro
          kicker="Pulse90 predictions"
          title="Pattern-based picks for every match."
          detail="Player likelihood scores use position weights + WC event history. Match winner picks are editorial. Nothing here is a betting recommendation."
        />

        {/* Golden Boot */}
        <section className="mt-8">
          <div className="flex items-center gap-2">
            <Trophy className="size-4 text-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
              Golden boot watch
            </h2>
          </div>
          {goldenBoot.length > 0 ? (
            <div className="mt-4 overflow-hidden rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm">
              <div className="max-h-[440px] overflow-y-auto">
                {goldenBoot.map((entry, i) => (
                  <div
                    key={entry.name}
                    className="grid grid-cols-[28px_auto_1fr_auto] items-center gap-3 border-b border-[#10131a]/6 px-5 py-3 last:border-0"
                  >
                    <span
                      className={`text-sm font-black tabular-nums ${
                        i === 0
                          ? "text-amber-500"
                          : i === 1
                            ? "text-[#10131a]/55"
                            : i === 2
                              ? "text-amber-700/70"
                              : "text-[#10131a]/35"
                      }`}
                    >
                      {i + 1}
                    </span>
                    {entry.flagAssetUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt=""
                        className="h-4 w-[22px] shrink-0 rounded-[2px] object-cover shadow-sm ring-1 ring-[#10131a]/10"
                        src={entry.flagAssetUrl}
                      />
                    ) : (
                      <span className="text-sm leading-none">{entry.flagEmoji ?? "🏳"}</span>
                    )}
                    <span className="truncate font-black text-[#10131a]">{entry.name}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-700">
                      ⚽ {entry.goals}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-[#10131a]/10 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#10131a]/50">
                Goal data will populate as matches are played.
              </p>
            </div>
          )}
        </section>

        {/* Upcoming match predictions */}
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-cobalt" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
              Upcoming match predictions
            </h2>
          </div>
          {upcomingMatches.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {upcomingMatches.map((m) => (
                <MatchPredictionCard key={m.fixtureId} match={m} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-[24px] border border-[#10131a]/10 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold text-[#10131a]/50">
                No upcoming fixtures with predictions in the next 7 days. Run the predictions sync to generate picks.
              </p>
            </div>
          )}
        </section>

        {/* Tournament predictions */}
        {tournamentPredictions.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
              Tournament outlook
            </h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {tournamentPredictions.map((prediction) => {
                const Icon = prediction.tone === "up" ? TrendingUp : TrendingDown;
                return (
                  <article
                    className="rounded-[24px] border border-[#10131a]/10 bg-white p-5 shadow-sm"
                    key={prediction.subject}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#10131a]/42">
                      {prediction.label}
                    </p>
                    <h3 className="mt-4 text-2xl font-black text-[#10131a]">
                      {prediction.subject}
                    </h3>
                    <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#10131a]/5 px-3 py-1 text-sm font-black text-cobalt">
                      <Icon className="size-4" />
                      {prediction.movement}
                    </span>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function MatchPredictionCard({ match }: { match: UpcomingMatchPrediction }) {
  return (
    <Link
      href={`/matches/${match.matchNumber}`}
      className="group block rounded-[24px] border border-[#10131a]/10 bg-white p-5 shadow-sm transition hover:border-cobalt/30 hover:shadow-md"
    >
      {/* Teams */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <FlagImg src={match.homeFlagAssetUrl} emoji={match.homeFlagEmoji} alt={match.home} />
          <span className="font-black text-[#10131a]">{match.home}</span>
        </div>
        <span className="text-xs font-bold text-[#10131a]/35">vs</span>
        <div className="flex items-center gap-1.5">
          <FlagImg src={match.awayFlagAssetUrl} emoji={match.awayFlagEmoji} alt={match.away} />
          <span className="font-black text-[#10131a]">{match.away}</span>
        </div>
      </div>

      <p className="mt-1.5 text-xs font-bold text-[#10131a]/45">
        {match.date} · {match.time}
      </p>

      {/* Our call */}
      {match.matchWinner ? (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-cobalt/8 px-3 py-1.5">
          <Sparkles className="size-3 shrink-0 text-cobalt" />
          <p className="text-xs font-black text-cobalt">Our call: {match.matchWinner}</p>
        </div>
      ) : (
        <div className="mt-3 rounded-lg bg-[#10131a]/4 px-3 py-1.5">
          <p className="text-xs font-bold text-[#10131a]/40">No match winner pick yet</p>
        </div>
      )}

      {/* Goal scorers */}
      {match.goalScorers.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cobalt">
            Likely to score
          </p>
          <ol className="mt-1.5 space-y-1">
            {match.goalScorers.map((name, i) => (
              <li key={i} className="flex items-center gap-2 text-xs font-bold text-[#10131a]">
                <span className="w-3 shrink-0 text-[#10131a]/30">{i + 1}.</span>
                {name}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Card watch */}
      {match.cardWatch.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
            Card watch
          </p>
          <ol className="mt-1.5 space-y-1">
            {match.cardWatch.map((name, i) => (
              <li key={i} className="flex items-center gap-2 text-xs font-bold text-[#10131a]">
                <span className="w-3 shrink-0 text-[#10131a]/30">{i + 1}.</span>
                {name}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-4 flex items-center gap-1 text-xs font-black text-cobalt opacity-0 transition group-hover:opacity-100">
        Match center
        <ArrowUpRight className="size-3.5" />
      </div>
    </Link>
  );
}
