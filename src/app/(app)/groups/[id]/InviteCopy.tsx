"use client";

import { useState } from "react";

export function InviteCopy({ code }: { code: string }) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/?code=${code}` : `?code=${code}`;

  const copy = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <span className="inline-flex rounded-lg bg-zinc-100 px-3 py-2 font-mono text-base font-bold tracking-widest">
        {code}
      </span>
      <button
        type="button"
        onClick={() => copy(code, setCopiedCode)}
        className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
      >
        {copiedCode ? "Copié ✓" : "Copier le code"}
      </button>
      <button
        type="button"
        onClick={() => copy(url, setCopiedUrl)}
        className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium hover:bg-zinc-50"
      >
        {copiedUrl ? "Copié ✓" : "Copier le lien"}
      </button>
    </div>
  );
}
