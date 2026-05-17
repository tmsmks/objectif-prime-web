"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <main className="min-h-dvh bg-white">
      {/* Image bien visible */}
      <div className="w-full">
        <Image
          src="/hero.jpg"
          alt="L'équipe Objectif Prime"
          width={900}
          height={600}
          priority
          className="w-full h-auto"
        />
      </div>

      {/* Formulaire */}
      <div className="px-6 py-8">
        <div className="mx-auto max-w-sm">
          <h1 className="text-3xl font-bold text-zinc-900">
            Objectif <span className="text-emerald-600">Prime</span>
          </h1>
          <p className="mt-2 text-zinc-500">Connecte-toi pour continuer.</p>

          <form action={formAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ton@email.com"
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••"
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-emerald-600 py-3.5 text-base font-bold text-white active:bg-emerald-700 disabled:opacity-50"
            >
              {pending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Pas encore inscrit ?{" "}
            <Link href="/signup" className="font-semibold text-emerald-600">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
