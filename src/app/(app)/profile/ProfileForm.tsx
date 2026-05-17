"use client";

import { useActionState } from "react";
import { updateProfile, type ProfileState } from "./actions";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

type Initial = {
  display_name: string | null;
  height_cm: number | null;
  target_weight_kg: number | null;
  target_date: string | null;
  daily_step_goal: number;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">Nom affiché</span>
        <input
          name="display_name"
          type="text"
          maxLength={40}
          defaultValue={initial.display_name ?? ""}
          className={INPUT_CLS}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Taille (cm)</span>
          <input
            name="height_cm"
            type="number"
            step="0.1"
            min="100"
            max="250"
            defaultValue={initial.height_cm ?? ""}
            className={INPUT_CLS}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Poids cible (kg)</span>
          <input
            name="target_weight_kg"
            type="number"
            step="0.1"
            min="30"
            max="400"
            defaultValue={initial.target_weight_kg ?? ""}
            className={INPUT_CLS}
          />
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Date cible</span>
          <input
            name="target_date"
            type="date"
            defaultValue={initial.target_date ?? ""}
            className={INPUT_CLS}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Objectif pas/jour</span>
          <input
            name="daily_step_goal"
            type="number"
            min="1000"
            max="50000"
            step="500"
            defaultValue={initial.daily_step_goal}
            className={INPUT_CLS}
          />
        </label>
      </div>

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
