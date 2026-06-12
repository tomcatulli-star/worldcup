import type { Match, MatchWithPrediction, Prediction } from "@/lib/types";
import { createClient } from "./server";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { supabase, user };
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, role, created_at, updated_at")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data;
}

export async function getMatchesWithPredictions(userId: string): Promise<MatchWithPrediction[]> {
  const supabase = await createClient();
  const [{ data: matches }, { data: predictions }] = await Promise.all([
    supabase.from("matches").select("*").order("kickoff_at", { ascending: true }),
    supabase.from("predictions").select("*").eq("user_id", userId)
  ]);

  const predictionByMatch = new Map(
    ((predictions ?? []) as Prediction[]).map((prediction) => [prediction.match_id, prediction])
  );

  return ((matches ?? []) as Match[]).map((match) => ({
    ...match,
    prediction: predictionByMatch.get(match.id) ?? null
  }));
}
