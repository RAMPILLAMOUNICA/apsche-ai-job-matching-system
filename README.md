# 🚀 Internal Job Mobility Assistant

An AI-powered enterprise platform designed to facilitate internal career mobility within organizations. The system enables employees to explore internal opportunities, analyze career compatibility using AI, receive personalized career recommendations, and allows HR teams to manage talent mobility effectively.

---

## 📌 Project Overview

The **Internal Job Mobility Assistant** helps employees identify suitable internal roles based on their skills, experience, certifications, and career interests. The platform leverages **Google Gemini AI** to provide intelligent job matching, skill gap analysis, career roadmaps, and resume insights.

The platform also provides HR partners with a centralized dashboard for managing employees, vacancies, applications, and organizational analytics.

---

## ✨ Key Features

### 👨‍💼 Employee Features

- User Registration & Login (JWT Authentication)
- Career Dossier Management
- Resume Analyzer with AI Insights
- Browse Internal Job Opportunities
- AI-Powered Job Match Analysis
- Skill Gap Identification
- Recommended Certifications
- Dynamic Learning Roadmaps
- Personalized AI Career Path Recommendations
- Profile Management

### 🏢 HR Features

- HR Partner Dashboard
- Candidate Management
- Vacancy Management
- Applicant Tracking
- Application Status Updates
- Organizational Talent Analytics

### 🤖 AI Features

- AI Match Score Generation
- Skill Gap Analysis
- Learning Roadmap Generation
- Career Path Simulation
- Resume Information Extraction

---

## 🏗️ System Architecture

### Frontend

- React.js
- TypeScript
- Tailwind CSS
- Recharts
- Axios
- Vite

### Backend

- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Passlib (Password Hashing)

### AI Integration

- Google Gemini API

---

## 📊 Modules

### Employee Career Mobility Hub

Employees can:

- Maintain career profiles
- Explore internal job openings
- Analyze job compatibility
- Receive AI recommendations

### Resume Analyzer

Employees can:

- Paste resume content
- Extract skills and experience
- Save extracted details to profile

### AI Career Planner

Generates:

- Upward Growth Paths
- Lateral Transition Paths
- Upskill Transition Paths

### HR Business Partner Center

HR can:

- View employees
- Create vacancies
- Review applicants
- Update application statuses

### Analytics Dashboard

Includes:

- Skill Inventory Analysis
- Department Distribution
- Match Score Distribution
- Mobility Engagement Trends

---

## 📁 Project Structure

```text
Internal Job Mobility Assistant
│
├── backend/
│   ├── database/
│   ├── models/
│   ├── routes/
│   ├── ai_service.py
│   ├── auth.py
│   ├── security.py
│   └── main.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── components/
│   └── App.tsx
│
├── README.md
└── .gitignore
```

---

## ⚙️ Installation & Setup

### Clone Repository

```bash
git clone https://github.com/RAMPILLAMOUNICA/apsche-ai-job-matching-system.git
cd apsche-ai-job-matching-system
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt

python main.py
```

Backend runs at:

```text
http://localhost:8000
```

Swagger API Documentation:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 🔐 Environment Variables

Create a `.env` file inside the backend folder.

```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
SECRET_KEY=your_secret_key
```

---

## 📈 Performance Targets

| Feature | Response Time |
|----------|--------------|
| Profile Update | < 200 ms |
| Job Listing | < 300 ms |
| AI Match Analysis | 3 - 8 sec |
| Career Recommendations | 4 - 10 sec |

---

## 🧪 Testing

The application has been tested for:

- Authentication Flow
- Employee Workflow
- HR Workflow
- AI Match Quality
- Career Recommendation Quality
- Role-Based Access Control
- API Performance
- Database Persistence

---

## 🔒 Security Features

- JWT Authentication
- Password Hashing using Bcrypt
- Role-Based Access Control
- Protected Routes
- Environment Variable Management

---

## 🚀 Future Enhancements

- Email Notifications
- Resume File Upload (PDF/DOCX)
- Multi-factor Authentication
- AI Chat Assistant
- Cloud Deployment
- Advanced Talent Analytics

---

## 👩‍💻 Author

**RAMPILLA MOUNICA SIVA SAI**

B.Tech CSE (AI & ML)  
University College of Engineering, JNTUK Kakinada

---

## 📄 License

This project is developed for academic and internship purposes.
