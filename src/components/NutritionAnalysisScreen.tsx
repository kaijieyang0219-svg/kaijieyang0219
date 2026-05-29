import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, Leaf, Percent, Info } from "lucide-react";
import { MealRecord, MealType } from "../types";

interface NutritionAnalysisScreenProps {
  records: MealRecord[];
  onNavigateToDashboard: () => void;
}

export default function NutritionAnalysisScreen({ records, onNavigateToDashboard }: NutritionAnalysisScreenProps) {
  // Let the user switch analysis reviews of today's recorded meals
  const todayRecords = records.filter(r => r.date === "2026-05-22");
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    todayRecords.length > 0 ? todayRecords[0].id : ""
  );

  const activeRecord = records.find(r => r.id === selectedRecordId) || todayRecords[0];

  const mealTypeLabels: Record<MealType, string> = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "點心"
  };

  // If no record exists
  if (!activeRecord) {
    return (
      <div className="w-full bg-white rounded-3xl p-8 text-center text-slate-400 border border-slate-100 shadow-xl" id="no-analysis-record">
        <Info className="w-12 h-12 stroke-1 mx-auto text-slate-300 mb-2" />
        <p className="text-sm font-bold">現時段尚無任何餐食記錄可分析</p>
        <p className="text-xs text-slate-400/90 mt-1 max-w-xs mx-auto">
          請先前往下方「首頁儀表板」或「AI 辨識記錄」建立您的第一筆營養豐盛的一餐！
        </p>
      </div>
    );
  }

  // Calculate macro totals of the active record
  let totalCals = 0;
  let totalCarbs = 0;
  let totalProtein = 0;
  let totalFat = 0;
  let totalFiber = 0;
  let totalSodium = 0;
  let totalSugar = 0;

  activeRecord.foods.forEach((f) => {
    totalCals += f.calories;
    totalCarbs += f.carbs;
    totalProtein += f.protein;
    totalFat += f.fat;
    totalFiber += f.fiber || 0;
    totalSodium += f.sodium || 0;
    totalSugar += f.sugar || 0;
  });

  // Calculate percentage ratios (by energy weight or simple gram weight representation)
  // Standard calorie macro factors: Carb=4, Protein=4, Fat=9
  const carbEnergy = totalCarbs * 4;
  const proteinEnergy = totalProtein * 4;
  const fatEnergy = totalFat * 9;
  const totalEnergyWeight = carbEnergy + proteinEnergy + fatEnergy || 1;

  const carbPct = Math.round((carbEnergy / totalEnergyWeight) * 100);
  const proteinPct = Math.round((proteinEnergy / totalEnergyWeight) * 100);
  const fatPct = Math.max(0, 100 - carbPct - proteinPct); // ensures exact 100% total sum

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="nutrition-analysis-card"
    >
      {/* Header with selector */}
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">06. 營養成分精密分析</h2>
          <p className="text-xs text-slate-400 mt-0.5">三餐精密常量營養比重與 AI 微量提示</p>
        </div>

        {/* Picker of today's records */}
        {todayRecords.length > 0 && (
          <select
            value={selectedRecordId}
            onChange={(e) => setSelectedRecordId(e.target.value)}
            className="text-xs font-semibold bg-emerald-50 text-emerald-700 border-none rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
          >
            {todayRecords.map((r, rIdx) => (
              <option key={rIdx} value={r.id}>
                {mealTypeLabels[r.type]} ({r.time}) - {r.foods.length}項
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Ring Chart Breakdown */}
        <div className="flex flex-col items-center justify-center py-4 bg-slate-50/40 rounded-2xl border border-slate-50 relative overflow-hidden">
          {/* Circular donut SVG layout */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Base background */}
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
              
              {/* Carbs Segment (Emerald green) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#10b981"
                strokeWidth="12"
                strokeDasharray={`${2.512 * carbPct} 251.2`}
                strokeDashoffset="0"
                className="transition-all duration-500"
              />
              {/* Protein Segment (Amber Gold) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="12"
                strokeDasharray={`${2.512 * proteinPct} 251.2`}
                strokeDashoffset={`-${2.512 * carbPct}`}
                className="transition-all duration-500"
              />
              {/* Fat Segment (Rose Pink) */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="12"
                strokeDasharray={`${2.512 * fatPct} 251.2`}
                strokeDashoffset={`-${2.512 * (carbPct + proteinPct)}`}
                className="transition-all duration-500"
              />
            </svg>

            {/* Inner text inside centered donut circle */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[26px] font-black text-slate-800 font-mono tracking-tighter leading-none">
                {totalCals}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 font-mono tracking-widest leading-none">
                kcal
              </span>
            </div>
          </div>

          {/* Side Legend Indicator badges */}
          <div className="flex justify-center gap-6 mt-6 w-full px-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 focus:outline-none">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block"></span>
              <span className="text-slate-500">碳水化合物 ({carbPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5 focus:outline-none">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></span>
              <span className="text-slate-500">蛋白質 ({proteinPct}%)</span>
            </div>
            <div className="flex items-center gap-1.5 focus:outline-none">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 block"></span>
              <span className="text-slate-500">脂肪 ({fatPct}%)</span>
            </div>
          </div>
        </div>

        {/* Gram specific values in tables */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
            <span className="block text-[11px] text-slate-400 font-medium mb-1">碳水化合物</span>
            <span className="text-sm font-bold text-emerald-600 font-mono">{totalCarbs}g</span>
          </div>
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
            <span className="block text-[11px] text-slate-400 font-medium mb-1">蛋白質</span>
            <span className="text-sm font-bold text-amber-600 font-mono">{totalProtein}g</span>
          </div>
          <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center">
            <span className="block text-[11px] text-slate-400 font-medium mb-1">脂肪</span>
            <span className="text-sm font-bold text-rose-500 font-mono">{totalFat}g</span>
          </div>
        </div>

        {/* Micro nutrition details (dietary fiber, sodium, sugars) */}
        <div>
          <span className="block text-xs font-bold text-slate-500 mb-3 ml-1">微量元素與輔助因子</span>
          <div className="grid grid-cols-3 gap-3">
            {/* Dietary Fiber */}
            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">膳食纖維</span>
              <span className="text-sm font-bold text-slate-700 font-mono mt-1 block">
                {totalFiber.toFixed(1)} <span className="text-[10px] font-bold text-slate-400 font-sans">g</span>
              </span>
            </div>

            {/* Sodium */}
            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">鈉離子</span>
              <span className="text-sm font-bold text-slate-700 font-mono mt-1 block">
                {Math.round(totalSodium)}{" "}
                <span className="text-[10px] font-bold text-slate-400 font-sans">mg</span>
              </span>
            </div>

            {/* Sugars */}
            <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">游離糖類</span>
              <span className="text-sm font-bold text-slate-700 font-mono mt-1 block">
                {totalSugar.toFixed(1)} <span className="text-[10px] font-bold text-slate-400 font-sans">g</span>
              </span>
            </div>
          </div>
        </div>

        {/* Professional Nutrition Advisor Feedback */}
        <div className="p-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl flex gap-3.5 items-start">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-emerald-800 leading-none mb-1">智慧營養點評 (單餐)</h4>
            <p className="text-xs text-emerald-700/95 leading-relaxed text-left text-justify">
              {activeRecord.advice || "整體用餐均衡度良好！建議可持續保持綠葉蔬菜攝取，補充微量維生素與礦物質，維持良好身體代謝。"}
            </p>
          </div>
        </div>

        {/* Direct Link back to Dashboard */}
        <button
          onClick={onNavigateToDashboard}
          className="w-full py-3 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center"
        >
          返回首頁儀表板
        </button>
      </div>
    </motion.div>
  );
}
