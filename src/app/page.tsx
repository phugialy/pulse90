import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Mail, MousePointer2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Final Whistle | Pulse90",
  description:
    "Pulse90 is retiring its live World Cup watch desk. The craft behind it is still available through Phugialy.",
};

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

function PulseCoin() {
  return (
    <div className="pulse-coin" aria-hidden="true">
      <div className="pulse-coin__rim" />
      <div className="pulse-coin__face">
        <span className="pulse-coin__mark">90</span>
        <span className="pulse-coin__rule" />
        <span className="pulse-coin__caption">Pulse</span>
      </div>
    </div>
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
    <article className={`closing-panel ${className}`}>
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
            <span className="size-2 rounded-full bg-[#3ef0b0] shadow-[0_0_18px_rgba(62,240,176,0.65)]" />
          </div>
        ))}
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <main className="closing-page">
      <header className="closing-nav" aria-label="Pulse90 closing navigation">
        <Link className="closing-logo" href="/">
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
          <a className="closing-nav-link" href="#artifact">
            Artifact
          </a>
          <a className="closing-nav-link" href="#craft">
            Craft
          </a>
          <a className="closing-nav-link" href="#contact">
            Contact
          </a>
        </nav>
      </header>

      <section className="closing-hero" id="artifact">
        <div className="closing-stage" aria-hidden="true">
          <div className="closing-stadium">
            <span className="closing-light closing-light-a" />
            <span className="closing-light closing-light-b" />
            <span className="closing-light closing-light-c" />
            <span className="closing-field-line closing-field-line-a" />
            <span className="closing-field-line closing-field-line-b" />
            <span className="closing-field-line closing-field-line-c" />
          </div>
          <div className="closing-orbit">
            <PulseCoin />
            {archivePanels.map((panel) => (
              <ArchivePanel key={panel.label} {...panel} />
            ))}
          </div>
        </div>

        <div className="closing-copy">
          <p className="closing-kicker">World Cup watch desk / archived</p>
          <h1>Final Whistle.</h1>
          <p className="closing-lede">
            Pulse90 is retiring its live match desk. The craft behind it is still
            available.
          </p>
          <div className="closing-actions">
            <a
              className="closing-primary"
              href="https://phugialy.com"
              rel="noreferrer"
              target="_blank"
            >
              Build something like this
              <ArrowUpRight className="size-4" />
            </a>
            <a className="closing-secondary" href="mailto:phu@phugialy.com">
              <Mail className="size-4" />
              Email phu@phugialy.com
            </a>
          </div>
          <div className="closing-scroll-cue">
            <MousePointer2 className="size-4" />
            <span>Scroll the artifact</span>
          </div>
        </div>
      </section>

      <section className="closing-craft" id="craft" aria-label="Pulse90 product craft">
        <div>
          <p className="closing-kicker">What this preserved</p>
          <h2>Not a shutdown page. A product memory you can hire.</h2>
        </div>
        <div className="closing-craft-grid">
          <article>
            <span>01</span>
            <h3>Live pressure, made scannable</h3>
            <p>
              Fixtures, tables, teams, and match stakes were designed for fast
              decisions instead of headline noise.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>3D as a signal, not decoration</h3>
            <p>
              The closing scene turns the product into an artifact: one badge,
              four frozen panels, one clear path forward.
            </p>
          </article>
          <article>
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
        <p className="closing-kicker">After the final whistle</p>
        <h2>Want a web experience people remember?</h2>
        <div className="closing-actions justify-center">
          <a
            className="closing-primary"
            href="https://phugialy.com"
            rel="noreferrer"
            target="_blank"
          >
            Go to phugialy.com
            <ArrowUpRight className="size-4" />
          </a>
          <a className="closing-secondary" href="mailto:phu@phugialy.com">
            <Mail className="size-4" />
            phu@phugialy.com
          </a>
        </div>
      </section>
    </main>
  );
}
