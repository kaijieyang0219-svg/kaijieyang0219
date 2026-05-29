import { useState } from "react";
import { motion } from "motion/react";
import { Search, Plus, Minus, Check, ChevronLeft, Sparkles } from "lucide-react";
import { FoodItem, MealType } from "../types";
import { COMMON_FOODS } from "../data";

interface ManualEntryScreenProps {
  onSaveMeal: (mealType: MealType, foods: FoodItem[], image: string, advice: string) => void;
  onNavigateToDashboard: () => void;
  initialMealType?: MealType;
}

export default function ManualEntryScreen({
  onSaveMeal,
  onNavigateToDashboard,
  initialMealType = "lunch",
}: ManualEntryScreenProps) {
  const [selectedMealType, setSelectedMealType] = useState<MealType>(initialMealType);
  const [searchText, setSearchText] = useState("");
  
  // Local list of active meal items being prepared by the user
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);

  // Filter common foods based on search query
  const filteredCommon = COMMON_FOODS.filter((food) =>
    food.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Add food to active draft
  const handleAddFoodDraft = (food: typeof COMMON_FOODS[0]) => {
    // Check if food already in drafting
    const exists = selectedFoods.some(f => f.name === food.name);
    if (exists) {
      // Increment
      setSelectedFoods(
        selectedFoods.map((f) => {
          if (f.name === food.name) {
            const weightNum = parseInt(f.weight) || 100;
            const updatedWeight = `${weightNum + 50}g`;
            const scale = (weightNum + 50) / weightNum;
            return {
              ...f,
              weight: updatedWeight,
              calories: Math.round(f.calories * scale),
              protein: parseFloat((f.protein * scale).toFixed(1)),
              fat: parseFloat((f.fat * scale).toFixed(1)),
              carbs: parseFloat((f.carbs * scale).toFixed(1)),
            };
          }
          return f;
        })
      );
    } else {
      setSelectedFoods([...selectedFoods, { ...food }]);
    }
  };

  const handleAdjustDraft = (idx: number, multiplier: number) => {
    const updated = [...selectedFoods];
    const food = updated[idx];
    const weightNum = parseInt(food.weight) || 100;
    const isGrams = food.weight.includes("g");

    if (multiplier > 0) {
      food.weight = isGrams ? `${weightNum + 50}g` : `${weightNum + 1}顆`;
      const scale = (weightNum + (isGrams ? 50 : 1)) / weightNum;
      food.calories = Math.round(food.calories * scale);
      food.protein = parseFloat((food.protein * scale).toFixed(1));
      food.fat = parseFloat((food.fat * scale).toFixed(1));
      food.carbs = parseFloat((food.carbs * scale).toFixed(1));
    } else {
      if (isGrams && weightNum <= 50) {
        // Remove item
        setSelectedFoods(selectedFoods.filter((_, i) => i !== idx));
        return;
      }
      if (!isGrams && weightNum <= 1) {
        setSelectedFoods(selectedFoods.filter((_, i) => i !== idx));
        return;
      }

      food.weight = isGrams ? `${weightNum - 50}g` : `${weightNum - 1}顆`;
      const scale = (weightNum - (isGrams ? 50 : 1)) / weightNum;
      food.calories = Math.round(food.calories * scale);
      food.protein = parseFloat((food.protein * scale).toFixed(1));
      food.fat = parseFloat((food.fat * scale).toFixed(1));
      food.carbs = parseFloat((food.carbs * scale).toFixed(1));
    }

    setSelectedFoods(updated);
  };

  // Build final record saving
  const handleSave = () => {
    if (selectedFoods.length === 0) return;
    
    // Generate simple nutritionist review advice for manual logging
    const totalProt = selectedFoods.reduce((sum, f) => sum + f.protein, 0);
    const totalCarb = selectedFoods.reduce((sum, f) => sum + f.carbs, 0);
    const advice = `手動登陸成功！您本餐共攝取了 ${totalProt}g 的優質蛋白質以及 ${totalCarb}g 的複合碳水化合物。餐後記得補充充足的水分，保持充足的膳食纖維攝取！`;

    onSaveMeal(selectedMealType, selectedFoods, "", advice);
    onNavigateToDashboard();
  };

  const totalCalsRef = selectedFoods.reduce((sum, f) => sum + f.calories, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="manual-entry-card"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToDashboard}
            className="p-1 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800">05. 手動輸入飲食紀錄</h2>
            <p className="text-xs text-slate-400 mt-0.5">自訂輸入卡路里與重量，多樣化靈活搭配</p>
          </div>
        </div>
        <select
          value={selectedMealType}
          onChange={(e) => setSelectedMealType(e.target.value as MealType)}
          className="text-xs font-semibold bg-emerald-50 text-emerald-700 border-none rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
        >
          <option value="breakfast">早餐</option>
          <option value="lunch">午餐</option>
          <option value="dinner">晚餐</option>
          <option value="snack">點心</option>
        </select>
      </div>

      <div className="p-6 space-y-6">
        {/* Search Bar */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 ml-1">搜尋食物組成分類</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="food-search-input"
              type="text"
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
              placeholder="搜尋食材，例如：雞胸肉、糙米、美式咖啡..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Commonly used Food items quick action buttons */}
        <div className="space-y-2">
          <span className="block text-xs font-semibold text-slate-400 ml-1">常用食物快捷鍵</span>
          <div className="flex flex-wrap gap-2">
            {filteredCommon.map((food, fIdx) => (
              <button
                key={fIdx}
                onClick={() => handleAddFoodDraft(food)}
                className="py-1.5 px-3 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-100 rounded-xl text-xs text-slate-600 font-medium transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3 scale-90 opacity-70" />
                <span>{food.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recently Added Draft Items for fine adjustments */}
        <div className="space-y-3">
          <span className="block text-xs font-semibold text-slate-400 ml-1">
            本餐已點選項目 ({selectedFoods.length})
          </span>

          {selectedFoods.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-100 rounded-2xl text-center text-slate-400 bg-slate-50/50">
              <span className="text-xs italic">請點擊上方常用食物或搜尋後新增餐盤食物</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {selectedFoods.map((food, draftIdx) => (
                <div
                  key={draftIdx}
                  className="p-3 border border-slate-100 bg-white rounded-xl flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-700">{food.name}</span>
                    <span className="text-[10px] text-slate-400 block font-mono mt-0.5">
                      {food.calories} kcal · PRO: {food.protein}g · CHO: {food.carbs}g
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* +/- adjustment values */}
                    <div className="flex items-center border border-slate-100 bg-slate-50 rounded-lg p-0.5 scale-90">
                      <button
                        onClick={() => handleAdjustDraft(draftIdx, -1)}
                        className="p-1 hover:bg-white text-slate-500 rounded transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 font-bold text-xs text-slate-600 font-mono min-w-[45px] text-center">
                        {food.weight}
                      </span>
                      <button
                        onClick={() => handleAdjustDraft(draftIdx, 1)}
                        className="p-1 hover:bg-white text-slate-500 rounded transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Manual Totals banner */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">本餐預估熱量加總</span>
          <span className="text-lg font-bold font-display text-emerald-600 font-mono">
            {totalCalsRef} <span className="text-xs font-bold">kcal</span>
          </span>
        </div>

        {/* Save button */}
        <button
          id="manual-save-meal-btn"
          onClick={handleSave}
          disabled={selectedFoods.length === 0}
          className={`w-full py-4.5 rounded-2xl text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
            selectedFoods.length > 0
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10 active:scale-[0.99]"
              : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
          }`}
        >
          <Check className="w-4 h-4" />
          <span>儲存此餐手動紀錄</span>
        </button>
      </div>
    </motion.div>
  );
}
