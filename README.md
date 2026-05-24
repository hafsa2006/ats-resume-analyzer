<div align="center">

# ResumeIQ — AI Resume Intelligence Platform

**An ATS-focused resume analyzer that scores, parses, and optimizes resumes against real job descriptions — built as a full-stack SaaS.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

[Features](#-features) · [Tech Stack](#-tech-stack) · [Installation](#-installation) · [Screenshots](#-screenshots) · [API](#-api-overview) · [Roadmap](#-future-improvements)

</div>

---

## Overview

**ResumeIQ** (ATS Resume Analyzer) is a production-style SaaS application that helps job seekers understand how applicant tracking systems (ATS) evaluate their resumes. Users upload a resume, paste a job description, and receive a **weighted ATS score**, skill gap analysis, formatting feedback, and actionable recommendations — with optional AI enhancements powered by Google Gemini.

The platform includes a premium dashboard UI (glassmorphism, animated analytics, dark/light themes), secure authentication, analysis history, and PDF export.

> **Built for:** portfolio demos, technical interviews, and recruiter review — demonstrating full-stack architecture, API design, and modern frontend craft.

---

## Features

### Core analysis
| Feature | Description |
|--------|-------------|
| **Weighted ATS engine** | Deterministic scoring: Keyword Match (40%), Skills (20%), Experience (15%), Formatting (15%), Projects (10%) |
| **Multi-format upload** | PDF, DOCX, PNG, JPG — with OCR for scanned documents |
| **Job description matching** | Token-based keyword and skill alignment against the target role |
| **Resume parsing** | Extracts contact info, experience, education, skills, and projects |
| **AI enhancements** | Optional Gemini-powered suggestions and keyword recommendations |

### Dashboard & insights
| Feature | Description |
|--------|-------------|
| **Animated score ring** | Circular ATS score with gradient stroke and smooth count-up |
| **Score breakdown charts** | Recharts visualizations with theme-aware styling |
| **Skill heatmap & density** | Visual keyword and skill coverage analysis |
| **Analysis history** | Persisted runs per user with searchable timeline |
| **PDF export** | Downloadable analysis reports |

### Platform
| Feature | Description |
|--------|-------------|
| **JWT authentication** | Secure signup, login, and protected routes |
| **MongoDB persistence** | User profiles, preferences, and analysis records |
| **Dark / light mode** | System-wide theme with accessible contrast |
| **Responsive SaaS UI** | Premium glassmorphism, motion, and spotlight interactions |

---

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwind-css&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3-22B5BF)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.7-5A29E4?logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/Mongoose-8-47A248?logo=mongodb&logoColor=white)
![JWT](https://img.shields.io/badge/JWT_Auth-bcryptjs-000000?logo=jsonwebtokens&logoColor=white)
![Multer](https://img.shields.io/badge/File_Upload-Multer-100000)
![pdf-parse](https://img.shields.io/badge/PDF-pdf--parse-E34F26)
![Mammoth](https://img.shields.io/badge/DOCX-Mammoth-2B579A)
![Tesseract](https://img.shields.io/badge/OCR-Tesseract.js-3D8BF2)

### DevOps & tooling
![Concurrently](https://img.shields.io/badge/Dev-concurrently-000000)
![ESLint](https://img.shields.io/badge/Lint-ESLint-4B32C3?logo=eslint&logoColor=white)

---

## Project Structure

```
ATS-resume/
├── backend/                 # Express API
│   ├── controllers/         # Auth, analysis, user logic
│   ├── middleware/          # JWT auth, optional auth
│   ├── models/              # User, Analysis (Mongoose)
│   ├── routes/              # REST API routes
│   └── utils/               # ATS engine, parser, Gemini, OCR
├── frontend/                # React + Vite SPA
│   └── src/
│       ├── components/      # UI, layout, charts
│       ├── context/         # Theme provider
│       ├── pages/           # Landing, Dashboard, Analyzer, etc.
│       └── services/        # Axios API client
├── docs/
│   └── screenshots/         # Add project screenshots here
└── package.json             # Root dev script (runs both servers)
```

---

## Installation

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- *(Optional)* **Google Gemini API key** for AI enhancements

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ATS-resume.git
cd ATS-resume
```

### 2. Install dependencies

```bash
# Root (concurrently for dev)
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 3. Configure environment

Create `backend/.env` from the example:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/ats_analyzer
JWT_SECRET=your-secure-secret-here
GEMINI_API_KEY=your-gemini-key-optional
ALLOW_START_WITHOUT_DB=true
```

### 4. Run the application

**Recommended — both servers at once:**

```bash
npm run dev
```

| Service  | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend  | http://localhost:5000 |
| Health   | http://localhost:5000/api/health |

**Or run separately:**

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### 5. Production build (frontend)

```bash
cd frontend
npm run build
npm run preview
```

---

## Screenshots

> Add your captures to `docs/screenshots/` and they will render below. Suggested filenames: `landing.png`, `dashboard.png`, `analyzer.png`, `results.png`.

<table>
  <tr>
    <td align="center"><b>Landing Page</b><br/><sub>Premium marketing & product overview</sub></td>
    <td align="center"><b>Dashboard</b><br/><sub>Analytics, trends, and activity</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/landing.png" alt="Landing page" width="100%"/></td>
    <td><img src="docs/screenshots/dashboard.png" alt="Dashboard" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><b>Resume Analyzer</b><br/><sub>Upload & job description input</sub></td>
    <td align="center"><b>Analysis Results</b><br/><sub>Score ring, breakdown & insights</sub></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/analyzer.png" alt="Analyzer" width="100%"/></td>
    <td><img src="docs/screenshots/results.png" alt="Analysis results" width="100%"/></td>
  </tr>
</table>

*Replace placeholder paths after adding screenshots. Images not committed yet will show as broken links until added.*

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/health` | — | API health & DB status |
| `POST` | `/api/auth/signup` | — | Register user |
| `POST` | `/api/auth/login` | — | Login & receive JWT |
| `GET` | `/api/user/profile` | JWT | User profile |
| `PUT` | `/api/user/preferences` | JWT | Theme & export preferences |
| `POST` | `/api/analysis/run` | JWT | Upload resume + JD, run analysis |
| `GET` | `/api/analysis/stats` | Optional | Dashboard analytics |
| `GET` | `/api/analysis/history` | JWT | Past analyses |
| `GET` | `/api/analysis/:id` | JWT | Single analysis detail |

---

## ATS Scoring Model

The deterministic engine evaluates resumes across five dimensions:

```
┌─────────────────────┬──────────┐
│ Keyword Match       │   40%    │
│ Skills Alignment    │   20%    │
│ Experience Quality  │   15%    │
│ Formatting & ATS    │   15%    │
│ Projects            │   10%    │
└─────────────────────┴──────────┘
```

Parsing pipeline: **extract text** → **structure sections** → **score against JD** → **surface insights** (+ optional Gemini layer).

---

## Future Improvements

- [ ] **Role templates** — Pre-built job description templates by industry
- [ ] **Bulk analysis** — Compare multiple resume versions side-by-side
- [ ] **LinkedIn import** — Pull profile data for faster resume generation
- [ ] **Real-time collaboration** — Share analysis links with mentors or recruiters
- [ ] **Email reports** — Scheduled ATS score summaries
- [ ] **Admin panel** — Usage analytics and user management
- [ ] **Docker Compose** — One-command local and production deployment
- [ ] **Unit & integration tests** — Jest/Vitest coverage for engine and API
- [ ] **CI/CD pipeline** — GitHub Actions for lint, test, and deploy
- [ ] **Stripe billing** — Freemium tiers for SaaS monetization

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` on `/api/*` | Start the backend: `cd backend && npm run dev` |
| MongoDB connection failed | Check `MONGO_URI` in `.env`; API still starts with mock dashboard data |
| Auth errors | Ensure `JWT_SECRET` is set in `backend/.env` |
| File upload rejected | Use PDF, DOCX, PNG, or JPG under 5 MB |

---

## Author

**Hafsa Rumaiza**

Full-stack project demonstrating modern React UI, REST API design, JWT security, document parsing, and ATS scoring logic.

---

<div align="center">

**If this project helped you, consider starring the repo.**

Built with React · Express · MongoDB · Gemini

</div>
