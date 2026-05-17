"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateGroupState = { error?: string } | undefined;
export type JoinGroupState = { error?: string } | undefined;

export async function createGroup(
  _prev: CreateGroupState,
  formData: FormData,
): Promise<CreateGroupState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Nom requis." };
  if (name.length > 40) return { error: "Nom trop long (40 max)." };

  const { data: group, error } = await supabase
    .from("groups")
    .insert({ name, created_by: user.id })
    .select("id")
    .single();

  if (error || !group) return { error: error?.message ?? "Erreur." };

  await supabase.from("group_members").insert({ group_id: group.id, user_id: user.id });

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

export async function joinGroup(
  _prev: JoinGroupState,
  formData: FormData,
): Promise<JoinGroupState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non connecté." };

  const invite_code = String(formData.get("invite_code") ?? "").trim().toUpperCase();
  if (!invite_code) return { error: "Code requis." };

  const { data: group, error: lookupErr } = await supabase
    .from("groups")
    .select("id")
    .eq("invite_code", invite_code)
    .maybeSingle();

  if (lookupErr || !group) return { error: "Code invalide." };

  const { error: joinErr } = await supabase
    .from("group_members")
    .upsert({ group_id: group.id, user_id: user.id }, { onConflict: "group_id,user_id" });

  if (joinErr) return { error: joinErr.message };

  revalidatePath("/groups");
  redirect(`/groups/${group.id}`);
}

export async function leaveGroup(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("group_members")
    .delete()
    .eq("group_id", groupId)
    .eq("user_id", user.id);
  revalidatePath("/groups");
  redirect("/groups");
}
