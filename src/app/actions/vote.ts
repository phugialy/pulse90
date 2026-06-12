"use server";

import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { VoteTally } from "@/lib/pulse90-data";

export async function castVote(
  fixtureId: string,
  pickedTeamId: string | null,
  voterSession: string,
  homeTeamId: string,
  awayTeamId: string,
): Promise<VoteTally> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return { homeVotes: 0, drawVotes: 0, awayVotes: 0, total: 0 };

  await supabase
    .from("fixture_votes")
    .upsert(
      { fixture_id: fixtureId, picked_team_id: pickedTeamId, voter_session: voterSession },
      { onConflict: "fixture_id,voter_session" },
    );

  const { data } = await supabase
    .from("fixture_votes")
    .select("picked_team_id")
    .eq("fixture_id", fixtureId);

  const rows = (data ?? []) as Array<{ picked_team_id: string | null }>;
  return {
    homeVotes: rows.filter((r) => r.picked_team_id === homeTeamId).length,
    drawVotes: rows.filter((r) => r.picked_team_id === null).length,
    awayVotes: rows.filter((r) => r.picked_team_id === awayTeamId).length,
    total: rows.length,
  };
}
