import { useState } from "react";
import axios from "axios";

interface User {
  name: string;
  email: string;
  role: string;
}

interface LoginRegisterProps {
  onLoginSuccess: (user: User) => void;
}

const LoginRegister = ({ onLoginSuccess }: LoginRegisterProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      alert("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        // Login Request
        const loginRes = await axios.post("http://localhost:8000/api/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        const data = loginRes.data;

        // If backend returned standard error string in a 200 OK message
        if (data.message && data.message !== "Success" && !data.access_token) {
          setError(data.message);
          setLoading(false);
          return;
        }

        if (data.access_token) {
          localStorage.setItem("access_token", data.access_token);
          
          // Set default axios Authorization header
          axios.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;

          // Attempt to call /api/auth/me to fetch user details
          try {
            const meRes = await axios.get("http://localhost:8000/api/auth/me");
            onLoginSuccess(meRes.data);
          } catch (meErr) {
            console.warn("Could not retrieve user info from /api/auth/me, decoding token payload.", meErr);
            // Fallback decode token payload client side
            try {
              const payloadBase64 = data.access_token.split(".")[1];
              const decoded = JSON.parse(atob(payloadBase64));
              onLoginSuccess({
                email: decoded.sub,
                role: decoded.role || "employee",
                name: decoded.sub.split("@")[0],
              });
            } catch {
              setError("Session initialization failed. Token invalid.");
              localStorage.removeItem("access_token");
            }
          }
        }
      } else {
        // Registration Request
        const registerRes = await axios.post("http://localhost:8000/api/auth/register", {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });

        const data = registerRes.data;

        if (data.message === "User already exists") {
          setError("An account with this email already exists.");
        } else {
          alert("Registration successful! Please log in.");
          setIsLogin(true);
          setFormData(prev => ({ ...prev, password: "" }));
        }
      }
    } catch (err: unknown) {
      console.error("Auth request failed", err);
      let errorMsg = "Authentication request failed. Ensure the backend server is running.";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.response?.data?.message || errorMsg;
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 text-left space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-indigo-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 pt-2">
          {isLogin ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm text-slate-500">
          {isLogin ? "Sign in to access career opportunities" : "Get started with your internal mobility dashboard"}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl text-sm bg-rose-50 text-rose-600 border border-solid border-rose-100 flex items-start gap-2">
          <span className="shrink-0 font-medium">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all duration-200"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Work Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all duration-200"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all duration-200"
            required
          />
        </div>

        {!isLogin && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Company Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 text-sm transition-all duration-200"
            >
              <option value="employee">Employee</option>
              <option value="hr">HR Partner</option>
            </select>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isLogin ? (
              "Log In"
            ) : (
              "Create Account"
            )}
          </button>
        </div>
      </form>

      <div className="border-t border-slate-100 pt-4 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all duration-200 cursor-pointer"
        >
          {isLogin ? "New to the platform? Register" : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
};

export default LoginRegister;