import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Mail, Lock, AlertCircle, User } from "lucide-react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

interface LoginScreenProps {
  onLoginSuccess?: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("kaijieyang0219@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Email / password login or registration
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      if (isRegister) {
        if (!name.trim()) {
          throw new Error("請填寫您的稱呼或姓名");
        }
        if (password.length < 6) {
          throw new Error("密碼長度至少需要 6 個字元");
        }
        // Register new user credentials
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Save Display Name to auth user profile
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || "帳號或密碼錯誤";
      if (err.code === "auth/email-already-in-use") {
        errMsg = "此電子郵件已在先前被註冊過！";
      } else if (err.code === "auth/invalid-email") {
        errMsg = "電子郵件格式無效！";
      } else if (err.code === "auth/weak-password") {
        errMsg = "密碼太薄弱，請填寫六位字元以上！";
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password" ||
        err.code === "auth/invalid-credential"
      ) {
        errMsg = "認證失效或輸入錯誤，請重新核對資訊！";
      }
      setErrorMsg(isRegister ? "註冊失敗：" + errMsg : "登入失敗：" + errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Google authentication
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      console.error("Google Sign In Error:", err);
      setErrorMsg("Google 登入失敗：" + (err.message || "使用者已取消登入"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
      id="login-form-card"
    >
      <div className="p-8 md:p-10 text-center">
        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 border border-emerald-100 shadow-sm">
            <svg
              className="w-10 h-10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2c5.523 0 10 4.477 10 10h-2a8 8 0 0 1-16 0H2c0-5.523 4.477-10 10-10z" />
              <path d="M12 6c3.314 0 6 2.686 6 6h-2a4 4 0 0 0-8 0H6c0-3.314 2.686-6 6-6z" />
              <path d="M12 10a2 2 0 1 1-2 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">飲控系統</h1>
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wider">DIET MANAGEMENT SYSTEM</p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs flex gap-2 items-start text-left">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Google Sign in Button */}
        <button
          id="google-login-btn"
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3.5 border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl text-sm font-bold text-emerald-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.14 3-.98 4.09h1.58l3.19 2.46c2.51-2.3 3.96-5.7 3.96-10.4z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.89-3.02c-1.12.75-2.5 1.22-4.07 1.22-3.13 0-5.78-2.11-6.73-4.96H1.19v3.1A11.99 11.99 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.27 14.33c-.25-.75-.39-1.56-.39-2.33 0-.77.14-1.58.39-2.33V6.57H1.19A11.99 11.99 0 0 0 0 12c0 2.02.51 3.93 1.19 5.43l4.08-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.96 1.19 15.24 0 12 0 7.37 0 3.4 2.67 1.19 6.57l4.08 3.1c.95-2.85 3.6-4.92 6.73-4.92z"
            />
          </svg>
          使用 Google 帳號快速登入
        </button>

        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-x-0 h-px bg-slate-100"></div>
          <span className="relative bg-white px-3 text-xs text-slate-400">
            {isRegister ? "或註冊一組新電子信箱" : "或使用電子郵件憑證"}
          </span>
        </div>

        <form onSubmit={handleEmailAuth} className="text-left space-y-5">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
                您的姓名或暱稱
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="login-name-input"
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                  placeholder="例如：王小明"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">
              電子郵件/信箱 {!isRegister && "(開發管理者預設：kaijieyang0219@gmail.com)"}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login-email-input"
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                placeholder="請輸入電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-xs font-medium text-slate-500">密碼 {isRegister && "(至少 6 位元)"}</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password-input"
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-700"
                placeholder="請輸入網路通行密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center cursor-pointer"
          >
            {loading ? "處理中..." : isRegister ? "立即免費註冊新帳號" : "以電子信箱帳本登入"}
          </button>
        </form>

        {/* Switch mode link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setErrorMsg(null);
              if (!isRegister) {
                setEmail("");
                setPassword("");
              } else {
                setEmail("kaijieyang0219@gmail.com");
                setPassword("12345678");
              }
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            {isRegister ? "已經有系統帳密了？返回登入" : "建立一個全新的系統帳號？點此註冊"}
          </button>
        </div>
      </div>

      {/* Trust Badge at footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-center gap-2 text-slate-400 text-xs">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        採用 Firebase 安全認證防護，守護您的隱私
      </div>
    </motion.div>
  );
}
