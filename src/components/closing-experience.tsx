"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mail, MousePointer2, Sparkles } from "lucide-react";

const archivePanels = [
  {
    label: "Fixtures",
    title: "Mexico vs England",
    meta: "Best of 16 / Estadio Azteca",
    lines: ["Kickoff preserved", "No live data", "Archive mode"],
    className: "closing-panel-fixtures",
  },
  {
    label: "Teams",
    title: "48 paths frozen",
    meta: "Flags, rosters, form",
    lines: ["National team lens", "Compact scouting", "Match context"],
    className: "closing-panel-teams",
  },
  {
    label: "Standings",
    title: "Tables retired",
    meta: "Group math complete",
    lines: ["Pts / GD / GF", "No cron dependency", "Static display"],
    className: "closing-panel-standings",
  },
  {
    label: "Match Flow",
    title: "Final signal held",
    meta: "Watch desk memory",
    lines: ["Moments", "Pressure", "Next move"],
    className: "closing-panel-flow",
  },
];

function PulseCoin({ onEnter }: { onEnter: () => void }) {
  return (
    <button
      aria-label="Enter the Pulse90 archive"
      className="pulse-coin"
      onClick={onEnter}
      type="button"
    >
      <span className="pulse-coin__rim" />
      <span className="pulse-coin__face">
        <span className="pulse-coin__shine" />
        <span className="pulse-coin__mark">90</span>
        <span className="pulse-coin__rule" />
        <span className="pulse-coin__caption">Pulse</span>
      </span>
    </button>
  );
}

