"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActivityState = { error?: string; ok?: boolean } | undefined;

export async function addActivity(
  _prev: ActivityState,
  formData: FormData,
): Promise<ActivityState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const activity = String(formData.get("activity") ?? "").trim();
  const duration_min = Number(formData.get("duration_min")) || null;
  const kcal_burned = Number(formData.get("kcal_burned"));
  const note = String(formData.get("note") ?? "").trim() || null;
  const logged_at = String(formData.get("logged_at") ?? "");

  if (!activity) return { error: "Nom d'activité requis." };
  if (!kcal_burned || kcal_burned < 0) return { error: "Calories invalides." };
  if (!logged_at) return { error: "Date requise." };

  const { error } = await supabase.from("activity_logs").insert({
    user_id: user.id,
    activity,
    duration_min,
    kcal_burned,
    note,
    logged_at,
  });

  if (error) return { error: error.message };
  revalidatePath("/activity");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteActivity(id: string) {
  const supabase = await createClient();
  await supabase.from("activity_logs").delete().eq("id", id);
  revalidatePath("/activity");
  revalidatePath("/dashboard");
}
