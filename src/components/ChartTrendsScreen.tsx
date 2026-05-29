import { useState } from "react";
import { motion } from "motion/react";
import { Calendar, TrendingUp, Award, Flame } from "lucide-react";
import { MOCK_CHART_DAYS } from "../data";

export default function ChartTrendsScreen() {
  const [activeTab, setActiveTab] = useState<"day" | "week" | "month">("week");
  const data = MOCK_CHART_DAYS;

  // Find max value for scaling the bar heights nicely inside SVG
  const maxCalVal = Math.max(...data.map(d => Math.max(d.calories, d.target))) || 2200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="chart-trends-card"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">07. 圖表分析與飲食趨勢</h2>
          <p className="text-xs text-slate-400 mt-0.5">多維度追蹤大卡與三大營養素走勢</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("day")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "day" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            日
          </button>
          <button
            onClick={() => setActiveTab("week")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "week" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            週
          </button>
          <button
            onClick={() => setActiveTab("month")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "month" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            月
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Date period selector info */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            對比期間：2026/05/18 歷史趨勢
          </span>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-mono">
            目標基準：2000 kcal
          </span>
        </div>

        {/* High-quality responsive SVG Bar Chart representing Calories vs Target */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
          <h3 className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-500" /> Card A: 每日熱量攝取趨勢 (kcal)
          </h3>
          
          <div className="relative w-full h-[180px]">
            <svg className="w-full h-full" viewBox="0 0 500 180" preserveAspectRatio="none">
              {/* Grid Lines */}
              <line x1="40" y1="30" x2="480" y2="30" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="80" x2="480" y2="80" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="130" x2="480" y2="130" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="40" y1="150" x2="480" y2="150" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* Y Axis descriptors */}
              <text x="10" y="34" className="text-[9px] fill-slate-400 font-mono font-bold" textAnchor="middle">2000</text>
              <text x="10" y="84" className="text-[9px] fill-slate-400 font-mono font-bold" textAnchor="middle">1000</text>
              <text x="10" y="134" className="text-[9px] fill-slate-400 font-mono font-bold" textAnchor="middle">500</text>
              
              {/* Target Line overlay (2000 calorie threshold in emerald) */}
              <line 
                x1="40" 
                y1="30" 
                x2="480" 
                y2="30" 
                stroke="#10b981" 
                strokeWidth="1.5" 
                strokeDasharray="4 4" 
                opacity="0.8" 
              />
              
              {/* Dynamic Bar renderings */}
              {data.map((day, idx) => {
                const stepX = 40 + idx * 90 + 35;
                const barHeight = (day.calories / maxCalVal) * 110;
                const barY = 140 - barHeight;

                return (
                  <g key={idx}>
                    {/* Shadow block bar background representing target cap */}
                    <rect
                      x={stepX}
                      y="30"
                      width="18"
                      height="110"
                      fill="#e2e8f0"
                      opacity="0.1"
                      rx="4"
                    />

                    {/* Actual intake calorie bar */}
                    <motion.rect
                      initial={{ height: 0, y: 140 }}
                      animate={{ height: barHeight, y: barY }}
                      transition={{ duration: 0.6, delay: idx * 0.05 }}
                      x={stepX}
                      width="18"
                      fill={day.calories > day.target ? "#ef4444" : "#10b981"}
                      opacity="0.85"
                      rx="4"
                    />

                    {/* Specific data labels */}
                    <text
                      x={stepX + 9}
                      y={Math.max(25, barY - 6)}
                      className="text-[9px] fill-slate-600 font-bold font-mono"
                      textAnchor="middle"
                    >
                      {day.calories}
                    </text>

                    {/* Date labels below axis */}
                    <text
                      x={stepX + 9}
                      y="162"
                      className="text-[9px] fill-slate-400 font-bold font-sans"
                      textAnchor="middle"
                    >
                      {day.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Macro trends representation chart with wavy SVG Lines */}
        <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-50">
          <h3 className="text-xs font-bold text-slate-500 mb-4 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" /> Card B: 三大營養素黃金走勢 (克數 g)
          </h3>

          <div className="relative w-full h-[140px]">
            <svg className="w-full h-full" viewBox="0 0 500 145" preserveAspectRatio="none">
              {/* Curved trend overlays */}
              {/* Carbs line (emerald) */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1 }}
                d="M 75 40 Q 165 20 255 10 T 435 55"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Protein line (amber) */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                d="M 75 75 Q 165 65 255 55 T 435 85"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              {/* Fat line (rose red) */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
                d="M 75 95 Q 165 110 255 90 T 435 115"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* End visual bubbles with values */}
              <circle cx="435" cy="55" r="4" fill="#10b981" />
              <circle cx="435" cy="85" r="4" fill="#f59e0b" />
              <circle cx="435" cy="115" r="4" fill="#f43f5e" />
            </svg>

            {/* Custom overlays / hover helpers */}
            <div className="absolute right-4 top-2 bg-white/90 backdrop-blur-xs text-[10px] font-bold p-2 rounded-lg border border-slate-100 flex flex-col gap-1 shadow-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> 碳水: 160g</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> 蛋白: 90g</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> 脂肪: 45g</span>
            </div>
          </div>
        </div>

        {/* Award/Goal success review banner */}
        <div className="p-4.5 bg-indigo-50/50 border border-indigo-100/30 rounded-2xl flex items-center justify-between">
          <div className="flex gap-3 items-center">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold relative shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-900 leading-none mb-1">目標達標率傑出！</h4>
              <p className="text-[11px] text-indigo-700/80 leading-tight">
                過去五天中您有 <b>4 天</b> 完美契合了卡路里控制區間，太棒了！
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
