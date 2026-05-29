import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { recordSteps } from "@/lib/steps";
import { todayISO } from "@/lib/utils";

// Reçoit le total de pas lu depuis Apple Santé (ou Health Connect) par l'app
// native Capacitor, et l'enregistre comme la saisie manuelle le ferait.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  let body: { steps?: unknown; date?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const steps = Number(body.steps);
  if (!Number.isFinite(steps) || steps < 0 || steps > 200000) {
    return NextResponse.json({ error: "Nombre de pas invalide." }, { status: 400 });
  }

  // Date au format YYYY-MM-DD ; défaut = aujourd'hui.
  const rawDate = typeof body.date === "string" ? body.date : "";
  const loggedAt = /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : todayISO();

  try {
    const { kcalBurned } = await recordSteps(supabase, user.id, Math.round(steps), loggedAt);
    revalidatePath("/steps");
    revalidatePath("/dashboard");
    revalidatePath("/groups");
    return NextResponse.json({ ok: true, steps: Math.round(steps), kcalBurned });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Erreur d'enregistrement." },
      { status: 500 },
    );
  }
}
