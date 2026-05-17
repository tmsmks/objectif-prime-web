import { differenceInYears, format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export const todayISO = (): string => new Date().toISOString().slice(0, 10);

export function formatDate(iso: string, pattern = "d MMM yyyy"): string {
  try {
    return format(parseISO(iso), pattern, { locale: fr });
  } catch {
    return iso;
  }
}

export function ageFromBirthDate(birthDate: string | null): number | null {
  if (!birthDate) return null;
  try {
    return differenceInYears(new Date(), parseISO(birthDate));
  } catch {
    return null;
  }
}

// Mifflin-St Jeor — calories de repos (BMR)
export function bmr(opts: {
  gender: "male" | "female" | "other" | null;
  weightKg: number;
  heightCm: number;
  ageYears: number;
}): number {
  const base = 10 * opts.weightKg + 6.25 * opts.heightCm - 5 * opts.ageYears;
  if (opts.gender === "male") return Math.round(base + 5);
  if (opts.gender === "female") return Math.round(base - 161);
  return Math.round(base - 78);
}

// Calories brûlées approximatives (MET × poids × heure)
const MET: Record<string, number> = {
  marche: 3.5,
  "marche rapide": 5,
  course: 9.8,
  "course rapide": 11.5,
  vélo: 7.5,
  "vélo intense": 10,
  natation: 7,
  musculation: 5,
  yoga: 2.5,
  "hiit": 8,
  "elliptique": 7,
  "rameur": 7,
  "boxe": 9,
  "football": 8,
  "tennis": 7,
  "danse": 5,
};

export function estimateKcalBurned(activity: string, durationMin: number, weightKg: number): number {
  const key = activity.toLowerCase().trim();
  const met = MET[key] ?? 5;
  return Math.round((met * weightKg * durationMin) / 60);
}

export const ACTIVITIES = Object.keys(MET);

export function classNames(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
