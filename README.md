# FitTrack Analytics — Fitness Center Membership & Retention Analytics

**Project / Internship 1 — Kalvium Full-Stack Capstone**
**Student:** Saravanan
**GitHub Repository:** https://github.com/Saravanan845/fitness_membership_analysis

---

## 🏋️ Project Title
**FitTrack Analytics — Fitness Center Membership & Retention Intelligence Platform**

---

## 💡 Project Idea & Description

### Problem Statement
Fitness centers suffer from an average annual member churn rate of 35–50%. Traditional gyms rely on spreadsheets and manual record-keeping without proactively identifying members at risk of cancellation until it is too late. There is no live intelligence connecting attendance patterns, payment history, class participation, and renewal behaviour into actionable retention decisions.

### Solution
**FitTrack Analytics** is a full-stack MERN web application that transforms raw gym membership data into real-time retention intelligence. The platform:

- **Tracks** every member's visit frequency, class attendance, days since last gym visit, and monthly spend — all stored in a **MongoDB database** with Mongoose schemas.
- **Calculates** live analytics (renewal rate, non-renewal rate, average attendance, engagement tiers, and churn risk scores) using **MongoDB aggregation pipelines** — values are never hardcoded.
- **Classifies** members into three engagement tiers (High, Moderate, Low) and three risk levels (High, Moderate, Low) using automatic pre-save logic on the Member model.
- **Surfaces** a priority watchlist of "potentially at-risk" members who have been absent for more than 14 days, have fewer than 3 visits per month, or have lapsed memberships.
- **Generates** personalised AI-driven retention outreach scripts and engagement strategies using **Google Gemini 2.5 Flash** (with a built-in offline heuristic fallback engine).
- **Provides** admin-only access through **JWT authentication**, **bcrypt-hashed passwords**, and a simulated **Google OAuth third-party SSO** integration.
- **Deploys** as a containerised multi-service application via **Docker Compose** (MongoDB + Express backend + React Nginx frontend).

### Technology Stack
| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + React Router DOM + Lucide Icons |
| Backend | Node.js + Express.js REST API |
| Database | MongoDB + Mongoose ORM |
| Authentication | JWT (jsonwebtoken) + bcryptjs |
| AI Feature | Google Gemini 2.5 Flash + local heuristic engine |
| Testing | Jest + Supertest |
| API Docs | Bruno Collection |
| Deployment | Docker Compose + Render (backend) + Vercel (frontend) |

---

## 📅 Day-by-Day Capstone Development Plan

### Week 1 — Project Setup & Backend Foundation

**Day 1 (Phase 1 — Task 1–2): GitHub & React Initialization**
- Create GitHub repository `fitness_membership_analysis`
- Initialise React + Vite frontend application (`npm create vite@latest`)
- Set up folder structure: `frontend/`, `backend/`, `tests/`, `bruno/`
- Write initial `README.md` with project overview

**Day 2 (Phase 1 — Task 3–4): React Components & Database Schema**
- Build reusable React components: `Navbar`, `Sidebar`, `MetricCard`, `StatusBadge`, `ProtectedRoute`
- Design MongoDB schemas with Mongoose: `User`, `Member`, `Membership`, `Attendance`
- Define pre-save hooks for automatic `engagementLevel` and `riskLevel` calculation
- Configure `AuthContext.jsx` for JWT state management

**Day 3 (Phase 2 — Task 5–6): MongoDB Connection & GET API**
- Write `backend/config/db.js` with MongoDB connection and reconnect logic
- Create `GET /api/members` with multi-field search, filters (risk, engagement, renewal, status), sorting, and pagination
- Create `GET /api/members/:id` with Mongoose `.populate()` for entity relationships
- Create `GET /api/analytics/overview` using MongoDB `$group` aggregation pipeline
- Test all GET endpoints using Bruno

**Day 4 (Phase 2 — Task 7–9): POST, PUT, DELETE APIs**
- Implement `POST /api/members` — create member with auto engagement/risk calculation
- Implement `PUT /api/members/:id` — update member fields, trigger pre-save recomputation
- Implement `DELETE /api/members/:id` — cascade delete linked memberships and attendance
- Add `POST /api/attendance` — record gym check-in and auto-update member visit stats
- Add `POST /api/memberships/renew` — renew subscription with plan tier selection

**Day 5 (Phase 2 — Task 10): Entity Relationships**
- Link `Membership` and `Attendance` to `Member` via Mongoose `ObjectId` references
- Use `.populate()` to join documents across collections on member detail view
- Write `GET /api/analytics/at-risk` — MongoDB query for churn-risk members with enriched explanations
- Write database seeder script (`utils/seedData.js`) to populate 15 sample members

---

### Week 2 — Authentication, Upload, AI & Frontend Pages

