from dotenv import load_dotenv
from google import genai
import os
import json

# Load variables from .env file
load_dotenv()

# Get Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Check if key loaded successfully
if GEMINI_API_KEY:
    print("Gemini API Key loaded successfully.")
else:
    print("Gemini API Key not found.")


def get_genai_client():
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key or api_key == "MY_GEMINI_API_KEY":
        return None

    try:
        return genai.Client(api_key=api_key)

    except Exception as e:
        print(f"Error initializing GenAI Client: {e}")
        return None


def check_ai_status_sync() -> dict:
    client = get_genai_client()

    if not client:
        return {
            "configured": False,
            "status": "Gemini client unavailable"
        }

    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents="Reply with the word OK only."
        )

        if response.text:
            return {
                "configured": True,
                "status": "Gemini AI connected"
            }

    except Exception as e:
        print(f"[GEMINI] Status check failed: {e}")

    return {
        "configured": False,
        "status": "Gemini AI unavailable"
    }


def _call_gemini(prompt: str):
    client = get_genai_client()

    if not client:
        raise Exception("Gemini client unavailable")

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt
    )

    return response.text


def _extract_json(text: str):
    try:
        text = text.strip()

        if text.startswith("```json"):
            text = text.replace("```json", "").replace("```", "").strip()

        elif text.startswith("```"):
            text = text.replace("```", "").strip()

        return json.loads(text)

    except Exception as e:
        print(f"JSON extraction failed: {e}")
        return {}


# Standard fallback career paths when Gemini is unconfigured or fails
DEFAULT_PATHS = [
    {
        "roleTitle": "Senior Software Engineer",
        "department": "Engineering",
        "transitionType": "Upward Growth",
        "matchPercentage": 85,
        "explanation": "Strong fit based on your core software engineering background and development experience.",
        "skillGaps": ["System Design", "Cloud Infrastructure"],
        "recommendedCertifications": ["AWS Certified Developer Associate"],
        "weeklyLearningBlueprint": [
            "Week 1: Study Distributed Systems & Microservices architecture",
            "Week 2: Practice system design concepts and database scalability",
            "Week 3: Deep dive into cloud patterns and AWS DevOps",
            "Week 4: Build and deploy a multi-service scalable system",
        ],
    },
    {
        "roleTitle": "Product Manager",
        "department": "Product Management",
        "transitionType": "Lateral Transition",
        "matchPercentage": 70,
        "explanation": "Good opportunity to leverage your engineering background into technical product ownership.",
        "skillGaps": ["Product Strategy", "Agile Methodologies", "User Research"],
        "recommendedCertifications": ["Certified Scrum Product Owner (CSPO)"],
        "weeklyLearningBlueprint": [
            "Week 1: Learn modern product lifecycle and design thinking",
            "Week 2: Study Scrum practices and product roadmap creation",
            "Week 3: Master wireframing, analytics tools, and KPI definition",
            "Week 4: Complete a mock product spec sheet and presentation",
        ],
    },
    {
        "roleTitle": "AI/ML Engineer",
        "department": "Data Science",
        "transitionType": "Upskill Transition",
        "matchPercentage": 65,
        "explanation": "Excellent growth path to transition into high-demand AI roles by building on your Python foundation.",
        "skillGaps": ["Machine Learning Theory", "PyTorch/TensorFlow", "Deep Learning"],
        "recommendedCertifications": ["Google Cloud Professional Machine Learning Engineer"],
        "weeklyLearningBlueprint": [
            "Week 1: Study linear algebra, probability, and classic ML algorithms",
            "Week 2: Practice data preprocessing and feature engineering with pandas",
            "Week 3: Master deep neural networks using TensorFlow or PyTorch",
            "Week 4: Train and deploy your first LLM/RAG agent locally",
        ],
    }
]


