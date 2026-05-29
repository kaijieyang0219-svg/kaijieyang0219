import { MealRecord, UserProfile, Student } from "./types";

// Base64 SVGs to act as highly styled food images in our applet
export const FOOD_IMAGES = {
  chickenRiceBroccoli: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><defs><radialGradient id='g1' cx='50%' cy='50%' r='50%'><stop offset='0%' stop-color='%23fda4af' /><stop offset='100%' stop-color='%23f43f5e' /></radialGradient><linearGradient id='g2' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='%23a7f3d0' /><stop offset='100%' stop-color='%23059669' /></linearGradient></defs><rect width='400' height='300' fill='%23f8fafc'/><circle cx='200' cy='150' r='120' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='8'/><circle cx='200' cy='150' r='100' fill='%23f1f5f9'/><path d='M130 170 Q140 120 180 130 T220 150 T200 190 Z' fill='url(%23g1)' opacity='0.9'/><circle cx='260' cy='120' r='25' fill='url(%23g2)'/><circle cx='235' cy='150' r='20' fill='url(%23g2)'/><rect x='160' y='180' width='70' height='40' rx='10' fill='%23fef08a'/><circle cx='180' cy='195' r='8' fill='%23ca8a04'/></svg>",
  eggSalad: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><rect width='400' height='300' fill='%23f8fafc'/><circle cx='200' cy='150' r='110' fill='%23fafaf9' stroke='%23e7e5e4' stroke-width='6'/><path d='M120 120 Q150 90 200 130 T280 140 T230 200 Z' fill='%23bbf7d0'/><circle cx='160' cy='170' r='24' fill='%23fef08a'/><circle cx='160' cy='170' r='14' fill='%23eab308'/><circle cx='230' cy='110' r='24' fill='%23fef08a'/><circle cx='230' cy='110' r='14' fill='%23eab308'/></svg>",
  bananaMilk: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' width='100%' height='100%'><rect width='400' height='300' fill='%23f8fafc'/><rect x='140' y='100' width='60' height='120' rx='8' fill='%23f8fafc' stroke='%23cbd5e1' stroke-width='4'/><rect x='140' y='120' width='60' height='40' fill='%23bfdbfe'/><path d='M230 110 C210 120 210 180 260 210' stroke='%23facc15' stroke-width='16' fill='none' stroke-linecap='round'/></svg>"
};

export const INITIAL_PROFILE: UserProfile = {
  name: "黃丞瑜",
  gender: "male",
  birthdate: "2002-05-22",
  height: 175,
  weight: 68,
  activityLevel: "moderate",
  calorieTarget: 2000,
  proteinTarget: 120, // g
  fatTarget: 67, // g
  carbTarget: 250, // g
  fiberTarget: 25, // g
  sodiumTarget: 2000, // mg
  sugarTarget: 50 // g
};

