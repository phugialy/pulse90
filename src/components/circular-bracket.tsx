"use client";

import { useState } from "react";
import type { R32Slot, KnockoutFixtureSlot } from "./standings-tabs";

// ─── Bracket order (top-to-bottom on each side) ───────────────────────────────
// Left half → SF M101 → Final M104
const L_R32 = [74, 77, 73, 75, 83, 84, 81, 82];
const L_R16 = [89, 90, 93, 94];
const L_QF  = [97, 98];
// Right half → SF M102 → Final M104
const R_R32 = [76, 78, 79, 80, 86, 88, 85, 87];
const R_R16 = [91, 92, 95, 96];
const R_QF  = [99, 100];

// ─── SVG layout ───────────────────────────────────────────────────────────────

const VW = 1100, VH = 590;
const CW = 85, CH = 44;   // card width / height

// Column left-edge x positions
const L0 = 5,   L1 = 108, L2 = 211, L3 = 314;   // left side  R32→R16→QF→SF
const FX = 508;                                    // Final card (centred)
const R3 = 701, R2 = 804, R1 = 907, R0 = 1010;   // right side SF→QF→R16→R32

// Bracket joint mid-x values (midpoint of each column gap)
const ML1 = 99,   ML2 = 202, ML3 = 305, MLF = 453;   // left  R32→R16→QF→SF→Final
const MR1 = 1001, MR2 = 898, MR3 = 795, MRF = 647;   // right R32→R16→QF→SF→Final

// Y positions
const YTOP = 24;   // height reserved for round labels
const YSTEP = 70;  // pixels per R32 slot

const y32 = (i: number) => YTOP + YSTEP * i + YSTEP / 2;
const y16 = (i: number) => (y32(i * 2) + y32(i * 2 + 1)) / 2;
const yqf = (i: number) => (y16(i * 2) + y16(i * 2 + 1)) / 2;
const ysf = ()           => (yqf(0) + yqf(1)) / 2;
const Y_MID = ysf();  // SF and Final share the same y-centre

// ─── Data types ───────────────────────────────────────────────────────────────

type Team = {
  name: string;
  flagEmoji: string;
  flagAssetUrl: string | null;
  slug?: string;
};

type Match = {
  home: Team | null;
  away: Team | null;
  hLabel: string;
  aLabel: string;
  hScore: number | null;
  aScore: number | null;
  hPen: number | null;
  aPen: number | null;
  finished: boolean;
};

// Which match feeds into which next match, and as home or away
const ADVANCEMENT: Record<number, [nextMn: number, slot: "home" | "away"]> = {
  // R32 → R16
  74: [89, "home"], 77: [89, "away"],
  73: [90, "home"], 75: [90, "away"],
  83: [93, "home"], 84: [93, "away"],
  81: [94, "home"], 82: [94, "away"],
  76: [91, "home"], 78: [91, "away"],
  79: [92, "home"], 80: [92, "away"],
  86: [95, "home"], 88: [95, "away"],
  85: [96, "home"], 87: [96, "away"],
  // R16 → QF
  89: [97, "home"], 90: [97, "away"],
  93: [98, "home"], 94: [98, "away"],
  91: [99, "home"], 92: [99, "away"],
  95: [100, "home"], 96: [100, "away"],
  // QF → SF
  97: [101, "home"], 98: [101, "away"],
  99: [102, "home"], 100: [102, "away"],
  // SF → Final
  101: [104, "home"], 102: [104, "away"],
};

