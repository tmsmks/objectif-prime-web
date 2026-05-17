"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export type OnboardingState = { error?: string } | undefined;

export async function completeOnboarding(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const display_name = String(formData.get("display_name") ?? "").trim() || null;
  const gender = String(formData.get("gender") ?? "");
  const birth_date = String(formData.get("birth_date") ?? "");
  const height_cm = Number(formData.get("height_cm"));
  const start_weight_kg = Number(formData.get("start_weight_kg"));
  const target_weight_kg = Number(formData.get("target_weight_kg"));
  const target_date = String(formData.get("target_date") ?? "");
  const daily_step_goal = Number(formData.get("daily_step_goal")) || 8000;

  if (!["male", "female", "other"].includes(gender)) return { error: "Genre requis." };
  if (!birth_date) return { error: "Date de naissance requise." };
  if (!height_cm || height_cm < 100 || height_cm > 250) return { error: "Taille invalide." };
  if (!start_weight_kg || start_weight_kg < 30 || start_weight_kg > 400)
    return { error: "Poids de départ invalide." };
  if (!target_weight_kg || target_weight_kg < 30 || target_weight_kg > 400)
    return { error: "Poids cible invalide." };
  if (!target_date) return { error: "Date cible requise." };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name,
      gender,
      birth_date,
      height_cm,
      start_weight_kg,
      target_weight_kg,
      target_date,
      daily_step_goal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  // Première pesée = poids de départ (upsert pour éviter doublon si onboarding rejoué)
  await supabase.from("weight_logs").upsert(
    {
      user_id: user.id,
      weight_kg: start_weight_kg,
      logged_at: todayISO(),
    },
    { onConflict: "user_id,logged_at" },
  );

  revalidatePath("/", "layout");
  redirect("/groups");
}
