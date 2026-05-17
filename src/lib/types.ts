export type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  gender: "male" | "female" | "other" | null;
  height_cm: number | null;
  start_weight_kg: number | null;
  target_weight_kg: number | null;
  target_date: string | null;
  daily_step_goal: number;
};

export type WeightLog = {
  id: string;
  user_id: string;
  weight_kg: number;
  logged_at: string;
  note: string | null;
};

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

export type FoodLog = {
  id: string;
  user_id: string;
  logged_at: string;
  meal: Meal;
  name: string;
  brand: string | null;
  barcode: string | null;
  serving_g: number | null;
  kcal: number;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  logged_at: string;
  activity: string;
  duration_min: number | null;
  kcal_burned: number | null;
  note: string | null;
};

export type HealthSnapshot = {
  user_id: string;
  logged_at: string;
  steps: number;
  active_kcal: number;
  resting_kcal: number;
  distance_m: number;
};

export type Group = {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
};

export type GroupMember = {
  group_id: string;
  user_id: string;
  joined_at: string;
};

export const MEAL_LABELS: Record<Meal, string> = {
  breakfast: "Petit-déjeuner",
  lunch: "Déjeuner",
  dinner: "Dîner",
  snack: "Collation",
};
