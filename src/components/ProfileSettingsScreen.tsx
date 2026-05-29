import React, { useState } from "react";
import { motion } from "motion/react";
import { UserProfile } from "../types";
import { User, Bell, Shield, Key, Edit3, Check } from "lucide-react";

interface ProfileSettingsScreenProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
}

export default function ProfileSettingsScreen({ profile, onUpdateProfile }: ProfileSettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "account" | "privacy" | "notify">("profile");
  const [isEditing, setIsEditing] = useState(false);
  
  // Editable local variables
  const [name, setName] = useState(profile.name);
  const [height, setHeight] = useState(profile.height);
  const [weight, setWeight] = useState(profile.weight);
  const [gender, setGender] = useState(profile.gender);

  const calculateAge = (bdayStr: string) => {
    const birthDate = new Date(bdayStr);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const currentAge = calculateAge(profile.birthdate);

  const handleUpdate = () => {
    onUpdateProfile({
      ...profile,
      name,
      height,
      weight,
      gender
    });
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="profile-settings-card"
    >
      {/* Header Tabs */}
      <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">10. 個人檔案與控制中心</h2>
          <p className="text-xs text-slate-400 mt-0.5">自訂健康核心基底指標與資安權限管理</p>
        </div>

        {/* Tab switcher options */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "profile" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            個人資料
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "account" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            帳號設定
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "privacy" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            隱私設定
          </button>
          <button
            onClick={() => setActiveTab("notify")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "notify" ? "bg-white text-slate-800 shadow-xs" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            通知設定
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {activeTab === "profile" ? (
          /* Profile fields screen */
          <div className="space-y-6 animate-fadeIn">
            {/* Visual Profile Avatar Banner */}
            <div className="flex items-center gap-4.5 bg-slate-50/50 p-4.5 rounded-2xl border border-slate-50 relative">
              <div className="relative">
                <img
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                  alt="Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                />
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center border-2 border-white hover:bg-emerald-700 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      id="profile-name-edit"
                      type="text"
                      className="px-2 py-1 border border-slate-200 rounded-lg text-xs bg-white text-slate-700"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <button
                      onClick={handleUpdate}
                      className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-slate-800">{profile.name}</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400 mt-1 font-mono">kaijieyang0219@gmail.com</p>
              </div>
            </div>

            {/* Health indices lists */}
            <div className="divide-y divide-slate-50">
              {/* Gender */}
              <div className="py-3.5 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">性別</span>
                {isEditing ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as "male" | "female" | "other")}
                    className="border border-slate-200 rounded px-2 py-1 text-xs"
                  >
                    <option value="male">男性</option>
                    <option value="female">女性</option>
                    <option value="other">其他</option>
                  </select>
                ) : (
                  <span className="text-slate-700">
                    {profile.gender === "male" ? "男性" : profile.gender === "female" ? "女性" : "其他"}
                  </span>
                )}
              </div>

              {/* Birthdate */}
              <div className="py-3.5 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">生日</span>
                <span className="text-slate-700">
                  {profile.birthdate} ({currentAge} 歲)
                </span>
              </div>

              {/* Height */}
              <div className="py-3.5 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">身高 (cm)</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1 text-xs w-20 text-center"
                  />
                ) : (
                  <span className="text-slate-700 font-mono">{profile.height} cm</span>
                )}
              </div>

              {/* Weight */}
              <div className="py-3.5 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">體重 (kg)</span>
                {isEditing ? (
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="border border-slate-200 rounded px-2 py-1 text-xs w-20 text-center"
                  />
                ) : (
                  <span className="text-slate-700 font-mono">{profile.weight} kg</span>
                )}
              </div>

              {/* Energy levels */}
              <div className="py-3.5 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-500">活動水平狀態</span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                  {profile.activityLevel === "sedentary"
                    ? "久坐上班族"
                    : profile.activityLevel === "light"
                    ? "輕度日常活動"
                    : profile.activityLevel === "moderate"
                    ? "中度活動 (健身)"
                    : "高度活動 (勞動)"}
                </span>
              </div>
            </div>
          </div>
        ) : activeTab === "account" ? (
          /* Account Settings Mock */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3.5 border border-slate-100 hover:border-slate-200 bg-white rounded-xl flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <Key className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">變更帳戶密碼</span>
              </div>
              <button className="text-xs text-emerald-600 hover:underline cursor-pointer">變更</button>
            </div>
            
            <div className="p-3.5 border border-slate-100 hover:border-slate-200 bg-white rounded-xl flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">綁定第三方 Google 登錄</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">已啟用</span>
            </div>
          </div>
        ) : activeTab === "privacy" ? (
          /* Privacy Settings Mock */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-700 block">GDPR 資料加密與隱私權保護</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed text-justify">
                  飲控系統極其嚴密關注您的個人生理數據完整度，所有發送給 Google Gemini 模型辨識與總部託管的歷程經軍規加密傳輸保護。
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Notifications Mock */
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3.5 border border-slate-100 hover:border-slate-200 bg-white rounded-xl flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <Bell className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">三餐定時登入呼叫提示</span>
              </div>
              <div className="w-9 h-5 bg-emerald-500 rounded-full p-0.5 cursor-pointer flex justify-end">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
