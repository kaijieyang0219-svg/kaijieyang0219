import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Sparkles,
  LayoutGrid,
  Laptop,
  Clock,
  Heart,
  Calendar,
  ChevronRight,
  LogOut,
  User,
  Plus,
  ArrowRight,
  AlertCircle,
  Users,
  Search,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Edit
} from "lucide-react";

// Types & Data
import { MealRecord, UserProfile, Student, MealType, UserRole, FoodItem } from "./types";
import { INITIAL_PROFILE, INITIAL_MEAL_RECORDS, FOOD_IMAGES } from "./data";

// Firebase Imports
import { auth, db, handleFirestoreError, OperationType } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore";

// UI Screens Sub-components
import LoginScreen from "./components/LoginScreen";
import DashboardScreen from "./components/DashboardScreen";
import AICaptureScreen from "./components/AICaptureScreen";
import ManualEntryScreen from "./components/ManualEntryScreen";
import NutritionAnalysisScreen from "./components/NutritionAnalysisScreen";
import ChartTrendsScreen from "./components/ChartTrendsScreen";
import GoalSettingsScreen from "./components/GoalSettingsScreen";
import FamilyStudentsScreen from "./components/FamilyStudentsScreen";
import ProfileSettingsScreen from "./components/ProfileSettingsScreen";
import AdminConsoleScreen from "./components/AdminConsoleScreen";

