"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { signup, type SignupState } from "./actions";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signup, undefined);

  return (
    <main className="min-h-dvh bg-white">
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

      <div className="px-6 py-8">
        <div className="mx-auto max-w-sm">
          <h1 className="text-3xl font-bold text-zinc-900">
            Objectif <span className="text-emerald-600">Prime</span>
          </h1>
          <p className="mt-2 text-zinc-500">Commence ton défi en quelques secondes.</p>

          <form action={formAction} className="mt-8 space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
                Pseudo
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                minLength={3}
                maxLength={20}
                autoComplete="username"
                placeholder="ton_pseudo"
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

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
                minLength={6}
                autoComplete="new-password"
                placeholder="6 caractères min."
                className="mt-1.5 block w-full rounded-lg border border-zinc-300 px-4 py-3 text-base text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</p>
            )}
            {state?.info && (
              <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{state.info}</p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-lg bg-emerald-600 py-3.5 text-base font-bold text-white active:bg-emerald-700 disabled:opacity-50"
            >
              {pending ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Déjà un compte ?{" "}
            <Link href="/login" className="font-semibold text-emerald-600">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
