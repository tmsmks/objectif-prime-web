import { createClient } from "@/lib/supabase/server";
import { todayISO, formatDate } from "@/lib/utils";
import { MEAL_LABELS, type FoodLog, type Meal } from "@/lib/types";
import { AddFoodPanel } from "./AddFoodPanel";
import { DeleteFoodButton } from "./DeleteFoodButton";

function suggestMeal(): Meal {
  const h = new Date().getHours();
  if (h < 10) return "breakfast";
  if (h < 14) return "lunch";
  if (h < 18) return "snack";
  return "dinner";
}

export default async function FoodPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayISO();
  const { data: logs } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("logged_at", today)
    .order("created_at", { ascending: true });

  const items = (logs ?? []) as FoodLog[];
  const totalKcal = items.reduce((s, f) => s + Number(f.kcal), 0);
  const byMeal = (Object.keys(MEAL_LABELS) as Meal[]).map((m) => ({
    meal: m,
    items: items.filter((i) => i.meal === m),
  }));

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repas du jour</h1>
          <p className="text-sm text-muted">{formatDate(today, "EEEE d MMMM yyyy")}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Total</p>
          <p className="text-xl font-bold text-primary">{Math.round(totalKcal)} kcal</p>
        </div>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Ajouter un aliment</h2>
        <p className="text-sm text-muted">Base Open Food Facts (gratuite).</p>
        <div className="mt-4">
          <AddFoodPanel today={today} defaultMeal={suggestMeal()} />
        </div>
      </section>

      <section className="space-y-3">
        {byMeal.map(({ meal, items }) => (
          <div key={meal} className="rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="font-semibold">{MEAL_LABELS[meal]}</h3>
              <span className="text-sm text-muted">
                {Math.round(items.reduce((s, i) => s + Number(i.kcal), 0))} kcal
              </span>
            </div>
            {items.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted">Aucun aliment.</p>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((f) => (
                  <li key={f.id} className="flex items-center justify-between px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{f.name}</p>
                      <p className="text-xs text-muted">
                        {f.serving_g ? `${f.serving_g} g · ` : ""}
                        {Math.round(Number(f.kcal))} kcal
                        {f.brand ? ` · ${f.brand}` : ""}
                      </p>
                    </div>
                    <DeleteFoodButton id={f.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
