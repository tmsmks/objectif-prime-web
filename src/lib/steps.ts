import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const WALKING_ACTIVITY = "Marche (pas)";

function stepsToKcal(steps: number, weightKg: number): number {
  // ~0.5 kcal per kg per km, average stride ~0.75m
  const km = (steps * 0.75) / 1000;
  return Math.round(km * 0.5 * weightKg);
}

/**
 * Enregistre le total de pas d'un jour pour un utilisateur : met à jour le
 * snapshot santé et l'activité « marche » dérivée. Logique partagée entre la
 * saisie manuelle (server action) et la synchro automatique Apple Santé
 * (route /api/steps/sync).
 */
export async function recordSteps(
  supabase: SupabaseServerClient,
  userId: string,
  steps: number,
  loggedAt: string,
): Promise<{ kcalBurned: number }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("start_weight_kg")
    .eq("id", userId)
    .single();

  const { data: latestWeight } = await supabase
    .from("weight_logs")
    .select("weight_kg")
    .eq("user_id", userId)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const weightKg = Number(latestWeight?.weight_kg ?? profile?.start_weight_kg ?? 75);
  const kcalBurned = stepsToKcal(steps, weightKg);

  const { error: snapError } = await supabase
    .from("health_snapshots")
    .upsert(
      { user_id: userId, logged_at: loggedAt, steps, active_kcal: kcalBurned },
      { onConflict: "user_id,logged_at" },
    );

  if (snapError) throw new Error(snapError.message);

  // Replace previous auto-generated walking activity for this day
  await supabase
    .from("activity_logs")
    .delete()
    .eq("user_id", userId)
    .eq("logged_at", loggedAt)
    .eq("activity", WALKING_ACTIVITY);

  if (steps > 0) {
    await supabase.from("activity_logs").insert({
      user_id: userId,
      logged_at: loggedAt,
      activity: WALKING_ACTIVITY,
      duration_min: Math.round((steps * 0.75) / 1000 / 5 * 60),
      kcal_burned: kcalBurned,
    });
  }

  return { kcalBurned };
}
