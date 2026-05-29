import { motion } from "motion/react";
import { Plus, ChevronRight, User, Sparkles } from "lucide-react";
import { MealRecord, UserProfile } from "../types";

interface DashboardScreenProps {
  records: MealRecord[];
  profile: UserProfile;
  onNavigateToMealInput: (mealType: "breakfast" | "lunch" | "dinner" | "snack") => void;
  onViewAnalysis: () => void;
  onViewSettings: () => void;
}

export default function DashboardScreen({
  records,
  profile,
  onNavigateToMealInput,
  onViewAnalysis,
  onViewSettings,
}: DashboardScreenProps) {
  
  // Calculate today's values
  const todayRecords = records.filter(r => r.date === "2026-05-22");
  
  const todayTotal = todayRecords.reduce(
    (acc, cur) => {
      let mealCals = 0;
      let mealProt = 0;
      let mealFat = 0;
      let mealCarb = 0;

      cur.foods.forEach(f => {
        mealCals += f.calories;
        mealProt += f.protein;
        mealFat += f.fat;
        mealCarb += f.carbs;
      });

      return {
        calories: acc.calories + mealCals,
        protein: acc.protein + mealProt,
        fat: acc.fat + mealFat,
        carbs: acc.carbs + mealCarb
      };
    },
    { calories: 0, protein: 0, fat: 0, carbs: 0 }
  );

  // Targets from profile state
  const targets = {
    calories: profile.calorieTarget || 2000,
    protein: profile.proteinTarget || 120,
    fat: profile.fatTarget || 67,
    carbs: profile.carbTarget || 250
  };

  const ringData = [
    {
      label: "熱量 (kcal)",
      current: todayTotal.calories,
      target: targets.calories,
      color: "stroke-indigo-500 text-indigo-600 bg-indigo-50",
      colorRaw: "#6366f1",
      unit: "/ " + targets.calories
    },
    {
      label: "蛋白質",
      current: todayTotal.protein,
      target: targets.protein,
      color: "stroke-amber-500 text-amber-600 bg-amber-50",
      colorRaw: "#f59e0b",
      unit: "/ " + targets.protein + "g"
    },
    {
      label: "脂肪",
      current: todayTotal.fat,
      target: targets.fat,
      color: "stroke-rose-500 text-rose-600 bg-rose-50",
      colorRaw: "#f43f5e",
      unit: "/ " + targets.fat + "g"
    },
    {
      label: "碳水",
      current: todayTotal.carbs,
      target: targets.carbs,
      color: "stroke-emerald-500 text-emerald-600 bg-emerald-50",
      colorRaw: "#10b981",
      unit: "/ " + targets.carbs + "g"
    }
  ];

  const mealTypes: { type: "breakfast" | "lunch" | "dinner" | "snack"; label: string; time: string }[] = [
    { type: "breakfast", label: "早餐", time: "08:30" },
    { type: "lunch", label: "午餐", time: "12:45" },
    { type: "dinner", label: "晚餐", time: "18:30" },
    { type: "snack", label: "點心", time: "15:30" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="dashboard-view-card"
    >
      {/* Header Profile Greeting */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent">
        <div>
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-slate-800">早安，{profile.name}！</h2>
            <span className="text-lg">💪</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">今天也要好好照顧自己喔 ✨</p>
        </div>
        <button
          id="dashboard-profile-btn"
          onClick={onViewSettings}
          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
        >
          <User className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Today's Summary & Ring Charts */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-slate-700">今日總覽 · 2026/05/22</h3>
            <button
              onClick={onViewSettings}
              className="text-xs text-emerald-600 hover:underline cursor-pointer"
            >
              編輯目標
            </button>
          </div>

          {/* Bento-style Rings Layout */}
          <div className="grid grid-cols-4 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            {ringData.map((ring, idx) => {
              const radius = 28;
              const circumference = 2 * Math.PI * radius;
              const pct = Math.min((ring.current / ring.target) * 100, 100);
              const strokeDashoffset = circumference - (pct / 100) * circumference;

              return (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-95">
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        className="stroke-slate-200 fill-none"
                        strokeWidth="5"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r={radius}
                        className={`fill-none transition-all duration-300 ${ring.color}`}
                        strokeWidth="5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {Math.round(ring.current)}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-mono whitespace-nowrap block">
                    {ring.unit}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600 mt-0.5 whitespace-nowrap block">
                    {ring.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Meal Logging List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-700">今日餐次記錄</h3>
          {mealTypes.map((meal, idx) => {
            const mealRecord = todayRecords.find(r => r.type === meal.type);
            const totalCals = mealRecord
              ? mealRecord.foods.reduce((sum, f) => sum + f.calories, 0)
              : 0;

            return (
              <div
                key={idx}
                className="p-4 border border-slate-100 rounded-2xl transition-all hover:border-slate-200 flex items-center justify-between bg-white relative group"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                      {meal.time}
                    </span>
                    <h4 className="text-sm font-bold text-slate-700">{meal.label}</h4>
                    {mealRecord?.advice && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 block" title="含有AI營養建議" />
                    )}
                  </div>

                  <div className="mt-2">
                    {mealRecord ? (
                      <p className="text-xs text-slate-400 max-w-[240px] truncate leading-relaxed">
                        {mealRecord.foods.map(f => f.name).join('、')}
                      </p>
                    ) : (
                      <span className="text-xs text-slate-400/75 italic">尚未記錄任何餐食</span>
                    )}
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  {mealRecord ? (
                    <div>
                      <p className="text-sm font-bold text-slate-700 font-mono">{totalCals} kcal</p>
                      <button
                        onClick={onViewAnalysis}
                        className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap inline-flex items-center gap-0.5 cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> 營養分析
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigateToMealInput(meal.type)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-xl hover:bg-emerald-100 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> 新增{meal.label}
                    </button>
                  )}
                  {mealRecord && (
                    <button
                      onClick={() => onNavigateToMealInput(meal.type)}
                      className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Tip banner */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-100/50 rounded-2xl flex gap-3 items-start">
          <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-600 border border-emerald-100 font-bold shrink-0 mt-0.5 shadow-sm">
            💡
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-700 leading-none mb-1">小提示</h4>
            <p className="text-xs text-emerald-600/90 leading-relaxed">
              點擊頂部導航的「AI 辨識記錄」可以使用相機或上傳相片，透過 Google Gemini 智慧模型自動替您分析整餐的精緻卡路里與重量！
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
