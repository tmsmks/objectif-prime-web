import { createClient } from "@/lib/supabase/server";
import { todayISO, formatDate } from "@/lib/utils";
import type { ActivityLog } from "@/lib/types";
import { ActivityForm } from "./ActivityForm";
import { DeleteActivityButton } from "./DeleteActivityButton";

export default async function ActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayISO();
  const [{ data: profile }, { data: latestWeight }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("start_weight_kg").eq("id", user.id).single(),
    supabase
      .from("weight_logs")
      .select("weight_kg")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(1),
    supabase
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("logged_at", today)
      .order("created_at", { ascending: false }),
  ]);

  const weight = Number(
    latestWeight?.[0]?.weight_kg ?? profile?.start_weight_kg ?? 70,
  );
  const items = (logs ?? []) as ActivityLog[];
  const totalKcal = items.reduce((s, a) => s + Number(a.kcal_burned ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activité du jour</h1>
          <p className="text-sm text-muted">{formatDate(today, "EEEE d MMMM yyyy")}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Brûlées</p>
          <p className="text-xl font-bold text-primary">{Math.round(totalKcal)} kcal</p>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Ajouter une activité</h2>
        <p className="text-sm text-muted">
          Estimation automatique à partir de ton poids ({weight.toFixed(1)} kg).
        </p>
        <div className="mt-4">
          <ActivityForm today={today} weightKg={weight} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <h2 className="border-b border-border px-6 py-4 text-lg font-semibold">Aujourd&apos;hui</h2>
        {items.length === 0 ? (
          <p className="px-6 py-6 text-center text-sm text-muted">Aucune activité enregistrée.</p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium">{a.activity}</p>
                  <p className="text-xs text-muted">
                    {a.duration_min ? `${a.duration_min} min · ` : ""}
                    {Math.round(Number(a.kcal_burned ?? 0))} kcal
                  </p>
                  {a.note && <p className="mt-1 text-xs italic text-muted">{a.note}</p>}
                </div>
                <DeleteActivityButton id={a.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
