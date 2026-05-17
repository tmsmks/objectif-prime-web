"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <main className="relative flex min-h-dvh flex-col">
      {/* Background image */}
      <div className="relative h-[45dvh] w-full shrink-0">
        <Image
          src="/hero.jpg"
          alt="L'équipe Objectif Prime"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background" />
        <div className="absolute left-6 top-10">
          <Link href="/" className="text-xl font-bold text-white drop-shadow-md">
            Objectif <span className="text-emerald-300">Prime</span>
          </Link>
        </div>
      </div>

      {/* Form card overlapping image */}
      <div className="-mt-8 flex flex-1 flex-col px-5 pb-8">
        <div className="w-full max-w-sm mx-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5">
          <h1 className="text-2xl font-bold text-zinc-900">Connexion</h1>
          <p className="mt-1 text-sm text-zinc-500">Heureux de te revoir.</p>

          <form action={formAction} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-zinc-700">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ton@email.com"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-zinc-700">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {state?.error && (
              <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{state.error}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-zinc-500">
            Pas encore inscrit ?{" "}
            <Link href="/signup" className="font-semibold text-emerald-600 hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
