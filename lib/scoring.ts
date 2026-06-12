type Score = {
  home: number;
  away: number;
};

export function outcome(score: Score) {
  if (score.home > score.away) return "home";
  if (score.away > score.home) return "away";
  return "draw";
}

export function calculatePredictionPoints(actual: Score, predicted: Score) {
  const correctOutcome = outcome(actual) === outcome(predicted);
  const exactScore = actual.home === predicted.home && actual.away === predicted.away;

  return {
    correctOutcome,
    exactScore,
    points: correctOutcome ? 1 + (exactScore ? 1 : 0) : 0
  };
}

export function isLocked(kickoffAt: string) {
  return new Date(kickoffAt).getTime() <= Date.now();
}

export function formatKickoff(kickoffAt: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(kickoffAt));
}
