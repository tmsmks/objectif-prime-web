"use client";

import { useActionState } from "react";
import { joinGroup, type JoinGroupState } from "./actions";

const INPUT_CLS =
  "mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm uppercase tracking-widest focus:border-primary focus:outline-none";

export function JoinGroupForm({ defaultCode }: { defaultCode?: string }) {
  const [state, formAction, pending] = useActionState<JoinGroupState, FormData>(
    joinGroup,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <label className="block">
        <span className="text-sm font-medium">Code d&apos;invitation</span>
        <input
          name="invite_code"
          type="text"
          required
          maxLength={10}
          defaultValue={defaultCode ?? ""}
          placeholder="ABC123"
          className={INPUT_CLS}
        />
      </label>
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full border border-border bg-white px-5 py-2 text-sm font-semibold hover:bg-zinc-50 disabled:opacity-50"
      >
        {pending ? "Connexion..." : "Rejoindre"}
      </button>
    </form>
  );
}
