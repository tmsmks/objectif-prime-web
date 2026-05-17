"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { login, type AuthState } from "./actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <main className="min-h-dvh bg-zinc-950">
      {/* Hero image with overlay */}
      <div className="relative h-52">
        <Image
          src="/hero.jpg"
          alt="L'équipe Objectif Prime"
          fill
          priority
          className="object-cover object-top brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950" />
      </div>

      {/* Content */}
      <div className="relative -mt-10 px-6 pb-10">
        <div className="mx-auto max-w-sm">
          <Logo size="md" href="/" />

          <h1 className="mt-6 text-3xl font-bold text-white">Connexion</h1>
          <p className="mt-1 text-sm text-zinc-400">Heureux de te revoir.</p>

          <form action={formAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="ton@email.com"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••"
                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {state?.error && (
              <p className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2.5 text-sm text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50"
            >
              {pending ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Pas encore inscrit ?{" "}
            <Link href="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
