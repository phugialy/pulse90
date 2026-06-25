"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Menu, Shield, Sparkles, Trophy, Users, X } from "lucide-react";
import { DonateMenu } from "@/components/donate-menu";
import { InstallAppCta } from "@/components/install-app-cta";
import { navItems } from "@/components/nav-links";

const navIcons = {
  Fixtures: CalendarDays,
  "Golden Boot": Trophy,
  Standings: Shield,
  Predictions: Sparkles,
  Teams: Users,
  "Watch Desk": Home,
};

export function MobileNav() {
  const pathname = usePathname();

  return (
    <>
      <input className="peer/mobile-nav sr-only" id="mobile-nav-toggle" type="checkbox" />
      <label
        aria-label="Open navigation"
        className="fixed right-0 top-[32vh] z-40 grid h-16 w-11 place-items-center rounded-l-2xl border border-r-0 border-[#10131a]/10 bg-[#10131a] text-white shadow-[0_16px_40px_rgba(16,19,26,0.24)] transition peer-checked/mobile-nav:pointer-events-none peer-checked/mobile-nav:opacity-0 md:hidden"
        htmlFor="mobile-nav-toggle"
      >
        <Menu className="size-5" />
      </label>

      <label
        aria-label="Close navigation overlay"
        className="fixed inset-0 z-40 hidden bg-[#10131a]/24 backdrop-blur-[2px] peer-checked/mobile-nav:block md:hidden"
        htmlFor="mobile-nav-toggle"
      />

      <nav className="fixed inset-y-0 right-0 z-50 w-[min(82vw,310px)] translate-x-full border-l border-[#10131a]/10 bg-[#f8fbf9] p-4 shadow-[-18px_0_60px_rgba(16,19,26,0.18)] transition-transform peer-checked/mobile-nav:translate-x-0 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black text-[#10131a]">Pulse90</p>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-cobalt">
              Navigate
            </p>
          </div>
          <label
            aria-label="Close navigation"
            className="grid size-10 place-items-center rounded-full border border-[#10131a]/10 bg-white text-[#10131a]/70 shadow-sm"
            htmlFor="mobile-nav-toggle"
          >
            <X className="size-4" />
          </label>
        </div>

        <div className="mt-6 grid gap-2">
          {navItems.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = navIcons[item.label as keyof typeof navIcons];

            return (
              <Link
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-3 text-sm font-black transition ${
                  active
                    ? "bg-[#10131a] text-white"
                    : "bg-white text-[#10131a]/68 shadow-sm hover:text-[#10131a]"
                }`}
                href={item.href}
                key={item.href}
              >
                <span
                  className={`grid size-9 place-items-center rounded-xl ${
                    active ? "bg-white/12 text-lime" : "bg-stadium text-cobalt"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-5">
          <InstallAppCta compact />
        </div>

        <div className="mt-5 rounded-[22px] border border-[#10131a]/10 bg-white p-3 shadow-sm">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.18em] text-[#10131a]/48">
            Support
          </p>
          <DonateMenu placement="mobile" />
        </div>
      </nav>
    </>
  );
}
