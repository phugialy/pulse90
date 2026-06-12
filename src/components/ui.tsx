import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Flame,
  MapPin,
  Radio,
  Shield,
  Sparkles,
  Tv,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  liveMatches,
  predictions,
  teams,
  todayMatches,
  tomorrowMatches,
  updates,
  type Match,
  type Prediction,
  type Team,
} from "@/lib/mock-data";
import type { ActiveGroup } from "@/lib/pulse90-data";

function FlagImg({
  src,
  emoji,
  alt,
}: {
  src: string | null | undefined;
  emoji: string | undefined;
  alt: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={alt}
        className="h-4 w-6 shrink-0 rounded-[3px] object-cover shadow-sm ring-1 ring-[#10131a]/10"
        loading="lazy"
        src={src}
      />
    );
  }
  return <span className="text-base leading-none">{emoji ?? "🏳"}</span>;
}

export function StatusPill({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#10131a]/10 bg-white px-3 py-1 text-xs font-bold text-[#10131a]/75 shadow-sm">
      <Icon className="size-3.5 text-cobalt" />
      {children}
    </span>
  );
}

export function PageIntro({
  kicker,
  title,
  detail,
}: {
  kicker: string;
  title: string;
  detail?: string;
}) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.22em] text-cobalt">
        {kicker}
      </p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-[#10131a] sm:text-5xl">
        {title}
      </h1>
      {detail ? (
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#10131a]/58 sm:text-base">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export function PriorityMatch({
  match = liveMatches[0],
  matchWinner = null,
}: {
  match?: Match;
  matchWinner?: string | null;
}) {
  const isLive = match.status === "live";
  const centerText = match.score ?? "vs";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#10131a]/10 bg-white p-5 shadow-[0_24px_70px_rgba(25,45,88,0.12)] sm:p-7">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-lime-300 via-cobalt to-coral" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusPill icon={isLive ? Radio : Clock3}>
          {isLive ? "Live command pick" : "Next priority match"}
        </StatusPill>
        <span className="rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-black">
          {match.heat} heat
        </span>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_240px] xl:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <FlagImg src={match.homeFlagAssetUrl} emoji={match.homeFlagEmoji} alt={match.home} />
            <FlagImg src={match.awayFlagAssetUrl} emoji={match.awayFlagEmoji} alt={match.away} />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-cobalt">
            {match.reason}
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
            <h2 className="text-5xl font-black leading-none tracking-tight text-[#10131a] sm:text-6xl">
              {match.home}
            </h2>
            <span className="pb-2 text-4xl font-black tabular-nums text-cobalt sm:text-5xl">
              {centerText}
            </span>
            <h2 className="text-5xl font-black leading-none tracking-tight text-[#10131a] sm:text-6xl">
              {match.away}
            </h2>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {match.date ? (
              <StatusPill icon={CalendarDays}>{match.date}</StatusPill>
            ) : null}
            <StatusPill icon={Clock3}>{match.minute ?? match.time}</StatusPill>
            <StatusPill icon={Trophy}>{match.group}</StatusPill>
            <StatusPill icon={MapPin}>{match.place}</StatusPill>
          </div>
        </div>

        <div className="rounded-2xl border border-[#10131a]/10 bg-stadium p-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#10131a]/45">
            Why this one
          </p>
          <p className="mt-3 text-lg font-bold leading-snug text-[#10131a]">
            {match.stakes}
          </p>
          <div className="mt-4 rounded-2xl bg-white p-3 text-sm font-bold leading-6 text-[#10131a]/68">
            <p>
              {match.date ? `${match.date} at ` : ""}
              {match.time}
            </p>
            <p>{match.venue}</p>
            <p>{match.place}</p>
          </div>
          {matchWinner && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-cobalt px-3 py-2.5">
              <Sparkles className="size-4 shrink-0 text-white/70" />
              <p className="text-sm font-black text-white">
                Our call: {matchWinner}
              </p>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center gap-2 rounded-full bg-[#10131a] px-4 text-sm font-black text-white transition hover:bg-cobalt"
              href={`/matches/${match.matchNumber}`}
            >
              Match center
              <ArrowUpRight className="size-4" />
            </Link>
            {isLive && (
              <a
                className="inline-flex h-10 items-center gap-2 rounded-full border border-cobalt/30 bg-cobalt/8 px-4 text-sm font-black text-cobalt transition hover:bg-cobalt hover:text-white"
                href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026"
                rel="noopener noreferrer"
                target="_blank"
              >
                <Tv className="size-4" />
                Watch live
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LiveStack({ matches = liveMatches }: { matches?: Match[] }) {
  const sideMatches = matches.slice(1);

  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white/88 shadow-sm p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
          Other live
        </h2>
        <Radio className="size-4 text-coral" />
      </div>
      {!matches.length ? (
        <div className="rounded-2xl border border-[#10131a]/10 bg-stadium p-4">
          <p className="text-lg font-black text-[#10131a]">No matches live yet.</p>
          <p className="mt-2 text-sm leading-6 text-[#10131a]/58">
            The command center will switch on once the tournament kicks off.
          </p>
        </div>
      ) : null}
      <div className="space-y-3">
        {sideMatches.map((match) => (
          <div key={`${match.home}-${match.away}`} className="rounded-2xl border border-[#10131a]/10 bg-stadium p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-[#10131a]/60">{match.minute}</p>
              <p className="rounded-full bg-[#10131a]/5 px-2.5 py-1 text-xs font-bold text-[#10131a]/70">
                {match.reason}
              </p>
            </div>
            <Link href={`/matches/${match.matchNumber}`}>
              <p className="mt-3 text-xl font-black text-[#10131a] transition hover:text-cobalt">
                {match.home}{" "}
                <span className="font-mono text-cobalt">{match.score}</span>{" "}
                {match.away}
              </p>
            </Link>
            <p className="mt-2 text-sm leading-6 text-[#10131a]/62">{match.stakes}</p>
            <div className="mt-3 flex gap-2">
              <Link
                href={`/matches/${match.matchNumber}`}
                className="inline-flex items-center rounded-full border border-[#10131a]/10 bg-white px-3 py-1.5 text-xs font-black text-[#10131a]/70 transition hover:border-cobalt/30 hover:text-cobalt"
              >
                Match center
              </Link>
              <a
                href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-cobalt px-3 py-1.5 text-xs font-black text-white transition hover:bg-cobalt/80"
              >
                <Tv className="size-3" />
                Watch
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const WATCH_LINKS = [
  { label: "FIFA+",      url: "https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026", note: "Free · Global" },
  { label: "Fox Sports", url: "https://www.foxsports.com/soccer/fifa-world-cup",                               note: "USA · English" },
  { label: "Peacock",    url: "https://www.peacocktv.com",                                                     note: "USA · Streaming" },
  { label: "Telemundo",  url: "https://www.telemundo.com/en-vivo",                                             note: "USA · Spanish" },
  { label: "CTV",        url: "https://www.ctv.ca/live",                                                       note: "Canada" },
  { label: "TSN",        url: "https://www.tsn.ca/watch",                                                      note: "Canada" },
  { label: "TV Azteca",  url: "https://aztecadeportes.com/en-vivo",                                            note: "Mexico" },
];

export function WhereToWatch() {
  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Tv className="size-4 text-cobalt" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
          Where to watch
        </h2>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-coral/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-coral">
          <Radio className="size-3" />
          Live now
        </span>
      </div>
      <ul className="mt-4 space-y-1">
        {WATCH_LINKS.map((s) => (
          <li key={s.label}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 transition hover:bg-cobalt/5"
            >
              <div>
                <p className="text-sm font-black text-[#10131a]">{s.label}</p>
                <p className="text-xs font-bold text-[#10131a]/45">{s.note}</p>
              </div>
              <ArrowUpRight className="size-4 shrink-0 text-cobalt" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MatchCard({ match }: { match: Match }) {
  return (
    <Link
      className="block rounded-[22px] border border-[#10131a]/10 bg-white shadow-sm p-4 transition hover:-translate-y-0.5 hover:border-cobalt/40"
      href={`/matches/${match.matchNumber}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#10131a]/60">
          {match.date ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stadium px-2.5 py-1">
              <CalendarDays className="size-3.5 text-cobalt" />
              {match.date}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-stadium px-2.5 py-1">
            <Clock3 className="size-3.5 text-cobalt" />
            {match.minute ?? match.time}
          </span>
        </div>
        <span className="rounded-full bg-[#10131a]/5 px-3 py-1 text-xs font-black text-[#10131a]/70">
          {match.tag}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-black tracking-tight text-[#10131a]">
        {match.home} vs {match.away}
      </h3>
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-[#10131a]/55">
        <span>{match.group}</span>
        <span>/</span>
        <span>{match.place}</span>
      </div>
      <div className="mt-3 rounded-2xl bg-stadium p-3 text-sm font-bold leading-6 text-[#10131a]/68">
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-cobalt" />
          <div>
            <p className="text-[#10131a]">{match.venue}</p>
            <p>{match.place}</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm font-bold leading-6 text-[#10131a]">
        {match.stakes}
      </p>
      <p className="mt-3 border-l border-cobalt/50 pl-3 text-sm leading-6 text-[#10131a]/60">
        {match.implication}
      </p>
    </Link>
  );
}

export function TodayWatchList({ matches = todayMatches }: { matches?: Match[] }) {
  const scheduledMatches = matches.filter((match) => match.status !== "live");

  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white/88 shadow-sm p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-cobalt" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
            Upcoming match list
          </h2>
        </div>
        <span className="text-sm font-bold text-[#10131a]/45">
          {matches.length} matches tracked
        </span>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {scheduledMatches.map((match) => (
          <MatchCard match={match} key={match.matchNumber} />
        ))}
      </div>
    </section>
  );
}

export function UpdateFeed({
  compact = false,
  items = updates,
}: {
  compact?: boolean;
  items?: typeof updates;
}) {
  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-cobalt" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
          What changed
        </h2>
      </div>
      <div className="mt-5 space-y-4">
        {items.slice(0, compact ? 3 : items.length).map((update) => (
          <article
            className="border-b border-[#10131a]/10 pb-4 last:border-0 last:pb-0"
            key={update.title}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cobalt">
              {update.label}
            </p>
            <h3 className="mt-2 font-black text-[#10131a]">{update.title}</h3>
            <p className="mt-1 text-sm leading-6 text-[#10131a]/58">
              {update.detail}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function TeamPathPanel({ items = teams.slice(0, 3) }: { items?: Team[] }) {
  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2">
        <Shield className="size-4 text-cobalt" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
          Team paths
        </h2>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((team) => (
          <Link
            className="block rounded-2xl bg-stadium p-4 transition hover:bg-cobalt/10"
            href={`/teams/${team.slug}`}
            key={team.name}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black text-[#10131a]">{team.name}</h3>
              <span className="text-xs font-bold text-cobalt">
                {team.status}
              </span>
            </div>
            <p className="mt-2 text-sm font-bold text-[#10131a]/72">{team.next}</p>
            <p className="mt-2 text-sm leading-6 text-[#10131a]/56">{team.need}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function TomorrowPreview({ items = tomorrowMatches }: { items?: typeof tomorrowMatches }) {
  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4 text-cobalt" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
          Watch windows
        </h2>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <article
            className="rounded-2xl border border-[#10131a]/10 bg-stadium p-4"
            key={item.slot}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cobalt">
              {item.slot}
            </p>
            <h3 className="mt-3 text-lg font-black text-[#10131a]">{item.match}</h3>
            <p className="mt-1 text-sm font-bold text-[#10131a]/45">
              {"date" in item && item.date ? `${item.date} / ` : ""}
              {item.time}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#10131a]/58">{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function WatchFlow({
  matches = todayMatches,
  items = tomorrowMatches,
}: {
  matches?: Match[];
  items?: typeof tomorrowMatches;
}) {
  const scheduledMatches = matches.filter((match) => match.status !== "live");

  return (
    <section className="min-w-0 rounded-[24px] border border-[#10131a]/10 bg-[#f8faf4]/90 p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Flame className="size-4 text-cobalt" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
            Upcoming watch flow
          </h2>
        </div>
        <span className="rounded-full bg-[#10131a]/5 px-3 py-1 text-xs font-black text-[#10131a]/55">
          {matches.length} matches loaded
        </span>
      </div>

      <div className="-mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:-mx-5 sm:px-5">
        {scheduledMatches.slice(0, 8).map((match, index) => (
          <Link
            aria-label={`Open ${match.home} vs ${match.away} match center`}
            className="group flex min-h-[270px] w-[248px] shrink-0 snap-start flex-col rounded-[22px] border border-[#10131a]/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cobalt/45 sm:w-[272px]"
            href={`/matches/${match.matchNumber}`}
            key={match.matchNumber}
          >
            <div className="flex flex-wrap gap-2 text-xs font-bold text-[#10131a]/60">
              {match.date ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-stadium px-2.5 py-1">
                  <CalendarDays className="size-3.5 text-cobalt" />
                  {match.date}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full bg-stadium px-2.5 py-1">
                <Clock3 className="size-3.5 text-cobalt" />
                {match.minute ?? match.time}
              </span>
            </div>

            <span className="mt-3 w-fit rounded-full bg-[#10131a]/5 px-2.5 py-1 text-[11px] font-black text-[#10131a]/62">
              {index === 0 ? "Next up" : match.tag}
            </span>

            <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight text-[#10131a]">
              {match.home} vs {match.away}
            </h3>

            <div className="mt-3 text-xs font-bold text-[#10131a]/55">
              <p>
                {match.group} / {match.place}
              </p>
            </div>

            <div className="mt-3 rounded-2xl bg-stadium p-3 text-sm font-bold leading-5 text-[#10131a]/70">
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-cobalt" />
                <div>
                  <p className="text-[#10131a]">{match.venue}</p>
                  <p>{match.place}</p>
                </div>
              </div>
            </div>

            <p className="mt-3 line-clamp-2 text-sm font-bold leading-6 text-[#10131a]/74">
              {match.stakes}
            </p>

            <div className="mt-auto flex items-center justify-between pt-4 text-sm font-black text-cobalt">
              <span>Match center</span>
              <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-1 flex gap-3 overflow-x-auto pb-1">
        {items.slice(0, 4).map((item) => (
          <article
            className="min-w-[220px] rounded-2xl bg-stadium px-4 py-3"
            key={item.slot}
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cobalt">
              {item.slot}
            </p>
            <h4 className="mt-1 truncate font-black text-[#10131a]">
              {item.match}
            </h4>
            <p className="mt-1 text-sm font-bold text-[#10131a]/48">
              {"date" in item && item.date ? `${item.date} / ` : ""}
              {item.time}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function PredictionStrip({
  items = predictions.slice(0, 3),
}: {
  items?: Prediction[];
}) {
  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white/88 shadow-sm p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="size-4 text-cobalt" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
            Prediction pulse
          </h2>
        </div>
        <Link
          className="text-xs font-black text-cobalt hover:underline"
          href="/predictions"
        >
          View all →
        </Link>
      </div>
      <div className="grid gap-3">
        {!items.length ? (
          <p className="rounded-2xl bg-stadium p-4 text-sm font-bold leading-6 text-[#10131a]/58">
            Prediction movement is waiting for the first model or editorial pass.
          </p>
        ) : null}
        {items.map((prediction) => {
          const Icon = prediction.tone === "up" ? TrendingUp : TrendingDown;
          return (
            <article
              className="flex items-center justify-between rounded-2xl bg-stadium p-4"
              key={prediction.subject}
            >
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#10131a]/40">
                  {prediction.label}
                </p>
                <p className="mt-1 font-black text-[#10131a]">
                  {prediction.subject}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#10131a]/5 px-3 py-1 text-sm font-black text-cobalt">
                <Icon className="size-4" />
                {prediction.movement}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function ShareCardSeed() {
  return (
    <section className="rounded-[24px] border border-lime-200/20 bg-lime-300 p-5 text-black">
      <div className="flex items-center gap-2">
        <BadgeCheck className="size-5" />
        <h2 className="text-sm font-black uppercase tracking-[0.18em]">
          Share card seed
        </h2>
      </div>
      <p className="mt-4 text-2xl font-black leading-tight">
        Opening day starts the first pressure window: Mexico vs South Africa.
      </p>
      <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-[#10131a] px-4 text-sm font-black text-white">
        Generate card
        <ArrowUpRight className="size-4" />
      </button>
    </section>
  );
}

export function ResultsRibbon({ matches }: { matches: Match[] }) {
  if (!matches.length) return null;

  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white shadow-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-4 text-cobalt" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
            Today&apos;s results
          </h2>
        </div>
        <span className="text-xs font-bold text-[#10131a]/45">
          {matches.length} finished
        </span>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
        {matches.map((match) => (
          <Link
            key={match.matchNumber}
            href={`/matches/${match.matchNumber}`}
            className="flex shrink-0 items-center gap-3 rounded-2xl border border-[#10131a]/10 bg-stadium px-4 py-3 transition hover:border-cobalt/40"
          >
            <span className="flex items-center gap-2 text-sm font-black text-[#10131a]">
              <FlagImg
                src={match.homeFlagAssetUrl}
                emoji={match.homeFlagEmoji}
                alt={match.home}
              />
              {match.home}
            </span>
            <span className="px-1 text-xl font-black tabular-nums text-cobalt">
              {match.score}
            </span>
            <span className="flex items-center gap-2 text-sm font-black text-[#10131a]">
              {match.away}
              <FlagImg
                src={match.awayFlagAssetUrl}
                emoji={match.awayFlagEmoji}
                alt={match.away}
              />
            </span>
            <span className="ml-1 rounded-full bg-[#10131a]/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#10131a]/55">
              {match.group} · FT
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function GroupSnapshot({ groups }: { groups: ActiveGroup[] }) {
  if (!groups.length) return null;

  return (
    <section className="rounded-[24px] border border-[#10131a]/10 bg-white/88 shadow-sm p-4">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="size-4 text-cobalt" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
          Live tables
        </h2>
      </div>

      <div className="space-y-5">
        {groups.map((group) => (
          <div key={group.groupCode}>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#10131a]/50">
                Group {group.groupCode}
              </p>
              <Link
                href="/groups"
                className="text-[10px] font-black text-cobalt hover:underline"
              >
                Full table →
              </Link>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#10131a]/10">
              <div className="grid grid-cols-[1fr_28px_32px_32px] bg-[#10131a]/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-[#10131a]/45">
                <span>Team</span>
                <span className="text-right">P</span>
                <span className="text-right">GD</span>
                <span className="text-right">Pts</span>
              </div>
              {group.teams.map((team, i) => (
                <Link
                  key={team.slug}
                  href={`/teams/${team.slug}`}
                  className={`grid grid-cols-[1fr_28px_32px_32px] items-center px-3 py-2 text-xs transition hover:bg-stadium ${
                    i > 0 ? "border-t border-[#10131a]/8" : ""
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <FlagImg
                      src={team.flagAssetUrl}
                      emoji={team.flagEmoji}
                      alt={team.name}
                    />
                    <span className="truncate font-bold text-[#10131a]">
                      {team.fifaCode}
                    </span>
                    {team.rank <= 2 && (
                      <span className="text-[9px] font-black text-lime-600">▲</span>
                    )}
                  </span>
                  <span className="text-right font-bold text-[#10131a]/60">
                    {team.played}
                  </span>
                  <span className="text-right font-bold text-[#10131a]/60">
                    {team.goalDifference > 0
                      ? `+${team.goalDifference}`
                      : team.goalDifference}
                  </span>
                  <span className="text-right font-black text-cobalt">
                    {team.points}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
