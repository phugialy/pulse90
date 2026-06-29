"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import type { R32Slot } from "./standings-tabs";

// ─── Layout ───────────────────────────────────────────────────────────────────

const CX = 400, CY = 400;
const R_BADGE = 340;   // outer ring — team badge centres
const R_R32   = 275;   // R32 convergence nodes
const R_R16   = 210;   // R16 convergence nodes
const R_QF    = 152;   // QF convergence nodes
const R_SF    = 103;   // SF convergence nodes
const BADGE_R = 22;    // radius of each team badge circle

// ─── Match → circle position ──────────────────────────────────────────────────
// 32 slots, clockwise from top (−90°).
// Right half (0–15) feeds M101 (left SF path); left half (16–31) feeds M102.
// Within each quarter: groups of 4 ordered so R16/QF/SF lines flow cleanly inward.

const MATCH_POS: Record<number, [number, number]> = {
  // Quarter A (right-top, 0–7) → M89 / M90 → M97 → M101
  74: [0, 1],
  77: [2, 3],
  73: [4, 5],
  75: [6, 7],
  // Quarter B (right-bottom, 8–15) → M93 / M94 → M98 → M101
  83: [8, 9],
  84: [10, 11],
  81: [12, 13],
  82: [14, 15],
  // Quarter C (left-bottom, 16–23) → M91 / M92 → M99 → M102
  76: [16, 17],
  78: [18, 19],
  79: [20, 21],
  80: [22, 23],
  // Quarter D (left-top, 24–31) → M95 / M96 → M100 → M102
  86: [24, 25],
  88: [26, 27],
  85: [28, 29],
  87: [30, 31],
};

// ─── Geometry ─────────────────────────────────────────────────────────────────

function angleOf(pos: number) {
  return ((-90 + (pos / 32) * 360) * Math.PI) / 180;
}