function buildMap(
  r32s: R32Slot[],
  kos: KnockoutFixtureSlot[],
): Map<number, Match> {
  const map = new Map<number, Match>();

  const isFinished = (s?: string) =>
    s === "full_time" || s === "post_game" || s === "final";

  for (const s of r32s) {
    map.set(s.matchNumber, {
      home: s.home.team
        ? { name: s.home.team.name, flagEmoji: s.home.team.flagEmoji, flagAssetUrl: s.home.team.flagAssetUrl, slug: s.home.team.slug }
        : null,
      away: s.away.team
        ? { name: s.away.team.name, flagEmoji: s.away.team.flagEmoji, flagAssetUrl: s.away.team.flagAssetUrl, slug: s.away.team.slug }
        : null,
      hLabel: s.home.label,
      aLabel: s.away.label,
      hScore: s.homeScore ?? null,
      aScore: s.awayScore ?? null,
      hPen: s.homePenalties ?? null,
      aPen: s.awayPenalties ?? null,
      finished: isFinished(s.status) || s.homeScore != null,
    });
  }

  for (const s of kos) {
    map.set(s.matchNumber, {
      home: s.home
        ? { name: s.home.name, flagEmoji: s.home.flagEmoji, flagAssetUrl: s.home.flagAssetUrl, slug: s.home.slug }
        : null,
      away: s.away
        ? { name: s.away.name, flagEmoji: s.away.flagEmoji, flagAssetUrl: s.away.flagAssetUrl, slug: s.away.slug }
        : null,
      hLabel: s.homePlaceholder ?? "TBD",
      aLabel: s.awayPlaceholder ?? "TBD",
      hScore: s.homeScore ?? null,
      aScore: s.awayScore ?? null,
      hPen: s.homePenalties ?? null,
      aPen: s.awayPenalties ?? null,
      finished: isFinished(s.status) || s.homeScore != null,
    });
  }

  // Client-side winner propagation: fill next-round slot if Supabase hasn't yet
  for (const mn of [...map.keys()]) {
    const adv = ADVANCEMENT[mn];
    if (!adv) continue;
    const m = map.get(mn)!;
    if (!m.finished) continue;

    // Determine winner by score; for tied matches use penalty shootout data if available
    let winner: Team | null = null;
    if (m.hScore != null && m.aScore != null) {
      if (m.hScore > m.aScore) winner = m.home;
      else if (m.aScore > m.hScore) winner = m.away;
      else if (m.hPen != null && m.aPen != null) {
        winner = m.hPen > m.aPen ? m.home : m.away;
      }
    }
    if (!winner) continue;

    const [nextMn, slot] = adv;
    let next = map.get(nextMn);
    if (!next) {
      next = { home: null, away: null, hLabel: "TBD", aLabel: "TBD", hScore: null, aScore: null, hPen: null, aPen: null, finished: false };
      map.set(nextMn, next);
    }
    // Only fill if the DB hasn't already set this slot
    if (slot === "home" && !next.home) next.home = winner;
    if (slot === "away" && !next.away) next.away = winner;
  }

  return map;
}

// ─── Connector lines ──────────────────────────────────────────────────────────

// Left-side: pair of cards (right edge at cardR) → joint midX → next card left edge nextX
function LConn({
  cardR, midX, nextX, ya, yb, color,
}: {
  cardR: number; midX: number; nextX: number;
  ya: number; yb: number; color: string;
}) {
  const ym = (ya + yb) / 2;
  return (
    <g stroke={color} strokeWidth={1} fill="none">
      <line x1={cardR} y1={ya} x2={midX} y2={ya} />
      <line x1={cardR} y1={yb} x2={midX} y2={yb} />
      <line x1={midX}  y1={ya} x2={midX} y2={yb} />
      <line x1={midX}  y1={ym} x2={nextX} y2={ym} />
    </g>
  );
}

// Right-side: pair of cards (left edge at cardL) → joint midX → next card right edge nextR
function RConn({
  cardL, midX, nextR, ya, yb, color,
}: {
  cardL: number; midX: number; nextR: number;
  ya: number; yb: number; color: string;
}) {
  const ym = (ya + yb) / 2;
  return (
    <g stroke={color} strokeWidth={1} fill="none">
      <line x1={cardL} y1={ya} x2={midX} y2={ya} />
      <line x1={cardL} y1={yb} x2={midX} y2={yb} />
      <line x1={midX}  y1={ya} x2={midX} y2={yb} />
      <line x1={midX}  y1={ym} x2={nextR} y2={ym} />
    </g>
  );
}