function ArchivePanel({
  className,
  label,
  lines,
  meta,
  title,
}: {
  className: string;
  label: string;
  lines: string[];
  meta: string;
  title: string;
}) {
  return (
    <article className={`closing-panel closing-hover-lift ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#ffcf3c]">
          {label}
        </p>
        <span className="rounded-full border border-white/15 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/58">
          frozen
        </span>
      </div>
      <h2 className="mt-4 text-xl font-black tracking-tight text-white sm:text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-sm font-medium text-white/58">{meta}</p>
      <div className="mt-5 space-y-2">
        {lines.map((line) => (
          <div
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2"
            key={line}
          >
            <span className="text-xs font-semibold text-white/72">{line}</span>
            <span className="closing-status-dot" />
          </div>
        ))}
      </div>
    </article>
  );
}

export function ClosingExperience() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [entered, setEntered] = useState(false);

  const resetPointer = useCallback(() => {
    const hero = heroRef.current;
    if (!hero) return;
    hero.style.setProperty("--mx", "0");
    hero.style.setProperty("--my", "0");
    hero.style.setProperty("--tilt-x", "0deg");
    hero.style.setProperty("--tilt-y", "0deg");
    hero.style.setProperty("--lift", "0px");
    hero.style.setProperty("--copy-x", "0px");
    hero.style.setProperty("--copy-y", "0px");
    hero.style.setProperty("--orbit-x", "0px");
    hero.style.setProperty("--orbit-y", "0px");
    hero.style.setProperty("--orbit-tilt-x", "0deg");
    hero.style.setProperty("--orbit-tilt-y", "0deg");
    hero.style.setProperty("--stadium-y", "12%");
    hero.style.setProperty("--stadium-rotate-x", "64deg");
    hero.style.setProperty("--stadium-rotate-z", "-3deg");
    hero.style.setProperty("--panel-a-x", "0px");
    hero.style.setProperty("--panel-a-y", "0px");
    hero.style.setProperty("--panel-a-rotate-x", "4deg");
    hero.style.setProperty("--panel-a-rotate-y", "28deg");
    hero.style.setProperty("--panel-b-x", "0px");
    hero.style.setProperty("--panel-b-y", "0px");
    hero.style.setProperty("--panel-b-rotate-x", "3deg");
    hero.style.setProperty("--panel-b-rotate-y", "-30deg");
    hero.style.setProperty("--panel-c-x", "0px");
    hero.style.setProperty("--panel-c-y", "0px");
    hero.style.setProperty("--panel-c-rotate-x", "-2deg");
    hero.style.setProperty("--panel-c-rotate-y", "24deg");
    hero.style.setProperty("--panel-d-x", "0px");
    hero.style.setProperty("--panel-d-y", "0px");
    hero.style.setProperty("--panel-d-rotate-x", "-2deg");
    hero.style.setProperty("--panel-d-rotate-y", "-26deg");
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === "touch") return;
    const hero = heroRef.current;
    if (!hero) return;

    const rect = hero.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    const clampedX = Math.max(-1, Math.min(1, x));
    const clampedY = Math.max(-1, Math.min(1, y));

    hero.style.setProperty("--mx", clampedX.toFixed(4));
    hero.style.setProperty("--my", clampedY.toFixed(4));
    hero.style.setProperty("--tilt-x", `${(-clampedY * 12).toFixed(2)}deg`);
    hero.style.setProperty("--tilt-y", `${(clampedX * 14).toFixed(2)}deg`);
    hero.style.setProperty("--lift", `${(-clampedY * 20).toFixed(2)}px`);
    hero.style.setProperty("--copy-x", `${(-clampedX * 6).toFixed(2)}px`);
    hero.style.setProperty("--copy-y", `${(-clampedY * 5).toFixed(2)}px`);
    hero.style.setProperty("--orbit-x", `${(clampedX * 13).toFixed(2)}px`);
    hero.style.setProperty("--orbit-y", `${(clampedY * 8).toFixed(2)}px`);
    hero.style.setProperty("--orbit-tilt-x", `${(-clampedY * 3.36).toFixed(2)}deg`);
    hero.style.setProperty("--orbit-tilt-y", `${(clampedX * 4.9).toFixed(2)}deg`);
    hero.style.setProperty("--stadium-y", `calc(12% + ${(clampedY * 8).toFixed(2)}px)`);
    hero.style.setProperty("--stadium-rotate-x", `${(64 - clampedY).toFixed(2)}deg`);
    hero.style.setProperty("--stadium-rotate-z", `${(-3 + clampedX * 1.4).toFixed(2)}deg`);
    hero.style.setProperty("--panel-a-x", `${(-clampedX * 11).toFixed(2)}px`);
    hero.style.setProperty("--panel-a-y", `${(-clampedY * 7).toFixed(2)}px`);
    hero.style.setProperty("--panel-a-rotate-x", `${(4 - clampedY * 3).toFixed(2)}deg`);
    hero.style.setProperty("--panel-a-rotate-y", `${(28 + clampedX * 4).toFixed(2)}deg`);
    hero.style.setProperty("--panel-b-x", `${(clampedX * 8).toFixed(2)}px`);
    hero.style.setProperty("--panel-b-y", `${(-clampedY * 6).toFixed(2)}px`);
    hero.style.setProperty("--panel-b-rotate-x", `${(3 - clampedY * 2).toFixed(2)}deg`);
    hero.style.setProperty("--panel-b-rotate-y", `${(-30 + clampedX * 4).toFixed(2)}deg`);
    hero.style.setProperty("--panel-c-x", `${(-clampedX * 7).toFixed(2)}px`);
    hero.style.setProperty("--panel-c-y", `${(clampedY * 7).toFixed(2)}px`);
    hero.style.setProperty("--panel-c-rotate-x", `${(-2 - clampedY * 2).toFixed(2)}deg`);
    hero.style.setProperty("--panel-c-rotate-y", `${(24 + clampedX * 3).toFixed(2)}deg`);
    hero.style.setProperty("--panel-d-x", `${(clampedX * 10).toFixed(2)}px`);
    hero.style.setProperty("--panel-d-y", `${(clampedY * 6).toFixed(2)}px`);
    hero.style.setProperty("--panel-d-rotate-x", `${(-2 - clampedY * 2).toFixed(2)}deg`);
    hero.style.setProperty("--panel-d-rotate-y", `${(-26 + clampedX * 3).toFixed(2)}deg`);
  }, []);

  const enterArchive = useCallback(() => {
    setEntered(true);
    window.setTimeout(() => {
      document.getElementById("craft")?.scrollIntoView({ behavior: "smooth" });
    }, 980);
  }, []);

  useEffect(() => {
    window.addEventListener("blur", resetPointer);
    return () => window.removeEventListener("blur", resetPointer);
  }, [resetPointer]);

  return (
    <main className={`closing-page ${entered ? "is-entering-archive" : ""}`}>
      <header className="closing-nav" aria-label="Pulse90 closing navigation">
        <Link className="closing-logo closing-hover-lift" href="/">
          <span className="closing-logo__coin">90</span>
          <span>
            <span className="block text-base font-black leading-none tracking-tight text-white">
              Pulse90
            </span>
            <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.36em] text-[#66a6ff]">
              final archive
            </span>
          </span>
        </Link>
        <nav className="hidden items-center gap-2 sm:flex">
          <a className="closing-nav-link closing-hover-lift" href="#artifact">
            Artifact
          </a>
          <a className="closing-nav-link closing-hover-lift" href="#craft">
            Craft
          </a>
          <a className="closing-nav-link closing-hover-lift" href="#contact">
            Contact
          </a>
        </nav>
      </header>

      <section
        className="closing-hero"
        id="artifact"
        onPointerLeave={resetPointer}
        onPointerMove={handlePointerMove}
        ref={heroRef}
      >
        <div className="closing-stage">
          <div className="closing-stage__hint">
            <Sparkles className="size-3.5" />
            <span>Click the badge to enter the archive</span>
          </div>
          <div className="closing-broadcast-world" aria-hidden="true">
            <span className="closing-tunnel-ring closing-tunnel-ring-a" />
            <span className="closing-tunnel-ring closing-tunnel-ring-b" />
            <span className="closing-tunnel-ring closing-tunnel-ring-c" />
            <span className="closing-ribbon closing-ribbon-a" />
            <span className="closing-ribbon closing-ribbon-b" />
            <span className="closing-audience-lights" />
          </div>
          <div className="closing-stadium" aria-hidden="true">
            <span className="closing-light closing-light-a" />
            <span className="closing-light closing-light-b" />
            <span className="closing-light closing-light-c" />
            <span className="closing-field-line closing-field-line-a" />
            <span className="closing-field-line closing-field-line-b" />
            <span className="closing-field-line closing-field-line-c" />
          </div>
          <div className="closing-orbit">
            <PulseCoin onEnter={enterArchive} />
            {archivePanels.map((panel) => (
              <ArchivePanel key={panel.label} {...panel} />
            ))}
          </div>
          <div className="closing-portal" aria-hidden="true" />
        </div>

        <div className="closing-copy">
          <p className="closing-kicker closing-hover-lift">World Cup watch desk / archived</p>
          <h1 className="closing-hover-lift">Final Whistle.</h1>
          <p className="closing-lede closing-hover-lift">
            Pulse90 is retiring its live match desk. The craft behind it is still
            available.
          </p>
          <div className="closing-actions">
            <a
              className="closing-primary closing-hover-lift"
              href="https://phugialy.com"
              rel="noreferrer"
              target="_blank"
            >
              Build something like this
              <ArrowUpRight className="size-4" />
            </a>
            <a className="closing-secondary closing-hover-lift" href="mailto:phu@phugialy.com">
              <Mail className="size-4" />
              Email phu@phugialy.com
            </a>
          </div>
          <button className="closing-scroll-cue closing-hover-lift" onClick={enterArchive} type="button">
            <MousePointer2 className="size-4" />
            <span>Enter the artifact</span>
          </button>
        </div>
      </section>

      <section className="closing-craft" id="craft" aria-label="Pulse90 product craft">
        <div>
          <p className="closing-kicker closing-hover-lift">What this preserved</p>
          <h2 className="closing-hover-lift">Not a shutdown page. A product memory you can hire.</h2>
        </div>
        <div className="closing-craft-grid">
          <article className="closing-hover-lift">
            <span>01</span>
            <h3>Live pressure, made scannable</h3>
            <p>
              Fixtures, tables, teams, and match stakes were designed for fast
              decisions instead of headline noise.
            </p>
          </article>
          <article className="closing-hover-lift">
            <span>02</span>
            <h3>Motion as product memory</h3>
            <p>
              The badge reacts to the pointer, panels hover independently, and the
              archive opens like a final broadcast transition.
            </p>
          </article>
          <article className="closing-hover-lift">
            <span>03</span>
            <h3>No database required</h3>
            <p>
              This final build is static, fast, and Vercel-hosted without live
              scores, Supabase calls, or scheduled data jobs.
            </p>
          </article>
        </div>
      </section>

      <section className="closing-contact" id="contact">
        <p className="closing-kicker closing-hover-lift">After the final whistle</p>
        <h2 className="closing-hover-lift">Want a web experience people remember?</h2>
        <div className="closing-actions justify-center">
          <a
            className="closing-primary closing-hover-lift"
            href="https://phugialy.com"
            rel="noreferrer"
            target="_blank"
          >
            Go to phugialy.com
            <ArrowUpRight className="size-4" />
          </a>
          <a className="closing-secondary closing-hover-lift" href="mailto:phu@phugialy.com">
            <Mail className="size-4" />
            phu@phugialy.com
          </a>
        </div>
      </section>
    </main>
  );
}
