"use client";

import { useState } from "react";
import { Heart, X } from "lucide-react";

const donationLinks = [
  { amount: "$1", href: "https://buy.stripe.com/cNi00jbB10yb4hf2VS7N600" },
  { amount: "$5", href: "https://buy.stripe.com/6oU00j20r6Wz00Z5407N601" },
  { amount: "$20", href: "https://buy.stripe.com/7sYdR920r80D5ljcws7N602" },
];

export function DonateMenu({ placement = "desktop" }: { placement?: "desktop" | "mobile" }) {
  const [open, setOpen] = useState(false);
  const isMobile = placement === "mobile";

  return (
    <div className={isMobile ? "relative" : "relative hidden md:block"}>
      <button
        aria-expanded={open}
        aria-label={open ? "Close donation options" : "Open donation options"}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-black transition ${
          isMobile
            ? "h-11 w-full bg-lime px-4 text-sm text-[#10131a]"
            : "h-10 bg-lime px-4 text-sm text-[#10131a] shadow-sm hover:bg-[#ffe26a]"
        }`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        {open ? <X className="size-4" /> : <Heart className="size-4 fill-current" />}
        Donate
      </button>

      {open ? (
        <div
          className={`z-50 rounded-[20px] border border-[#10131a]/10 bg-white p-2 shadow-[0_18px_50px_rgba(16,19,26,0.18)] ${
            isMobile
              ? "mt-2 grid grid-cols-3 gap-2"
              : "absolute right-0 top-12 grid w-[188px] grid-cols-3 gap-2"
          }`}
        >
          {donationLinks.map((item) => (
            <a
              className="grid h-11 place-items-center rounded-2xl bg-stadium text-sm font-black text-[#10131a] transition hover:bg-[#10131a] hover:text-white"
              href={item.href}
              key={item.amount}
              rel="noopener noreferrer"
              target="_blank"
            >
              {item.amount}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
