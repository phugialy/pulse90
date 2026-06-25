"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { label: "Watch Desk", href: "/" },
  { label: "Fixtures", href: "/fixtures" },
  { label: "Standings", href: "/groups" },
  { label: "Teams", href: "/teams" },
  { label: "Predictions", href: "/predictions" },
  { label: "Golden Boot", href: "/golden-boot" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-1 rounded-full border border-[#10131a]/10 bg-[#f8faf4] p-1 shadow-sm md:flex">
      {navItems.map((item) => {
        const active =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              active
                ? "bg-[#10131a] text-white"
                : "text-[#10131a]/60 hover:bg-[#10131a]/5 hover:text-[#10131a]"
            }`}
            href={item.href}
            key={item.label}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
