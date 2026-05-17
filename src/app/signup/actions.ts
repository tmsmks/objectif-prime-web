"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SignupState = { error?: string; info?: string } | undefined;

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const username = String(formData.get("username") ?? "").trim().toLowerCase();

  if (!email || !password || !username) {
    return { error: "Tous les champs sont requis." };
  }
  if (password.length < 6) {
    return { error: "Le mot de passe doit faire au moins 6 caractères." };
  }
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { error: "Pseudo : 3-20 caractères, lettres minuscules, chiffres et _ uniquement." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) {
    return { error: error.message };
  }

  // Si confirmation email activée côté Supabase, pas de session retournée
  if (!data.session) {
    return {
      info: "Compte créé ! Vérifie ta boîte mail pour confirmer ton adresse, puis connecte-toi.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}
