import Link from "next/link";
import type { GroupInfo, GroupMemberStats, UserGroup } from "@/lib/groups";
import { formatDate, todayISO } from "@/lib/utils";
import { InviteCopy } from "./InviteCopy";
import { LeaveGroupButton } from "./LeaveGroupButton";

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
  const totalLost = members.reduce((s, m) => s + (m.weight_lost != null && m.weight_lost > 0 ? m.weight_lost : 0), 0);
  const totalSteps = members.reduce((s, m) => s + m.steps, 0);

  return (
    <div className="space-y-5 pb-20 sm:pb-6">
      {/* Header */}
      <header className="rounded-2xl border border-border bg-gradient-to-br from-emerald-600 to-emerald-800 p-4 text-white shadow-md sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {otherGroups.length > 1 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {otherGroups.map((g) => (
                  <Link
                    key={g.id}
                    href={`/groups/${g.id}`}
                    className={
                      g.id === group.id
                        ? "rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-semibold"
                        : "rounded-full bg-white/10 px-2.5 py-0.5 text-xs hover:bg-white/20"
                    }
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
            <h1 className="text-xl font-bold tracking-tight sm:text-3xl">{group.name}</h1>
            <p className="mt-1 text-xs text-emerald-100 sm:text-sm">
              {memberCount} membre{memberCount > 1 ? "s" : ""} · {formatDate(today, "EEEE d MMMM")}
            </p>
          </div>
          <LeaveGroupButton groupId={group.id} variant="light" />
        </div>

        {/* Quick group stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniStat label="Poids perdus" value={`${totalLost.toFixed(1)} kg`} />
          <MiniStat label="Pas totaux" value={totalSteps.toLocaleString("fr-FR")} />
          <MiniStat label="Membres" value={String(memberCount)} className="hidden sm:block" />
        </div>
      </header>

      {/* Member cards - daily view */}
      <section>
        <h2 className="mb-3 text-base font-semibold sm:text-lg">Membres</h2>
        <div className="space-y-3">
          {members.map((m) => (
            <MemberDayCard
              key={m.user_id}
              member={m}
              isMe={m.user_id === currentUserId}
            />
          ))}
        </div>
      </section>

      {/* Invite section */}
      <section className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <h2 className="text-base font-semibold sm:text-lg">Inviter des amis</h2>
        <p className="mt-1 text-xs text-muted sm:text-sm">
          Partage le code ou le lien pour rejoindre le groupe.
        </p>
        <InviteCopy code={group.invite_code} />
      </section>
    </div>
  );
}

function MiniStat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-xl bg-white/10 px-3 py-2 ${className ?? ""}`}>
      <p className="text-[10px] uppercase tracking-wider text-emerald-200">{label}</p>
      <p className="text-sm font-bold sm:text-base">{value}</p>
    </div>
  );
}

function MemberDayCard({
  member,
  isMe,
}: {
  member: GroupMemberStats;
  isMe: boolean;
}) {
  const weightLostText =
    member.weight_lost != null && member.weight_lost > 0
      ? `−${member.weight_lost.toFixed(1)} kg`
      : member.weight_lost != null
        ? `${member.weight_lost > 0 ? "−" : "+"}${Math.abs(member.weight_lost).toFixed(1)} kg`
        : "—";

  return (
    <div
      className={`rounded-2xl border bg-card p-4 ${
        isMe ? "border-primary/50 bg-emerald-50/40" : "border-border"
      }`}
    >
      {/* Top row: name */}
      <div className="flex items-center justify-between gap-2">
        <p className="truncate font-semibold text-sm sm:text-base min-w-0">
          {member.display_name ?? member.username}
          {isMe && <span className="ml-1 text-xs text-primary">(toi)</span>}
        </p>
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
          {weightLostText}
        </span>
      </div>

      {/* Stats grid */}
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <DayStat
          label="Poids actuel"
          value={member.current_weight != null ? `${member.current_weight.toFixed(1)} kg` : "—"}
        />
        <DayStat
          label="Calories IN"
          value={`${member.kcal_in.toLocaleString("fr-FR")} kcal`}
          accent={member.kcal_in > 0 ? "neutral" : undefined}
        />
        <DayStat
          label="Calories OUT"
          value={`${member.kcal_out.toLocaleString("fr-FR")} kcal`}
          accent={member.kcal_out > 0 ? "good" : undefined}
        />
        <DayStat
          label="Pas"
          value={member.steps.toLocaleString("fr-FR")}
          accent={member.steps >= 8000 ? "good" : undefined}
        />
      </div>

      {/* Progress bar */}
      {member.progress_pct != null && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-muted">
            <span>
              {member.start_weight_kg} kg → {member.target_weight_kg} kg
            </span>
            <span className="font-semibold text-foreground">{member.progress_pct}%</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${member.progress_pct}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function DayStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "good" | "neutral";
}) {
  return (
    <div className="rounded-lg bg-zinc-50 px-2.5 py-1.5">
      <p className="text-[10px] text-muted">{label}</p>
      <p
        className={`text-xs font-semibold sm:text-sm ${
          accent === "good" ? "text-primary" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
