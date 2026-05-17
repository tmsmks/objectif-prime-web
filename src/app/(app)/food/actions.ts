"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Meal } from "@/lib/types";

export type FoodState = { error?: string; ok?: boolean } | undefined;

export async function addFood(_prev: FoodState, formData: FormData): Promise<FoodState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const meal = String(formData.get("meal") ?? "") as Meal;
  const name = String(formData.get("name") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim() || null;
  const barcode = String(formData.get("barcode") ?? "").trim() || null;
  const serving_g = Number(formData.get("serving_g")) || null;
  const kcal = Number(formData.get("kcal"));
  const protein_g = Number(formData.get("protein_g")) || null;
  const carbs_g = Number(formData.get("carbs_g")) || null;
  const fat_g = Number(formData.get("fat_g")) || null;
  const logged_at = String(formData.get("logged_at") ?? "");

  if (!name) return { error: "Nom requis." };
  if (!kcal || kcal < 0) return { error: "Calories invalides." };
  if (!["breakfast", "lunch", "dinner", "snack"].includes(meal)) return { error: "Repas requis." };
  if (!logged_at) return { error: "Date requise." };

  const { error } = await supabase.from("food_logs").insert({
    user_id: user.id,
    meal,
    name,
    brand,
    barcode,
    serving_g,
    kcal,
    protein_g,
    carbs_g,
    fat_g,
    logged_at,
  });

  if (error) return { error: error.message };
  revalidatePath("/food");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteFood(id: string) {
  const supabase = await createClient();
  await supabase.from("food_logs").delete().eq("id", id);
  revalidatePath("/food");
  revalidatePath("/dashboard");
}
