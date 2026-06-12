import { redirect } from "next/navigation";
import { MatchCard } from "@/components/MatchCard";
import { Nav } from "@/components/Nav";
import { getMatchesWithPredictions, getProfile, getSessionUser } from "@/lib/supabase/queries";

export default async function DashboardPage() {
  const { user } = await getSessionUser();
  if (!user) redirect("/auth");

  const [profile, matches] = await Promise.all([getProfile(user.id), getMatchesWithPredictions(user.id)]);
  const upcoming = matches.filter((match) => match.status !== "finished");
  const finished = matches.filter((match) => match.status === "finished");

  return (
    <>
      <Nav profile={profile} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-limeflash">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black">Your match picks</h1>
          <p className="mt-2 max-w-2xl text-white/60">Submit scores before kickoff. Once a match starts, picks lock automatically.</p>
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-black">Upcoming and live</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {upcoming.map((match) => <MatchCard key={match.id} match={match} />)}
            {upcoming.length === 0 ? <p className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-white/60">No open matches yet.</p> : null}
          </div>
        </section>
        <section className="mt-8 space-y-3">
          <h2 className="text-lg font-black">Finished</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {finished.map((match) => <MatchCard key={match.id} match={match} />)}
            {finished.length === 0 ? <p className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-white/60">Finished matches will show here.</p> : null}
          </div>
        </section>
      </main>
    </>
  );
}
