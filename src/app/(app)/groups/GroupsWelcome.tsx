import { CreateGroupForm } from "./CreateGroupForm";
import { JoinGroupForm } from "./JoinGroupForm";

export function GroupsWelcome({ inviteCode }: { inviteCode?: string }) {
  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-emerald-50 to-white p-8 text-center">
        <p className="text-sm font-medium uppercase tracking-wider text-primary">Objectif Prime</p>
        <h1 className="mt-2 text-3xl font-bold">Rejoins ton équipe</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          Crée un groupe privé avec tes amis ou entre un code d&apos;invitation. Une fois dedans, tu
          verras le classement et la progression de chacun chaque jour.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
            ✨
          </div>
          <h2 className="mt-4 text-lg font-semibold">Créer un groupe</h2>
          <p className="mt-1 text-sm text-muted">
            Tu obtiens un code à partager. Tes amis le saisissent pour te rejoindre.
          </p>
          <div className="mt-5">
            <CreateGroupForm />
          </div>
        </section>

        <section className="rounded-2xl border-2 border-primary/20 bg-card p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg">
            🔗
          </div>
          <h2 className="mt-4 text-lg font-semibold">Rejoindre un groupe</h2>
          <p className="mt-1 text-sm text-muted">
            Colle le code reçu par un ami. Tu accèdes directement au classement du groupe.
          </p>
          <div className="mt-5">
            <JoinGroupForm defaultCode={inviteCode} />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-dashed border-border bg-zinc-50/80 p-6">
        <h3 className="text-sm font-semibold">Dans ton groupe tu verras</h3>
        <ul className="mt-3 grid gap-2 text-sm text-muted sm:grid-cols-3">
          <li className="rounded-lg bg-white px-3 py-2">🏆 Classement perte de poids</li>
          <li className="rounded-lg bg-white px-3 py-2">🔥 Calories du jour (IN / OUT)</li>
          <li className="rounded-lg bg-white px-3 py-2">👟 Pas et objectifs</li>
        </ul>
      </section>
    </div>
  );
}
