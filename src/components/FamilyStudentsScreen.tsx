import React, { useState } from "react";
import { motion } from "motion/react";
import { Student, UserRole } from "../types";
import { Search, Plus, Trash2, Calendar, Dumbbell, Heart, UserPlus } from "lucide-react";

interface FamilyStudentsScreenProps {
  studentsList: Student[];
  role: UserRole;
  onAddStudent: (newStudent: Student) => void;
  onRemoveStudent: (id: string) => void;
}

export default function FamilyStudentsScreen({
  studentsList,
  role,
  onAddStudent,
  onRemoveStudent,
}: FamilyStudentsScreenProps) {
  const [searchText, setSearchText] = useState("");
  const [newStudentName, setNewStudentName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter list by role alignment & search texts
  const filtered = studentsList.filter((s) => {
    // Caregiver role sees "兒子" / "母親", Dietitian/coach sees "學員"
    const roleMatches = role === "caregiver" ? s.relation !== "學員" : s.relation === "學員";
    const searchMatches = s.name.toLowerCase().includes(searchText.toLowerCase());
    return roleMatches && searchMatches;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const added: Student = {
      id: `student-${Date.now()}`,
      name: newStudentName,
      gender: Math.random() > 0.5 ? "male" : "female",
      age: 26 + Math.floor(Math.random() * 10),
      lastRecordDate: "2026-05-22",
      calorieTarget: role === "caregiver" ? 1800 : 2000,
      recentTrends: [1800, 1920, 1750, 1690, 1850, 1900, 1820],
      relation: role === "caregiver" ? "兒子" : "學員"
    };

    onAddStudent(added);
    setNewStudentName("");
    setShowAddForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="family-students-card"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {role === "caregiver" ? "09. 家庭成員餐飲管理中心" : "09. 學員飲食與體能追蹤"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {role === "caregiver"
              ? "守護全家人的飲食健康！掌握家庭成員大卡狀況"
              : "健身教練與營養學專家監控專屬學員減脂狀態"}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ml-auto md:ml-0"
        >
          {role === "caregiver" ? (
            <>
              <Heart className="w-3.5 h-3.5" /> + 新增成員
            </>
          ) : (
            <>
              <UserPlus className="w-3.5 h-3.5" /> + 新增學員
            </>
          )}
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Search bar inputs */}
        <div>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="student-search-input"
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
              placeholder={role === "caregiver" ? "搜尋家庭成員姓名..." : "搜尋指派之專屬學員姓名..."}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>

        {/* Dynamic add form overlay */}
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreate}
            className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
          >
            <span className="block text-xs font-bold text-slate-700">
              {role === "caregiver" ? "新增家庭成員姓名" : "新增指派學員姓名"}
            </span>
            <div className="flex gap-2">
              <input
                id="new-student-name-input"
                type="text"
                required
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-emerald-500 text-slate-800"
                placeholder="例如手打：王曉珍、黃世豪..."
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-all cursor-pointer"
              >
                儲存
              </button>
            </div>
          </motion.form>
        )}

        {/* Roster lists rendering */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 border border-dashed border-slate-100 rounded-2xl text-center text-slate-400">
              <span className="text-xs italic">
                您目前尚未指派或關心任何成員，點擊右上方按鈕加載您的名單！
              </span>
            </div>
          ) : (
            filtered.map((student) => {
              // Calculate mini sparkline data ratios
              const maxVal = Math.max(...student.recentTrends) || 2000;

              return (
                <div
                  key={student.id}
                  className="p-4 border border-slate-100 hover:border-slate-200 bg-white rounded-2xl transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Simulated avatar */}
                    {student.avatar ? (
                      <img
                        referrerPolicy="no-referrer"
                        src={student.avatar}
                        alt="student profile"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-600 border border-slate-100">
                        {student.name.substring(0, 1)}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-700">{student.name}</span>
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                          {student.relation}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        最後登陸：{student.lastRecordDate}
                      </p>
                    </div>
                  </div>

                  {/* Sparkline widget showing calorie trends */}
                  <div className="flex items-center gap-4 ml-auto md:ml-0">
                    <div className="text-right">
                      <span className="block text-[10px] text-slate-400 font-semibold mb-1">熱量預算 (kcal)</span>
                      <span className="text-xs font-bold text-slate-600 font-mono">
                        {student.calorieTarget} / 日
                      </span>
                    </div>

                    {/* Highly responsive tiny inline SVG sparkline */}
                    <div className="w-16 h-8 flex items-center justify-center" title="最近熱量起伏趨勢">
                      <svg className="w-full h-full" viewBox="0 0 60 30">
                        <polyline
                          fill="none"
                          stroke={role === "caregiver" ? "#ef4444" : "#10b981"}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={student.recentTrends
                            .map((val, idx) => {
                              const x = (idx / (student.recentTrends.length - 1)) * 56 + 2;
                              const y = 30 - (val / maxVal) * 26 - 2;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                        />
                      </svg>
                    </div>

                    <button
                      onClick={() => onRemoveStudent(student.id)}
                      className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer ml-2"
                      title="移除指派學員"
                    >
                      <Trash2 className="w-4 h-4 scale-95" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Action tip */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 leading-relaxed text-justify flex gap-2">
          <span className="text-sm">🏋️</span>
          <span>
            {role === "teacher" ? (
              <b>教練特別視角：</b>
            ) : (
              <b>照護家長提示：</b>
            )}
            您可以隨時追蹤您的受託人其進食能量曲線。紅色波形趨近起伏代表他/她當作健身熱能紀錄的配合水平比對。
          </span>
        </div>
      </div>
    </motion.div>
  );
}
