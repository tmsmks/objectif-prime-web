"use client";

import { useTransition } from "react";
import { leaveGroup } from "../actions";

export function LeaveGroupButton({
  groupId,
  variant = "default",
}: {
  groupId: string;
  variant?: "default" | "light";
}) {
  const [pending, start] = useTransition();
  const light = variant === "light";
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Quitter ce groupe ?")) start(() => leaveGroup(groupId));
      }}
      className={
        light
          ? "rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 disabled:opacity-50"
          : "rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50"
      }
    >
      Quitter
    </button>
  );
}
