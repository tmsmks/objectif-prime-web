"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordSteps } from "@/lib/steps";
import { todayISO } from "@/lib/utils";

export type StepsState = { error?: string; ok?: boolean; kcalBurned?: number } | undefined;

export async function saveSteps(_prev: StepsState, formData: FormData): Promise<StepsState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const steps = Number(formData.get("steps"));
  const logged_at = String(formData.get("logged_at") ?? "") || todayISO();

  if (steps == null || steps < 0 || steps > 200000) return { error: "Nombre de pas invalide." };

  try {
    const { kcalBurned } = await recordSteps(supabase, user.id, steps, logged_at);
    revalidatePath("/steps");
    revalidatePath("/dashboard");
    revalidatePath("/groups");
    return { ok: true, kcalBurned };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erreur d'enregistrement." };
  }
}
