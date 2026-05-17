"use client";

import { useActionState } from "react";
import { saveSteps, type StepsState } from "./actions";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

export function StepsForm({
  today,
  initialSteps,
  initialKcal,
}: {
  today: string;
  initialSteps: number;
  initialKcal: number;
}) {
  const [state, formAction, pending] = useActionState<StepsState, FormData>(saveSteps, undefined);

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Pas</span>
          <input
            name="steps"
            type="number"
            min="0"
            max="200000"
            step="1"
            defaultValue={initialSteps || ""}
            required
            className={INPUT_CLS}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Cal. actives (facultatif)</span>
          <input
            name="active_kcal"
            type="number"
            min="0"
            step="1"
            defaultValue={initialKcal || ""}
            className={INPUT_CLS}
          />
        </label>
      </div>
      <input type="hidden" name="logged_at" value={today} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state?.ok && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-primary">Enregistré.</p>
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
