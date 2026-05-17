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
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          Objectif <span className="text-primary">Prime</span>
        </h1>
        <p className="mt-6 text-lg text-muted">
          Suivez votre perte de poids au quotidien et challengez vos amis dans des groupes
          privés. Calories consommées, calories dépensées, pas, évolution du poids : tout au même
          endroit.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/signup"
            className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-sm hover:opacity-90"
          >
            Créer un compte
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border bg-card px-8 py-3 text-base font-semibold text-foreground hover:bg-zinc-50"
          >
            J&apos;ai déjà un compte
          </Link>
        </div>
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
    <div className="rounded-2xl border border-border bg-card p-6 text-left">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
