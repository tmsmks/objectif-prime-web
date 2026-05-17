import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayISO, formatDate, ageFromBirthDate, bmr } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const today = todayISO();

  const [{ data: profile }, { data: weights }, { data: foods }, { data: activities }, { data: health }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("weight_logs")
        .select("weight_kg, logged_at")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(1),
      supabase.from("food_logs").select("kcal").eq("user_id", user.id).eq("logged_at", today),
      supabase
        .from("activity_logs")
        .select("kcal_burned")
        .eq("user_id", user.id)
        .eq("logged_at", today),
      supabase.from("health_snapshots").select("steps").eq("user_id", user.id).eq("logged_at", today).maybeSingle(),
    ]);

  if (!profile) return <p>Profil introuvable.</p>;

  const currentWeight = weights?.[0]?.weight_kg ?? profile.start_weight_kg;
  const kcalIn = (foods ?? []).reduce((s, f) => s + Number(f.kcal ?? 0), 0);
  const kcalActivity = (activities ?? []).reduce((s, a) => s + Number(a.kcal_burned ?? 0), 0);
  const steps = health?.steps ?? 0;

  const age = ageFromBirthDate(profile.birth_date);
  const restingKcal =
    profile.height_cm && currentWeight && age != null
      ? bmr({
          gender: profile.gender,
          weightKg: Number(currentWeight),
          heightCm: Number(profile.height_cm),
          ageYears: age,
        })
      : 0;
  const kcalOut = restingKcal + kcalActivity;
  const netKcal = kcalIn - kcalOut;

  const lostKg =
    profile.start_weight_kg && currentWeight
      ? Number(profile.start_weight_kg) - Number(currentWeight)
      : 0;
  const totalToLose =
    profile.start_weight_kg && profile.target_weight_kg
      ? Number(profile.start_weight_kg) - Number(profile.target_weight_kg)
      : 0;
  const progressPct = totalToLose > 0 ? Math.max(0, Math.min(100, (lostKg / totalToLose) * 100)) : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-sm text-muted">{formatDate(today, "EEEE d MMMM yyyy")}</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-sm text-muted">Poids actuel</p>
            <p className="mt-1 text-3xl font-bold">
              {currentWeight != null ? `${Number(currentWeight).toFixed(1)} kg` : "—"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">Perdus</p>
            <p className={`mt-1 text-xl font-semibold ${lostKg > 0 ? "text-primary" : "text-muted"}`}>
              {lostKg > 0 ? "−" : ""}
              {Math.abs(lostKg).toFixed(1)} kg
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">
            Objectif : {profile.target_weight_kg} kg
            {profile.target_date ? ` d'ici le ${formatDate(profile.target_date)}` : ""} ·{" "}
            {progressPct.toFixed(0)}%
          </p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Calories ingérées" value={`${Math.round(kcalIn)} kcal`} href="/food" />
        <Stat
          label="Calories dépensées"
          value={`${Math.round(kcalOut)} kcal`}
          sub={`dont sport : ${Math.round(kcalActivity)}`}
          href="/activity"
        />
        <Stat
          label="Bilan du jour"
          value={`${netKcal > 0 ? "+" : ""}${Math.round(netKcal)} kcal`}
          accent={netKcal < 0 ? "good" : "bad"}
        />
        <Stat
          label="Pas"
          value={`${steps.toLocaleString("fr-FR")}`}
          sub={`/ ${profile.daily_step_goal.toLocaleString("fr-FR")}`}
          href="/steps"
        />
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Action href="/weight" label="+ Pesée" />
        <Action href="/food" label="+ Aliment" />
        <Action href="/activity" label="+ Sport" />
        <Action href="/steps" label="+ Pas" />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  href,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  href?: string;
  accent?: "good" | "bad";
}) {
  const body = (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-1 text-xl font-semibold ${
          accent === "good" ? "text-primary" : accent === "bad" ? "text-danger" : ""
        }`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

function Action({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-border bg-card px-4 py-2 text-center text-sm font-medium hover:bg-zinc-50"
    >
      {label}
    </Link>
  );
}
