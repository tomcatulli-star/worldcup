"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import type { Match, Prediction } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { formatKickoff, isLocked } from "@/lib/scoring";

export function PredictionForm({
  match,
  prediction,
  userId
}: {
  match: Match;
  prediction: Prediction | null;
  userId: string;
}) {
  const router = useRouter();
  const locked = isLocked(match.kickoff_at);
  const [homeScore, setHomeScore] = useState(prediction?.predicted_home_score ?? 0);
  const [awayScore, setAwayScore] = useState(prediction?.predicted_away_score ?? 0);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function savePrediction(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const supabase = createClient();
    const payload = {
      predicted_home_score: homeScore,
      predicted_away_score: awayScore
    };

    const { error } = prediction
      ? await supabase
          .from("predictions")
          .update(payload)
          .eq("user_id", userId)
          .eq("match_id", match.id)
      : await supabase.from("predictions").insert({
          user_id: userId,
          match_id: match.id,
          ...payload
        });

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Prediction saved.");
    router.refresh();
  }

  return (
    <form className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-glow" onSubmit={savePrediction}>
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-limeflash">{match.tournament}</p>
        <h1 className="mt-2 text-2xl font-black">
          {match.home_team} vs {match.away_team}
        </h1>
        <p className="mt-2 text-sm text-white/60">{match.stage} - {formatKickoff(match.kickoff_at)}</p>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <label>
          <span className="mb-2 block text-sm text-white/65">{match.home_team}</span>
          <input
            className="h-20 w-full rounded-md border border-white/10 bg-black/30 text-center text-4xl font-black outline-none ring-limeflash/60 focus:ring-2 disabled:opacity-50"
            type="number"
            min={0}
            max={20}
            value={homeScore}
            disabled={locked}
            onChange={(event) => setHomeScore(Number(event.target.value))}
            required
          />
        </label>
        <span className="pb-5 text-3xl font-black text-white/35">:</span>
        <label>
          <span className="mb-2 block text-right text-sm text-white/65">{match.away_team}</span>
          <input
            className="h-20 w-full rounded-md border border-white/10 bg-black/30 text-center text-4xl font-black outline-none ring-limeflash/60 focus:ring-2 disabled:opacity-50"
            type="number"
            min={0}
            max={20}
            value={awayScore}
            disabled={locked}
            onChange={(event) => setAwayScore(Number(event.target.value))}
            required
          />
        </label>
      </div>
      {locked ? (
        <p className="mt-4 rounded-md border border-white/10 bg-black/25 p-3 text-sm text-white/65">
          Predictions are locked after kickoff.
        </p>
      ) : null}
      {message ? <p className="mt-4 rounded-md border border-goldline/40 bg-goldline/10 p-3 text-sm text-goldline">{message}</p> : null}
      <button
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-limeflash px-4 py-3 font-black text-pitch-950 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        disabled={locked || saving}
        type="submit"
      >
        <Save size={18} />
        {saving ? "Saving" : "Save prediction"}
      </button>
      {prediction && match.status === "finished" ? (
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-md bg-black/25 p-3">
            <p className="text-white/50">Points</p>
            <p className="text-xl font-black text-limeflash">{prediction.calculated_points}</p>
          </div>
          <div className="rounded-md bg-black/25 p-3">
            <p className="text-white/50">Outcome</p>
            <p className="font-black">{prediction.correct_outcome ? "Yes" : "No"}</p>
          </div>
          <div className="rounded-md bg-black/25 p-3">
            <p className="text-white/50">Exact</p>
            <p className="font-black">{prediction.exact_score ? "Yes" : "No"}</p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
