"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type WeightState = { error?: string; ok?: boolean } | undefined;

export async function addWeight(_prev: WeightState, formData: FormData): Promise<WeightState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const weight_kg = Number(formData.get("weight_kg"));
  const logged_at = String(formData.get("logged_at") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!weight_kg || weight_kg < 30 || weight_kg > 400) return { error: "Poids invalide." };
  if (!logged_at) return { error: "Date requise." };

  const { error } = await supabase
    .from("weight_logs")
    .upsert(
      { user_id: user.id, weight_kg, logged_at, note },
      { onConflict: "user_id,logged_at" },
    );

  if (error) return { error: error.message };
  revalidatePath("/weight");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteWeight(id: string) {
  const supabase = await createClient();
  await supabase.from("weight_logs").delete().eq("id", id);
  revalidatePath("/weight");
  revalidatePath("/dashboard");
}
