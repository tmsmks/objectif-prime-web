"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signup, type SignupState } from "./actions";
import { Logo } from "@/components/Logo";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signup, undefined);

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Logo size="md" href="/" />
        <h1 className="mt-6 text-2xl font-semibold">Créer un compte</h1>
        <p className="mt-1 text-sm text-muted">Commence ton défi en quelques secondes.</p>

        <form action={formAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Pseudo</span>
            <input
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9_]+"
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Mot de passe</span>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </label>

          {state?.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
          )}
          {state?.info && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-primary">{state.info}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {pending ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