def calculate_job_match_sync(employee_profile: dict, job: dict) -> dict:
    # Dynamic fallback when Gemini is not configured
    def get_fallback_result():
        # Ensure we work with lists of skills
        def sanitize_skills(val):
            if isinstance(val, list):
                return [s.lower().strip() for s in val]
            if isinstance(val, str):
                return [s.lower().strip() for s in val.split(",") if s.strip()]
            return []

        emp_skills = sanitize_skills(employee_profile.get("skills", []))
        job_skills = sanitize_skills(job.get("requirements", job.get("skills_needed", "")))

        matched = [s for s in job_skills if s in emp_skills]
        gap = [s for s in job_skills if s not in emp_skills]

        match_pct = 50
        if job_skills:
            match_pct = int((len(matched) / len(job_skills)) * 100)
            match_pct = max(30, min(95, match_pct))

        explanation = f"Compatible fit for the {job.get('title', 'Role')} role based on alignment in {', '.join(matched) if matched else 'core competencies'}."

        return {
            "matchPercentage": match_pct,
            "matchExplanation": explanation,
            "skillsGap": [g.title() for g in gap] if gap else ["System Architecture", "Cloud Engineering"],
            "recommendedCerts": [f"Professional {g.title()} Cert" for g in gap] if gap else ["AWS Certified Developer"],
            "learningRoadmap": [f"Week {i+1}: Upskill in {g.title()}" for i, g in enumerate(gap[:4])] if gap else ["Week 1: System Design", "Week 2: Performance Profiling", "Week 3: Cloud Deployment"]
        }

    if not get_genai_client():
        return get_fallback_result()

    prompt = f"""
You are an enterprise HR AI assistant.

Perform deep compatibility analysis between the employee profile and the internal job posting.

EMPLOYEE PROFILE:
- Current Role: {employee_profile.get('designation', 'N/A')}
- Department: {employee_profile.get('department', 'N/A')}
- Experience: {employee_profile.get('years_of_experience', 0)} years
- Skills: {employee_profile.get('skills', [])}
- Certifications: {employee_profile.get('certifications', [])}
- Career Interests: {employee_profile.get('career_interests', [])}
- Education: {employee_profile.get('education', 'N/A')}

JOB DETAILS:
- Title: {job.get('title', 'N/A')}
- Department: {job.get('department', 'N/A')}
- Required Experience: {job.get('required_experience', 0)} years
- Required Skills: {job.get('required_skills', [])}
- Preferred Skills: {job.get('preferred_skills', [])}
- Description: {job.get('description', 'N/A')}

Return ONLY a valid JSON object.

Expected JSON format:

{{
    "matchPercentage": 85,
    "matchExplanation": "Detailed explanation of why the employee matches this role.",
    "skillsGap": ["Docker", "Kubernetes"],
    "recommendedCerts": [
        "Docker Certified Associate",
        "AWS Cloud Practitioner"
    ],
    "learningRoadmap": [
        "Week 1: Learn Docker fundamentals",
        "Week 2: Containerize applications",
        "Week 3: Learn Kubernetes basics",
        "Week 4: Deploy projects using Kubernetes"
    ]
}}
"""

    try:
        response = _call_gemini(prompt)
        parsed = _extract_json(response)
        if parsed and "matchPercentage" in parsed:
            return parsed
        return get_fallback_result()

    except Exception as e:
        print(f"[GEMINI] calculate_job_match_sync failed: {e}")
        return get_fallback_result()


def simulate_career_paths_sync(employee_profile: dict) -> dict:
    if not get_genai_client():
        return {
            "careerPaths": DEFAULT_PATHS
        }

    prompt = f"""
You are an enterprise HR AI career advisor.

Generate EXACTLY THREE personalized career paths for the employee.

Employee Profile:

- Current Role: {employee_profile.get('designation', 'N/A')}
- Department: {employee_profile.get('department', 'N/A')}
- Experience: {employee_profile.get('years_of_experience', 0)} years
- Skills: {employee_profile.get('skills', [])}
- Certifications: {employee_profile.get('certifications', [])}
- Career Interests: {employee_profile.get('career_interests', [])}
- Education: {employee_profile.get('education', 'N/A')}

Generate exactly 3 career paths:

1. Upward Growth Path
2. Lateral Transition Path
3. Upskill Transition Path

For each path include:

- roleTitle
- department
- transitionType
- matchPercentage
- explanation
- skillGaps
- recommendedCertifications
- weeklyLearningBlueprint

Return ONLY valid JSON.

Example format:

{{
    "careerPaths": [
        {{
            "roleTitle": "Senior Software Engineer",
            "department": "Engineering",
            "transitionType": "Upward Growth",
            "matchPercentage": 85,
            "explanation": "Strong match based on current experience.",
            "skillGaps": ["System Design"],
            "recommendedCertifications": [
                "AWS Developer Associate"
            ],
            "weeklyLearningBlueprint": [
                "Week 1: Learn System Design basics",
                "Week 2: Practice architecture patterns"
            ]
        }}
    ]
}}
"""

    try:
        response = _call_gemini(prompt)
        parsed = _extract_json(response)
        
        # Verify we got a non-empty list of paths
        paths = parsed.get("careerPaths", [])
        if isinstance(paths, list) and len(paths) > 0:
            return parsed
        return {
            "careerPaths": DEFAULT_PATHS
        }

    except Exception as e:
        print(f"[GEMINI] simulate_career_paths_sync failed: {e}")
        return {
            "careerPaths": DEFAULT_PATHS
        }


def analyze_resume_sync(resume_text: str) -> dict:
    # Fallback if Gemini is unavailable
    default_resume_analysis = {
        "skills": ["Python", "React", "SQL", "Git"],
        "strengths": ["Quick learner", "Solves complex queries", "Full stack implementation"],
        "weaknesses": ["Cloud computing tools", "Containerization workflows"],
        "certifications": ["AWS Cloud Practitioner candidate"],
        "experienceSummary": "Demonstrated skills in building web features and database schemas."
    }

    if not get_genai_client():
        return default_resume_analysis

    prompt = f"""
You are an expert HR resume analyzer.

Analyze the following resume and extract structured career information.

Resume Content:

{resume_text}

Extract the following information:

- skills
- strengths
- weaknesses
- certifications
- experienceSummary

Return ONLY valid JSON.

Example format:

{{
    "skills": [
        "Python",
        "React",
        "SQL"
    ],
    "strengths": [
        "Strong problem solving",
        "Team collaboration"
    ],
    "weaknesses": [
        "Limited cloud experience"
    ],
    "certifications": [
        "AWS Cloud Practitioner"
    ],
    "experienceSummary": "2 years of experience in full stack web development."
}}
"""

    try:
        response = _call_gemini(prompt)
        parsed = _extract_json(response)
        if parsed and "skills" in parsed:
            return parsed
        return default_resume_analysis

    except Exception as e:
        print(f"[GEMINI] analyze_resume_sync failed: {e}")
        return default_resume_analysis
