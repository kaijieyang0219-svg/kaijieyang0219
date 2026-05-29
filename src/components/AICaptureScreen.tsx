import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, RefreshCw, Upload, Image as ImageIcon, Sparkles, Check, Plus, Minus, AlertCircle } from "lucide-react";
import { FoodItem, MealType } from "../types";
import { FOOD_IMAGES } from "../data";

interface AICaptureScreenProps {
  onSaveMeal: (mealType: MealType, foods: FoodItem[], image: string, advice: string) => void;
  onNavigateToDashboard: () => void;
}

export default function AICaptureScreen({ onSaveMeal, onNavigateToDashboard }: AICaptureScreenProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType>("lunch");
  const [imagePreview, setImagePreview] = useState<string>(FOOD_IMAGES.chickenRiceBroccoli);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ foods: FoodItem[]; advice: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick Preset Sample Images for Simplicity
  const samples = [
    { name: "蒜香雞肉糙米餐 (預設範例)", data: FOOD_IMAGES.chickenRiceBroccoli },
    { name: "鮮綠水煮蛋沙拉", data: FOOD_IMAGES.eggSalad },
    { name: "香蕉牛奶燕麥點心", data: FOOD_IMAGES.bananaMilk }
  ];

  // Manual Adjustments to identified foods
  const handleQuantityChange = (idx: number, multiplier: number) => {
    if (!analysisResult) return;
    const updatedFoods = [...analysisResult.foods];
    const food = updatedFoods[idx];
    
    // Parse weight number
    const weightNum = parseInt(food.weight) || 1;
    const isGrams = food.weight.includes("g");
    
    if (multiplier > 0) {
      food.weight = isGrams ? `${weightNum + 20}g` : `${weightNum + 1}顆`;
      // Linearly scale calories and macros
      const scale = (weightNum + (isGrams ? 20 : 1)) / weightNum;
      food.calories = Math.round(food.calories * scale);
      food.protein = parseFloat((food.protein * scale).toFixed(1));
      food.fat = parseFloat((food.fat * scale).toFixed(1));
      food.carbs = parseFloat((food.carbs * scale).toFixed(1));
    } else {
      if (isGrams && weightNum <= 20) return;
      if (!isGrams && weightNum <= 1) return;
      
      food.weight = isGrams ? `${weightNum - 20}g` : `${weightNum - 1}顆`;
      const scale = (weightNum - (isGrams ? 20 : 1)) / weightNum;
      food.calories = Math.round(food.calories * scale);
      food.protein = parseFloat((food.protein * scale).toFixed(1));
      food.fat = parseFloat((food.fat * scale).toFixed(1));
      food.carbs = parseFloat((food.carbs * scale).toFixed(1));
    }

    setAnalysisResult({
      ...analysisResult,
      foods: updatedFoods
    });
  };

  const handleAddNewItem = () => {
    if (!analysisResult) return;
    const newItem: FoodItem = {
      name: "新增食物",
      weight: "100g",
      calories: 120,
      protein: 5,
      fat: 2,
      carbs: 15,
      fiber: 1,
      sodium: 40,
      sugar: 2
    };
    setAnalysisResult({
      ...analysisResult,
      foods: [...analysisResult.foods, newItem]
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setAnalysisResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Perform Real Gemini-Powered AI Food Recognition
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);

    try {
      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imagePreview,
          textPrompt: `Please identify all individual food items in this meal photograph. Estimate their weight in grams (or standard measure), calories, and protein/fat/carbs. Let the tone be in Traditional Chinese (繁體中文).`
        })
      });

      if (!response.ok) {
        throw new Error("Gemini analysis request failed.");
      }

      const data = await response.json();
      setAnalysisResult({
        foods: data.foods || [],
        advice: data.advice || "整體營養相當均衡！請繼續保持高蛋白質與豐富纖維膳食。"
      });
    } catch (err) {
      console.error(err);
      setError("AI 辨識服務暫時忙碌中，已為您自動加載高擬真預設辨識結果！");
      // Fallback
      setAnalysisResult({
        foods: [
          { name: "蒜香嫩雞胸", weight: "120g", calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0, sodium: 74, sugar: 0 },
          { name: "天然糙米飯", weight: "150g", calories: 180, protein: 4, fat: 1.5, carbs: 38, fiber: 2.5, sodium: 2, sugar: 0.5 },
          { name: "有機綠花椰", weight: "100g", calories: 35, protein: 3, fat: 0.4, carbs: 7, fiber: 3, sodium: 33, sugar: 1.5 },
          { name: "安心水煮蛋", weight: "1顆", calories: 70, protein: 6, fat: 5, carbs: 0.6, fiber: 0, sodium: 62, sugar: 0.6 },
          { name: "初榨橄欖油", weight: "5g", calories: 40, protein: 0, fat: 4.5, carbs: 0, fiber: 0, sodium: 0, sugar: 0 }
        ],
        advice: "整體營養比例十分健康！雞胸肉配合水煮蛋提供了高達 37g 的優質蛋白質來源，糙米飯則是高纖低 GI 澱粉。若下午感到微餓，可以再搭配 10-15 克的綜合堅果。"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!analysisResult) return;
    onSaveMeal(
      selectedMealType,
      analysisResult.foods,
      imagePreview,
      analysisResult.advice
    );
    onNavigateToDashboard();
  };

  // Calculate totals
  const totalCals = analysisResult?.foods.reduce((sum, f) => sum + f.calories, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="ai-recognition-card"
    >
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-800">03. AI 拍照飲食辨識</h2>
          <p className="text-xs text-slate-400 mt-0.5">透過 Google Gemini 音速神經網路智慧辨識整盤美味</p>
        </div>
        <select
          value={selectedMealType}
          onChange={(e) => setSelectedMealType(e.target.value as MealType)}
          className="text-xs font-semibold bg-emerald-50 text-emerald-700 border-none rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
        >
          <option value="breakfast">記錄至：早餐</option>
          <option value="lunch">記錄至：午餐</option>
          <option value="dinner">記錄至：晚餐</option>
          <option value="snack">記錄至：點心</option>
        </select>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!analysisResult && !isAnalyzing ? (
            /* Screen 03: Camera / Photo selection space */
            <motion.div
              key="camera-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Fake camera preview frame */}
              <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex flex-col items-center justify-center group">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Food preview"
                    className="w-full h-full object-cover opacity-90"
                    id="camera-preview-img"
                  />
                ) : (
                  <div className="text-center text-slate-400 p-8">
                    <Camera className="w-12 h-12 stroke-1 mx-auto mb-3" />
                    <p className="text-sm">尚未載入盤中食物照片</p>
                  </div>
                )}

                {/* Target Guides */}
                <div className="absolute inset-4 border border-dashed border-white/40 pointer-events-none rounded-xl flex items-center justify-center">
                  <span className="text-[10px] text-white/50 bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs font-medium">
                    請將餐點置於框線中心內
                  </span>
                </div>

                {/* Left floating buttons for simulated actions */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                  <button
                    onClick={triggerUploadClick}
                    className="p-2.5 bg-black/70 hover:bg-black/85 text-white rounded-xl backdrop-blur-md transition-all cursor-pointer"
                    title="上傳個人相片"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {/* Preset Sample Photo Selectors */}
              <div className="space-y-3">
                <span className="block text-xs font-semibold text-slate-500 ml-1">無相機？點擊加載優選範例測試 AI 晶片：</span>
                <div className="grid grid-cols-3 gap-2.5">
                  {samples.map((sample, sIdx) => (
                    <button
                      key={sIdx}
                      onClick={() => {
                        setImagePreview(sample.data);
                        setAnalysisResult(null);
                        setError(null);
                      }}
                      className={`p-2.5 border rounded-xl text-left transition-all text-xs flex flex-col gap-1.5 cursor-pointer ${
                        imagePreview === sample.data
                          ? "border-emerald-500 bg-emerald-50/50 text-emerald-800"
                          : "border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold block truncate">{sample.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start Recognition Action button */}
              <button
                id="ai-recognize-submit-btn"
                onClick={handleAnalyze}
                className="w-full py-4.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-semibold transition-all shadow-lg shadow-emerald-600/10 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                使用 Gemini 開始拍照 AI 辨識
              </button>
            </motion.div>
          ) : isAnalyzing ? (
            /* Analyzing Loading State with high reassure */
            <motion.div
              key="analyzing-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-6"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <span className="text-sm font-bold text-slate-700 block">盤中美食大腦飛速分析中...</span>
                <span className="text-xs text-slate-400 block leading-relaxed animate-pulse">
                  正在讀取邊緣輪廓、估算高保真重量，並參照國際臨床營養成分基準...
                </span>
              </div>
            </motion.div>
          ) : (
            /* Screen 04: AI Result Adjust and Save */
            <motion.div
              key="result-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {error && (
                <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 text-xs rounded-xl flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Identified foods list */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-slate-500">大腦辨識到之食物組成</span>
                  <button
                    onClick={handleAddNewItem}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" /> 新增其他
                  </button>
                </div>

                <div className="divide-y divide-slate-50 max-h-[280px] overflow-y-auto pr-1">
                  {analysisResult?.foods.map((food, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{food.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            蛋白質: {food.protein}g · 脂肪: {food.fat}g · 碳水: {food.carbs}g
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* +/- counter to adjust grams */}
                        <div className="flex items-center border border-slate-100 bg-slate-50 rounded-lg p-1 scale-90">
                          <button
                            onClick={() => handleQuantityChange(idx, -1)}
                            className="p-1 hover:bg-white text-slate-500 rounded transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-600 font-mono min-w-[50px] text-center">
                            {food.weight}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(idx, 1)}
                            className="p-1 hover:bg-white text-slate-500 rounded transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-slate-700 font-mono text-right min-w-[65px]">
                          {food.calories} kcal
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total calories banner */}
              <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <span className="text-xs font-bold text-slate-500">本餐熱量加總比對</span>
                <span className="text-xl font-bold font-display text-emerald-600 font-mono">
                  {totalCals} <span className="text-xs font-bold">kcal</span>
                </span>
              </div>

              {/* AI dietitian suggestion banner */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-100/30 rounded-2xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini 營養師點評與建議</span>
                </div>
                <p className="text-xs text-emerald-600/90 leading-relaxed text-justify">
                  {analysisResult?.advice}
                </p>
              </div>

              {/* Save or Retake actions */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> 重新拍照
                </button>
                <button
                  onClick={handleSave}
                  className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-500/15 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" /> 儲存此餐記錄
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
