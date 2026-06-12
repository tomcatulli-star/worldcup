"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName || email.split("@")[0] } }
          });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("Account created. Confirm your email if your Supabase project requires it.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-glow">
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-limeflash">Private league</p>
        <h1 className="mt-2 text-3xl font-black">World Cup predictions</h1>
      </div>
      <div className="mb-5 grid grid-cols-2 rounded-lg bg-black/25 p-1">
        <button
          className={`rounded-md px-3 py-2 text-sm font-bold ${mode === "login" ? "bg-limeflash text-pitch-950" : "text-white/70"}`}
          type="button"
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          className={`rounded-md px-3 py-2 text-sm font-bold ${mode === "signup" ? "bg-limeflash text-pitch-950" : "text-white/70"}`}
          type="button"
          onClick={() => setMode("signup")}
        >
          Signup
        </button>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        {mode === "signup" ? (
          <label className="block">
            <span className="mb-1 block text-sm text-white/70">Display name</span>
            <input
              className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-3 outline-none ring-limeflash/60 focus:ring-2"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Thomas"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Email</span>
          <input
            className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-3 outline-none ring-limeflash/60 focus:ring-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="you@example.com"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm text-white/70">Password</span>
          <input
            className="w-full rounded-md border border-white/10 bg-black/25 px-3 py-3 outline-none ring-limeflash/60 focus:ring-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            placeholder="At least 6 characters"
          />
        </label>
        {message ? <p className="rounded-md border border-goldline/40 bg-goldline/10 p-3 text-sm text-goldline">{message}</p> : null}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-md bg-limeflash px-4 py-3 font-black text-pitch-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : null}
          {mode === "login" ? "Enter league" : "Create account"}
        </button>
      </form>
    </div>
  );
}
