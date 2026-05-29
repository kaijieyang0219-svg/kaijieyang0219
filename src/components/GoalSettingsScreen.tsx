import { useState } from "react";
import { motion } from "motion/react";
import { UserProfile, ActivityLevel } from "../types";
import { Check, Flame, Trophy, Shield } from "lucide-react";

interface GoalSettingsScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onNavigateToDashboard: () => void;
}

export default function GoalSettingsScreen({
  profile,
  onUpdateProfile,
  onNavigateToDashboard,
}: GoalSettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<"calorie" | "nutrition" | "weight">("calorie");
  
  // Local state copy of goals
  const [calorieVal, setCalorieVal] = useState(profile.calorieTarget);
  const [proteinVal, setProteinVal] = useState(profile.proteinTarget);
  const [fatVal, setFatVal] = useState(profile.fatTarget);
  const [carbVal, setCarbVal] = useState(profile.carbTarget);
  const [activeLevel, setActiveLevel] = useState<ActivityLevel>(profile.activityLevel);

  const activityOptions: { key: ActivityLevel; label: string; desc: string; icon: string }[] = [
    { key: "sedentary", label: "久坐", desc: "辦公室上班族", icon: "🛋️" },
    { key: "light", label: "輕度", desc: "日常少量走動", icon: "🚶" },
    { key: "moderate", label: "中度", desc: "規律健身運動", icon: "🏃" },
    { key: "high", label: "強度", desc: "高抗高負荷勞動", icon: "🚴" }
  ];

  const handleSave = () => {
    onUpdateProfile({
      ...profile,
      calorieTarget: calorieVal,
      proteinTarget: proteinVal,
      fatTarget: fatVal,
      carbTarget: carbVal,
      activityLevel: activeLevel
    });
    onNavigateToDashboard();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="goal-settings-card"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">08. 目標設定調整</h2>
          <p className="text-xs text-slate-400 mt-0.5">客製化配置您的卡路里預算與黃金能量佔比</p>
        </div>

        {/* Goals selection categories tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("calorie")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "calorie" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            熱量目標
          </button>
          <button
            onClick={() => setActiveTab("nutrition")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "nutrition" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            營養素目標
          </button>
          <button
            onClick={() => setActiveTab("weight")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "weight" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            體重目標
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {activeTab === "calorie" ? (
          /* Calorie input panel */
          <div className="space-y-6 animate-fadeIn">
            {/* Direct counter picker wrapper */}
            <div className="text-center p-6 bg-slate-50/50 rounded-2xl border border-slate-50 space-y-4">
              <span className="text-xs font-bold text-slate-400 tracking-wider uppercase block">每日推薦熱量目標</span>
              
              <div className="flex items-center justify-center gap-6">
                {/* Decrement */}
                <button
                  onClick={() => setCalorieVal(v => Math.max(1200, v - 50))}
                  className="w-11 h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-lg leading-none">-</span>
                </button>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black font-display text-slate-800 tracking-tighter font-mono leading-none">
                    {calorieVal}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-sans">kcal</span>
                </div>

                {/* Increment */}
                <button
                  onClick={() => setCalorieVal(v => Math.min(4500, v + 50))}
                  className="w-11 h-11 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="text-lg leading-none">+</span>
                </button>
              </div>
            </div>

            {/* Select activity factors */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-500 ml-1">活動量等級選擇</span>
              
              <div className="grid grid-cols-4 gap-2.5">
                {activityOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setActiveLevel(opt.key)}
                    className={`py-3.5 px-2 border rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                      activeLevel === opt.key
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-xs"
                        : "border-slate-100 bg-slate-50/80 hover:bg-slate-100 text-slate-600"
                    }`}
                  >
                    <span className="text-sm mb-1">{opt.icon}</span>
                    <span className="text-xs font-bold block">{opt.label}</span>
                    <span className="text-[9px] text-slate-400 mt-1 block max-w-full truncate">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Calculation reference notes */}
            <div className="p-4 bg-slate-50 rounded-2xl flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 text-slate-500 flex items-center justify-center font-bold font-sans">
                ⚖️
              </div>
              <div className="text-xs">
                <span className="block font-bold text-slate-700 mb-1">目標基準估算依據</span>
                <p className="text-slate-400 leading-relaxed text-justify">
                  已自動為您在背景估算：基礎代謝率 (BMR) 約 1640 kcal 加上 {activeLevel === "sedentary" ? "輕微" : activeLevel === "light" ? "日常" : "中度配合中強度訓練"}之熱量消耗。
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === "nutrition" ? (
          /* Macronutrients fine settings block */
          <div className="space-y-5 animate-fadeIn">
            {/* Protein target bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">蛋白質 (蛋白質熱量比)</span>
                <span className="text-amber-600 font-mono">{proteinVal}g ({Math.round((proteinVal * 4 / calorieVal) * 100)}%)</span>
              </div>
              <input
                type="range"
                min="60"
                max="200"
                step="5"
                value={proteinVal}
                onChange={(e) => setProteinVal(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
              />
            </div>

            {/* Carbs target bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">碳水化合物 (低碳～平衡澱粉)</span>
                <span className="text-emerald-600 font-mono">{carbVal}g ({Math.round((carbVal * 4 / calorieVal) * 100)}%)</span>
              </div>
              <input
                type="range"
                min="100"
                max="400"
                step="5"
                value={carbVal}
                onChange={(e) => setCarbVal(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
              />
            </div>

            {/* Fat target range bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-600">脂肪 (好油脂比例)</span>
                <span className="text-rose-600 font-mono">{fatVal}g ({Math.round((fatVal * 9 / calorieVal) * 100)}%)</span>
              </div>
              <input
                type="range"
                min="30"
                max="120"
                step="5"
                value={fatVal}
                onChange={(e) => setFatVal(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none"
              />
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl flex gap-2 items-center text-[11px] text-amber-800">
              <Shield className="w-4 h-4 shrink-0 text-amber-600" />
              <span>建議：在進行重訓減脂時，推薦將蛋白質熱量比重維持在 25% 以上最能鞏固骨骼肌肉！</span>
            </div>
          </div>
        ) : (
          /* Weight targets section */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center justify-center gap-2">
              <Trophy className="w-10 h-10 text-emerald-600 stroke-1" />
              <span className="text-sm font-bold text-slate-700">體重管理健康里程</span>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed mt-1">
                當前量體重：68 kg · 新設置目標體重：65 kg。<br/>理想狀態推薦每週健康溫和減少 0.5kg，預計在 6 週內即可達標！
              </p>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        <button
          id="goals-save-submit-btn"
          onClick={handleSave}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" /> 儲存設定
        </button>
      </div>
    </motion.div>
  );
}