// ─── Color palette per stage ──────────────────────────────────────────────────

const C = {
  r32:  "rgba(255,255,255,0.13)",
  r16:  "rgba(100,200,255,0.38)",
  qf:   "rgba(255,185,45,0.48)",
  sf:   "rgba(247,209,73,0.68)",
  fin:  "rgba(247,209,73,0.95)",
};

// ─── Match card ───────────────────────────────────────────────────────────────

const FW = 18, FH = 12;  // flag image dimensions
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

function Card({
  x, y, mn, map, hov, setHov, color,
}: {
  x: number; y: number; mn: number;
  map: Map<number, Match>;
  hov: number | null;
  setHov: (n: number | null) => void;
  color: string;
}) {
  const m   = map.get(mn);
  const isH = hov === mn;

  // Row y-centres (card spans y-22 to y+22; divider at y; rows centred in each half)
  const hy = y - CH / 2 + 3 + (CH / 2 - 3) / 2;   // ≈ y − 8.5
  const ay = y + 3 + (CH / 2 - 3) / 2;              // ≈ y + 13.5

  const showScore = m?.finished ?? false;

  const renderRow = (team: Team | null, label: string, ry: number, score: number | null) => {
    if (!team) {
      return (
        <text
          x={x + 5} y={ry}
          dominantBaseline="middle"
          fontSize="8" fontWeight="600"
          fill="rgba(255,255,255,0.28)"
          style={{ fontFamily: "system-ui" }}
        >
          {trunc(label, 14)}
        </text>
      );
    }
    const nameX = x + 4 + (team.flagAssetUrl ? FW + 3 : 19);
    const maxCh = showScore ? 9 : 11;
    return (
      <>
        {team.flagAssetUrl ? (
          <image
            href={team.flagAssetUrl}
            x={x + 4} y={ry - FH / 2}
            width={FW} height={FH}
            preserveAspectRatio="xMidYMid slice"
          />
        ) : (
          <text
            x={x + 13} y={ry}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="13"
            style={{ userSelect: "none" }}
          >
            {team.flagEmoji}
          </text>
        )}
        <text
          x={nameX} y={ry}
          dominantBaseline="middle"
          fontSize="9" fontWeight="900"
          fill="rgba(255,255,255,0.87)"
          style={{ fontFamily: "system-ui" }}
        >
          {trunc(team.name, maxCh)}
        </text>
        {score != null && (
          <text
            x={x + CW - 4} y={ry}
            textAnchor="end" dominantBaseline="middle"
            fontSize="10" fontWeight="900"
            fill="rgba(247,209,73,0.95)"
            style={{ fontFamily: "system-ui" }}
          >
            {score}
          </text>
        )}
      </>
    );
  };

  return (
    <g
      onMouseEnter={() => setHov(mn)}
      onMouseLeave={() => setHov(null)}
      style={{ cursor: "default" }}
    >
      {/* Card background */}
      <rect
        x={x} y={y - CH / 2}
        width={CW} height={CH}
        rx={5}
        fill={isH ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)"}
        stroke={isH ? "rgba(255,255,255,0.42)" : color}
        strokeWidth={0.9}
      />
      {/* Divider */}
      <line
        x1={x + 3} y1={y} x2={x + CW - 3} y2={y}
        stroke="rgba(255,255,255,0.07)" strokeWidth={0.6}
      />
      {/* Match number */}
      <text
        x={x + CW / 2} y={y - CH / 2 - 6}
        textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontWeight="900"
        fill="rgba(255,255,255,0.2)"
        style={{ fontFamily: "system-ui" }}
      >
        M{mn}
      </text>
      {/* Team rows */}
      {renderRow(m?.home ?? null, m?.hLabel ?? "TBD", hy, showScore ? (m?.hScore ?? null) : null)}
      {renderRow(m?.away ?? null, m?.aLabel ?? "TBD", ay, showScore ? (m?.aScore ?? null) : null)}
    </g>
  );
}

