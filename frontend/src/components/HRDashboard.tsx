import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface Job {
  id: string;
  title: string;
  department: string;
  required_experience?: number;
  experience_level?: string;
  description: string;
  skills_needed?: string;
  requirements?: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string;
  experience: string;
  certifications: string;
  career_interests: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  status: string;
  applied_at?: string;
}

const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState("candidates");
  const [showModal, setShowModal] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const [vacancy, setVacancy] = useState({
    title: "",
    department: "",
    skills: "",
    description: "",
    required_experience: 1,
  });

  const fetchJobs = useCallback(async () => {
    await Promise.resolve();
    setLoadingJobs(true);
    try {
      const response = await axios.get("http://localhost:8000/api/jobs");
      if (Array.isArray(response.data)) {
        setJobs(response.data);
      }
    } catch (err) {
      console.warn("Failed to fetch jobs from API", err);
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const fetchCandidates = useCallback(async () => {
    await Promise.resolve();
    setLoadingCandidates(true);
    try {
      const response = await axios.get("http://localhost:8000/api/profile/all");
      if (Array.isArray(response.data)) {
        setCandidates(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch candidates", err);
    } finally {
      setLoadingCandidates(false);
    }
  }, []);

  const fetchApplicants = useCallback(async () => {
    await Promise.resolve();
    setLoadingApplicants(true);
    try {
      const response = await axios.get("http://localhost:8000/api/applications");
      if (Array.isArray(response.data)) {
        setApplicants(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch applicants", err);
    } finally {
      setLoadingApplicants(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (activeTab === "candidates") {
        fetchCandidates();
      } else if (activeTab === "vacancies") {
        fetchJobs();
      } else if (activeTab === "applicants") {
        fetchApplicants();
      }
    }, 0);
    return () => clearTimeout(handle);
  }, [activeTab, fetchCandidates, fetchJobs, fetchApplicants]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.name === "required_experience" ? parseInt(e.target.value, 10) || 0 : e.target.value;
    setVacancy({
      ...vacancy,
      [e.target.name]: value,
    });
  };

  const postVacancy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacancy.title || !vacancy.department || !vacancy.description) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      title: vacancy.title,
      department: vacancy.department,
      location: "Remote",
      salary_range: "Negotiable",
      description: vacancy.description,
      requirements: vacancy.skills,
      skills_needed: vacancy.skills,
      posted_date: new Date().toISOString().split("T")[0],
      experience_level: `${vacancy.required_experience} years`,
      employment_type: "Full-Time",
    };

    try {
      await axios.post("http://localhost:8000/api/jobs", payload);
      alert("Vacancy Posted Successfully");
      setShowModal(false);
      setVacancy({
        title: "",
        department: "",
        skills: "",
        description: "",
        required_experience: 1,
      });
      fetchJobs();
    } catch (err) {
      console.error("Failed to post vacancy", err);
      alert("Failed to post new vacancy. Ensure the backend server is running.");
    }
  };

  const deleteVacancy = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job vacancy?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/jobs/${id}`);
      alert("Vacancy deleted successfully");
      fetchJobs();
    } catch (err) {
      console.error("Failed to delete vacancy", err);
      alert("Failed to delete vacancy.");
    }
  };

  const handleStatusChange = async (applicantId: string, newStatus: string) => {
    try {
      await axios.put(`http://localhost:8000/api/applications/${applicantId}`, {
        status: newStatus,
      });
      fetchApplicants();
    } catch (err) {
      console.error("Could not save applicant status on backend", err);
      setApplicants((prev) =>
        prev.map((app) => (app.id === applicantId ? { ...app, status: newStatus } : app))
      );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Talent & Job Openings Workspace</h1>
        <p className="text-sm text-slate-500 mt-1">Review internal employee applicants, configure new vacancies, and sync with candidate details.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-px">
        {["candidates", "vacancies", "applicants"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-semibold text-sm capitalize transition-all duration-200 border-b-2 border-solid -mb-px cursor-pointer ${
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Candidates Tab */}
      {activeTab === "candidates" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Internal Talent Pool</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/55">
              {candidates.length} Registered Profiles
            </span>
          </div>

          {loadingCandidates ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm mt-3 text-slate-500 font-medium">Syncing talent profiles...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">No candidates registered on the database yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{cand.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium mt-0.5">{cand.email}</p>
                  </div>
                  
                  <div className="space-y-1 bg-slate-50 p-3.5 rounded-2xl border border-slate-100/50">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Experience Statement</span>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      {cand.experience || "None specified."}
                    </p>
                  </div>

                  {cand.skills && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Key Competencies</span>
                      <div className="flex flex-wrap gap-1">
                        {cand.skills.split(",").map((s: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-0.5 rounded-lg border border-slate-200 font-semibold bg-slate-50 text-slate-600"
                          >
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(cand.certifications || cand.career_interests) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                      {cand.certifications && (
                        <div>
                          <strong className="text-[11px] font-bold text-violet-500 uppercase tracking-wider block">Certifications</strong>
                          <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{cand.certifications}</p>
                        </div>
                      )}
                      {cand.career_interests && (
                        <div>
                          <strong className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">Mobility Targets</strong>
                          <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">{cand.career_interests}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Vacancies Tab */}
      {activeTab === "vacancies" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Current Job Postings</h2>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-sm font-bold cursor-pointer shadow-sm inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Configure Vacancy
            </button>
          </div>

          {loadingJobs ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm mt-3 text-slate-500 font-medium">Syncing vacancies...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">No active vacancies posted yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-2 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Experience Criteria: {job.required_experience ?? job.experience_level ?? "None specified"}
                    </p>
                    <p className="text-sm text-slate-600 max-w-2xl">{job.description}</p>
                    {(job.skills_needed || job.requirements) && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(job.skills_needed || job.requirements || "").split(",").map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2.5 py-0.5 rounded-lg border border-slate-200 font-semibold bg-slate-50 text-slate-600"
                          >
                            {skill.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteVacancy(job.id)}
                    className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer shadow-sm self-start md:self-auto inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Delete Posting
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Applicants Tab */}
      {activeTab === "applicants" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Applicants Pipeline</h2>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/55">
              {applicants.length} Total Applications
            </span>
          </div>

          {loadingApplicants ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm mt-3 text-slate-500 font-medium">Syncing applications pipeline...</p>
            </div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">No application records found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-150 text-left bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-xs">
                      <th className="p-5 font-bold">Candidate</th>
                      <th className="p-5 font-bold">Applied Role</th>
                      <th className="p-5 font-bold">Pipeline Status</th>
                      <th className="p-5 font-bold text-right">Update Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {applicants.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-5">
                          <div className="font-semibold text-slate-900">{app.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{app.email}</div>
                        </td>
                        <td className="p-5 font-semibold text-slate-900">{app.jobTitle}</td>
                        <td className="p-5">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-bold border inline-block"
                            style={{
                              backgroundColor:
                                app.status === "Shortlisted"
                                  ? "rgb(239, 246, 255)"
                                  : app.status === "Interview"
                                  ? "rgb(254, 243, 199)"
                                  : app.status === "Offer"
                                  ? "rgb(240, 253, 244)"
                                  : "rgb(254, 242, 242)",
                              borderColor:
                                app.status === "Shortlisted"
                                  ? "rgb(191, 219, 254)"
                                  : app.status === "Interview"
                                  ? "rgb(253, 230, 138)"
                                  : app.status === "Offer"
                                  ? "rgb(187, 247, 208)"
                                  : "rgb(254, 202, 202)",
                              color:
                                app.status === "Shortlisted"
                                  ? "rgb(37, 99, 235)"
                                  : app.status === "Interview"
                                  ? "rgb(217, 119, 6)"
                                  : app.status === "Offer"
                                  ? "rgb(22, 163, 74)"
                                  : "rgb(220, 38, 38)",
                            }}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Interview">Interview</option>
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Post Vacancy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-lg bg-white p-6 rounded-3xl border border-slate-100 shadow-xl space-y-4 text-left">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Configure New Position
            </h2>

            <form onSubmit={postVacancy} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Lead React Developer"
                  value={vacancy.title}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Engineering"
                  value={vacancy.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="required_experience"
                    value={vacancy.required_experience}
                    onChange={handleChange}
                    min={0}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Required Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="React, TypeScript"
                    value={vacancy.skills}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Describe details, roles and responsibilities..."
                  value={vacancy.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm h-24"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-xl transition-all duration-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-xs font-bold cursor-pointer shadow-sm"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;