"use client";

import { useActionState } from "react";
import { completeOnboarding, type OnboardingState } from "./actions";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

export default function OnboardingPage() {
  const [state, formAction, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    undefined,
  );

  return (
    <main className="flex flex-1 items-start justify-center px-4 py-6 sm:items-center sm:px-6 sm:py-12">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold">Bienvenue sur Objectif Prime</h1>
        <p className="mt-1 text-sm text-muted">
          Quelques infos pour personnaliser ton suivi.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <Field label="Prénom ou surnom affiché">
            <input name="display_name" type="text" maxLength={40} className={INPUT_CLS} />
          </Field>

          <Field label="Genre">
            <select name="gender" required className={INPUT_CLS}>
              <option value="">Choisir…</option>
              <option value="female">Femme</option>
              <option value="male">Homme</option>
              <option value="other">Autre</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date de naissance">
              <input name="birth_date" type="date" required className={INPUT_CLS} />
            </Field>
            <Field label="Taille (cm)">
              <input
                name="height_cm"
                type="number"
                step="0.1"
                min="100"
                max="250"
                required
                className={INPUT_CLS}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Poids actuel (kg)">
              <input
                name="start_weight_kg"
                type="number"
                step="0.1"
                min="30"
                max="400"
                required
                className={INPUT_CLS}
              />
            </Field>
            <Field label="Poids cible (kg)">
              <input
                name="target_weight_kg"
                type="number"
                step="0.1"
                min="30"
                max="400"
                required
                className={INPUT_CLS}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Date cible">
              <input name="target_date" type="date" required className={INPUT_CLS} />
            </Field>
            <Field label="Objectif pas/jour">
              <input
                name="daily_step_goal"
                type="number"
                min="1000"
                max="50000"
                step="500"
                defaultValue={8000}
                className={INPUT_CLS}
              />
            </Field>
          </div>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Enregistrement..." : "C'est parti"}
          </button>
        </form>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
