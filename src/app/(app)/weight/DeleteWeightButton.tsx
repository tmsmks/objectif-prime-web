"use client";

import { useTransition } from "react";
import { deleteWeight } from "./actions";

export function DeleteWeightButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Supprimer cette pesée ?")) start(() => deleteWeight(id));
      }}
      className="text-xs text-muted hover:text-danger disabled:opacity-50"
    >
      Supprimer
    </button>
  );
}
