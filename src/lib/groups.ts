import type { SupabaseClient } from "@supabase/supabase-js";
import { todayISO } from "@/lib/utils";

export type UserGroup = {
  id: string;
  name: string;
  invite_code: string;
  joined_at: string;
};

export type GroupInfo = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
};

export type GroupMemberStats = {
  user_id: string;
  username: string;
  display_name: string | null;
  start_weight_kg: number | null;
  target_weight_kg: number | null;
  current_weight: number | null;
  kcal_in: number;
  kcal_out: number;
  steps: number;
  weight_lost: number | null;
  progress_pct: number | null;
  kcal_balance: number;
};

export async function fetchUserGroups(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserGroup[]> {
  const { data } = await supabase
    .from("group_members")
    .select("joined_at, groups(id, name, invite_code)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  type Row = {
    joined_at: string;
    groups: { id: string; name: string; invite_code: string } | { id: string; name: string; invite_code: string }[] | null;
  };

  return ((data ?? []) as unknown as Row[]).flatMap((row) => {
    if (!row.groups) return [];
    const g = Array.isArray(row.groups) ? row.groups[0] : row.groups;
    if (!g) return [];
    return [{ id: g.id, name: g.name, invite_code: g.invite_code, joined_at: row.joined_at }];
  });
}

export function primaryGroupId(groups: UserGroup[]): string | null {
  return groups[0]?.id ?? null;
}

function progressPct(
  start: number | null,
  target: number | null,
  current: number | null,
): number | null {
  if (start == null || target == null || current == null) return null;
  const total = start - target;
  if (total <= 0) return null;
  const done = start - current;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

export async function fetchGroupLeaderboard(
  supabase: SupabaseClient,
  groupId: string,
  userId: string,
  today = todayISO(),
): Promise<{
  group: GroupInfo | null;
  members: GroupMemberStats[];
  memberCount: number;
  isMember: boolean;
}> {
  const { data: group } = await supabase
    .from("groups")
    .select("id, name, invite_code, created_by, created_at")
    .eq("id", groupId)
    .maybeSingle();

  if (!group) return { group: null, members: [], memberCount: 0, isMember: false };

  const { data: memberRows } = await supabase
    .from("group_members")
    .select("user_id")
    .eq("group_id", groupId);

  const memberIds = (memberRows ?? []).map((r) => r.user_id as string);
  const isMember = memberIds.includes(userId);
  if (!isMember) return { group: group as GroupInfo, members: [], memberCount: memberIds.length, isMember: false };

  const [{ data: profiles }, { data: weights }, { data: foods }, { data: activities }, { data: health }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, username, display_name, start_weight_kg, target_weight_kg")
        .in("id", memberIds),
      supabase
        .from("weight_logs")
        .select("user_id, weight_kg, logged_at")
        .in("user_id", memberIds)
        .order("logged_at", { ascending: false }),
      supabase.from("food_logs").select("user_id, kcal").in("user_id", memberIds).eq("logged_at", today),
      supabase
        .from("activity_logs")
        .select("user_id, kcal_burned")
        .in("user_id", memberIds)
        .eq("logged_at", today),
      supabase
        .from("health_snapshots")
        .select("user_id, steps")
        .in("user_id", memberIds)
        .eq("logged_at", today),
    ]);

  const latestWeight = new Map<string, number>();
  for (const w of weights ?? []) {
    const uid = w.user_id as string;
    if (!latestWeight.has(uid)) latestWeight.set(uid, Number(w.weight_kg));
  }
  const kcalInByUser = new Map<string, number>();
  for (const f of foods ?? []) {
    const uid = f.user_id as string;
    kcalInByUser.set(uid, (kcalInByUser.get(uid) ?? 0) + Number(f.kcal ?? 0));
  }
  const kcalOutByUser = new Map<string, number>();
  for (const a of activities ?? []) {
    const uid = a.user_id as string;
    kcalOutByUser.set(uid, (kcalOutByUser.get(uid) ?? 0) + Number(a.kcal_burned ?? 0));
  }
  const stepsByUser = new Map<string, number>();
  for (const h of health ?? []) {
    stepsByUser.set(h.user_id as string, Number(h.steps ?? 0));
  }

  const members: GroupMemberStats[] = (
    (profiles ?? []) as Array<{
      id: string;
      username: string;
      display_name: string | null;
      start_weight_kg: number | null;
      target_weight_kg: number | null;
    }>
  ).map((p) => {
    const start = p.start_weight_kg != null ? Number(p.start_weight_kg) : null;
    const target = p.target_weight_kg != null ? Number(p.target_weight_kg) : null;
    const current = latestWeight.get(p.id) ?? null;
    const kcal_in = Math.round(kcalInByUser.get(p.id) ?? 0);
    const kcal_out = Math.round(kcalOutByUser.get(p.id) ?? 0);
    const weight_lost =
      start != null && current != null ? Number((start - current).toFixed(1)) : null;
    return {
      user_id: p.id,
      username: p.username,
      display_name: p.display_name,
      start_weight_kg: start,
      target_weight_kg: target,
      current_weight: current,
      kcal_in,
      kcal_out,
      steps: stepsByUser.get(p.id) ?? 0,
      weight_lost,
      progress_pct: progressPct(start, target, current),
      kcal_balance: kcal_in - kcal_out,
    };
  });

  members.sort((a, b) => (b.weight_lost ?? -Infinity) - (a.weight_lost ?? -Infinity));

  return {
    group: group as GroupInfo,
    members,
    memberCount: memberIds.length,
    isMember,
  };
}
