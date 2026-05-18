"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { ACTIVITIES, estimateKcalBurned } from "@/lib/utils";
import { addActivity, type ActivityState } from "./actions";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

export function ActivityForm({ today, weightKg }: { today: string; weightKg: number }) {
  const [activity, setActivity] = useState("");
  const [duration, setDuration] = useState(30);
  const [kcal, setKcal] = useState(0);
  const [touchedKcal, setTouchedKcal] = useState(false);
  const [state, formAction, pending] = useActionState<ActivityState, FormData>(
    addActivity,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setActivity("");
      setDuration(30);
      setKcal(0);
      setTouchedKcal(false);
    }
  }, [state]);

  useEffect(() => {
    if (touchedKcal) return;
    if (activity && duration > 0) {
      setKcal(estimateKcalBurned(activity, duration, weightKg));
    }
  }, [activity, duration, weightKg, touchedKcal]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Activité</span>
        <select
          name="activity"
          required
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          className={INPUT_CLS}
        >
          <option value="">Choisir…</option>
          {ACTIVITIES.map((a) => (
            <option key={a} value={a}>
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Durée (min)</span>
          <input
            name="duration_min"
            type="number"
            min="1"
            step="1"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 0)}
            className={INPUT_CLS}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Calories brûlées</span>
          <input
            name="kcal_burned"
            type="number"
            min="0"
            step="1"
            required
            value={kcal}
            onChange={(e) => {
              setKcal(Number(e.target.value) || 0);
              setTouchedKcal(true);
            }}
            className={INPUT_CLS}
          />
          <span className="text-xs text-muted">Auto-calculé, modifiable.</span>
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Note (facultatif)</span>
        <input name="note" type="text" maxLength={120} className={INPUT_CLS} />
      </label>
      <input type="hidden" name="logged_at" value={today} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Ajout..." : "Ajouter"}
      </button>
    </form>
  );
}