export const INITIAL_MEAL_RECORDS: MealRecord[] = [
  {
    id: "record-1",
    type: "breakfast",
    date: "2026-05-22",
    time: "08:30",
    foods: [
      { name: "燕麥", weight: "50g", calories: 190, protein: 7, fat: 3.5, carbs: 32, fiber: 5, sodium: 2, sugar: 1 },
      { name: "手作麵包", weight: "1 塊", calories: 150, protein: 5, fat: 2, carbs: 28, fiber: 1.5, sodium: 180, sugar: 3 },
      { name: "香蕉", weight: "1 根", calories: 90, protein: 1.2, fat: 0.3, carbs: 23, fiber: 2.6, sodium: 1, sugar: 12 },
      { name: "低脂鮮奶", weight: "240ml", calories: 120, protein: 8, fat: 2.5, carbs: 12, fiber: 0, sodium: 120, sugar: 12 }
    ],
    image: FOOD_IMAGES.bananaMilk,
    advice: "早餐的飽足感足夠，低脂鮮奶提供了很好的鈣質與蛋白質來源，香蕉和燕麥則是高膳食纖維的複合碳水化合物，有助於維持穩定的血糖與早晨專注力。"
  },
  {
    id: "record-2",
    type: "lunch",
    date: "2026-05-22",
    time: "12:45",
    foods: [
      { name: "雞胸肉", weight: "120g", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, sodium: 74, sugar: 0 },
      { name: "糙米飯", weight: "150g", calories: 180, protein: 4, fat: 1.5, carbs: 38, fiber: 2.5, sodium: 2, sugar: 0.5 },
      { name: "花椰菜", weight: "100g", calories: 35, protein: 3, fat: 0.4, carbs: 7, fiber: 3, sodium: 33, sugar: 1.5 },
      { name: "水煮蛋", weight: "1 顆", calories: 70, protein: 6, fat: 5, carbs: 0.6, fiber: 0, sodium: 62, sugar: 0.6 },
      { name: "橄欖油", weight: "5g", calories: 40, protein: 0, fat: 4.5, carbs: 0, fiber: 0, sodium: 0, sugar: 0 }
    ],
    image: FOOD_IMAGES.chickenRiceBroccoli,
    advice: "整體營養均衡不錯！雞胸肉配合水煮蛋提供了優質的蛋白質來源，糙米飯則是優質的低 GI 碳水化合物，花椰菜補充了膳食纖維。"
  },
  {
    id: "record-3",
    type: "snack",
    date: "2026-05-22",
    time: "15:30",
    foods: [
      { name: "綜合堅果", weight: "15g", calories: 95, protein: 3, fat: 8, carbs: 3, fiber: 1.2, sodium: 15, sugar: 0.5 },
      { name: "希臘優格", weight: "100g", calories: 145, protein: 9, fat: 5, carbs: 4.5, fiber: 0, sodium: 45, sugar: 3.5 }
    ],
    image: FOOD_IMAGES.eggSalad,
    advice: "下午茶點心選擇希臘優格與堅果很棒！提供了好脂肪（單元不飽和脂肪酸）以及緩釋優質蛋白，可以有效緩解下午飢餓感，避免晚餐暴飲暴食。"
  }
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: "student-1",
    name: "王小明",
    gender: "male",
    age: 24,
    lastRecordDate: "2026-05-22",
    calorieTarget: 1800,
    recentTrends: [1750, 1850, 1680, 1720, 1900, 1820, 1780],
    relation: "兒子",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80"
  },
  {
    id: "student-2",
    name: "李雅婷",
    gender: "female",
    age: 28,
    lastRecordDate: "2026-05-22",
    calorieTarget: 1600,
    recentTrends: [1550, 1620, 1580, 1450, 1610, 1650, 1590],
    relation: "學員",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
  },
  {
    id: "student-3",
    name: "陳大宇",
    gender: "male",
    age: 32,
    lastRecordDate: "2026-05-21",
    calorieTarget: 2200,
    recentTrends: [2100, 2300, 2150, 2400, 2200, 2050, 2220],
    relation: "學員",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80"
  },
  {
    id: "student-4",
    name: "張小花",
    gender: "female",
    age: 55,
    lastRecordDate: "2026-05-18",
    calorieTarget: 1500,
    recentTrends: [1420, 1380, 1490, 1510, 1460, 1400, 1390],
    relation: "母親",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80"
  }
];

export const MOCK_CHART_DAYS = [
  { name: "Mon (05/18)", calories: 1850, target: 2000, protein: 110, fat: 64, carbs: 230 },
  { name: "Tue (05/19)", calories: 1980, target: 2000, protein: 118, fat: 68, carbs: 245 },
  { name: "Wed (05/20)", calories: 2150, target: 2000, protein: 125, fat: 72, carbs: 260 },
  { name: "Thu (05/21)", calories: 1890, target: 2000, protein: 115, fat: 62, carbs: 225 },
  { name: "Fri (05/22)", calories: 1420, target: 2000, protein: 90, fat: 45, carbs: 160 }
];

export const COMMON_FOODS = [
  { name: "雞胸肉", weight: "120g", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, sodium: 74, sugar: 0 },
  { name: "糙米飯", weight: "150g", calories: 180, protein: 4, fat: 1.5, carbs: 38, fiber: 2.5, sodium: 2, sugar: 0.5 },
  { name: "雞蛋", weight: "1顆", calories: 70, protein: 6, fat: 5, carbs: 0.6, fiber: 0, sodium: 62, sugar: 0.6 },
  { name: "香蕉", weight: "120g", calories: 90, protein: 1.2, fat: 0.3, carbs: 23, fiber: 2.6, sodium: 1, sugar: 12 },
  { name: "牛奶", weight: "240g", calories: 120, protein: 8, fat: 2.5, carbs: 12, fiber: 0, sodium: 120, sugar: 12 },
  { name: "花椰菜", weight: "100g", calories: 35, protein: 3, fat: 0.4, carbs: 7, fiber: 3, sodium: 33, sugar: 1.5 }
];
