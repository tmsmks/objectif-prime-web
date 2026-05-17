"use client";

import { useActionState, useEffect, useRef } from "react";
import { addWeight, type WeightState } from "./actions";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

export function WeightForm({ defaultDate }: { defaultDate: string }) {
  const [state, formAction, pending] = useActionState<WeightState, FormData>(addWeight, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-sm font-medium">Poids (kg)</span>
          <input
            name="weight_kg"
            type="number"
            step="0.1"
            min="30"
            max="400"
            required
            className={INPUT_CLS}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Date</span>
          <input
            name="logged_at"
            type="date"
            defaultValue={defaultDate}
            required
            className={INPUT_CLS}
          />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-medium">Note (facultatif)</span>
        <input name="note" type="text" maxLength={120} className={INPUT_CLS} />
      </label>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
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
