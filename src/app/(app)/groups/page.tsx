import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchUserGroups, primaryGroupId } from "@/lib/groups";
import { GroupsWelcome } from "./GroupsWelcome";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { code } = await searchParams;
  const myGroups = await fetchUserGroups(supabase, user.id);
  const primary = primaryGroupId(myGroups);

  if (primary) {
    redirect(`/groups/${primary}`);
  }

  return <GroupsWelcome inviteCode={code?.toUpperCase()} />;
}
