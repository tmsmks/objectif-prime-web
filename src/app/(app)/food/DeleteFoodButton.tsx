"use client";

import { useTransition } from "react";
import { deleteFood } from "./actions";

export function DeleteFoodButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => deleteFood(id))}
      className="text-xs text-muted hover:text-danger disabled:opacity-50"
    >
      ×
    </button>
  );
}
