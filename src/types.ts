export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export interface FoodItem {
  name: string;
  weight: string; // e.g. "120g", "150g"
  calories: number; // kcal
  protein: number; // g
  fat: number; // g
  carbs: number; // g
  fiber?: number; // g
  sodium?: number; // mg
  sugar?: number; // g
}

export interface MealRecord {
  id: string;
  type: MealType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  foods: FoodItem[];
  image?: string; // base64 payload or placeholder URL
  advice?: string; // professional advice
}

export type UserRole = "admin" | "teacher" | "caregiver" | "student" | "pending";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "high";

export interface UserProfile {
  name: string;
  gender: "male" | "female" | "other";
  birthdate: string; // YYYY-MM-DD
  height: number; // cm
  weight: number; // kg
  activityLevel: ActivityLevel;
  calorieTarget: number;
  proteinTarget: number; // g
  fatTarget: number; // g
  carbTarget: number; // g
  fiberTarget: number; // g
  sodiumTarget: number; // mg
  sugarTarget: number; // g
}

export interface Student {
  id: string;
  name: string;
  gender: "male" | "female";
  age: number;
  lastRecordDate: string;
  calorieTarget: number;
  recentTrends: number[]; // numbers representing last 7 days calories
  avatar?: string;
  relation?: string; // for caregiver ("兒子", "女兒") vs dietitian ("學員")
}
