import { redirect } from "next/navigation";
import { AdminPanel } from "@/components/AdminPanel";
import { Nav } from "@/components/Nav";
import type { Match } from "@/lib/types";
import { getProfile, getSessionUser } from "@/lib/supabase/queries";

export default async function AdminPage() {
  const { user, supabase } = await getSessionUser();
  if (!user) redirect("/auth");

  const profile = await getProfile(user.id);
  if (profile?.role !== "admin") redirect("/dashboard");

  const { data } = await supabase.from("matches").select("*").order("kickoff_at", { ascending: true });

  return (
    <>
      <Nav profile={profile} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-limeflash">Admin</p>
          <h1 className="mt-2 text-3xl font-black">Match control room</h1>
        </section>
        <AdminPanel matches={(data ?? []) as Match[]} />
      </main>
    </>
  );
}
