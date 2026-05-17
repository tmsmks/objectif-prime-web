"use client";

import { useActionState } from "react";
import { saveSteps, type StepsState } from "./actions";

export function StepsForm({
  today,
  initialSteps,
}: {
  today: string;
  initialSteps: number;
}) {
  const [state, formAction, pending] = useActionState<StepsState, FormData>(saveSteps, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Nombre de pas</span>
        <input
          name="steps"
          type="number"
          min="0"
          max="200000"
          step="1"
          defaultValue={initialSteps || ""}
          required
          className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-base focus:border-primary focus:outline-none"
        />
      </label>
      <input type="hidden" name="logged_at" value={today} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-primary">
          Enregistré — {state.kcalBurned} kcal brûlées ajoutées automatiquement.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
