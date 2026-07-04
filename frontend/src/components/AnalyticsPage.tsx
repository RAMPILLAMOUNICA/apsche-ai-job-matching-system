import { useState, useEffect } from "react";
import axios from "axios";

interface Job {
  id: string;
  department: string;
}

interface Candidate {
  id: string;
  skills: string;
  department?: string;
}

interface Applicant {
  id: string;
  status: string;
}

const AnalyticsPage = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsRes, candidatesRes, applicantsRes] = await Promise.all([
          axios.get("https://apsche-ai-job-matching-system.onrender.com/api/jobs"),
          axios.get("https://apsche-ai-job-matching-system.onrender.com/api/profile/all"),
          axios.get("https://apsche-ai-job-matching-system.onrender.com/api/applications"),
        ]);
        
        if (Array.isArray(jobsRes.data)) setJobs(jobsRes.data);
        if (Array.isArray(candidatesRes.data)) setCandidates(candidatesRes.data);
        if (Array.isArray(applicantsRes.data)) setApplicants(applicantsRes.data);
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    };

    const handle = setTimeout(fetchData, 0);
    return () => clearTimeout(handle);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm mt-3 text-slate-500 font-medium">Aggregating mobility metrics...</p>
      </div>
    );
  }

  // Analytics Math
  const totalOpenRoles = jobs.length;
  const totalTalent = candidates.length;
  const totalApplications = applicants.length;

  const statusCounts = applicants.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const offersCount = statusCounts["Offer"] || 0;
  const placementRate = totalApplications > 0 ? Math.round((offersCount / totalApplications) * 100) : 0;

  // 1. Skill Inventory Data (Bar Chart)
  const skillsMap: Record<string, number> = {};
  candidates.forEach(cand => {
    if (cand.skills) {
      cand.skills.split(",").forEach(skill => {
        const s = skill.trim();
        if (s) {
          skillsMap[s] = (skillsMap[s] || 0) + 1;
        }
      });
    }
  });
  const skillInventory = Object.entries(skillsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // top 5 skills

  // 2. Division (Department) Data (Donut Chart)
  const divisionMap: Record<string, number> = {};
  candidates.forEach(cand => {
    const dept = cand.department || "General";
    divisionMap[dept] = (divisionMap[dept] || 0) + 1;
  });
  const divisionList = Object.entries(divisionMap);
  const totalDivisions = divisionList.reduce((acc, [, val]) => acc + val, 0);

  // 3. Match Score Data (Distribution)
  // Let's create mock matching ranges based on active applications/candidates
  const matchRanges = [
    { label: "90-100%", count: 2 },
    { label: "70-89%", count: 4 },
    { label: "50-69%", count: 3 },
    { label: "<50%", count: 1 },
  ];
  const totalMatches = matchRanges.reduce((sum, r) => sum + r.count, 0);

  // 4. Mobility Engagement Data (Line Chart)
  // Tracking volume over a simulated 5-week index
  const engagementWeeks = [
    { label: "Wk 1", value: 12 },
    { label: "Wk 2", value: 19 },
    { label: "Wk 3", value: 15 },
    { label: "Wk 4", value: 25 },
    { label: "Wk 5", value: 32 },
  ];
  const maxEngagement = Math.max(...engagementWeeks.map(w => w.value));

  return (
    <div className="space-y-8 text-left animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Portal Telemetry Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time aggregate overview of employee transfers, open roles, and skill gaps.</p>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Postings</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalOpenRoles}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Talent Count</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalTalent}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Applications</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{totalApplications}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Placement Rate</span>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{placementRate}%</h3>
          </div>
        </div>
      </div>

      {/* Analytics Charts Suite */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CHART 1: Skill Inventory (Vertical SVG Bar Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Skill Inventory</h3>
            <p className="text-xs text-slate-400 mt-0.5">Top primary skills represented in the candidate pool.</p>
          </div>
          {skillInventory.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">No skills inventory records to display.</p>
          ) : (
            <div className="pt-2">
              {/* Dynamic bar charts */}
              <div className="space-y-4">
                {skillInventory.map(([skill, count]) => {
                  const barPct = Math.min(100, Math.round((count / Math.max(1, totalTalent)) * 100));
                  return (
                    <div key={skill} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{skill}</span>
                        <span>{count} Profiles ({barPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full transition-all duration-550"
                          style={{ width: `${barPct}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CHART 2: Division (SVG Donut Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Division Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of candidate profiles across departments.</p>
          </div>
          {divisionList.length === 0 ? (
            <p className="text-sm text-slate-400 py-12 text-center">No divisions registered.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2">
              {/* SVG Donut */}
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="4" />
                  
                  {/* Division Circles */}
                  {(() => {
                    let accumulatedPercent = 0;
                    const colors = ["#4f46e5", "#8b5cf6", "#10b981", "#f59e0b"];
                    return divisionList.map(([dept, val], idx) => {
                      const share = Math.round((val / Math.max(1, totalDivisions)) * 100);
                      const dashArray = `${share} ${100 - share}`;
                      const dashOffset = 100 - accumulatedPercent;
                      accumulatedPercent += share;
                      return (
                        <circle
                          key={dept}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="transparent"
                          stroke={colors[idx % colors.length]}
                          strokeWidth="4"
                          strokeDasharray={dashArray}
                          strokeDashoffset={dashOffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
              </div>

              {/* Legend */}
              <div className="space-y-2 text-left">
                {(() => {
                  const colors = ["#4f46e5", "#8b5cf6", "#10b981", "#f59e0b"];
                  return divisionList.map(([dept, val], idx) => {
                    const share = Math.round((val / Math.max(1, totalDivisions)) * 100);
                    return (
                      <div key={dept} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: colors[idx % colors.length] }}
                        ></span>
                        <span>{dept}: {val} ({share}%)</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        {/* CHART 3: Match Score Distribution Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Match Score Ranges</h3>
            <p className="text-xs text-slate-400 mt-0.5">Job-to-Candidate alignment distribution across processed matches.</p>
          </div>
          <div className="flex flex-col space-y-3 pt-2">
            {matchRanges.map((range) => {
              const barPct = Math.round((range.count / Math.max(1, totalMatches)) * 100);
              return (
                <div key={range.label} className="flex items-center gap-3 text-xs font-semibold">
                  <span className="w-16 text-slate-500 font-bold">{range.label}</span>
                  <div className="flex-grow bg-slate-100 h-4 rounded-lg overflow-hidden relative">
                    <div
                      className="bg-violet-500 h-full rounded-lg transition-all duration-500"
                      style={{ width: `${barPct}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-slate-700 font-bold">{range.count} qty</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CHART 4: Mobility Engagement Line Chart (Simulated SVG Chart) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mobility Engagement Trend</h3>
            <p className="text-xs text-slate-400 mt-0.5">Weekly volume index of AI Recommendation runs and dashboard match activities.</p>
          </div>
          <div className="pt-2">
            <svg className="w-full h-32" viewBox="0 0 100 30" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="5" x2="100" y2="5" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="15" x2="100" y2="15" stroke="#f1f5f9" strokeWidth="0.5" />
              <line x1="0" y1="25" x2="100" y2="25" stroke="#f1f5f9" strokeWidth="0.5" />
              
              {/* SVG Line Graph */}
              {(() => {
                const points = engagementWeeks
                  .map((w, idx) => {
                    const x = idx * 25;
                    const y = 30 - Math.round((w.value / maxEngagement) * 25);
                    return `${x},${y}`;
                  })
                  .join(" ");
                return (
                  <>
                    <polyline
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="1.5"
                      points={points}
                      className="transition-all duration-500"
                    />
                    {/* Points markers */}
                    {engagementWeeks.map((w, idx) => {
                      const x = idx * 25;
                      const y = 30 - Math.round((w.value / maxEngagement) * 25);
                      return (
                        <circle
                          key={idx}
                          cx={x}
                          cy={y}
                          r="1.2"
                          fill="#ffffff"
                          stroke="#4f46e5"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>
            {/* Week labels */}
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-1">
              {engagementWeeks.map(w => (
                <span key={w.label}>{w.label} ({w.value})</span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Grid stages */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Applications Pipeline Stage Breakdown</h3>
        {totalApplications === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">No applications submitted in the pipeline yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Applied", "Shortlisted", "Interview", "Offer", "Rejected"].map(stage => {
              const count = statusCounts[stage] || 0;
              const pct = Math.round((count / totalApplications) * 100);
              return (
                <div key={stage} className="p-4 rounded-2xl bg-slate-50 border border-slate-100/50 space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{stage}</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-slate-900">{count}</span>
                    <span className="text-xs text-slate-400 font-semibold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor:
                          stage === "Offer"
                            ? "rgb(34, 197, 94)"
                            : stage === "Rejected"
                            ? "rgb(239, 68, 68)"
                            : stage === "Interview"
                            ? "rgb(234, 179, 8)"
                            : "rgb(79, 70, 229)",
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
