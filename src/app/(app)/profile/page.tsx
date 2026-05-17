import { createClient } from "@/lib/supabase/server";
import { ageFromBirthDate, formatDate } from "@/lib/utils";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return <p>Profil introuvable.</p>;

  const age = ageFromBirthDate(profile.birth_date);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Profil</h1>
        <p className="text-sm text-muted">@{profile.username}</p>
      </header>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Identité</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs text-muted">Email</dt>
            <dd className="mt-0.5 font-medium">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Âge</dt>
            <dd className="mt-0.5 font-medium">
              {age != null ? `${age} ans` : "—"}
              {profile.birth_date && (
                <span className="ml-1 text-xs text-muted">
                  (né le {formatDate(profile.birth_date)})
                </span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Genre</dt>
            <dd className="mt-0.5 font-medium">
              {profile.gender === "male" ? "Homme" : profile.gender === "female" ? "Femme" : "Autre"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Poids de départ</dt>
            <dd className="mt-0.5 font-medium">
              {profile.start_weight_kg ? `${Number(profile.start_weight_kg).toFixed(1)} kg` : "—"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Objectifs</h2>
        <p className="mt-1 text-sm text-muted">Modifie tes cibles à tout moment.</p>
        <div className="mt-4">
          <ProfileForm
            initial={{
              display_name: profile.display_name,
              height_cm: profile.height_cm != null ? Number(profile.height_cm) : null,
              target_weight_kg:
                profile.target_weight_kg != null ? Number(profile.target_weight_kg) : null,
              target_date: profile.target_date,
              daily_step_goal: profile.daily_step_goal,
            }}
          />
        </div>
      </section>
    </div>
  );
}
