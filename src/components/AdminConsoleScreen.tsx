import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, ShieldAlert, UserCheck, Key, Settings2, Sparkles, RefreshCw, Layers } from "lucide-react";
import { UserRole } from "../types";

interface AdminConsoleScreenProps {
  allUsers: any[];
  onUpdateUserRole: (
    uid: string,
    fields: { role: UserRole; teacherId?: string; caregiverId?: string }
  ) => Promise<void>;
}

export default function AdminConsoleScreen({ allUsers, onUpdateUserRole }: AdminConsoleScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter teachers and caregivers for assignments
  const teachers = allUsers.filter((u) => u.role === "teacher");
  const caregivers = allUsers.filter((u) => u.role === "caregiver");

  // Filter the users list to render
  const filteredUsers = allUsers.filter((user) => {
    const nameMatches = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatches = (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const roleMatches = roleFilter === "all" || user.role === roleFilter;
    return (nameMatches || emailMatches) && roleMatches;
  });

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    setUpdatingId(uid);
    try {
      await onUpdateUserRole(uid, { role: newRole });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleTeacherChange = async (uid: string, teacherId: string) => {
    setUpdatingId(uid);
    try {
      await onUpdateUserRole(uid, { role: "student", teacherId });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCaregiverChange = async (uid: string, caregiverId: string) => {
    setUpdatingId(uid);
    try {
      await onUpdateUserRole(uid, { role: "student", caregiverId });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="admin-console-card"
    >
      {/* Visual Header */}
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-5 h-5 text-emerald-600 animate-pulse" />
              帳號與權限分配中心 (管理者)
            </h2>
            <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">
              Admin ONLY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            預設 <b>kaijieyang0219@gmail.com</b> 為最高管理者。其餘 Google 登入帳號預設為「審核中」，由您在此指派權限（教師/家長/學生）與關聯綁定。
          </p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Search and Filters banner */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="admin-user-search"
              type="text"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
              placeholder="搜尋使用者姓名或 Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 shrink-0">
            {["all", "admin", "teacher", "caregiver", "student", "pending"].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-2 text-xs font-bold rounded-xl transition-all capitalize border cursor-pointer ${
                  roleFilter === role
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                {role === "all" ? "全部" : role === "admin" ? "最高管理者" : role === "teacher" ? "教師" : role === "caregiver" ? "家長" : role === "student" ? "學生" : "審核中"}
              </button>
            ))}
          </div>
        </div>

        {/* Users catalog list */}
        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/20">
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-slate-100/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <span className="col-span-4">姓名 / 電子郵件</span>
            <span className="col-span-3">身份角色指派</span>
            <span className="col-span-4">關聯指派 (限「學生」身份)</span>
            <span className="col-span-1 text-right">狀態</span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <span className="text-xs italic">查無匹配的使用者清單</span>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.uid}
                  className="grid grid-cols-12 gap-2 px-4 py-4 items-center bg-white hover:bg-slate-50/50 transition-colors"
                >
                  {/* Name and Email */}
                  <div className="col-span-4 space-y-1">
                    <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      {user.name || "新使用者"}
                      {user.email === "kaijieyang0219@gmail.com" && (
                        <span className="text-[9px] bg-rose-100 text-rose-600 px-1 py-0.2 rounded-md font-extrabold uppercase shrink-0">
                          Bootstrap
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{user.email}</p>
                  </div>

                  {/* Role selection Dropdown */}
                  <div className="col-span-3">
                    <select
                      value={user.role}
                      disabled={updatingId === user.uid || user.email === "kaijieyang0219@gmail.com"}
                      onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 focus:outline-none focus:border-emerald-500 w-fit hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <option value="pending">審核中 (Pending)</option>
                      <option value="student">學生 (Student)</option>
                      <option value="teacher">教師 (Teacher/Coach)</option>
                      <option value="caregiver">家長 (Caregiver/Parent)</option>
                      <option value="admin">管理者 (Admin)</option>
                    </select>
                  </div>

                  {/* Parent Coach and Caregiver association */}
                  <div className="col-span-4 space-y-2">
                    {user.role === "student" ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-400 font-bold w-12 shrink-0">配對教師:</span>
                          <select
                            value={user.teacherId || ""}
                            onChange={(e) => handleTeacherChange(user.uid, e.target.value)}
                            disabled={updatingId === user.uid}
                            className="flex-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] font-medium text-slate-600 focus:outline-none"
                          >
                            <option value="">-- 無 --</option>
                            {teachers.map((t) => (
                              <option key={t.uid} value={t.uid}>
                                {t.name} ({t.email.split("@")[0]})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-slate-400 font-bold w-12 shrink-0">配對家長:</span>
                          <select
                            value={user.caregiverId || ""}
                            onChange={(e) => handleCaregiverChange(user.uid, e.target.value)}
                            disabled={updatingId === user.uid}
                            className="flex-1 px-2 py-1 bg-slate-50 border border-slate-100 rounded text-[11px] font-medium text-slate-600 focus:outline-none"
                          >
                            <option value="">-- 無 --</option>
                            {caregivers.map((c) => (
                              <option key={c.uid} value={c.uid}>
                                {c.name} ({c.email.split("@")[0]})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">非學生身份，無須配對關係</span>
                    )}
                  </div>

                  {/* Status indicator */}
                  <div className="col-span-1 text-right">
                    {updatingId === user.uid ? (
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin ml-auto" />
                    ) : (
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          user.role === "pending"
                            ? "bg-amber-400 animate-pulse"
                            : user.role === "admin"
                            ? "bg-rose-500"
                            : user.role === "teacher"
                            ? "bg-sky-500"
                            : user.role === "caregiver"
                            ? "bg-purple-500"
                            : "bg-emerald-500"
                        }`}
                        title={
                          user.role === "pending"
                            ? "審核中"
                            : user.role === "admin"
                            ? "專屬最高管理者"
                            : user.role === "teacher"
                            ? "教師認證中"
                            : user.role === "caregiver"
                            ? "照護家長關係"
                            : "學生"
                        }
                      ></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instruction Footer Tip */}
        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] text-slate-500 leading-relaxed text-justify flex gap-2">
          <Layers className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <b>系統配對指引：</b>變更任何人的角色權限，會立刻引導該帳號在他們的設備上同步轉換為對應的主題與專屬功能。將學生與教師/家長配對後，該教師或家長便能在其「受託學員管理」內即時點擊、觀看該學員的所有飲控數值與相片，並即時給予飲食點評！
          </span>
        </div>
      </div>
    </motion.div>
  );
}
