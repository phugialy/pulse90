"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
  /** Relative path appended to window.location.origin — e.g. "/golden-boot" */
  path?: string;
  className?: string;
  label?: string;
}

export function ShareButton({ title, text, path = "", className = "", label }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.origin + path : path;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // user cancelled — nothing to do
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  }

  const Icon = copied ? Check : Share2;

  return (
    <button
      aria-label="Share"
      onClick={handleShare}
      className={className}
    >
      <Icon className="size-4 shrink-0" />
      {label !== undefined && (
        <span>{copied ? "Copied!" : label}</span>
      )}
    </button>
  );
}
