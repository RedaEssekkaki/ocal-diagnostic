export type Sex = "M" | "F";
export type Objective = "maintien" | "perte" | "seche" | "prise_muscle" | "recomposition";
export type ActivityLevel = "sedentaire" | "leger" | "actif" | "tres_actif";
export type Pace = "doux" | "modere" | "rapide";
export type Diet = "omnivore" | "vegetarien" | "vegan";
export type Breakfast = "complet" | "leger" | "aucun";
export type MainMeal = "midi" | "soir" | "equilibre";

export interface SessionIn {
  sport: string;
  minutes: number;
  per_week: number;
  intensity?: string | null;
}

export interface ProfileIn {
  sex: Sex;
  age: number;
  weight_kg: number;
  height_cm: number;
  objective: Objective;
  sessions: SessionIn[];
  activity_level: ActivityLevel;
  steps?: number | null;
  pace?: Pace | null;
  bodyfat_pct?: number | null;
  diet: Diet;
  is_athlete: boolean;
  breakfast: Breakfast;
  main_meal: MainMeal;
}

export interface Targets {
  bmr: number;
  bmr_method: string;
  neat_kcal: number;
  sport_kcal: number;
  tdee: number;
  calories: number;
  pace: string;
  weekly_change_kg: number;
  protein_g: number;
  carb_g: number;
  fat_g: number;
  fiber_g: number;
  confidence: number;
  warnings: string[];
}

export interface Meal {
  protein_g: number;
  carb_g: number;
  fat_g: number;
  kcal: number;
}

export interface ApiResponse {
  targets: Targets;
  meals: Record<string, Meal>;
}
