import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface MyProfileProps {
  currentUser: {
    name: string;
    email: string;
    role: string;
  };
  onUserUpdate: (updatedUser: { name: string; email: string; role: string; }) => void;
  onLogout: () => void;
}

const MyProfile = ({ currentUser, onUserUpdate, onLogout }: MyProfileProps) => {
  const [profile, setProfile] = useState({
    skills: "",
    experience: "",
    certifications: "",
    career_interests: "",
    department: "General",
    designation: "Employee",
  });
  
  const [fullName, setFullName] = useState(currentUser.name);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingDetails, setUpdatingDetails] = useState(false);
  
  // Password state
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete Account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProfile = useCallback(async () => {
    await Promise.resolve();
    try {
      const response = await axios.get("https://apsche-ai-job-matching-system.onrender.com/api/profile");
      const data = response.data;
      if (data && !data.message) {
        setProfile({
          skills: data.skills || "",
          experience: data.experience || "",
          certifications: data.certifications || "",
          career_interests: data.career_interests || "",
          department: data.department || "General",
          designation: data.designation || "Employee",
        });
      }
    } catch (err) {
      console.error("Failed to load profile details", err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(handle);
  }, [fetchProfile]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingDetails(true);
    try {
      // 1. Update Name in DBUser
      const userRes = await axios.put("https://apsche-ai-job-matching-system.onrender.com/api/profile/user", {
        name: fullName,
      });
      // Notify parent App component
      onUserUpdate(userRes.data);

      // 2. Update Department and Designation in DBEmployeeProfile
      await axios.put("https://apsche-ai-job-matching-system.onrender.com/api/profile", {
        skills: profile.skills,
        experience: profile.experience,
        certifications: profile.certifications,
        career_interests: profile.career_interests,
        department: profile.department,
        designation: profile.designation,
      });

      alert("Profile details updated successfully!");
    } catch (err) {
      console.error("Failed to update profile info", err);
      alert("Failed to update profile information.");
    } finally {
      setUpdatingDetails(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (passwords.new_password !== passwords.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (passwords.new_password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setUpdatingPassword(true);
    try {
      await axios.put("https://apsche-ai-job-matching-system.onrender.com/api/auth/password", {
        current_password: passwords.current_password,
        new_password: passwords.new_password,
      });
      alert("Password updated successfully!");
      setPasswords({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err: unknown) {
      console.error("Password change failed", err);
      let msg = "Failed to update password. Verify your current password.";
      if (axios.isAxiosError(err)) {
        msg = err.response?.data?.detail || err.response?.data?.message || msg;
      }
      setPasswordError(msg);
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await axios.delete(`https://apsche-ai-job-matching-system.onrender.com/api/auth/delete/${currentUser.email}`);
      alert("Account successfully deleted.");
      onLogout(); // Log out from App context and clear cache
    } catch (err) {
      console.error("Account deletion failed", err);
      alert("Failed to delete account. Please try again later.");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // Calculations for profile stats
  const skillCount = profile.skills ? profile.skills.split(",").map(s => s.trim()).filter(Boolean).length : 0;
  const certCount = profile.certifications ? profile.certifications.split(",").map(c => c.trim()).filter(Boolean).length : 0;
  
  const completionPct = (() => {
    let filled = 0;
    if (fullName.trim()) filled++;
    if (profile.department.trim()) filled++;
    if (profile.designation.trim()) filled++;
    if (profile.skills.trim()) filled++;
    if (profile.experience.trim()) filled++;
    if (profile.certifications.trim()) filled++;
    return Math.round((filled / 6) * 100);
  })();

  const initials = (fullName || currentUser.email)
    .split("@")[0]
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (loadingProfile) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm mt-3 text-slate-500 font-medium">Syncing profile suite...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your corporate credentials, update security, and view account stats.</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        {/* Initials Avatar */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg shadow-indigo-100">
            {initials}
          </div>
          <span className="absolute bottom-0 right-0 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold" title="Online Session">
            ✓
          </span>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">{fullName}</h2>
          <p className="text-sm text-indigo-600 font-semibold flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span>{profile.designation}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">{profile.department}</span>
          </p>
          <p className="text-xs text-slate-400 font-medium pt-0.5">{currentUser.email}</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Skills</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{skillCount} Skills</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certifications</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{certCount} Active</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Index</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{completionPct}%</h3>
          </div>
        </div>
      </div>

      {/* Settings Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Form: Profile Details */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Personal Details</h3>
            <p className="text-xs text-slate-400 mt-0.5">Edit public name, department, and company scope.</p>
          </div>

          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Work Email Address (Read-only)
              </label>
              <input
                type="email"
                value={currentUser.email}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-not-allowed focus:outline-none"
                disabled
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                System Role (Read-only)
              </label>
              <input
                type="text"
                value={currentUser.role}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-100 text-slate-400 text-sm cursor-not-allowed capitalize focus:outline-none"
                disabled
              />
            </div>

            <button
              type="submit"
              disabled={updatingDetails}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
            >
              {updatingDetails ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        </div>

        {/* Right Form: Change Password */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-900">Security Credentials</h3>
            <p className="text-xs text-slate-400 mt-0.5">Change your password settings to ensure account safety.</p>
          </div>

          {passwordError && (
            <div className="p-3.5 rounded-xl text-sm bg-rose-50 text-rose-600 border border-solid border-rose-100">
              ⚠️ {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwords.current_password}
                onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
            >
              {updatingPassword ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Danger Zone Block */}
      <div className="bg-rose-50/30 p-6 rounded-3xl border border-rose-100 space-y-6">
        <div className="border-b border-rose-100 pb-3">
          <h3 className="text-lg font-bold text-rose-800">Danger Zone</h3>
          <p className="text-xs text-slate-500 mt-0.5">Destructive actions for your active session and credentials.</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Log Out Session</h4>
            <p className="text-xs text-slate-500">Deauthorize and clear the current auth token session.</p>
          </div>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer border border-slate-200"
          >
            Log Out Session
          </button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pt-4 border-t border-rose-100/50">
          <div>
            <h4 className="text-sm font-bold text-rose-700">Delete Mobility Account</h4>
            <p className="text-xs text-slate-500">Permanently delete your profile and user account from the system database.</p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer shadow-sm inline-flex items-center gap-1.5 animate-pulse hover:animate-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4 text-left">
            <h2 className="text-xl font-bold text-rose-800 flex items-center gap-2">
              ⚠️ Delete Account Confirmation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete your account? This action is <strong className="text-rose-600 font-bold">irreversible</strong> and will completely wipe your candidate profile, matching dossiers, and credentials from the system database.
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all duration-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer shadow-sm disabled:opacity-50 flex items-center gap-1.5"
              >
                {deleting ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Confirm Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