export default function App() {
  // Authentication states
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [userRole, setUserRole] = useState<UserRole>("pending");

  // Nav menu modes
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [viewMode, setViewMode] = useState<"simulator" | "blueprint">("simulator");

  // Dynamic shared states synced with database
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [records, setRecords] = useState<MealRecord[]>([]);

  // Admin and management data lists
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<any[]>([]);

  // Selection view for Teachers or Parents to inspect a specific student's logs
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedStudentMeals, setSelectedStudentMeals] = useState<MealRecord[]>([]);
  const [advisingMeal, setAdvisingMeal] = useState<MealRecord | null>(null);
  const [adviceText, setAdviceText] = useState<string>("");

  // Firebase auth & user listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setFirebaseUser(u);
        const userRef = doc(db, "users", u.uid);
        let snap = await getDoc(userRef);

        if (!snap.exists()) {
          // New User signup: default kaijieyang0219@gmail.com to admin, else pending
          const isDefaultAdmin = u.email === "kaijieyang0219@gmail.com";
          const assignedRole: UserRole = isDefaultAdmin ? "admin" : "pending";

          const newProfile = {
            uid: u.uid,
            email: u.email || "",
            name: u.displayName || u.email?.split("@")[0] || "使用者",
            role: assignedRole,
            gender: "male",
            birthdate: "2002-05-22",
            height: 175,
            weight: 68,
            activityLevel: "moderate",
            calorieTarget: 2000,
            proteinTarget: 125,
            fatTarget: 65,
            carbTarget: 250,
            fiberTarget: 25,
            sodiumTarget: 2000,
            sugarTarget: 50,
            teacherId: "",
            caregiverId: "",
            createdAt: new Date().toISOString()
          };
          try {
            await setDoc(userRef, newProfile);
          } catch (err) {
            console.error("Error creating initial profile doc:", err);
          }
          snap = await getDoc(userRef);
        }

        // Subscribing to direct profile changes
        const unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserRole(data.role as UserRole);
            setProfile({
              name: data.name || u.displayName || "使用者",
              gender: data.gender || "male",
              birthdate: data.birthdate || "2002-05-22",
              height: Number(data.height) || 175,
              weight: Number(data.weight) || 68,
              activityLevel: data.activityLevel || "moderate",
              calorieTarget: Number(data.calorieTarget) || 2000,
              proteinTarget: Number(data.proteinTarget) || 120,
              fatTarget: Number(data.fatTarget) || 67,
              carbTarget: Number(data.carbTarget) || 250,
              fiberTarget: Number(data.fiberTarget) || 25,
              sodiumTarget: Number(data.sodiumTarget) || 2000,
              sugarTarget: Number(data.sugarTarget) || 50
            });
          }
        });

        // Subscribing to logged meals
        const mealsRef = collection(db, "users", u.uid, "meals");
        const unsubMeals = onSnapshot(mealsRef, (snapMeals) => {
          const loadedMeals: MealRecord[] = [];
          snapMeals.forEach((mDoc) => {
            loadedMeals.push(mDoc.data() as MealRecord);
          });
          loadedMeals.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
          setRecords(loadedMeals.length > 0 ? loadedMeals : INITIAL_MEAL_RECORDS);
        });

        setLoadingAuth(false);
        return () => {
          unsubUser();
          unsubMeals();
        };
      } else {
        setFirebaseUser(null);
        setUserRole("pending");
        setRecords(INITIAL_MEAL_RECORDS);
        setProfile(INITIAL_PROFILE);
        setLoadingAuth(false);
      }
    });

    return () => unsub();
  }, []);

  // Admin - load all accounts dynamically
  useEffect(() => {
    if (firebaseUser && userRole === "admin") {
      const usersQuery = collection(db, "users");
      const unsubUsers = onSnapshot(usersQuery, (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          list.push(d.data());
        });
        setAllUsers(list);
      });
      return () => unsubUsers();
    }
  }, [firebaseUser, userRole]);

  // Coach or Caregiver - load their assigned students dynamically
  useEffect(() => {
    if (firebaseUser && (userRole === "teacher" || userRole === "caregiver")) {
      const field = userRole === "teacher" ? "teacherId" : "caregiverId";
      const q = query(collection(db, "users"), where(field, "==", firebaseUser.uid));
      const unsubAssigned = onSnapshot(q, (snap) => {
        const list: any[] = [];
        snap.forEach((d) => {
          list.push(d.data());
        });
        setAssignedStudents(list);
      });
      return () => unsubAssigned();
    } else {
      setAssignedStudents([]);
    }
  }, [firebaseUser, userRole]);

  // Load selected student's meals
  useEffect(() => {
    if (selectedStudent) {
      const mealsRef = collection(db, "users", selectedStudent.uid, "meals");
      const unsubStudMeals = onSnapshot(mealsRef, (snap) => {
        const list: MealRecord[] = [];
        snap.forEach((d) => {
          list.push(d.data() as MealRecord);
        });
        list.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
        setSelectedStudentMeals(list);
      });
      return () => unsubStudMeals();
    } else {
      setSelectedStudentMeals([]);
    }
  }, [selectedStudent]);

  // Admin dynamic updates
  const handleUpdateUserRole = async (
    targetUid: string,
    fields: { role: UserRole; teacherId?: string; caregiverId?: string }
  ) => {
    const docRef = doc(db, "users", targetUid);
    try {
      await updateDoc(docRef, fields);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
    }
  };

  // Student logs a meal to Firebase
  const handleSaveMealRecord = async (
    mealType: MealType,
    foods: FoodItem[],
    image: string,
    advice: string
  ) => {
    if (!firebaseUser) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const dateStr = now.toISOString().split("T")[0];

    const mealId = `meal-${Date.now()}`;
    const newRecord: MealRecord = {
      id: mealId,
      type: mealType,
      date: dateStr,
      time: timeStr,
      foods,
      image: image || FOOD_IMAGES.chickenRiceBroccoli,
      advice: advice || ""
    };
    try {
      await setDoc(doc(db, "users", firebaseUser.uid, "meals", mealId), newRecord);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${firebaseUser.uid}/meals/${mealId}`);
    }
  };

  // Student updates health objectives
  const handleUpdateProfile = async (updated: UserProfile) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, "users", firebaseUser.uid), {
        ...updated
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  // Teacher or Caregiver writes comments (advice) to student's meal record
  const handleSaveAdvice = async () => {
    if (!selectedStudent || !advisingMeal) return;
    const targetDoc = doc(db, "users", selectedStudent.uid, "meals", advisingMeal.id);
    try {
      await updateDoc(targetDoc, {
        advice: adviceText
      });
      setAdvisingMeal(null);
      setAdviceText("");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${selectedStudent.uid}/meals/${advisingMeal.id}`);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setFirebaseUser(null);
  };

  // Navigation Items
  const menuItems = [
    { id: "dashboard", label: "首頁儀表板", icon: "🏠", show: userRole !== "admin" && userRole !== "pending" },
    { id: "admin_users", label: "最高權限管理者", icon: "🔑", show: userRole === "admin" },
    { id: "ai_capture", label: "AI 拍照辨識記錄", icon: "📸", show: userRole === "student" || userRole === "admin" },
    { id: "manual", label: "手動輸入紀錄", icon: "📝", show: userRole === "student" || userRole === "admin" },
    { id: "analysis", label: "營養分析 (單餐)", icon: "🥗", show: userRole === "student" || userRole === "admin" },
    { id: "charts", label: "圖表分析 (趨勢)", icon: "📊", show: userRole === "student" || userRole === "admin" },
    { id: "goals", label: "目標設定", icon: "🎯", show: userRole === "student" || userRole === "admin" },
    { id: "profile", label: "個人檔案 / 設定", icon: "👤", show: userRole !== "pending" },
    {
      id: "students",
      label: userRole === "caregiver" ? "家庭成員飲食管理" : "受託學員飲食管理",
      icon: "👥",
      show: userRole === "teacher" || userRole === "caregiver"
    }
  ];

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-bold text-slate-600">系統正在同步載入 Firebase 安全連接...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="diet-studio-container">
      {/* Visual Workspace Top Bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            🥗
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-black text-slate-800 leading-tight">智慧飲食控系統</h1>
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full font-mono">
                Firebase Realtime
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-none">讓每一餐都有數據，讓關懷與健康更有方向。</p>
          </div>
        </div>

        {/* Presentation View Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit items-center gap-1 self-start md:self-auto">
          <button
            onClick={() => setViewMode("blueprint")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "blueprint"
                ? "bg-white text-emerald-700 shadow-md"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            01-10 設計總覽畫布 (大會盤)
          </button>
          <button
            onClick={() => setViewMode("simulator")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === "simulator"
                ? "bg-white text-emerald-700 shadow-md"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Laptop className="w-4 h-4" />
            100% 互動模擬器
          </button>
        </div>
      </header>

      {/* Main Studio Body Workspace */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 md:p-6 lg:p-8 flex gap-6 flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side Control Panel */}
        <section className="w-full lg:w-[280px] bg-white rounded-3xl border border-slate-100 shadow-xl p-6 flex flex-col gap-6 shrink-0 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto">
          {firebaseUser && (
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-400 tracking-wider">目前登入資訊</span>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {profile.name}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate">{firebaseUser.email}</p>
                <div className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg text-[10px] text-slate-600 font-bold tracking-wide w-fit mt-1">
                  身份:{" "}
                  {userRole === "admin" ? (
                    <span className="text-rose-600">最高管理者</span>
                  ) : userRole === "teacher" ? (
                    <span className="text-sky-600">認證教師 / 教練</span>
                  ) : userRole === "caregiver" ? (
                    <span className="text-purple-600">家庭照護 / 家長</span>
                  ) : userRole === "student" ? (
                    <span className="text-emerald-600">學生 / 一般使用者</span>
                  ) : (
                    <span className="text-amber-600 animate-pulse">等待審核中</span>
                  )}
                </div>

                <button
                  onClick={handleLogout}
                  className="mt-2 text-rose-600 hover:text-rose-700 cursor-pointer text-[10px] font-bold flex items-center gap-1 bg-rose-50 hover:bg-rose-100 py-1.5 px-3 rounded-lg w-full justify-center transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" /> 登出目前帳號
                </button>
              </div>
            </div>
          )}

          <hr className="border-slate-100" />

          {/* Nav Menu */}
          <div className="space-y-3">
            <span className="block text-xs font-bold text-slate-400 tracking-wider">主要功能選單</span>
            <div className="space-y-1">
              {menuItems
                .filter((item) => item.show)
                .map((item) => (
                  <button
                    key={item.id}
                    disabled={viewMode === "blueprint"}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id === "students") {
                        setSelectedStudent(null);
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between gap-3 ${
                      viewMode === "blueprint"
                        ? "text-slate-400 cursor-not-allowed"
                        : activeTab === item.id
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/10"
                        : "text-slate-600 hover:bg-slate-50 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-sm">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {viewMode === "simulator" && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                  </button>
                ))}
            </div>
          </div>
        </section>

        {/* Right Adaptive Canvas Wrapper */}
        <section className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {!firebaseUser ? (
              <div key="login-overlay" className="max-w-md mx-auto py-12">
                <LoginScreen />
              </div>
            ) : userRole === "pending" ? (
              /* User Pending Screen */
              <motion.div
                key="pending-screen"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-xl mx-auto bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-amber-50 border border-amber-100 text-amber-500 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-sm">
                  ⏱️
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-800">帳號審核中 (Pending Review)</h2>
                  <p className="text-sm text-slate-400 font-mono">{firebaseUser.email}</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 leading-relaxed text-justify space-y-3">
                  <p>
                    您已成功透過 Google 帳號建立帳戶。為維護醫療點評與家庭健康的安全性，新註冊帳戶預設不具備任何權限。
                  </p>
                  <p className="font-bold text-slate-600">
                    💡 請聯絡系統管理者 (預設管理者: kaijieyang0219@gmail.com) 協助您在管理者後台指派對應的角色權限（教師 / 家長 / 學生）。
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> 登出並更換 Google 帳號
                </button>
              </motion.div>
            ) : viewMode === "blueprint" ? (
              /* ================== BLUEPRINT VIEW ================== */
              <motion.div
                key="blueprint-canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8 overflow-y-auto max-h-[calc(100vh-140px)] pr-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {/* Card 01 */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-400 ml-1">
                      <span className="text-emerald-600">01</span> Firebase 角色管理中心 (管理者專屬)
                    </span>
                    <div className="scale-95 origin-top transition-transform hover:scale-[0.97] bg-white rounded-3xl overflow-hidden shadow-md">
                      <AdminConsoleScreen allUsers={allUsers} onUpdateUserRole={handleUpdateUserRole} />
                    </div>
                  </div>

                  {/* Card 02 */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-400 ml-1">
                      <span className="text-emerald-600">02</span> 首頁儀表板
                    </span>
                    <div className="scale-95 origin-top transition-transform hover:scale-[0.97] bg-white rounded-3xl overflow-hidden shadow-md">
                      <DashboardScreen
                        records={records}
                        profile={profile}
                        onNavigateToMealInput={(type) => {
                          setViewMode("simulator");
                          setActiveTab("manual");
                        }}
                        onViewAnalysis={() => {
                          setViewMode("simulator");
                          setActiveTab("analysis");
                        }}
                        onViewSettings={() => {
                          setViewMode("simulator");
                          setActiveTab("goals");
                        }}
                      />
                    </div>
                  </div>

                  {/* Card 03 */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-400 ml-1">
                      <span className="text-emerald-600">03 & 04</span> AI 拍照辨識
                    </span>
                    <div className="scale-95 origin-top transition-transform hover:scale-[0.97] bg-white rounded-3xl overflow-hidden shadow-md">
                      <AICaptureScreen
                        onSaveMeal={handleSaveMealRecord}
                        onNavigateToDashboard={() => setViewMode("simulator")}
                      />
                    </div>
                  </div>

                  {/* Card 05 */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-400 ml-1">
                      <span className="text-emerald-600">05</span> 手動輸入
                    </span>
                    <div className="scale-95 origin-top transition-transform hover:scale-[0.97] bg-white rounded-3xl overflow-hidden shadow-md">
                      <ManualEntryScreen
                        onSaveMeal={handleSaveMealRecord}
                        onNavigateToDashboard={() => setViewMode("simulator")}
                      />
                    </div>
                  </div>

                  {/* Card 06 */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-400 ml-1">
                      <span className="text-emerald-600">06</span> 營養分析
                    </span>
                    <div className="scale-95 origin-top transition-transform hover:scale-[0.97] bg-white rounded-3xl overflow-hidden shadow-md">
                      <NutritionAnalysisScreen
                        records={records}
                        onNavigateToDashboard={() => setViewMode("simulator")}
                      />
                    </div>
                  </div>

                  {/* Card 07 */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold text-slate-400 ml-1">
                      <span className="text-emerald-600">07</span> 圖表分析
                    </span>
                    <div className="scale-95 origin-top transition-transform hover:scale-[0.97] bg-white rounded-3xl overflow-hidden shadow-md">
                      <ChartTrendsScreen />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* ================== SIMULATOR VIEW ================== */
              <motion.div
                key="interactive-simulator"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-2xl mx-auto w-full lg:px-4 py-2"
              >
                <div className="border-[10px] border-slate-900 rounded-[44px] shadow-2xl bg-white overflow-hidden aspect-[9/18] flex flex-col relative min-h-[760px]">
                  {/* Phone Notch/Status block */}
                  <div className="h-6 bg-slate-900 w-full flex items-center justify-between px-6 text-[11px] text-white/95 font-mono select-none shrink-0 z-30">
                    <span className="font-bold flex items-center gap-1">09:41 AM <Clock className="w-3 h-3 text-emerald-400 scale-90" /></span>
                    <div className="w-24 h-4 bg-slate-950 rounded-b-xl absolute left-1/2 transform -translate-x-1/2 top-0"></div>
                    <span className="flex items-center gap-1.5 font-bold">5G📶 🔋100%</span>
                  </div>

                  {/* Live Viewport Screen Frame */}
                  <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
                    <AnimatePresence mode="wait">
                      {activeTab === "admin_users" && userRole === "admin" ? (
                        <div key="screen-admin-panel" className="w-full">
                          <AdminConsoleScreen allUsers={allUsers} onUpdateUserRole={handleUpdateUserRole} />
                        </div>
                      ) : activeTab === "dashboard" ? (
                        <div key="screen-dashboard" className="w-full">
                          <DashboardScreen
                            records={records}
                            profile={profile}
                            onNavigateToMealInput={(type) => setActiveTab("manual")}
                            onViewAnalysis={() => setActiveTab("analysis")}
                            onViewSettings={() => setActiveTab("goals")}
                          />
                        </div>
                      ) : activeTab === "ai_capture" ? (
                        <div key="screen-ai-capture" className="w-full">
                          <AICaptureScreen
                            onSaveMeal={handleSaveMealRecord}
                            onNavigateToDashboard={() => setActiveTab("dashboard")}
                          />
                        </div>
                      ) : activeTab === "manual" ? (
                        <div key="screen-manual-entry" className="w-full">
                          <ManualEntryScreen
                            onSaveMeal={handleSaveMealRecord}
                            onNavigateToDashboard={() => setActiveTab("dashboard")}
                          />
                        </div>
                      ) : activeTab === "analysis" ? (
                        <div key="screen-analysis" className="w-full">
                          <NutritionAnalysisScreen
                            records={records}
                            onNavigateToDashboard={() => setActiveTab("dashboard")}
                          />
                        </div>
                      ) : activeTab === "charts" ? (
                        <div key="screen-charts" className="w-full">
                          <ChartTrendsScreen />
                        </div>
                      ) : activeTab === "goals" ? (
                        <div key="screen-goals" className="w-full">
                          <GoalSettingsScreen
                            profile={profile}
                            onUpdateProfile={handleUpdateProfile}
                            onNavigateToDashboard={() => setActiveTab("dashboard")}
                          />
                        </div>
                      ) : activeTab === "students" && (userRole === "teacher" || userRole === "caregiver") ? (
                        <div key="screen-students" className="w-full space-y-4">
                          {!selectedStudent ? (
                            <div className="space-y-4">
                              <div className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                                  <Users className="w-5 h-5 text-emerald-600" />
                                  {userRole === "caregiver" ? "家庭成員飲食管理" : "受託學員飲食管理"}
                                </h2>
                                <p className="text-xs text-slate-400 mt-1">
                                  點擊下方任何一個已被最高管理者關聯到您帳號之學員/家庭成員，即可即時監督、查看其拍照記錄與點評！
                                </p>
                              </div>

                              <div className="space-y-2">
                                {assignedStudents.length === 0 ? (
                                  <div className="p-8 border border-dashed border-slate-100 rounded-2xl text-center text-slate-400 text-xs bg-white">
                                    目前尚未有學生或成員綁定到您帳號下面。請請最高管理者 kaijieyang0219@gmail.com 協助為學生或家庭成員綁定！
                                  </div>
                                ) : (
                                  assignedStudents.map((student) => (
                                    <button
                                      key={student.uid}
                                      onClick={() => setSelectedStudent(student)}
                                      className="p-4 border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50/20 bg-white rounded-2xl transition-all cursor-pointer flex items-center justify-between w-full text-left font-sans"
                                    >
                                      <div>
                                        <p className="text-sm font-bold text-slate-700">{student.name}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">{student.email}</p>
                                      </div>
                                      <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                                        查看餐條記錄 <ChevronRight className="w-4 h-4" />
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            </div>
                          ) : (
                            /* Sub-screen: student layout details */
                            <div className="space-y-4">
                              <button
                                onClick={() => setSelectedStudent(null)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                              >
                                ← 返回成員名單
                              </button>

                              <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                                <h3 className="text-sm font-bold text-slate-800">
                                  成員：{selectedStudent.name} 的飲食看板
                                </h3>
                                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="block text-[10px] text-slate-400">熱量預算</span>
                                    <span className="text-xs font-bold text-slate-700">
                                      {selectedStudent.calorieTarget || 2000} kcal
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="block text-[10px] text-slate-400">身高 / 體重</span>
                                    <span className="text-xs font-bold text-slate-700">
                                      {selectedStudent.height}cm / {selectedStudent.weight}kg
                                    </span>
                                  </div>
                                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <span className="block text-[10px] text-slate-400">活躍度</span>
                                    <span className="text-xs font-bold text-slate-700 capitalize">
                                      {selectedStudent.activityLevel === "sedentary" ? "久坐" : selectedStudent.activityLevel === "light" ? "輕度" : selectedStudent.activityLevel === "moderate" ? "適度" : "強度"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Student records timeline list */}
                              <div className="space-y-3">
                                <span className="block text-xs font-bold text-slate-400">
                                  餐點即時記錄 ({selectedStudentMeals.length})
                                </span>
                                {selectedStudentMeals.length === 0 ? (
                                  <div className="p-8 border border-dashed border-slate-100 rounded-2xl text-center text-slate-400 text-xs bg-white bg-white/50">
                                    該學生目前尚未發布任何餐食記錄
                                  </div>
                                ) : (
                                  selectedStudentMeals.map((meal) => (
                                    <div key={meal.id} className="p-4 bg-white border border-slate-100 rounded-2xl space-y-3">
                                      <div className="flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                                            {meal.type === "breakfast" ? "早餐" : meal.type === "lunch" ? "午餐" : meal.type === "dinner" ? "晚餐" : "點心"}
                                          </span>
                                          <span className="text-[10px] text-slate-400 font-mono">
                                            {meal.date} {meal.time}
                                          </span>
                                        </div>
                                        <span className="text-xs font-mono font-bold text-slate-700">
                                          {meal.foods.reduce((acc, f) => acc + f.calories, 0)} kcal
                                        </span>
                                      </div>

                                      <div className="space-y-1">
                                        {meal.foods.map((food, fIdx) => (
                                          <div key={fIdx} className="flex justify-between text-xs text-slate-600 border-b border-dashed border-slate-100 pb-1">
                                            <span>{food.name} ({food.weight})</span>
                                            <span className="font-mono text-[11px]">
                                              蛋 {food.protein}g / 脂 {food.fat}g / 碳 {food.carbs}g
                                            </span>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Advice Section */}
                                      <div className="p-3 bg-emerald-50/40 rounded-xl border border-emerald-100/30 text-xs text-slate-600 leading-relaxed text-left flex flex-col gap-2">
                                        <p>
                                          <span className="font-bold text-emerald-800">
                                            📝 {userRole === "teacher" ? "教練專業點評：" : "配對家長給予鼓勵："}
                                          </span>{" "}
                                          {meal.advice || <span className="text-slate-400 italic">尚無點評</span>}
                                        </p>
                                        <button
                                          onClick={() => {
                                            setAdvisingMeal(meal);
                                            setAdviceText(meal.advice || "");
                                          }}
                                          className="text-[10px] bg-emerald-600 text-white font-bold py-1 px-2.5 rounded-lg w-fit mt-1 self-end hover:bg-emerald-700 flex items-center gap-1 cursor-pointer"
                                        >
                                          <Edit className="w-3 h-3" /> 編輯給予評點
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div key="screen-profile" className="w-full">
                          <ProfileSettingsScreen
                            profile={profile}
                            onUpdateProfile={handleUpdateProfile}
                          />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Interactive Tab Navigation menu in Sim view */}
                  <nav className="border-t border-slate-100/80 bg-white grid grid-cols-5 py-2.5 px-2 relative z-30 shrink-0">
                    {[
                      { id: "dashboard", label: "首頁", icon: "🏠", disabled: userRole === "admin" },
                      { id: "ai_capture", label: "AI拍照", icon: "📸", disabled: userRole === "teacher" || userRole === "caregiver" || userRole === "admin" },
                      { id: "manual", label: "手動", icon: "📝", disabled: userRole === "teacher" || userRole === "caregiver" || userRole === "admin" },
                      {
                        id: userRole === "admin" ? "admin_users" : (userRole === "teacher" || userRole === "caregiver" ? "students" : "analysis"),
                        label: userRole === "admin" ? "管理端" : (userRole === "teacher" || userRole === "caregiver" ? "學生端" : "分析"),
                        icon: userRole === "admin" ? "🔑" : (userRole === "teacher" || userRole === "caregiver" ? "👥" : "🥗"),
                        disabled: false
                      },
                      { id: "profile", label: "設定", icon: "👤", disabled: false }
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        disabled={btn.disabled}
                        onClick={() => {
                          setActiveTab(btn.id);
                          if (btn.id === "students") {
                            setSelectedStudent(null);
                          }
                        }}
                        className={`flex flex-col items-center justify-center text-center gap-1 cursor-pointer group ${
                          btn.disabled ? "opacity-30 cursor-not-allowed" : ""
                        }`}
                      >
                        <span className={`text-base transition-transform group-active:scale-95 ${activeTab === btn.id ? "scale-110" : ""}`}>{btn.icon}</span>
                        <span
                          className={`text-[9px] font-bold ${
                            activeTab === btn.id ? "text-emerald-600 font-extrabold" : "text-slate-400"
                          }`}
                        >
                          {btn.label}
                        </span>
                      </button>
                    ))}
                  </nav>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Advice Edit Modal Overlay for professional coaches/parents */}
      {advisingMeal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-100 shadow-2xl space-y-4 text-left"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                對 {selectedStudent?.name} 給予飲食點評及關懷建議
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                此項目之飲食類型為：
                <span className="font-semibold text-emerald-600">
                  {advisingMeal.type === "breakfast" ? "早餐" : advisingMeal.type === "lunch" ? "午餐" : advisingMeal.type === "dinner" ? "晚餐" : "點心"}
                </span>
              </p>
            </div>

            <textarea
              id="advice-textarea"
              rows={4}
              className="w-full border border-slate-200 p-3 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-700 font-sans"
              placeholder="請輸入給予對方的評估或關懷建議，例如：『此餐蛋白質充足，唯獨精緻澱粉可稍微用燕麥替代，加油！』"
              value={adviceText}
              onChange={(e) => setAdviceText(e.target.value)}
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setAdvisingMeal(null)}
                className="px-4 py-2 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-500 cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveAdvice}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md cursor-pointer"
              >
                儲存評語
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
