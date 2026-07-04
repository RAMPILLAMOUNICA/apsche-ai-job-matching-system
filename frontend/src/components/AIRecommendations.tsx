import { useState, useEffect, useCallback } from "react";
import axios from "axios";

interface CareerPath {
  roleTitle?: string;
  role?: string;
  transitionType?: string;
  type?: string;
  matchPercentage?: number;
  match_percentage?: number;
  explanation?: string;
  skillGaps?: string[];
  skill_gaps?: string[];
  recommendedCertifications?: string[];
  recommended_certs?: string[];
  weeklyLearningBlueprint?: string[];
  blueprint?: string[];
}

const defaultPaths: CareerPath[] = [
  {
    roleTitle: "Senior Software Engineer",
    transitionType: "Upward Growth",
    matchPercentage: 85,
    explanation: "Strong fit based on your core software engineering background and development experience.",
    skillGaps: ["System Design", "Cloud Infrastructure"],
    recommendedCertifications: ["AWS Certified Developer Associate"],
    weeklyLearningBlueprint: [
      "Week 1: Study Distributed Systems & Microservices architecture",
      "Week 2: Practice system design concepts and database scalability",
      "Week 3: Deep dive into cloud patterns and AWS DevOps",
      "Week 4: Build and deploy a multi-service scalable system",
    ],
  },
  {
    roleTitle: "Product Manager",
    transitionType: "Lateral Transition",
    matchPercentage: 70,
    explanation: "Good opportunity to leverage your engineering background into technical product ownership.",
    skillGaps: ["Product Strategy", "Agile Methodologies", "User Research"],
    recommendedCertifications: ["Certified Scrum Product Owner (CSPO)"],
    weeklyLearningBlueprint: [
      "Week 1: Learn modern product lifecycle and design thinking",
      "Week 2: Study Scrum practices and product roadmap creation",
      "Week 3: Master wireframing, analytics tools, and KPI definition",
      "Week 4: Complete a mock product spec sheet and presentation",
    ],
  },
  {
    roleTitle: "AI/ML Engineer",
    transitionType: "Upskill Transition",
    matchPercentage: 65,
    explanation: "Excellent growth path to transition into high-demand AI roles by building on your Python foundation.",
    skillGaps: ["Machine Learning Theory", "PyTorch/TensorFlow", "Deep Learning"],
    recommendedCertifications: ["Google Cloud Professional Machine Learning Engineer"],
    weeklyLearningBlueprint: [
      "Week 1: Study linear algebra, probability, and classic ML algorithms",
      "Week 2: Practice data preprocessing and feature engineering with pandas",
      "Week 3: Master deep neural networks using TensorFlow or PyTorch",
      "Week 4: Train and deploy your first LLM/RAG agent locally",
    ],
  },
];

const AIRecommendations = () => {
  const [careerPaths, setCareerPaths] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    setError(null);
    
    let profilePayload = {
      designation: "Software Engineer",
      department: "Engineering",
      years_of_experience: 2,
      skills: ["Python", "React", "SQL"],
      certifications: ["AWS Cloud Practitioner"],
      career_interests: ["AI", "Full Stack"],
      education: "B.Tech CSE",
    };

    try {
      const profileRes = await axios.get("https://apsche-ai-job-matching-system.onrender.com/api/profile");
      const data = profileRes.data;
      if (data && !data.message) {
        const ensureArray = (val: string | string[] | undefined | null): string[] => {
          if (Array.isArray(val)) return val;
          if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
          return [];
        };
        profilePayload = {
          designation: "Employee",
          department: "General",
          years_of_experience: parseInt(data.experience?.match(/\d+/)?.[0] || "2", 10),
          skills: ensureArray(data.skills),
          certifications: ensureArray(data.certifications),
          career_interests: ensureArray(data.career_interests),
          education: "N/A",
        };
      }
    } catch (err) {
      console.warn("Could not load employee profile, utilizing defaults.", err);
    }

    try {
      const response = await axios.post("https://apsche-ai-job-matching-system.onrender.com/api/recommendations/generate", profilePayload);
      const data = response.data;
      
      const paths = data.careerPaths || data.career_paths;
      if (Array.isArray(paths)) {
        setCareerPaths(paths.slice(0, 3));
      } else {
        setCareerPaths(defaultPaths);
      }
    } catch (err) {
      console.error("Failed to generate career paths", err);
      setError("Failed to generate personalized career recommendations.");
      setCareerPaths(defaultPaths);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchRecommendations();
    }, 0);
    return () => clearTimeout(handle);
  }, [fetchRecommendations]);

  return (
    <div className="space-y-6 text-left">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">AI Career Pathways</h1>
          <p className="text-sm text-slate-500 mt-1">Explore personalized promotion steps, lateral transfers, and learning blueprints.</p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all duration-200 text-sm font-bold cursor-pointer shadow-sm inline-flex items-center gap-2 self-start sm:self-center disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Regenerate Paths
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl text-sm bg-rose-50 text-rose-600 border border-solid border-rose-100">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm mt-3 text-slate-500 font-medium">Synthesizing personalized trajectories using Gemini AI...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {careerPaths.map((path: CareerPath, index: number) => {
            const roleTitle = path.roleTitle ?? path.role ?? "Career Option";
            const transitionType = path.transitionType ?? path.type ?? "Transition";
            const matchPercentage = path.matchPercentage ?? path.match_percentage ?? 0;
            const explanation = path.explanation ?? "N/A";
            const skillGaps = path.skillGaps ?? path.skill_gaps ?? [];
            const recommendedCerts = path.recommendedCertifications ?? path.recommended_certs ?? [];
            const blueprint = path.weeklyLearningBlueprint ?? path.blueprint ?? [];

            return (
              <div
                key={index}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 leading-tight">
                        {roleTitle}
                      </h2>
                      <span className="inline-block text-xs font-bold px-2.5 py-0.5 mt-2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {transitionType}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                      {matchPercentage}% Match
                    </span>
                  </div>

                  <p className="text-sm text-slate-600">
                    {explanation}
                  </p>

                  {/* Skill gaps */}
                  {skillGaps.length > 0 && (
                    <div className="space-y-1.5">
                      <strong className="text-xs font-bold uppercase tracking-wider text-rose-500 block">Required Skills</strong>
                      <div className="flex flex-wrap gap-1">
                        {skillGaps.map((skill: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-100/50 font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {recommendedCerts.length > 0 && (
                    <div className="space-y-1.5">
                      <strong className="text-xs font-bold uppercase tracking-wider text-violet-500 block">Recommended Certifications</strong>
                      <div className="flex flex-wrap gap-1">
                        {recommendedCerts.map((cert: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100/50 font-medium"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Timeline */}
                {blueprint.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <strong className="text-xs font-bold uppercase tracking-wider text-indigo-500 block">Weekly Step Blueprint</strong>
                    <div className="relative border-l-2 border-indigo-100 ml-2 space-y-4">
                      {blueprint.map((week: string, idx: number) => (
                        <div key={idx} className="relative pl-5">
                          <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-white"></div>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed">{week}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;