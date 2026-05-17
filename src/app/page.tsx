import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/groups");

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-10 sm:px-6 sm:py-16">
      <div className="w-full max-w-3xl">
        {/* Hero */}
        <div className="overflow-hidden rounded-3xl">
          <Image
            src="/hero.jpg"
            alt="L'équipe Objectif Prime à la salle"
            width={900}
            height={500}
            priority
            className="h-48 w-full object-cover sm:h-72"
          />
        </div>

        <div className="mt-8 text-center sm:mt-10">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
            Objectif <span className="text-primary">Prime</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:mt-6 sm:text-lg">
            Suivez votre perte de poids au quotidien et challengez vos amis dans des groupes
            privés. Calories, sport, pas, poids : tout au même endroit.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="w-full rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90 sm:w-auto"
            >
              Créer un compte
            </Link>
            <Link
              href="/login"
              className="w-full rounded-full border border-border bg-card px-8 py-3 text-base font-semibold text-foreground hover:bg-zinc-50 sm:w-auto"
            >
              J&apos;ai déjà un compte
            </Link>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-3 sm:gap-6">
          <Feature title="Suivi quotidien" body="Poids, repas, sport, pas en un coup d'œil." />
          <Feature title="Aliments scannés" body="Recherche dans la base Open Food Facts." />
          <Feature title="Entre amis" body="Groupes privés avec classement et progression." />
        </div>
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 text-left sm:p-6">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
