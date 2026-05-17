"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; ok?: boolean } | undefined;

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const display_name = String(formData.get("display_name") ?? "").trim() || null;
  const height_cm = Number(formData.get("height_cm")) || null;
  const target_weight_kg = Number(formData.get("target_weight_kg")) || null;
  const target_date = String(formData.get("target_date") ?? "") || null;
  const daily_step_goal = Number(formData.get("daily_step_goal")) || 8000;

  if (height_cm != null && (height_cm < 100 || height_cm > 250)) return { error: "Taille invalide." };
  if (target_weight_kg != null && (target_weight_kg < 30 || target_weight_kg > 400))
    return { error: "Poids cible invalide." };
  if (daily_step_goal < 1000 || daily_step_goal > 50000) return { error: "Objectif pas invalide." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name,
      height_cm,
      target_weight_kg,
      target_date,
      daily_step_goal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}
