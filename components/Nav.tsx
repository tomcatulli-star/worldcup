import Link from "next/link";
import { Trophy } from "lucide-react";
import type { Profile } from "@/lib/types";
import { SignOutButton } from "./SignOutButton";

export function Nav({ profile }: { profile?: Profile | null }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-pitch-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2 font-black tracking-wide">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-limeflash text-pitch-950">
            <Trophy size={18} />
          </span>
          <span>Cup Picks</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-white/75">
          <Link className="rounded-md px-3 py-2 hover:bg-white/10 hover:text-white" href="/dashboard">
            Matches
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-white/10 hover:text-white" href="/leaderboard">
            Table
          </Link>
          {profile?.role === "admin" ? (
            <Link className="rounded-md px-3 py-2 hover:bg-white/10 hover:text-white" href="/admin">
              Admin
            </Link>
          ) : null}
          {profile ? <SignOutButton /> : null}
        </nav>
      </div>
    </header>
  );
}
