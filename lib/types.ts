export type Role = "user" | "admin";
export type MatchStatus = "upcoming" | "live" | "finished";

export type Profile = {
  id: string;
  display_name: string;
  role: Role;
  created_at: string;
  updated_at: string;
};

export type Match = {
  id: string;
  tournament: string;
  stage: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  created_at: string;
  updated_at: string;
};

export type Prediction = {
  id: string;
  user_id: string;
  match_id: string;
  predicted_home_score: number;
  predicted_away_score: number;
  calculated_points: number;
  exact_score: boolean;
  correct_outcome: boolean;
  created_at: string;
  updated_at: string;
};

export type LeaderboardRow = {
  user_id: string;
  display_name: string;
  total_points: number;
  exact_scores_count: number;
  correct_outcomes_count: number;
  predictions_count: number;
};

export type MatchWithPrediction = Match & {
  prediction?: Prediction | null;
};
