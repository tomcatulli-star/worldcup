"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth");
    router.refresh();
  }

  return (
    <button
      aria-label="Sign out"
      className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
      type="button"
      onClick={signOut}
    >
      <LogOut size={18} />
    </button>
  );
}
