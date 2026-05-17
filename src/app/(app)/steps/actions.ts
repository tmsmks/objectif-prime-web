"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type StepsState = { error?: string; ok?: boolean } | undefined;

export async function saveSteps(_prev: StepsState, formData: FormData): Promise<StepsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const steps = Number(formData.get("steps"));
  const active_kcal = Number(formData.get("active_kcal")) || 0;
  const logged_at = String(formData.get("logged_at") ?? "");

  if (steps == null || steps < 0 || steps > 200000) return { error: "Nombre de pas invalide." };
  if (!logged_at) return { error: "Date requise." };

  const { error } = await supabase
    .from("health_snapshots")
    .upsert(
      { user_id: user.id, logged_at, steps, active_kcal },
      { onConflict: "user_id,logged_at" },
    );

  if (error) return { error: error.message };
  revalidatePath("/steps");
  revalidatePath("/dashboard");
  return { ok: true };
}
