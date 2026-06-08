import Link from "next/link";
import { Search } from "lucide-react";
import { MobileNav } from "@/components/mobile-nav";
import { NavLinks } from "@/components/nav-links";

export function PulseLogo() {
  return (
    <Link className="flex items-center gap-3" href="/">
      <div className="relative grid size-11 place-items-center rounded-full border border-[#10131a]/10 bg-lime text-black shadow-[0_12px_30px_rgba(17,24,39,0.14)]">
        <span className="absolute h-px w-8 bg-black/70" />
        <span className="absolute h-8 w-px bg-black/30" />
        <span className="relative text-sm font-black tracking-tighter">90</span>
      </div>
      <div>
        <p className="text-lg font-black tracking-tight text-[#10131a]">Pulse90</p>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cobalt">
          watch desk
        </p>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#d7ebff_0,#edf4f8_320px,#e7f3ef_880px)] text-[#10131a]">
      <header className="sticky top-0 z-20 border-b border-[#10131a]/10 bg-[#f8fbf9]/86 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          <PulseLogo />
          <NavLinks />
          <button
            aria-label="Search teams and matches"
            className="grid size-10 place-items-center rounded-full border border-[#10131a]/10 bg-white text-[#10131a]/70 shadow-sm transition hover:border-cobalt/40 hover:text-[#10131a]"
          >
            <Search className="size-4" />
          </button>
        </div>
      </header>
      <MobileNav />
      {children}
    </main>
  );
}
