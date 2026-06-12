import Link from "next/link";
import { Lock, Pencil, Timer, Trophy } from "lucide-react";
import type { MatchWithPrediction } from "@/lib/types";
import { formatKickoff, isLocked } from "@/lib/scoring";

export function MatchCard({ match }: { match: MatchWithPrediction }) {
  const locked = isLocked(match.kickoff_at);
  const hasPrediction = Boolean(match.prediction);
  const score =
    match.home_score !== null && match.away_score !== null ? `${match.home_score}:${match.away_score}` : "vs";

  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.055] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-limeflash">{match.tournament}</p>
          <p className="mt-1 text-sm text-white/55">{match.stage}</p>
        </div>
        <span className="rounded-md border border-white/10 px-2 py-1 text-xs font-bold uppercase text-white/70">
          {match.status}
        </span>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <p className="text-left text-lg font-black">{match.home_team}</p>
        <div className="rounded-md bg-black/30 px-3 py-2 text-lg font-black text-goldline">{score}</div>
        <p className="text-right text-lg font-black">{match.away_team}</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-white/65">
        <span className="flex items-center gap-2">
          <Timer size={16} />
          {formatKickoff(match.kickoff_at)}
        </span>
        <span className="flex items-center gap-2">
          {locked ? <Lock size={16} /> : <Pencil size={16} />}
          {locked ? "Locked" : hasPrediction ? "Editable" : "Open"}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm">
          <p className="text-white/50">Your pick</p>
          <p className="font-bold">
            {match.prediction
              ? `${match.prediction.predicted_home_score}:${match.prediction.predicted_away_score} (${match.prediction.calculated_points} pts)`
              : "No prediction yet"}
          </p>
        </div>
        <Link
          className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-black text-pitch-950 hover:bg-limeflash"
          href={`/matches/${match.id}`}
        >
          <Trophy size={16} />
          Pick
        </Link>
      </div>
    </article>
  );
}
