"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "./actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl">
          <Image
            src="/hero.jpg"
            alt="L'équipe Objectif Prime"
            width={600}
            height={300}
            priority
            className="h-36 w-full object-cover sm:h-44"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <Logo size="md" href="/" />
          <h1 className="mt-4 text-2xl font-semibold">Connexion</h1>
          <p className="mt-1 text-sm text-muted">Heureux de te revoir.</p>

          <form action={formAction} className="mt-5 space-y-4">
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
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </label>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {pending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted">
            Pas encore inscrit ?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