// ─── Round column label ───────────────────────────────────────────────────────

function RoundLabel({ x, text, color }: { x: number; text: string; color: string }) {
  return (
    <text
      x={x + CW / 2} y={13}
      textAnchor="middle" dominantBaseline="middle"
      fontSize="7" fontWeight="900" letterSpacing="0.1em"
      fill={color}
      style={{ fontFamily: "system-ui" }}
    >
      {text}
    </text>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function CircularBracket({
  slots,
  knockoutSlots = [],
}: {
  slots: R32Slot[];
  knockoutSlots?: KnockoutFixtureSlot[];
}) {
  const [hov, setHov] = useState<number | null>(null);
  const map = buildMap(slots, knockoutSlots);
  const hovMatch = hov != null ? map.get(hov) : null;

  return (
    <div className="overflow-hidden rounded-[28px] bg-[#10131a] shadow-[0_0_0_1px_rgba(247,209,73,0.12),0_24px_60px_rgba(16,19,26,0.45)]">
      {/* Header */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
        style={{ background: "linear-gradient(135deg, #1a2e50 0%, #10131a 100%)" }}
      >
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#f7d149]">
            FIFA World Cup 2026
          </p>
          <h2 className="mt-1 text-2xl font-black text-white">Tournament Bracket</h2>
          <p className="mt-0.5 text-sm font-bold text-white/35">
            Full draw · R32 → R16 → QF → SF → Final · hover any match
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          {[
            { color: "bg-white/10 border-white/15", label: "Round of 32" },
            { color: "bg-sky-400/10 border-sky-400/40", label: "Round of 16" },
            { color: "bg-amber-400/10 border-amber-400/40", label: "Quarter-final" },
            { color: "bg-[#f7d149]/15 border-[#f7d149]/50", label: "Semi / Final" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`inline-block size-3 rounded-full border ${color}`} />
              <span className="text-[10px] font-bold text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bracket SVG */}
      <div className="overflow-x-auto p-4 pt-3 pb-2">
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          style={{ minWidth: 600, maxWidth: VW }}
        >
          {/* ── Round labels ─────────────────────────────────────── */}
          <RoundLabel x={L0} text="ROUND OF 32"   color="rgba(255,255,255,0.3)" />
          <RoundLabel x={L1} text="ROUND OF 16"   color="rgba(100,200,255,0.52)" />
          <RoundLabel x={L2} text="QUARTER-FINAL" color="rgba(255,185,45,0.58)" />
          <RoundLabel x={L3} text="SEMI-FINAL"    color="rgba(247,209,73,0.72)" />
          <RoundLabel x={FX} text="FINAL"         color="rgba(247,209,73,0.98)" />
          <RoundLabel x={R3} text="SEMI-FINAL"    color="rgba(247,209,73,0.72)" />
          <RoundLabel x={R2} text="QUARTER-FINAL" color="rgba(255,185,45,0.58)" />
          <RoundLabel x={R1} text="ROUND OF 16"   color="rgba(100,200,255,0.52)" />
          <RoundLabel x={R0} text="ROUND OF 32"   color="rgba(255,255,255,0.3)" />

          {/* ── LEFT bracket connectors ──────────────────────────── */}

          {/* R32 → R16 (4 pairs) */}
          {[0, 1, 2, 3].map((i) => (
            <LConn key={`lr32-${i}`}
              cardR={L0 + CW} midX={ML1} nextX={L1}
              ya={y32(i * 2)} yb={y32(i * 2 + 1)}
              color={C.r32}
            />
          ))}

          {/* R16 → QF (2 pairs) */}
          {[0, 1].map((i) => (
            <LConn key={`lr16-${i}`}
              cardR={L1 + CW} midX={ML2} nextX={L2}
              ya={y16(i * 2)} yb={y16(i * 2 + 1)}
              color={C.r16}
            />
          ))}

          {/* QF → SF */}
          <LConn
            cardR={L2 + CW} midX={ML3} nextX={L3}
            ya={yqf(0)} yb={yqf(1)}
            color={C.qf}
          />

          {/* SF → Final */}
          <line x1={L3 + CW} y1={Y_MID} x2={FX} y2={Y_MID} stroke={C.sf} strokeWidth={1.5} />

          {/* ── RIGHT bracket connectors ─────────────────────────── */}

          {/* R32 → R16 (4 pairs) */}
          {[0, 1, 2, 3].map((i) => (
            <RConn key={`rr32-${i}`}
              cardL={R0} midX={MR1} nextR={R1 + CW}
              ya={y32(i * 2)} yb={y32(i * 2 + 1)}
              color={C.r32}
            />
          ))}

          {/* R16 → QF (2 pairs) */}
          {[0, 1].map((i) => (
            <RConn key={`rr16-${i}`}
              cardL={R1} midX={MR2} nextR={R2 + CW}
              ya={y16(i * 2)} yb={y16(i * 2 + 1)}
              color={C.r16}
            />
          ))}

          {/* QF → SF */}
          <RConn
            cardL={R2} midX={MR3} nextR={R3 + CW}
            ya={yqf(0)} yb={yqf(1)}
            color={C.qf}
          />

          {/* SF → Final */}
          <line x1={R3} y1={Y_MID} x2={FX + CW} y2={Y_MID} stroke={C.sf} strokeWidth={1.5} />

          {/* ── LEFT match cards ─────────────────────────────────── */}

          {L_R32.map((mn, i) => (
            <Card key={mn} x={L0} y={y32(i)} mn={mn} map={map} hov={hov} setHov={setHov} color={C.r32} />
          ))}
          {L_R16.map((mn, i) => (
            <Card key={mn} x={L1} y={y16(i)} mn={mn} map={map} hov={hov} setHov={setHov} color={C.r16} />
          ))}
          {L_QF.map((mn, i) => (
            <Card key={mn} x={L2} y={yqf(i)} mn={mn} map={map} hov={hov} setHov={setHov} color={C.qf} />
          ))}
          <Card x={L3} y={Y_MID} mn={101} map={map} hov={hov} setHov={setHov} color={C.sf} />

          {/* ── FINAL ────────────────────────────────────────────── */}
          <Card x={FX} y={Y_MID} mn={104} map={map} hov={hov} setHov={setHov} color={C.fin} />

          {/* ── RIGHT match cards ────────────────────────────────── */}

          {R_R32.map((mn, i) => (
            <Card key={mn} x={R0} y={y32(i)} mn={mn} map={map} hov={hov} setHov={setHov} color={C.r32} />
          ))}
          {R_R16.map((mn, i) => (
            <Card key={mn} x={R1} y={y16(i)} mn={mn} map={map} hov={hov} setHov={setHov} color={C.r16} />
          ))}
          {R_QF.map((mn, i) => (
            <Card key={mn} x={R2} y={yqf(i)} mn={mn} map={map} hov={hov} setHov={setHov} color={C.qf} />
          ))}
          <Card x={R3} y={Y_MID} mn={102} map={map} hov={hov} setHov={setHov} color={C.sf} />
        </svg>
      </div>

      {/* Hover info panel */}
      <div className="flex h-12 items-center justify-center px-6 pb-4">
        {hovMatch ? (
          <div className="text-center">
            <div className="text-sm font-bold text-white/80">
              <span>{hovMatch.home?.name ?? hovMatch.hLabel}</span>
              <span className="mx-2 font-normal text-white/30">vs</span>
              <span>{hovMatch.away?.name ?? hovMatch.aLabel}</span>
            </div>
            {(hovMatch.hScore != null || !hovMatch.home) && (
              <div className="mt-0.5 text-xs text-white/35">
                {hovMatch.finished && hovMatch.hScore != null
                  ? `${hovMatch.hScore} – ${hovMatch.aScore}`
                  : "Upcoming"}
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-white/20">hover a match to see details</p>
        )}
      </div>
    </div>
  );
}
