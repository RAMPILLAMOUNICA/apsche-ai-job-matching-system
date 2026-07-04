import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface EmployeeProfile {
  skills: string;
  experience: string;
  certifications: string;
  career_interests: string;
}

interface Job {
  id: string;
  title: string;
  department: string;
  required_skills?: string | string[];
  skills_needed?: string;
  required_experience?: number;
  experience_level?: string;
  description: string;
}

interface Analysis {
  matchScore: number;
  matchExplanation: string;
  skillGaps: string[];
  recommendedCerts: string[];
  learningRoadmap: string[];
}

const EmployeeDashboard = () => {
  const [profile, setProfile] = useState<EmployeeProfile>({
    skills: "",
    experience: "",
    certifications: "",
    career_interests: "",
  });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [analyses, setAnalyses] = useState<Record<string, Analysis>>({});
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingMatch, setLoadingMatch] = useState<Record<string, boolean>>({});

  // Parse arrays or strings to clean comma-separated values
  const ensureString = (val: unknown): string => {
    if (Array.isArray(val)) {
      return val.join(", ");
    }
    return typeof val === "string" ? val : "";
  };

  const fetchProfile = useCallback(async () => {
    await Promise.resolve();
    try {
      const response = await axios.get("https://apsche-ai-job-matching-system.onrender.com/api/profile");
      const data = response.data;
      
      // If backend returns the stub message, fallback to default profile state
      if (data && data.message && typeof data.message === "string") {
        setProfile({
          skills: "Python, React, SQL",
          experience: "2 years of full stack web development experience",
          certifications: "AWS Cloud Practitioner, Google Data Analytics",
          career_interests: "AI, Full Stack Engineering",
        });
      } else {
        setProfile({
          skills: ensureString(data.skills),
          experience: ensureString(data.experience),
          certifications: ensureString(data.certifications),
          career_interests: ensureString(data.career_interests),
        });
      }
    } catch (err) {
      console.error("Failed to load profile from API, loading defaults.", err);
      setProfile({
        skills: "Python, React, SQL",
        experience: "2 years of full stack web development experience",
        certifications: "AWS Cloud Practitioner, Google Data Analytics",
        career_interests: "AI, Full Stack Engineering",
      });
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    await Promise.resolve();
    const defaultJobs: Job[] = [
      {
        id: "1",
        title: "Full Stack Engineer",
        department: "Engineering",
        required_skills: ["React", "Node.js", "Docker"],
        required_experience: 2,
        description: "Develop enterprise applications using React, Node.js, and Docker.",
      },
      {
        id: "2",
        title: "AI/ML Engineer",
        department: "Data Science",
        required_skills: ["Python", "TensorFlow", "Machine Learning"],
        required_experience: 1,
        description: "Build, evaluate, and deploy scalable machine learning and generative AI models.",
      },
    ];

    try {
      const response = await axios.get("https://apsche-ai-job-matching-system.onrender.com/api/jobs");
      if (Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
        setJobs(defaultJobs);
      }
    } catch (err) {
      console.error("Failed to load jobs from API, loading defaults.", err);
      setJobs(defaultJobs);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchProfile();
      fetchJobs();
    }, 0);
    return () => clearTimeout(handle);
  }, [fetchProfile, fetchJobs]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await axios.put("https://apsche-ai-job-matching-system.onrender.com/api/profile", profile);
      alert("Career dossier updated successfully!");
    } catch (err) {
      console.error("Failed to save profile dossier", err);
      alert("Failed to save career dossier.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await axios.post("https://apsche-ai-job-matching-system.onrender.com/api/applications", { job_id: jobId });
      alert("Successfully applied for this position!");
    } catch (err) {
      console.error("Application failed", err);
      alert("Failed to submit job application.");
    }
  };

  const analyzeJob = async (job: Job) => {
    setLoadingMatch((prev) => ({ ...prev, [job.id]: true }));

    const skillsArray = profile.skills.split(",").map((s) => s.trim()).filter(Boolean);
    const certsArray = profile.certifications.split(",").map((c) => c.trim()).filter(Boolean);
    const interestsArray = profile.career_interests.split(",").map((i) => i.trim()).filter(Boolean);

    const payload = {
      employee_profile: {
        designation: "Software Engineer",
        department: "Engineering",
        years_of_experience: parseInt(profile.experience.match(/\d+/)?.[0] || "2", 10),
        skills: skillsArray,
        certifications: certsArray,
        career_interests: interestsArray,
        education: "N/A",
      },
      job: {
        title: job.title,
        department: job.department,
        required_experience: job.required_experience || 0,
        required_skills: Array.isArray(job.required_skills) ? job.required_skills : (job.required_skills?.split(",") || []),
        preferred_skills: job.required_skills ? (Array.isArray(job.required_skills) ? job.required_skills : job.required_skills.split(",")) : [],
        description: job.description,
      },
    };

    try {
      const response = await axios.post("https://apsche-ai-job-matching-system.onrender.com/api/jobs/match", payload);
      const data = response.data;

      setAnalyses((prev) => ({
        ...prev,
        [job.id]: {
          matchScore: data.matchPercentage ?? data.match_percentage ?? data.matchScore ?? 0,
          matchExplanation: data.matchExplanation ?? data.match_explanation ?? "N/A",
          skillGaps: data.skillsGap ?? data.skill_gaps ?? [],
          recommendedCerts: data.recommendedCerts ?? data.recommended_certs ?? [],
          learningRoadmap: data.learningRoadmap ?? data.learning_roadmap ?? [],
        },
      }));
    } catch (error) {
      console.error("Failed to retrieve matching analysis", error);
      alert("Failed to analyze job match. Ensure the backend server is running.");
    } finally {
      setLoadingMatch((prev) => ({ ...prev, [job.id]: false }));
    }
  };

  const handleDossierChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Calculations for Stat Cards
  const matchScores = Object.values(analyses).map((a) => a.matchScore);
  const topMatch = matchScores.length > 0 ? Math.max(...matchScores) : 0;

  const profileCompletion = (() => {
    let filled = 0;
    if (profile.skills && profile.skills.trim()) filled++;
    if (profile.experience && profile.experience.trim()) filled++;
    if (profile.certifications && profile.certifications.trim()) filled++;
    if (profile.career_interests && profile.career_interests.trim()) filled++;
    return Math.round((filled / 4) * 100);
  })();

  if (loadingProfile) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm mt-3 text-slate-500 font-medium">Syncing profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Career Hub Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your professional dossier and discover internal job options.</p>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Open Positions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Open Roles</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{jobs.length}</h3>
          </div>
        </div>

        {/* Active Applications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Analyses Ran</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{Object.keys(analyses).length}</h3>
          </div>
        </div>

        {/* Top Match */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.18 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118l-3.97-2.883c-.783-.57-.372-1.81.588-1.81h4.906a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Match Rate</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{topMatch}%</h3>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dossier Completed</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{profileCompletion}%</h3>
          </div>
        </div>
      </div>

      {/* Main Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Career Dossier (1 Column) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 lg:col-span-1">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">Career Dossier</h2>
            <p className="text-xs text-slate-400 mt-0.5">Keep your professional summary up to date for candidate screening.</p>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Technical Skills
              </label>
              <textarea
                name="skills"
                rows={2}
                placeholder="Python, React, PostgreSQL..."
                value={profile.skills}
                onChange={handleDossierChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Experience Summary
              </label>
              <textarea
                name="experience"
                rows={3}
                placeholder="Describe your role history and achievements..."
                value={profile.experience}
                onChange={handleDossierChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all duration-200 h-24"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Certifications
              </label>
              <textarea
                name="certifications"
                rows={2}
                placeholder="e.g. AWS Certified Solutions Architect"
                value={profile.certifications}
                onChange={handleDossierChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Career Interests
              </label>
              <textarea
                name="career_interests"
                rows={2}
                placeholder="Roles, teams, or scopes you wish to target..."
                value={profile.career_interests}
                onChange={handleDossierChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="w-full py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {savingProfile ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Save Dossier"
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Job Opportunities & Match Drawer (2 Columns) */}
        <div className="space-y-6 lg:col-span-2">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-900">Internal Opportunities</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/55">
              {jobs.length} Matches Found
            </span>
          </div>

          {loadingJobs ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm mt-3 text-slate-500">Querying positions list...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">No open mobility positions available at the moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {jobs.map((job) => {
                const analysis = analyses[job.id];
                const analyzing = loadingMatch[job.id];

                return (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {job.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Experience needed: {job.required_experience ?? job.experience_level ?? "None specified"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => analyzeJob(job)}
                          disabled={analyzing}
                          className="px-4 py-2 border border-indigo-200 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all duration-200 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
                        >
                          {analyzing ? (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                          )}
                          Apply & Analyze
                        </button>
                        <button
                          onClick={() => handleApply(job.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer shadow-sm"
                        >
                          Quick Apply
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600">{job.description}</p>

                    {/* Dynamic matching indicators */}
                    {analysis && (
                      <div className="pt-4 border-t border-slate-100 space-y-4 animate-fadeIn text-left">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Match Output:</span>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-bold border"
                            style={{
                              backgroundColor:
                                analysis.matchScore >= 80
                                  ? "rgb(240, 253, 244)"
                                  : analysis.matchScore >= 60
                                  ? "rgb(254, 243, 199)"
                                  : "rgb(254, 242, 242)",
                              borderColor:
                                analysis.matchScore >= 80
                                  ? "rgb(187, 247, 208)"
                                  : analysis.matchScore >= 60
                                  ? "rgb(253, 230, 138)"
                                  : "rgb(254, 202, 202)",
                              color:
                                analysis.matchScore >= 80
                                  ? "rgb(22, 163, 74)"
                                  : analysis.matchScore >= 60
                                  ? "rgb(217, 119, 6)"
                                  : "rgb(220, 38, 38)",
                            }}
                          >
                            {analysis.matchScore}% Match
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                          {analysis.matchExplanation}
                        </p>

                        {/* Skill gaps and recommended certs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {analysis.skillGaps.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">Skill Gaps</span>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.skillGaps.map((skill, index) => (
                                  <span key={index} className="text-xs px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 font-medium">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {analysis.recommendedCerts.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-xs font-bold text-violet-500 uppercase tracking-wider block">Recommended Certifications</span>
                              <div className="flex flex-wrap gap-1.5">
                                {analysis.recommendedCerts.map((cert, index) => (
                                  <span key={index} className="text-xs px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-100 font-medium">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Roadmap Timeline */}
                        {analysis.learningRoadmap.length > 0 && (
                          <div className="pt-2">
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block mb-3">Weekly Learning Blueprint</span>
                            <div className="relative border-l-2 border-indigo-100 ml-3 space-y-4">
                              {analysis.learningRoadmap.map((step, idx) => (
                                <div key={idx} className="relative pl-6">
                                  <div className="absolute -left-1.5 top-1.5 w-3.5 h-3.5 bg-indigo-600 rounded-full ring-4 ring-white"></div>
                                  <p className="text-sm text-slate-700 font-medium">{step}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;