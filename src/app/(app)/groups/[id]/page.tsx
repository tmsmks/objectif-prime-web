import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchGroupLeaderboard, fetchUserGroups } from "@/lib/groups";
import { GroupView } from "./GroupView";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { group, members, isMember } = await fetchGroupLeaderboard(supabase, id, user.id);

  if (!group) notFound();
  if (!isMember) redirect("/groups");

  const myGroups = await fetchUserGroups(supabase, user.id);

  return (
    <GroupView
      group={group}
      members={members}
      memberCount={members.length}
      currentUserId={user.id}
      otherGroups={myGroups}
    />
  );
}
