"use client";

import { useTransition } from "react";
import { deleteActivity } from "./actions";

export function DeleteActivityButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => deleteActivity(id))}
      className="text-xs text-muted hover:text-danger disabled:opacity-50"
    >
      ×
    </button>
  );
}
