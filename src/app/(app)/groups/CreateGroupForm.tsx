"use client";

import { useActionState } from "react";
import { createGroup, type CreateGroupState } from "./actions";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

export function CreateGroupForm() {
  const [state, formAction, pending] = useActionState<CreateGroupState, FormData>(
    createGroup,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Nom du groupe</span>
        <input
          name="name"
          type="text"
          required
          maxLength={40}
          placeholder="Ex: Les défis du printemps"
          className={INPUT_CLS}
        />
      </label>
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Création..." : "Créer le groupe"}
      </button>
    </form>
  );
}
