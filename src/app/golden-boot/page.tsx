export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { LiveRefresh } from "@/components/live-refresh";
import { GoldenBootBoard } from "@/components/golden-boot-board";
import { getGoldenBootStandings } from "@/lib/pulse90-data";

export const metadata: Metadata = {
  title: "Golden Boot Watch",
  description: "Live top scorer standings for FIFA World Cup 2026 — updated every 2 minutes during matches.",
};

export default async function GoldenBootPage() {
  const { players, hasLiveGame } = await getGoldenBootStandings();
  return (
    <AppShell>
      <LiveRefresh isLive={hasLiveGame} />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <GoldenBootBoard hasLiveGame={hasLiveGame} players={players} />
      </div>
    </AppShell>
  );
}
