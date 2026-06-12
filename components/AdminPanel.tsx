"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Save } from "lucide-react";
import type { Match, MatchStatus } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

type DraftMatch = {
  tournament: string;
  stage: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
};

const blankDraft: DraftMatch = {
  tournament: "FIFA World Cup 2026",
  stage: "Group A",
  home_team: "",
  away_team: "",
  kickoff_at: ""
};

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  return new Date(value).toISOString();
}

export function AdminPanel({ matches }: { matches: Match[] }) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [draft, setDraft] = useState<DraftMatch>(blankDraft);
  const [message, setMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function createMatch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    const { error } = await supabase.from("matches").insert({
      ...draft,
      kickoff_at: fromDatetimeLocal(draft.kickoff_at),
      status: "upcoming"
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setDraft(blankDraft);
    router.refresh();
  }

  async function updateMatch(match: Match, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusyId(match.id);
    setMessage(null);
    const formData = new FormData(event.currentTarget);

    const homeScore = formData.get("home_score");
    const awayScore = formData.get("away_score");
    const status = formData.get("status") as MatchStatus;
    const kickoffAt = String(formData.get("kickoff_at"));

    const { error } = await supabase
      .from("matches")
      .update({
        tournament: String(formData.get("tournament")),
        stage: String(formData.get("stage")),
        home_team: String(formData.get("home_team")),
        away_team: String(formData.get("away_team")),
        kickoff_at: fromDatetimeLocal(kickoffAt),
        home_score: homeScore === "" ? null : Number(homeScore),
        away_score: awayScore === "" ? null : Number(awayScore),
        status
      })
      .eq("id", match.id);

    setBusyId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.refresh();
  }

  async function recalculate(matchId: string) {
    setBusyId(matchId);
    setMessage(null);
    const { error } = await supabase.rpc("recalculate_match_points", { target_match_id: matchId });
    setBusyId(null);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Points recalculated.");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <form className="rounded-lg border border-white/10 bg-white/[0.06] p-4" onSubmit={createMatch}>
        <h2 className="mb-4 text-xl font-black">Create match</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className="rounded-md border border-white/10 bg-black/25 px-3 py-3" value={draft.tournament} onChange={(event) => setDraft({ ...draft, tournament: event.target.value })} required />
          <input className="rounded-md border border-white/10 bg-black/25 px-3 py-3" value={draft.stage} onChange={(event) => setDraft({ ...draft, stage: event.target.value })} required />
          <input className="rounded-md border border-white/10 bg-black/25 px-3 py-3" placeholder="Home team" value={draft.home_team} onChange={(event) => setDraft({ ...draft, home_team: event.target.value })} required />
          <input className="rounded-md border border-white/10 bg-black/25 px-3 py-3" placeholder="Away team" value={draft.away_team} onChange={(event) => setDraft({ ...draft, away_team: event.target.value })} required />
          <input className="rounded-md border border-white/10 bg-black/25 px-3 py-3 sm:col-span-2" type="datetime-local" value={draft.kickoff_at} onChange={(event) => setDraft({ ...draft, kickoff_at: event.target.value })} required />
        </div>
        <button className="mt-4 flex items-center gap-2 rounded-md bg-limeflash px-4 py-3 font-black text-pitch-950 hover:bg-white" type="submit">
          <Plus size={18} />
          Add match
        </button>
      </form>

      {message ? <p className="rounded-md border border-goldline/40 bg-goldline/10 p-3 text-sm text-goldline">{message}</p> : null}

      <div className="space-y-4">
        {matches.map((match) => (
          <form
            key={match.id}
            className="rounded-lg border border-white/10 bg-white/[0.05] p-4"
            onSubmit={(event) => updateMatch(match, event)}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="tournament" className="rounded-md border border-white/10 bg-black/25 px-3 py-3" defaultValue={match.tournament} />
              <input name="stage" className="rounded-md border border-white/10 bg-black/25 px-3 py-3" defaultValue={match.stage} />
              <input name="home_team" className="rounded-md border border-white/10 bg-black/25 px-3 py-3" defaultValue={match.home_team} />
              <input name="away_team" className="rounded-md border border-white/10 bg-black/25 px-3 py-3" defaultValue={match.away_team} />
              <input name="kickoff_at" className="rounded-md border border-white/10 bg-black/25 px-3 py-3" type="datetime-local" defaultValue={toDatetimeLocal(match.kickoff_at)} />
              <select name="status" className="rounded-md border border-white/10 bg-black/25 px-3 py-3" defaultValue={match.status}>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="finished">Finished</option>
              </select>
              <input name="home_score" className="rounded-md border border-white/10 bg-black/25 px-3 py-3" type="number" min={0} placeholder="Home score" defaultValue={match.home_score ?? ""} />
              <input name="away_score" className="rounded-md border border-white/10 bg-black/25 px-3 py-3" type="number" min={0} placeholder="Away score" defaultValue={match.away_score ?? ""} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="flex items-center gap-2 rounded-md bg-white px-4 py-3 font-black text-pitch-950 hover:bg-limeflash disabled:opacity-50" disabled={busyId === match.id} type="submit">
                <Save size={18} />
                Save
              </button>
              <button className="flex items-center gap-2 rounded-md border border-white/10 px-4 py-3 font-black hover:bg-white/10 disabled:opacity-50" disabled={busyId === match.id} type="button" onClick={() => recalculate(match.id)}>
                <RefreshCw size={18} />
                Recalculate
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
