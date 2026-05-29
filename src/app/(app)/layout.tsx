import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Nav } from "@/components/Nav";
import { HealthSync } from "@/components/HealthSync";
import { NativeReminders } from "@/components/NativeReminders";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, start_weight_kg")
    .eq("id", user.id)
    .single();

  if (!profile || profile.start_weight_kg == null) {
    redirect("/onboarding");
  }

  return (
    <>
      <Nav username={profile.username} />
      <HealthSync />
      <NativeReminders />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 sm:py-6">{children}</main>
    </>
  );
}
