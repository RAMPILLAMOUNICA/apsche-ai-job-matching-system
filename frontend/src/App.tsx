import { useEffect, useState } from "react";
import axios from "axios";
import LoginRegister from "./components/LoginRegister";
import EmployeeDashboard from "./components/EmployeeDashboard";
import HRDashboard from "./components/HRDashboard";
import AIRecommendations from "./components/AIRecommendations";
import ResumeUpload from "./components/ResumeUpload";
import AnalyticsPage from "./components/AnalyticsPage";
import MyProfile from "./components/MyProfile";

interface User {
  name: string;
  email: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [employeeTab, setEmployeeTab] = useState("dashboard"); // dashboard, recommendations, resume, profile
  const [hrTab, setHrTab] = useState("dashboard"); // dashboard, analytics, profile

  const restoreSession = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      const response = await axios.get("https://apsche-ai-job-matching-system.onrender.com/api/auth/me");
      setUser(response.data);
    } catch (error) {
      console.warn("Session restore failed, checking client-side decode.", error);
      try {
        const payloadBase64 = token.split(".")[1];
        const decoded = JSON.parse(atob(payloadBase64));
        setUser({
          email: decoded.sub,
          role: decoded.role || "employee",
          name: decoded.sub.split("@")[0],
        });
      } catch (decodeErr) {
        console.error("Token decoding failed", decodeErr);
        localStorage.removeItem("access_token");
        delete axios.defaults.headers.common["Authorization"];
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      restoreSession();
    }, 0);
    return () => clearTimeout(handle);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <LoginRegister onLoginSuccess={(userData) => setUser(userData)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Mobility<span className="text-indigo-600">Hub</span>
                </span>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                {user.role === "hr" ? "HR Management" : "Employee Space"}
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-900">{user.name || user.email}</span>
                <span className="text-xs text-slate-400 capitalize">{user.role} Account</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:border-red-200 hover:bg-red-50 text-xs font-semibold text-slate-600 hover:text-red-600 rounded-xl transition-all duration-200 cursor-pointer shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Log Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {user.role === "hr" ? (
          <div className="space-y-6">
            {/* HR Navigation tabs */}
            <div className="bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm inline-flex gap-1 mb-2">
              <button
                onClick={() => setHrTab("dashboard")}
                className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  hrTab === "dashboard"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                </svg>
                HR Workspace
              </button>
              <button
                onClick={() => setHrTab("analytics")}
                className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  hrTab === "analytics"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                Telemetry & Analytics
              </button>
              <button
                onClick={() => setHrTab("profile")}
                className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  hrTab === "profile"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
            </div>

            {hrTab === "dashboard" && <HRDashboard />}
            {hrTab === "analytics" && <AnalyticsPage />}
            {hrTab === "profile" && (
              <MyProfile
                currentUser={user}
                onUserUpdate={(updatedUser) => setUser(updatedUser)}
                onLogout={handleLogout}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Employee Space Subnavigation Menu */}
            <div className="bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm inline-flex flex-wrap gap-1 mb-2">
              <button
                onClick={() => setEmployeeTab("dashboard")}
                className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  employeeTab === "dashboard"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Career Profile
              </button>
              <button
                onClick={() => setEmployeeTab("recommendations")}
                className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  employeeTab === "recommendations"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Pathways
              </button>
              <button
                onClick={() => setEmployeeTab("resume")}
                className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  employeeTab === "resume"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resume Extraction
              </button>
              <button
                onClick={() => setEmployeeTab("profile")}
                className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                  employeeTab === "profile"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                My Profile
              </button>
            </div>

            {/* Sub-tabs Rendering */}
            {employeeTab === "dashboard" && <EmployeeDashboard />}
            {employeeTab === "recommendations" && <AIRecommendations />}
            {employeeTab === "resume" && <ResumeUpload />}
            {employeeTab === "profile" && (
              <MyProfile
                currentUser={user}
                onUserUpdate={(updatedUser) => setUser(updatedUser)}
                onLogout={handleLogout}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;