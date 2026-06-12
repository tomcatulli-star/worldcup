import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Nav } from "@/components/Nav";
import { PredictionForm } from "@/components/PredictionForm";
import type { Match, Prediction } from "@/lib/types";
import { getProfile, getSessionUser } from "@/lib/supabase/queries";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, supabase } = await getSessionUser();
  if (!user) redirect("/auth");

  const { id } = await params;
  const [{ data: profile }, { data: match }, { data: prediction }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("matches").select("*").eq("id", id).single(),
    supabase.from("predictions").select("*").eq("user_id", user.id).eq("match_id", id).maybeSingle()
  ]);

  if (!match) notFound();

  return (
    <>
      <Nav profile={profile ?? (await getProfile(user.id))} />
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Link className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-white/70 hover:text-white" href="/dashboard">
          <ArrowLeft size={16} />
          Back to matches
        </Link>
        <PredictionForm match={match as Match} prediction={(prediction as Prediction | null) ?? null} userId={user.id} />
      </main>
    </>
  );
}