**Day 6 (Phase 3 — Task 11–12): Username/Password Auth & JWT**
- Implement `POST /api/auth/register` with bcrypt password hashing
- Implement `POST /api/auth/login` returning signed JWT token
- Write `authMiddleware.js` — verify Bearer token on all protected routes
- Build React `Login.jsx` page with form validation and error display

**Day 7 (Phase 3 — Task 13–14): OAuth & File Upload**
- Implement `POST /api/auth/oauth-login` for Google SSO simulation
- Add Google SSO button to `Login.jsx` with `AuthContext.thirdPartyLogin()`
- Implement `POST /api/upload/csv` using Multer + csv-parser for batch member import
- Build `CsvUploadModal.jsx` with drag-and-drop file input and upload progress

**Day 8 (Phase 3 — Task 15): Bruno API Documentation**
- Document all API endpoints in Bruno collection (`bruno/` directory)
- Create requests for: Auth, Members (CRUD), Attendance, Memberships, Analytics, AI, Upload
- Configure `Local.bru` environment with `baseUrl` and auto-inject `jwtToken` variable
- Test all 21 endpoints end-to-end with Bruno

**Day 9 (Phase 4): Dashboard, Members & Attendance Pages**
- Build `Dashboard.jsx` — executive KPI cards, retention gauge, top at-risk member list
- Build `Members.jsx` — CRUD data table with inline action buttons, search, filters, pagination
- Build `Attendance.jsx` — daily check-in recorder, activity distribution chart, log viewer

**Day 10 (Phase 4): Membership, Analytics & Reports Pages**
- Build `Membership.jsx` — plan tier cards, expiry countdown badges, renewal workflow
- Build `Analytics.jsx` — 6 core metric visualisations from live database aggregation
- Build `Reports.jsx` — downloadable CSV and JSON analytical report generator

---

### Week 3 — AI Feature, Testing, Docker & Deployment

**Day 11 (Phase 5 — Task 20): AI Retention Insights Assistant**
- Write `aiController.js` integrating Google Gemini 2.5 Flash API (`@google/genai`)
- Build local heuristic fallback engine for zero-API-key offline operation
- Create `RetentionAiModal.jsx` — dual-tab member diagnostics and club-level strategy
- Implement churn probability calculation, risk factor breakdown, and re-engagement message drafts

**Day 12 (Phase 5 — Task 18): Jest Automated Testing**
- Write `tests/setup.js` — test database connection setup and teardown
- Write `tests/auth.test.js` — registration, login, JWT, and OAuth tests with Supertest
- Write `tests/member.test.js` — Member CRUD API integration tests
- Write `tests/analytics.test.js` — database aggregation accuracy validation tests
- Run full test suite: `cd backend && npm test`

**Day 13 (Phase 5 — Task 19): Docker Containerisation**
- Write `backend/Dockerfile` — Node.js 20 Alpine production image
- Write `frontend/Dockerfile` — multi-stage Vite build + Nginx SPA server
- Write `docker-compose.yml` — orchestrates MongoDB + backend + frontend with health checks
- Test full Docker stack: `docker-compose up --build`

**Day 14 (Phase 5 — Task 16–17): Backend & Frontend Deployment**
- Configure `render.yaml` for Render.com backend deployment
- Configure `frontend/vercel.json` for Vercel SPA deployment with API proxy rewrites
- Set environment variables on hosting platforms: `MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`
- Verify live deployment URLs and update `README.md` with live links

**Day 15 (Phase 5 — Task 21): Final Submission & Technical Defence**
- Complete `DEFENCE_GUIDE.md` with architectural justifications, MongoDB pipeline explanations, and viva Q&A
- Final end-to-end feature walkthrough and cross-browser testing
- Record a 3–5 minute project demo video
- Submit GitHub repository PR link and deployed application URLs for Kalvium evaluation

---

## 🚀 Quick Start

```bash
# Backend (Terminal 1)
cd backend
npm install
npm run seed      # Seed admin + 15 sample members
npm run dev       # Starts on http://localhost:5000

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev       # Starts on http://localhost:5173
```

**Login credentials:** Username: `admin` | Password: `adminpassword123`

---

## 📊 Analytics Calculations (From MongoDB Records)

| Metric | Database Formula |
|---|---|
| Total Registered Members | `Member.countDocuments()` |
| Renewal Rate | `(renewedCount / totalMembers) × 100` |
| Non-Renewal Rate | `100 - renewalRate` |
| Average Attendance | `$avg: '$visitsLast30Days'` via `$group` |
| High Engagement | `visitsLast30Days >= 12` |
| Moderate Engagement | `visitsLast30Days >= 5 && < 12` |
| Low Engagement | `visitsLast30Days < 5` |
| At-Risk Members | `daysSinceLastVisit > 14 OR riskLevel = 'High' OR renewed = false` |

---

## 📄 License
ISC License — Developed for Kalvium Project / Internship 1 Capstone.
