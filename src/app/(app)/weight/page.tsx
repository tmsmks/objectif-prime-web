import { createClient } from "@/lib/supabase/server";
import { todayISO, formatDate } from "@/lib/utils";
import { WeightChart } from "@/components/WeightChart";
import { WeightForm } from "./WeightForm";
import { DeleteWeightButton } from "./DeleteWeightButton";

export default async function WeightPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: profile }, { data: logs }] = await Promise.all([
    supabase
      .from("profiles")
      .select("target_weight_kg, start_weight_kg")
      .eq("id", user.id)
      .single(),
    supabase
      .from("weight_logs")
      .select("id, weight_kg, logged_at, note")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(90),
  ]);

  const points = (logs ?? []).map((l) => ({
    logged_at: l.logged_at as string,
    weight_kg: Number(l.weight_kg),
  }));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Suivi du poids</h1>
        <p className="text-sm text-muted">Pèse-toi le matin, à jeun, pour des données stables.</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-4">
        <WeightChart data={points} targetKg={profile?.target_weight_kg ?? null} />
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Nouvelle pesée</h2>
        <WeightForm defaultDate={todayISO()} />
      </section>

      <section className="rounded-2xl border border-border bg-card">
        <h2 className="border-b border-border px-6 py-4 text-lg font-semibold">Historique</h2>
        <ul className="divide-y divide-border">
          {(logs ?? []).map((log) => (
            <li key={log.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium">{Number(log.weight_kg).toFixed(1)} kg</p>
                <p className="text-xs text-muted">{formatDate(log.logged_at as string)}</p>
                {log.note && <p className="mt-1 text-xs italic text-muted">{log.note}</p>}
              </div>
              <DeleteWeightButton id={log.id as string} />
            </li>
          ))}
          {logs?.length === 0 && (
            <li className="px-6 py-6 text-center text-sm text-muted">Aucune pesée enregistrée.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
