import { createClient } from "@/lib/supabase/server";
import { todayISO, formatDate } from "@/lib/utils";
import { StepsForm } from "./StepsForm";

export default async function StepsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayISO();
  const [{ data: profile }, { data: snap }, { data: history }] = await Promise.all([
    supabase.from("profiles").select("daily_step_goal").eq("id", user.id).single(),
    supabase
      .from("health_snapshots")
      .select("steps, active_kcal")
      .eq("user_id", user.id)
      .eq("logged_at", today)
      .maybeSingle(),
    supabase
      .from("health_snapshots")
      .select("logged_at, steps")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(14),
  ]);

  const goal = profile?.daily_step_goal ?? 8000;
  const currentSteps = snap?.steps ?? 0;
  const pct = Math.min(100, (currentSteps / goal) * 100);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Pas quotidiens</h1>
        <p className="text-sm text-muted">
          Saisis tes pas depuis ton tracker (app Santé, Garmin, montre…).
        </p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-muted">Aujourd&apos;hui</p>
            <p className="text-3xl font-bold">{currentSteps.toLocaleString("fr-FR")}</p>
          </div>
          <p className="text-sm text-muted">Objectif {goal.toLocaleString("fr-FR")}</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Saisir / mettre à jour</h2>
        <p className="mt-1 text-xs text-muted">
          Astuce : ouvre ton app Santé en fin de journée et reporte le total.
        </p>
        <div className="mt-4">
          <StepsForm
            today={today}
            initialSteps={snap?.steps ?? 0}
            initialKcal={Number(snap?.active_kcal ?? 0)}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <h2 className="border-b border-border px-6 py-4 text-lg font-semibold">14 derniers jours</h2>
        {history && history.length > 0 ? (
          <ul className="divide-y divide-border">
            {history.map((h) => (
              <li key={h.logged_at as string} className="flex items-center justify-between px-6 py-2.5">
                <span className="text-sm">{formatDate(h.logged_at as string)}</span>
                <span className="text-sm font-medium">
                  {Number(h.steps).toLocaleString("fr-FR")} pas
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-6 text-center text-sm text-muted">Aucune donnée.</p>
        )}
      </section>
    </div>
  );
}
