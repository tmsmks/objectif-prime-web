"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export type StepsState = { error?: string; ok?: boolean; kcalBurned?: number } | undefined;

function stepsToKcal(steps: number, weightKg: number): number {
  // ~0.5 kcal per kg per km, average stride ~0.75m
  const km = (steps * 0.75) / 1000;
  return Math.round(km * 0.5 * weightKg);
}

export async function saveSteps(_prev: StepsState, formData: FormData): Promise<StepsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const steps = Number(formData.get("steps"));
  const logged_at = String(formData.get("logged_at") ?? "") || todayISO();

  if (steps == null || steps < 0 || steps > 200000) return { error: "Nombre de pas invalide." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("start_weight_kg")
    .eq("id", user.id)
    .single();

  const { data: latestWeight } = await supabase
    .from("weight_logs")
    .select("weight_kg")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const weightKg = Number(latestWeight?.weight_kg ?? profile?.start_weight_kg ?? 75);
  const kcalBurned = stepsToKcal(steps, weightKg);

  const { error: snapError } = await supabase
    .from("health_snapshots")
    .upsert(
      { user_id: user.id, logged_at, steps, active_kcal: kcalBurned },
      { onConflict: "user_id,logged_at" },
    );

  if (snapError) return { error: snapError.message };

  // Replace previous auto-generated walking activity for this day
  await supabase
    .from("activity_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("logged_at", logged_at)
    .eq("activity", "Marche (pas)");

  if (steps > 0) {
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      logged_at,
      activity: "Marche (pas)",
      duration_min: Math.round((steps * 0.75) / 1000 / 5 * 60),
      kcal_burned: kcalBurned,
    });
  }

  revalidatePath("/steps");
  revalidatePath("/dashboard");
  revalidatePath("/groups");
  return { ok: true, kcalBurned };
}
