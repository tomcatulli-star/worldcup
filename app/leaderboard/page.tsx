import { redirect } from "next/navigation";
import { Medal } from "lucide-react";
import { Nav } from "@/components/Nav";
import type { LeaderboardRow } from "@/lib/types";
import { getProfile, getSessionUser } from "@/lib/supabase/queries";

export default async function LeaderboardPage() {
  const { user, supabase } = await getSessionUser();
  if (!user) redirect("/auth");

  const [profile, { data }] = await Promise.all([
    getProfile(user.id),
    supabase
      .from("leaderboard")
      .select("*")
      .order("total_points", { ascending: false })
      .order("exact_scores_count", { ascending: false })
      .order("correct_outcomes_count", { ascending: false })
  ]);

  const rows = (data ?? []) as LeaderboardRow[];

  return (
    <>
      <Nav profile={profile} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-limeflash">Leaderboard</p>
          <h1 className="mt-2 text-3xl font-black">League table</h1>
        </section>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
          <div className="grid grid-cols-[48px_1fr_80px] gap-3 border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white/45 sm:grid-cols-[64px_1fr_110px_110px_110px]">
            <span>Rank</span>
            <span>Name</span>
            <span className="text-right">Pts</span>
            <span className="hidden text-right sm:block">Exact</span>
            <span className="hidden text-right sm:block">Outcome</span>
          </div>
          {rows.map((row, index) => (
            <div key={row.user_id} className="grid grid-cols-[48px_1fr_80px] items-center gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[64px_1fr_110px_110px_110px]">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-black/25 font-black text-goldline">
                {index < 3 ? <Medal size={18} /> : index + 1}
              </span>
              <div>
                <p className="font-black">{row.display_name}</p>
                <p className="text-xs text-white/45">{row.predictions_count} picks</p>
              </div>
              <span className="text-right text-2xl font-black text-limeflash">{row.total_points}</span>
              <span className="hidden text-right font-bold sm:block">{row.exact_scores_count}</span>
              <span className="hidden text-right font-bold sm:block">{row.correct_outcomes_count}</span>
            </div>
          ))}
          {rows.length === 0 ? <p className="p-4 text-white/60">No predictions scored yet.</p> : null}
        </div>
      </main>
    </>
  );
}
