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
import type { ActiveGroup, LiveBoardMatch } from "@/lib/pulse90-data";
import { ShareButton } from "@/components/share-button";

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

function HeroFlag({ src, emoji, name }: { src?: string | null; emoji?: string; name: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={`${name} flag`}
        className="h-16 w-24 rounded-xl object-cover shadow-lg ring-1 ring-white/10 sm:h-20 sm:w-28"
        src={src}
      />
    );
  }
  return (
    <span className="flex h-16 w-24 items-center justify-center rounded-xl bg-white/8 text-5xl sm:h-20 sm:w-28">
      {emoji ?? "🏳"}
    </span>
  );
}

export function PriorityMatch({
  match = liveMatches[0],
  matchWinner = null,
  heroLive = null,
}: {
  match?: Match;
  matchWinner?: string | null;
  heroLive?: LiveBoardMatch | null;
}) {
  // ── LIVE MODE ────────────────────────────────────────────────────
  if (heroLive != null) {
    const isPreMatch = heroLive.isPreMatch ?? false;
    const isHalfTime = heroLive.periodDisplay === "HT";
    const homeScore = heroLive.homeScore ?? 0;
    const awayScore = heroLive.awayScore ?? 0;

    const goals = heroLive.events.filter(
      (e) => e.eventType === "goal" || e.eventType === "own_goal",
    );
    const cards = heroLive.events.filter(
      (e) => e.eventType === "yellow_card" || e.eventType === "red_card",
    );

    // title is stored as "Havertz 23'" — strip the trailing minute for clean display
    const playerName = (title: string) => title.replace(/\s+\d+(?:\+\d+)?'$/, "").trim() || title;
    const minuteStr = (e: { minute: number | null; stoppageMinute: number | null }) =>
      e.minute != null
        ? e.stoppageMinute != null
          ? `${e.minute}+${e.stoppageMinute}'`
          : `${e.minute}'`
        : null;

    return (
      <section className={`overflow-hidden rounded-[28px] bg-[#10131a] text-white ${
        isHalfTime
          ? "shadow-[0_0_0_2px_rgba(245,158,11,0.5),0_0_60px_rgba(245,158,11,0.10),0_24px_70px_rgba(16,19,26,0.3)]"
          : "shadow-[0_0_0_2px_rgba(239,68,68,0.6),0_0_60px_rgba(239,68,68,0.18),0_24px_70px_rgba(16,19,26,0.3)]"
      }`}>
        {/* Broadcast bar */}
        <div className={`flex items-center justify-between gap-3 px-6 py-2.5 ${isHalfTime ? "bg-amber-500" : "bg-red-600"}`}>
          <div className="flex items-center gap-2">
            {!isHalfTime && !isPreMatch && (
              <span className="relative flex size-2.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-white" />
              </span>
            )}
            <span className="text-xs font-black uppercase tracking-[0.22em] text-white">
              {isPreMatch
                ? `Kick off in ${heroLive.minutesUntilKickoff ?? "?"} min`
                : isHalfTime
                  ? "Half time"
                  : "Live now"}
            </span>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white tabular-nums">
            {isPreMatch ? "Pre-match" : isHalfTime ? "HT" : (heroLive.minute ?? "Live")}
          </span>
        </div>

        {/* Top meta */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
          <span className="text-xs font-black uppercase tracking-[0.22em] text-white/50">
            {isPreMatch ? "Up next" : isHalfTime ? "Half time" : "Live match"}
          </span>
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-black text-white/55">
            {heroLive.group}
          </span>
        </div>

        {/* Teams + score */}
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
          <div className="flex flex-col items-center gap-3">
            <HeroFlag
              src={heroLive.homeFlagAssetUrl}
              emoji={heroLive.homeFlagEmoji}
              name={heroLive.home}
            />
            <span className="text-center text-lg font-black leading-tight tracking-tight text-white sm:text-xl">
              {heroLive.home}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span
              className={`font-black tabular-nums ${
                isPreMatch
                  ? "text-4xl text-white/60"
                  : isHalfTime
                    ? "text-5xl text-amber-300/80 sm:text-6xl"
                    : "text-5xl text-red-400 drop-shadow-[0_0_18px_rgba(248,113,113,0.55)] sm:text-6xl"
              }`}
            >
              {homeScore} — {awayScore}
            </span>
            {!isPreMatch && (
              <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${isHalfTime ? "text-amber-400/60" : "text-red-400/70"}`}>
                {isHalfTime ? "half time" : "in play"}
              </span>
            )}
          </div>
          <div className="flex flex-col items-center gap-3">
            <HeroFlag
              src={heroLive.awayFlagAssetUrl}
              emoji={heroLive.awayFlagEmoji}
              name={heroLive.away}
            />
            <span className="text-center text-lg font-black leading-tight tracking-tight text-white sm:text-xl">
              {heroLive.away}
            </span>
          </div>
        </div>

        {/* Goal scorers — home left, away right */}
        {goals.length > 0 && (
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] gap-x-3 px-6">
            <div className="space-y-1">
              {goals.filter((e) => e.teamId === heroLive.homeTeamId).map((e, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs font-bold text-white/70">
                  <span className="shrink-0 text-sm leading-none">{heroLive.homeFlagEmoji}</span>
                  <span>⚽</span>
                  <span>{playerName(e.title)}</span>
                  {minuteStr(e) && <span className="text-red-400/60">{minuteStr(e)}</span>}
                </div>
              ))}
            </div>
            <div className="w-px bg-white/10" />
            <div className="space-y-1">
              {goals.filter((e) => e.teamId === heroLive.awayTeamId).map((e, i) => (
                <div key={i} className="flex items-center justify-end gap-1.5 text-xs font-bold text-white/70">
                  {minuteStr(e) && <span className="text-red-400/60">{minuteStr(e)}</span>}
                  <span>{playerName(e.title)}</span>
                  <span>⚽</span>
                  <span className="shrink-0 text-sm leading-none">{heroLive.awayFlagEmoji}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cards strip */}
        {cards.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 px-6">
            {cards.map((e, i) => {
              const isHome = e.teamId != null && e.teamId === heroLive.homeTeamId;
              const isAway = e.teamId != null && e.teamId === heroLive.awayTeamId;
              const flagEmoji = isHome
                ? heroLive.homeFlagEmoji
                : isAway
                  ? heroLive.awayFlagEmoji
                  : null;
              const icon = e.eventType === "red_card" ? "🟥" : "🟨";
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-bold text-white/55"
                >
                  {icon} {playerName(e.title)}{flagEmoji ? ` ${flagEmoji}` : ""}{minuteStr(e) ? ` ${minuteStr(e)}` : ""}
                </span>
              );
            })}
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-6 py-4">
          <span className="text-xs font-bold text-white/30">
            {isPreMatch
              ? "Starting soon · auto-switches to live"
              : isHalfTime
                ? "Resumes in 2nd half · updates every 2 min"
                : "Score updates every 2 min"}
          </span>
          <div className="flex gap-2">
            <ShareButton
              title={`${heroLive.home} vs ${heroLive.away} · Pulse90`}
              text={
                isPreMatch
                  ? `${heroLive.home} vs ${heroLive.away} kicks off in ${heroLive.minutesUntilKickoff ?? "a few"} min — watching on Pulse90`
                  : isHalfTime
                    ? `Half time: ${heroLive.home} ${homeScore}–${awayScore} ${heroLive.away} — following on Pulse90`
                    : `${heroLive.home} ${homeScore}–${awayScore} ${heroLive.away} · ${heroLive.minute ?? "Live"} — watching on Pulse90`
              }
              className="inline-flex h-9 items-center gap-2 rounded-full bg-white/12 px-4 text-sm font-black text-white transition hover:bg-white/20"
              label="Share"
            />
            <Link
              className="inline-flex h-9 items-center gap-2 rounded-full bg-white px-4 text-sm font-black text-[#10131a] transition hover:bg-red-50"
              href={`/matches/${heroLive.matchNumber}`}
            >
              Match center
              <ArrowUpRight className="size-4" />
            </Link>
            {!isPreMatch && (
              <a
                className="inline-flex h-9 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
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
      </section>
    );
  }

  // ── REGULAR MODE ─────────────────────────────────────────────────
  const isLive = match.status === "live";

  return (
    <section
      className={`overflow-hidden rounded-[28px] text-white ${
        isLive
          ? "bg-[#10131a] shadow-[0_0_0_2px_rgba(239,68,68,0.6),0_0_60px_rgba(239,68,68,0.18),0_24px_70px_rgba(16,19,26,0.3)]"
          : "bg-[#10131a] shadow-[0_24px_70px_rgba(16,19,26,0.22)]"
      }`}
    >
      {/* Live broadcast bar — only when live */}
      {isLive && (
        <div className="flex items-center justify-between gap-3 bg-red-600 px-6 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-white" />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.22em] text-white">
              Live now
            </span>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black text-white tabular-nums">
            {match.minute}
          </span>
        </div>
      )}

      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-5">
        <span className="text-xs font-black uppercase tracking-[0.22em] text-white/50">
          {isLive ? "Command pick" : "Next priority match"}
        </span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-black text-white/55">
            {match.group}
          </span>
          <span className="rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-black">
            {match.heat} heat
          </span>
        </div>
      </div>

      {/* Teams + score */}
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6">
        <div className="flex flex-col items-center gap-3">
          <HeroFlag src={match.homeFlagAssetUrl} emoji={match.homeFlagEmoji} name={match.home} />
          <span className="text-center text-lg font-black leading-tight tracking-tight text-white sm:text-xl">
            {match.home}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span
            className={`font-black tabular-nums sm:text-5xl ${
              isLive
                ? "text-5xl text-red-400 drop-shadow-[0_0_18px_rgba(248,113,113,0.55)] sm:text-6xl"
                : "text-4xl text-cobalt"
            }`}
          >
            {match.score ?? "vs"}
          </span>
          {isLive && match.score && (
            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-red-400/70">
              in play
            </span>
          )}
        </div>
        <div className="flex flex-col items-center gap-3">
          <HeroFlag src={match.awayFlagAssetUrl} emoji={match.awayFlagEmoji} name={match.away} />
          <span className="text-center text-lg font-black leading-tight tracking-tight text-white sm:text-xl">
            {match.away}
          </span>
        </div>
      </div>

      {/* Context */}
      <div className="mt-5 px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-cobalt">
          {match.reason}
        </p>
        <p className="mt-2 text-sm font-bold leading-snug text-white/60">
          {match.stakes}
        </p>
        {!isLive && (
          <div className="mt-4 flex flex-wrap gap-2">
            {match.date && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-white/55">
                <CalendarDays className="size-3.5" />
                {match.date}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-white/55">
              <Clock3 className="size-3.5" />
              {match.time}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1.5 text-xs font-bold text-white/55">
              <MapPin className="size-3.5" />
              {match.place}
            </span>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-6 py-4">
        {matchWinner ? (
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-cobalt" />
            <span className="text-sm font-black text-white">
              Our call: <span className="text-cobalt">{matchWinner}</span>
            </span>
          </div>
        ) : (
          <span className="text-xs font-bold text-white/30">Prediction pending</span>
        )}
        <div className="flex gap-2">
          <ShareButton
            title={`${match.home} vs ${match.away} · Pulse90`}
            text={
              isLive
                ? `${match.home} ${match.score} ${match.away} · Live — watching on Pulse90`
                : `${match.home} vs ${match.away} · ${match.time ?? ""} — on Pulse90`
            }
            className="inline-flex h-9 items-center gap-2 rounded-full bg-white/12 px-4 text-sm font-black text-white transition hover:bg-white/20"
            label="Share"
          />
          <Link
            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-black transition ${
              isLive
                ? "bg-white text-[#10131a] hover:bg-red-50"
                : "bg-white text-[#10131a] hover:bg-lime-300"
            }`}
            href={`/matches/${match.matchNumber}`}
          >
            Match center
            <ArrowUpRight className="size-4" />
          </Link>
          {isLive && (
            <a
              className="inline-flex h-9 items-center gap-2 rounded-full bg-red-600 px-4 text-sm font-black text-white transition hover:bg-red-700"
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
    </section>
  );
}

export function LiveStack({ matches = liveMatches }: { matches?: Match[] }) {
  const sideMatches = matches.slice(1);
  const hasLive = matches.length > 0;

  return (
    <section
      className={`rounded-[24px] p-4 ${
        hasLive
          ? "bg-[#10131a] shadow-[0_0_0_1px_rgba(239,68,68,0.4),0_0_32px_rgba(239,68,68,0.1)]"
          : "border border-[#10131a]/10 bg-white/88 shadow-sm"
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {hasLive && (
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-red-400" />
            </span>
          )}
          <h2 className={`text-sm font-black uppercase tracking-[0.2em] ${hasLive ? "text-white/70" : "text-[#10131a]/70"}`}>
            {hasLive ? "Also live" : "Other live"}
          </h2>
        </div>
        <Radio className={`size-4 ${hasLive ? "text-red-400" : "text-[#10131a]/30"}`} />
      </div>

      {!matches.length ? (
        <div className="rounded-2xl border border-[#10131a]/10 bg-stadium p-4">
          <p className="text-lg font-black text-[#10131a]">No matches live yet.</p>
          <p className="mt-2 text-sm leading-6 text-[#10131a]/58">
            The command center activates once the tournament is live.
          </p>
        </div>
      ) : null}

      <div className="space-y-3">
        {sideMatches.map((match) => (
          <div
            key={`${match.home}-${match.away}`}
            className="rounded-2xl border border-red-500/20 bg-white/6 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-red-600/80 px-2.5 py-1 text-[10px] font-black text-white tabular-nums">
                {match.minute}
              </span>
              <span className="rounded-full bg-white/8 px-2.5 py-1 text-[10px] font-bold text-white/55">
                {match.reason}
              </span>
            </div>
            <Link href={`/matches/${match.matchNumber}`}>
              <p className="mt-3 text-xl font-black text-white transition hover:text-red-300">
                {match.home}{" "}
                <span className="font-mono text-red-400">{match.score}</span>{" "}
                {match.away}
              </p>
            </Link>
            <p className="mt-1.5 text-xs font-bold leading-5 text-white/50">{match.stakes}</p>
            <div className="mt-3 flex gap-2">
              <Link
                href={`/matches/${match.matchNumber}`}
                className="inline-flex items-center rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-black text-white/70 transition hover:bg-white/15"
              >
                Match center
              </Link>
              <a
                href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-red-700"
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

// ─── Live Match Board ─────────────────────────────────────────────────────────

export function LiveMatchBoard({ matches }: { matches: LiveBoardMatch[] }) {
  if (!matches.length) return null;

  return (
    <section className="overflow-hidden rounded-[28px] bg-[#10131a] text-white shadow-[0_0_0_2px_rgba(239,68,68,0.55),0_0_60px_rgba(239,68,68,0.15)]">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 bg-red-600 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-white" />
          </span>
          <span className="text-xs font-black uppercase tracking-[0.22em] text-white">
            Live now — {matches.length} {matches.length === 1 ? "match" : "matches"} in play
          </span>
        </div>
        <Radio className="size-4 text-white/70" />
      </div>

      {/* Match cards */}
      <div className="divide-y divide-white/8">
        {matches.map((m) => (
          <LiveBoardCard key={m.fixtureId} match={m} />
        ))}
      </div>
    </section>
  );
}

function LiveBoardCard({ match }: { match: LiveBoardMatch }) {
  const goals = match.events.filter((e) =>
    e.eventType === "goal" || e.eventType === "penalty_goal" || e.eventType === "own_goal",
  );
  const cards = match.events.filter((e) =>
    e.eventType === "yellow_card" || e.eventType === "red_card",
  );
  // Score is always a number now (computed from events in data layer, 0 if no goals yet)
  const homeScore = match.homeScore ?? 0;
  const awayScore = match.awayScore ?? 0;

  return (
    <div className="px-5 py-4">
      {/* Match meta */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">
          {match.group}
        </span>
        <span className="rounded-full bg-red-600/80 px-2.5 py-1 text-[10px] font-black text-white tabular-nums">
          {match.minute ?? "LIVE"}
        </span>
      </div>

      {/* Teams + score */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/8">
            {match.homeFlagAssetUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.homeFlagAssetUrl} alt={match.home} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">{match.homeFlagEmoji}</span>
            )}
          </span>
          <span className="truncate text-base font-black text-white">{match.home}</span>
        </div>
        <span className="text-3xl font-black tabular-nums text-red-400 drop-shadow-[0_0_12px_rgba(248,113,113,0.5)]">
          {homeScore} – {awayScore}
        </span>
        <div className="flex items-center justify-end gap-2.5">
          <span className="truncate text-right text-base font-black text-white">{match.away}</span>
          <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white/8">
            {match.awayFlagAssetUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={match.awayFlagAssetUrl} alt={match.away} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xl">{match.awayFlagEmoji}</span>
            )}
          </span>
        </div>
      </div>

      {/* Event log */}
      {(goals.length > 0 || cards.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {goals.map((ev, i) => {
            const flag = ev.teamId === match.homeTeamId
              ? match.homeFlagEmoji
              : ev.teamId === match.awayTeamId
                ? match.awayFlagEmoji
                : null;
            return (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-white/80">
                {flag && <span className="leading-none">{flag}</span>}
                <span>⚽</span>
                <span>{ev.title.replace(/\s+\d+(\+\d+)?'$/, "")}</span>
                {ev.minute && <span className="text-white/45">{ev.minute}{ev.stoppageMinute ? `+${ev.stoppageMinute}` : ""}'</span>}
                {ev.eventType === "own_goal" && <span className="text-white/40">OG</span>}
                {ev.eventType === "penalty_goal" && <span className="text-cobalt">pen</span>}
              </span>
            );
          })}
          {cards.map((ev, i) => {
            const flag = ev.teamId === match.homeTeamId
              ? match.homeFlagEmoji
              : ev.teamId === match.awayTeamId
                ? match.awayFlagEmoji
                : null;
            return (
              <span key={i} className="inline-flex items-center gap-1 rounded-full bg-white/8 px-2.5 py-1 text-xs font-bold text-white/60">
                {flag && <span className="leading-none">{flag}</span>}
                <span>{ev.eventType === "red_card" ? "🟥" : "🟨"}</span>
                <span>{ev.title.replace(/\s+\d+(\+\d+)?'$/, "")}</span>
                {ev.minute && <span className="text-white/40">{ev.minute}'</span>}
              </span>
            );
          })}
        </div>
      )}

      {/* CTA */}
      <div className="mt-3 flex gap-2">
        <Link
          href={`/matches/${match.matchNumber}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-black text-white/80 transition hover:bg-white/20"
        >
          Match center <ArrowUpRight className="size-3.5" />
        </Link>
        <a
          href="https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-black text-white transition hover:bg-red-700"
        >
          <Tv className="size-3" />
          Watch live
        </a>
      </div>
    </div>
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
    <section className="min-w-0 rounded-[24px] border border-[#10131a]/8 bg-white p-4 shadow-sm sm:p-5">
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

      <div className="-mx-4 mt-4 flex snap-x gap-3 overflow-x-auto px-4 pb-3 sm:-mx-5 sm:px-5">
        {scheduledMatches.slice(0, 8).map((match, index) => (
          <Link
            aria-label={`Open ${match.home} vs ${match.away} match center`}
            className="group flex min-h-[260px] w-[248px] shrink-0 snap-start flex-col rounded-[22px] border border-[#10131a]/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-cobalt/45 sm:w-[272px]"
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

            <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#10131a]/50">
              <MapPin className="size-3 shrink-0 text-cobalt" />
              {match.venue}, {match.place}
            </div>

            <p className="mt-3 line-clamp-3 text-sm font-bold leading-6 text-[#10131a]/68">
              {match.stakes}
            </p>

            <div className="mt-auto flex items-center justify-between pt-4 text-sm font-black text-cobalt">
              <span>Match center</span>
              <ArrowUpRight className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#10131a]/38">
            On deck tomorrow
          </p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5">
            {items.slice(0, 5).map((item) => (
              <article
                className="shrink-0 min-w-[170px] rounded-xl border border-[#10131a]/8 px-3 py-2.5"
                key={item.slot}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-cobalt">
                  {item.slot}
                </p>
                <p className="mt-0.5 truncate text-sm font-black text-[#10131a]">
                  {item.match}
                </p>
                <p className="mt-0.5 text-xs font-bold text-[#10131a]/42">
                  {"date" in item && item.date ? `${item.date} · ` : ""}
                  {item.time}
                </p>
              </article>
            ))}
          </div>
        </div>
      )}
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

function parseScore(score: string | undefined): { home: number; away: number } | null {
  if (!score) return null;
  const [h, a] = score.split("-").map(Number);
  return isNaN(h) || isNaN(a) ? null : { home: h, away: a };
}

export function ResultsRibbon({ matches }: { matches: Match[] }) {
  if (!matches.length) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-4 text-cobalt" />
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#10131a]/70">
            Results
          </h2>
        </div>
        <Link
          href="/results"
          className="text-xs font-black text-cobalt hover:underline"
        >
          View all →
        </Link>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        {matches.map((match) => {
          const s = parseScore(match.score);
          const homeWon = s ? s.home > s.away : false;
          const awayWon = s ? s.away > s.home : false;

          return (
            <Link
              key={match.matchNumber}
              href={`/matches/${match.matchNumber}`}
              className="group flex w-[215px] shrink-0 flex-col gap-2 rounded-2xl border border-[#10131a]/10 bg-stadium px-4 py-3 transition hover:border-cobalt/40 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#10131a]/40">
                  {match.group}
                </span>
                <span className="rounded-full bg-[#10131a]/6 px-2 py-0.5 text-[10px] font-black uppercase text-[#10131a]/45">
                  FT
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`flex min-w-0 flex-1 items-center gap-1.5 text-xs font-black ${homeWon ? "text-[#10131a]" : awayWon ? "text-[#10131a]/28" : "text-[#10131a]/65"}`}>
                  <FlagImg src={match.homeFlagAssetUrl} emoji={match.homeFlagEmoji} alt={match.home} />
                  <span className="truncate">{match.home}</span>
                </span>
                <span className="shrink-0 text-base font-black tabular-nums text-cobalt">
                  {match.score}
                </span>
                <span className={`flex min-w-0 flex-1 items-center justify-end gap-1.5 text-xs font-black ${awayWon ? "text-[#10131a]" : homeWon ? "text-[#10131a]/28" : "text-[#10131a]/65"}`}>
                  <span className="truncate text-right">{match.away}</span>
                  <FlagImg src={match.awayFlagAssetUrl} emoji={match.awayFlagEmoji} alt={match.away} />
                </span>
              </div>
            </Link>
          );
        })}
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