function pt(pos: number, r: number): [number, number] {
  const a = angleOf(pos);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

function mid(posA: number, posB: number, r: number): [number, number] {
  return pt((posA + posB) / 2, r);
}

// ─── Slot lookup ──────────────────────────────────────────────────────────────

type PosEntry = {
  slot: R32Slot;
  isHome: boolean;
};

function buildPosMap(slots: R32Slot[]): Map<number, PosEntry> {
  const map = new Map<number, PosEntry>();
  for (const slot of slots) {
    const positions = MATCH_POS[slot.matchNumber];
    if (!positions) continue;
    map.set(positions[0], { slot, isHome: true });
    map.set(positions[1], { slot, isHome: false });
  }
  return map;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CircularBracket({ slots }: { slots: R32Slot[] }) {
  const [hoveredPos, setHoveredPos] = useState<number | null>(null);
  const posMap = buildPosMap(slots);

  // Derive per-position display data
  function posInfo(pos: number) {
    const entry = posMap.get(pos);
    if (!entry) return { team: null, label: "?", isLocked: false, isKnown: false };
    const seed = entry.isHome ? entry.slot.home : entry.slot.away;
    const team = seed.team;
    const isLocked = team?.qualificationStatus === "advancing" && (team?.played ?? 0) >= 3;
    const isKnown = team !== null;
    return { team, label: seed.label, isLocked, isKnown };
  }

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
            32 → 16 → QF → SF → Final · click any team to visit their page
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-1.5">
          {[
            { color: "border-[#f7d149] bg-[#f7d149]/20", label: "Qualified (locked)" },
            { color: "border-sky-400/40 bg-sky-400/10", label: "Leading (provisional)" },
            { color: "border-white/10 bg-white/5", label: "3rd-place slot" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`inline-block size-3 rounded-full border ${color}`} />
              <span className="text-[10px] font-bold text-white/40">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SVG */}
      <div className="flex items-center justify-center p-4 pt-2 pb-6">
        <svg
          viewBox="0 0 800 800"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
          style={{ maxWidth: 600, maxHeight: 600 }}
        >
          <defs>
            <clipPath id="cb-clip">
              <circle cx="0" cy="0" r={BADGE_R - 1} />
            </clipPath>
            <radialGradient id="cb-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f7d149" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f7d149" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background */}
          <circle cx={CX} cy={CY} r={390} fill="#0d1018" />

          {/* Ring guides */}
          {[R_BADGE, R_R32, R_R16, R_QF, R_SF].map((r) => (
            <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          ))}

          {/* ── Bracket lines ─────────────────────────────────────── */}

          {/* R32: each team badge → R32 convergence node */}
          {Array.from({ length: 16 }, (_, i) => {
            const p1 = i * 2, p2 = i * 2 + 1;
            const [x1, y1] = pt(p1, R_BADGE - BADGE_R);
            const [x2, y2] = pt(p2, R_BADGE - BADGE_R);
            const [mx, my] = mid(p1, p2, R_R32);
            return (
              <g key={`r32l-${i}`}>
                <line x1={x1} y1={y1} x2={mx} y2={my} stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
                <line x1={x2} y1={y2} x2={mx} y2={my} stroke="rgba(255,255,255,0.12)" strokeWidth="1.2" />
              </g>
            );
          })}

          {/* R32 node → R16 node */}
          {Array.from({ length: 8 }, (_, i) => {
            const g = i * 4;
            const [m1x, m1y] = mid(g, g + 1, R_R32);
            const [m2x, m2y] = mid(g + 2, g + 3, R_R32);
            const [rx, ry] = mid(g, g + 3, R_R16);
            return (
              <g key={`r16l-${i}`}>
                <line x1={m1x} y1={m1y} x2={rx} y2={ry} stroke="rgba(100,180,255,0.22)" strokeWidth="1.4" />
                <line x1={m2x} y1={m2y} x2={rx} y2={ry} stroke="rgba(100,180,255,0.22)" strokeWidth="1.4" />
              </g>
            );
          })}

          {/* R16 node → QF node */}
          {Array.from({ length: 4 }, (_, i) => {
            const g = i * 8;
            const [m1x, m1y] = mid(g, g + 3, R_R16);
            const [m2x, m2y] = mid(g + 4, g + 7, R_R16);
            const [qx, qy] = mid(g, g + 7, R_QF);
            return (
              <g key={`qfl-${i}`}>
                <line x1={m1x} y1={m1y} x2={qx} y2={qy} stroke="rgba(255,180,50,0.28)" strokeWidth="1.6" />
                <line x1={m2x} y1={m2y} x2={qx} y2={qy} stroke="rgba(255,180,50,0.28)" strokeWidth="1.6" />
              </g>
            );
          })}

          {/* QF node → SF node */}
          {Array.from({ length: 2 }, (_, i) => {
            const g = i * 16;
            const [m1x, m1y] = mid(g, g + 7, R_QF);
            const [m2x, m2y] = mid(g + 8, g + 15, R_QF);
            const [sx, sy] = mid(g, g + 15, R_SF);
            return (
              <g key={`sfl-${i}`}>
                <line x1={m1x} y1={m1y} x2={sx} y2={sy} stroke="rgba(247,209,73,0.38)" strokeWidth="1.8" />
                <line x1={m2x} y1={m2y} x2={sx} y2={sy} stroke="rgba(247,209,73,0.38)" strokeWidth="1.8" />
              </g>
            );
          })}

          {/* SF nodes → centre */}
          {([0, 16] as const).map((g) => {
            const [sx, sy] = mid(g, g + 15, R_SF);
            return <line key={`finl-${g}`} x1={sx} y1={sy} x2={CX} y2={CY} stroke="rgba(247,209,73,0.55)" strokeWidth="2" />;
          })}

          {/* ── Stage nodes ────────────────────────────────────────── */}

          {/* R32 nodes */}
          {Array.from({ length: 16 }, (_, i) => {
            const [x, y] = mid(i * 2, i * 2 + 1, R_R32);
            return <circle key={`r32n-${i}`} cx={x} cy={y} r={3} fill="rgba(255,255,255,0.22)" />;
          })}
          {/* R16 nodes */}
          {Array.from({ length: 8 }, (_, i) => {
            const g = i * 4;
            const [x, y] = mid(g, g + 3, R_R16);
            return <circle key={`r16n-${i}`} cx={x} cy={y} r={4} fill="rgba(100,200,255,0.55)" />;
          })}
          {/* QF nodes */}
          {Array.from({ length: 4 }, (_, i) => {
            const g = i * 8;
            const [x, y] = mid(g, g + 7, R_QF);
            return <circle key={`qfn-${i}`} cx={x} cy={y} r={5} fill="rgba(255,185,45,0.65)" />;
          })}
          {/* SF nodes */}
          {Array.from({ length: 2 }, (_, i) => {
            const g = i * 16;
            const [x, y] = mid(g, g + 15, R_SF);
            return <circle key={`sfn-${i}`} cx={x} cy={y} r={7} fill="rgba(247,209,73,0.85)" />;
          })}

          {/* ── Match number labels (outer) ────────────────────────── */}
          {Array.from({ length: 16 }, (_, i) => {
            const matchNums = Object.entries(MATCH_POS).filter(([, [h]]) => h === i * 2).map(([mn]) => mn);
            const mn = matchNums[0];
            const [mx, my] = mid(i * 2, i * 2 + 1, R_BADGE + 30);
            return (
              <text key={`mn-${i}`} x={mx} y={my} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="900" fill="rgba(255,255,255,0.25)" style={{ fontFamily: "system-ui" }}>
                M{mn}
              </text>
            );
          })}

          {/* ── Stage ring labels ──────────────────────────────────── */}
          {[
            { r: R_R16 + 14, text: "R16", fill: "rgba(100,200,255,0.4)" },
            { r: R_QF + 12,  text: "QF",  fill: "rgba(255,185,45,0.45)" },
            { r: R_SF + 10,  text: "SF",  fill: "rgba(247,209,73,0.6)" },
          ].map(({ r, text, fill }) => (
            <text key={text} x={CX} y={CY - r} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="900" fill={fill} style={{ fontFamily: "system-ui" }}>
              {text}
            </text>
          ))}

          {/* ── Centre (Final / Trophy) ────────────────────────────── */}
          <circle cx={CX} cy={CY} r={65} fill="url(#cb-glow)" />
          <circle cx={CX} cy={CY} r={40} fill="rgba(247,209,73,0.12)" stroke="rgba(247,209,73,0.5)" strokeWidth="1.5" />
          <text x={CX} y={CY - 2} textAnchor="middle" dominantBaseline="middle" fontSize="26">🏆</text>
          <text x={CX} y={CY + 54} textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="900" fill="rgba(247,209,73,0.65)" letterSpacing="0.2em" style={{ fontFamily: "system-ui" }}>
            FINAL
          </text>

          {/* ── Team badges ────────────────────────────────────────── */}
          {Array.from({ length: 32 }, (_, pos) => {
            const { team, label, isLocked, isKnown } = posInfo(pos);
            const [bx, by] = pt(pos, R_BADGE);
            const isHov = hoveredPos === pos;
            const isThird = label.startsWith("3rd") || (!isKnown && !label.match(/^[A-L][12]$/));

            const badgeFill = isLocked
              ? "rgba(247,209,73,0.22)"
              : isKnown
                ? "rgba(255,255,255,0.1)"
                : "rgba(255,255,255,0.04)";
            const badgeStroke = isLocked
              ? "#f7d149"
              : isKnown
                ? "rgba(255,255,255,0.22)"
                : "rgba(255,255,255,0.08)";
            const strokeWidth = isLocked ? 1.8 : isKnown ? 1 : 0.8;

            const inner = (
              <>
                {/* Glow for locked teams */}
                {isLocked && (
                  <circle r={BADGE_R + 5} fill="rgba(247,209,73,0.12)" />
                )}
                {/* Badge background */}
                <circle
                  r={BADGE_R}
                  fill={badgeFill}
                  stroke={badgeStroke}
                  strokeWidth={strokeWidth}
                  style={{ transition: "fill 0.15s" }}
                />
                {/* Hover ring */}
                {isHov && (
                  <circle r={BADGE_R + 2} fill="none" stroke={isLocked ? "#f7d149" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" />
                )}
                {/* Flag image */}
                {team?.flagAssetUrl ? (
                  <image
                    href={team.flagAssetUrl}
                    x={-(BADGE_R - 1)}
                    y={-Math.round((BADGE_R - 1) * 0.7)}
                    width={(BADGE_R - 1) * 2}
                    height={Math.round((BADGE_R - 1) * 1.4)}
                    clipPath="url(#cb-clip)"
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : team?.flagEmoji ? (
                  <text textAnchor="middle" dominantBaseline="middle" fontSize={BADGE_R - 2} style={{ userSelect: "none" }}>
                    {team.flagEmoji}
                  </text>
                ) : (
                  <text textAnchor="middle" dominantBaseline="middle" fontSize="8" fontWeight="900" fill="rgba(255,255,255,0.25)" style={{ userSelect: "none", fontFamily: "system-ui" }}>
                    {label.slice(0, 5)}
                  </text>
                )}
                {/* LOCKED micro-badge */}
                {isLocked && (
                  <g transform={`translate(${BADGE_R - 8}, ${-(BADGE_R - 8)})`}>
                    <circle r={6} fill="#f7d149" />
                    <text textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="900" fill="#10131a" style={{ userSelect: "none" }}>✓</text>
                  </g>
                )}
                {/* Tooltip on hover */}
                {isHov && (team || label) && (
                  <g transform={`translate(0, ${BADGE_R + 8})`}>
                    <rect x={-50} y={0} width={100} height={20} rx={5} fill="rgba(16,19,26,0.97)" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" />
                    <text
                      x={0} y={10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8.5"
                      fontWeight="900"
                      fill="white"
                      style={{ userSelect: "none", fontFamily: "system-ui" }}
                    >
                      {team ? (team.name.length > 14 ? team.name.slice(0, 13) + "…" : team.name) : label}
                    </text>
                  </g>
                )}
              </>
            );

            const slug = team?.slug;

            return (
              <g
                key={pos}
                transform={`translate(${bx}, ${by})`}
                onMouseEnter={() => setHoveredPos(pos)}
                onMouseLeave={() => setHoveredPos(null)}
                style={{ cursor: slug ? "pointer" : "default" }}
                onClick={() => { if (slug) window.location.href = `/teams/${slug}`; }}
              >
                {inner}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
