import Link from "next/link";
import type { GroupInfo, GroupMemberStats, UserGroup } from "@/lib/groups";
import { formatDate, todayISO } from "@/lib/utils";
import { InviteCopy } from "./InviteCopy";
import { LeaveGroupButton } from "./LeaveGroupButton";

const MEDALS = ["🥇", "🥈", "🥉"] as const;

export function GroupView({
  group,
  members,
  memberCount,
  currentUserId,
  otherGroups,
  today = todayISO(),
}: {
  group: GroupInfo;
  members: GroupMemberStats[];
  memberCount: number;
  currentUserId: string;
  otherGroups: UserGroup[];
  today?: string;
}) {
  const podium = members.slice(0, 3);
  const me = members.find((m) => m.user_id === currentUserId);
  const totalLost = members.reduce((s, m) => s + (m.weight_lost != null && m.weight_lost > 0 ? m.weight_lost : 0), 0);
  const totalSteps = members.reduce((s, m) => s + m.steps, 0);
  const avgSteps = memberCount > 0 ? Math.round(totalSteps / memberCount) : 0;

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-border bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-md sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {otherGroups.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {otherGroups.map((g) => (
                  <Link
                    key={g.id}
                    href={`/groups/${g.id}`}
                    className={
                      g.id === group.id
                        ? "rounded-full bg-white/25 px-3 py-1 text-xs font-semibold"
                        : "rounded-full bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
                    }
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
            <p className="text-sm font-medium text-emerald-100">Mon groupe</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">{group.name}</h1>
            <p className="mt-2 text-sm text-emerald-100">
              {memberCount} membre{memberCount > 1 ? "s" : ""} · classement du{" "}
              {formatDate(today, "EEEE d MMMM")}
            </p>
          </div>
          <LeaveGroupButton groupId={group.id} variant="light" />
        </div>
      </header>

      {me && (
        <section className="rounded-2xl border-2 border-primary/30 bg-emerald-50/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Ta position aujourd&apos;hui</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-4">
            <Stat label="Rang perte de poids" value={rankLabel(members, currentUserId)} />
            <Stat
              label="Perdu"
              value={
                me.weight_lost != null && me.weight_lost > 0
                  ? `−${me.weight_lost.toFixed(1)} kg`
                  : me.weight_lost != null
                    ? `${me.weight_lost.toFixed(1)} kg`
                    : "—"
              }
              highlight={me.weight_lost != null && me.weight_lost > 0}
            />
            <Stat label="Calories IN" value={`${me.kcal_in.toLocaleString("fr-FR")} kcal`} />
            <Stat label="Pas" value={me.steps.toLocaleString("fr-FR")} />
          </div>
        </section>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <SummaryCard title="Poids perdus (groupe)" value={`${totalLost.toFixed(1)} kg`} sub="cumul des pertes" />
        <SummaryCard title="Pas aujourd'hui" value={totalSteps.toLocaleString("fr-FR")} sub={`moy. ${avgSteps.toLocaleString("fr-FR")} / pers.`} />
        <SummaryCard title="Membres actifs" value={String(memberCount)} sub="dans le classement" />
      </section>

      {podium.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Podium</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {podium.map((m, i) => (
              <PodiumCard key={m.user_id} rank={i} member={m} isMe={m.user_id === currentUserId} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold">Progression vers l&apos;objectif</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {members.map((m) => (
            <MemberProgressCard key={m.user_id} member={m} isMe={m.user_id === currentUserId} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Inviter des amis</h2>
        <p className="mt-1 text-sm text-muted">
          Partage le code ou le lien — après inscription, ils collent le code sur la page groupe.
        </p>
        <InviteCopy code={group.invite_code} />
      </section>

      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">Classement détaillé</h2>
          <p className="text-sm text-muted">Données du jour et évolution du poids</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-border bg-zinc-50 text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Membre</th>
                <th className="px-4 py-3">Départ</th>
                <th className="px-4 py-3">Actuel</th>
                <th className="px-4 py-3">Objectif</th>
                <th className="px-4 py-3">Perdus</th>
                <th className="px-4 py-3">Cal IN</th>
                <th className="px-4 py-3">Cal OUT</th>
                <th className="px-4 py-3">Bilan</th>
                <th className="px-4 py-3">Pas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((m, idx) => (
                <tr key={m.user_id} className={m.user_id === currentUserId ? "bg-emerald-50/50" : ""}>
                  <td className="px-4 py-3 text-muted">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">
                    {m.display_name ?? m.username}
                    {m.user_id === currentUserId && (
                      <span className="ml-1 text-xs text-primary">(toi)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {m.start_weight_kg != null ? `${m.start_weight_kg.toFixed(1)} kg` : "—"}
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {m.current_weight != null ? `${m.current_weight.toFixed(1)} kg` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {m.target_weight_kg != null ? `${m.target_weight_kg.toFixed(1)} kg` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {m.weight_lost != null ? (
                      <span className={m.weight_lost > 0 ? "font-semibold text-primary" : "text-muted"}>
                        {m.weight_lost > 0 ? "−" : ""}
                        {Math.abs(m.weight_lost).toFixed(1)} kg
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">{m.kcal_in.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">{m.kcal_out.toLocaleString("fr-FR")}</td>
                  <td className="px-4 py-3">
                    <span className={m.kcal_balance > 0 ? "text-amber-700" : "text-primary"}>
                      {m.kcal_balance > 0 ? "+" : ""}
                      {m.kcal_balance.toLocaleString("fr-FR")}
                    </span>
                  </td>
                  <td className="px-4 py-3">{m.steps.toLocaleString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs text-muted">
        Perte de poids = poids de départ − poids actuel. Équivalence énergétique : 1 kg ≈ 7700 kcal.
      </p>
    </div>
  );
}

function rankLabel(members: GroupMemberStats[], userId: string): string {
  const idx = members.findIndex((m) => m.user_id === userId);
  if (idx < 0) return "—";
  if (idx < 3) return `${MEDALS[idx]} ${idx + 1}${idx === 0 ? "er" : "e"}`;
  return `${idx + 1}e`;
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${highlight ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function SummaryCard({ title, value, sub }: { title: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted">{sub}</p>
    </div>
  );
}

function PodiumCard({
  rank,
  member,
  isMe,
}: {
  rank: number;
  member: GroupMemberStats;
  isMe: boolean;
}) {
  const heights = ["order-2 sm:mt-6", "order-1 sm:mt-0", "order-3 sm:mt-10"];
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-border bg-card p-5 text-center ${heights[rank] ?? ""} ${isMe ? "ring-2 ring-primary/40" : ""}`}
    >
      <span className="text-3xl">{MEDALS[rank]}</span>
      <p className="mt-2 font-semibold">{member.display_name ?? member.username}</p>
      <p className="mt-1 text-2xl font-bold text-primary">
        {member.weight_lost != null && member.weight_lost > 0
          ? `−${member.weight_lost.toFixed(1)} kg`
          : "—"}
      </p>
      {member.current_weight != null && (
        <p className="text-xs text-muted">actuel : {member.current_weight.toFixed(1)} kg</p>
      )}
    </div>
  );
}

function MemberProgressCard({ member, isMe }: { member: GroupMemberStats; isMe: boolean }) {
  const pct = member.progress_pct;
  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 ${isMe ? "border-primary/40 bg-emerald-50/30" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">
          {member.display_name ?? member.username}
          {isMe && <span className="ml-1 text-xs text-primary">(toi)</span>}
        </p>
        <span className="text-xs text-muted">
          {member.kcal_in} / {member.kcal_out} kcal
        </span>
      </div>
      {pct != null ? (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted">
            <span>Objectif</span>
            <span className="font-medium text-foreground">{pct}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">Objectif ou pesée manquante</p>
      )}
      <div className="mt-3 flex gap-4 text-xs text-muted">
        <span>
          {member.start_weight_kg != null ? `${member.start_weight_kg} kg` : "?"} →{" "}
          {member.current_weight != null ? `${member.current_weight} kg` : "?"}
        </span>
        <span>{member.steps.toLocaleString("fr-FR")} pas</span>
      </div>
    </div>
  );
}
