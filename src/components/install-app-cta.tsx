import Link from "next/link";
import { ArrowUpRight, Smartphone } from "lucide-react";

export function InstallAppCta({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`rounded-[24px] border border-[#10131a]/10 bg-[#10131a] text-white shadow-sm ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <div className="flex items-center gap-2">
        <Smartphone className="size-4 text-lime" />
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/62">
          Faster daily access
        </p>
      </div>
      <h2 className={`mt-3 font-black leading-tight ${compact ? "text-lg" : "text-2xl"}`}>
        Add Pulse90 to your phone like an app.
      </h2>
      <p className="mt-2 text-sm font-bold leading-6 text-white/62">
        One tap from your home screen when matchday gets busy.
      </p>
      <Link
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-full bg-lime px-4 text-sm font-black text-[#10131a] transition hover:bg-[#ffe26a]"
        href="/install"
      >
        Add to phone
        <ArrowUpRight className="size-4" />
      </Link>
    </section>
  );
}
