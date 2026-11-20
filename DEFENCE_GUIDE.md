# 🎓 FitTrack Analytics — Technical Defence & Viva Preparation Guide

**Project / Internship 1 – Fitness Center Membership & Retention Analytics**  
**Technology Stack:** MERN (MongoDB, Express.js, React.js, Node.js) + Bruno + Docker + Google Gemini AI

---

## 📌 Executive Summary

### 1. Problem Statement
Fitness centers face high annual member attrition (often between 35% and 50%). Traditional gyms manually track sign-ups without identifying warning signs such as dwindling attendance frequency, elapsed days since last visit, or unrenewed subscriptions until the member has already permanently churned.

### 2. Solution Developed
**FitTrack Analytics** is an end-to-end MERN web application that replaces static spreadsheets with real-time database-driven retention intelligence. The system automatically computes retention rates, tracks visit frequencies, classifies member engagement into standardized tiers, identifies at-risk members through multi-factor risk algorithms, and employs an AI Retention Insights Copilot to draft personalized re-engagement interventions.

---

## 🏛️ System Architecture & Entity Relationships

```
┌────────────────────────────────────────────────────────┐
│                   React Frontend                       │
│    (Vite + React Router + Context API + Lucide)        │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT Auth)
┌───────────────────────────▼────────────────────────────┐
│                  Express.js Backend                    │
│   Controllers | Middlewares | Aggregation Pipelines     │
└─────────────┬───────────────────────────┬──────────────┘
              │ Mongoose ORM              │ @google/genai
┌─────────────▼─────────────┐   ┌─────────▼──────────────┐
│     MongoDB Database      │   │ Google Gemini Flash /  │
│ - Users (Admins)          │   │ Local AI Retention     │
│ - Members                 │   │ Engine                 │
│ - Memberships             │   └────────────────────────┘
│ - Attendance Logs         │
└───────────────────────────┘
```

### Database Entity Relationships (Task 10)
1. **`User`**: Administrator credentials, encrypted password with `bcryptjs`, and role management.
2. **`Member`**: Core demographic and engagement profile:
   - Primary Key: `_id` & unique indexed `memberId` (e.g. `M1001`)
   - Pre-save hooks automatically compute `engagementLevel` ('High', 'Moderate', 'Low') and `riskLevel` ('Low', 'Moderate', 'High').
3. **`Membership`**: Relational foreign key `memberId` pointing to `Member._id`:
   - Tracks subscription tiers (`Basic Pass`, `Standard Fit`, `Pro Performance`, `Elite VIP`), billing cycle, start/end dates, renewal status, and auto-renew flags.
   - Pre-save hooks evaluate remaining days to flag status (`Active`, `Expiring Soon`, `Expired`).
4. **`Attendance`**: Relational foreign key `memberId` pointing to `Member._id`:
   - Logs check-in timestamp, duration, and activity category (`Open Gym`, `HIIT`, `Yoga`, `Spinning`, etc.).
   - Recording attendance automatically increments `visitsLast30Days` and resets `daysSinceLastVisit` to `0` on the related `Member` document.

---

## 🧮 Mathematical Formulations & Database Aggregation Logic

> [!IMPORTANT]
> All analytical metrics are derived dynamically using native MongoDB `$group`, `$cond`, and `$avg` aggregation pipelines—never hardcoded.

### 1. Retention & Renewal Rates
$$\text{Renewal Rate (\%)} = \left( \frac{\text{Count of Members with } \text{renewed} = \text{true}}{\text{Total Registered Members}} \right) \times 100$$
$$\text{Non-Renewal Rate (\%)} = 100 - \text{Renewal Rate}$$

### 2. Engagement Tier Categorization
- **High Engagement**: $\text{Visits in Last 30 Days} \ge 12$
- **Moderate Engagement**: $5 \le \text{Visits in Last 30 Days} < 12$
- **Low Engagement**: $\text{Visits in Last 30 Days} < 5$

### 3. Churn Risk Classification Algorithm
A member is flagged as **High Risk** if:
$$\text{Days Since Last Visit} > 20 \quad \lor \quad (\text{Visits Last 30 Days} \le 3 \;\land\; \text{renewed} = \text{false})$$
A member is flagged as **Moderate Risk** if:
$$(10 < \text{Days Since Last Visit} \le 20) \quad \lor \quad (4 \le \text{Visits Last 30 Days} \le 7 \;\land\; \text{renewed} = \text{false})$$

### 4. Facility Retention Health Score
A composite health index on a 0–100 scale:
$$\text{Health Score} = (\text{Renewal Rate} \times 0.5) + \left(\min\left(100, \frac{\text{Average Attendance}}{15} \times 100\right) \times 0.3\right) + (\text{Low-Risk Proportion} \times 0.2)$$

---

## 🤖 AI Feature: Retention Insights Assistant (Task 20)

### Dual-Engine Design:
1. **Cloud LLM Engine (Google Gemini 2.5 Flash)**: When `GEMINI_API_KEY` is present in the environment, the backend communicates with the Google GenAI SDK (`@google/genai`) to produce rich contextual analysis, custom administrator prompt Q&A, and personalized multi-channel outreach scripts.
2. **Local Intelligent Heuristic Fallback Engine**: If running offline or without an API key, the built-in heuristic retention engine evaluates the member's exact metrics, calculates churn probability, identifies specific risk drivers, and drafts ready-to-copy communication templates (SMS, WhatsApp, and Email).

---

## 💡 Top 10 Technical Defence / Viva Q&A

### Q1: Why did you choose MERN stack for this fitness analytics project?
**Answer:** The MERN stack provides a unified JavaScript/JSON paradigm across frontend and backend. MongoDB's flexible BSON document model is ideal for hierarchical member data with nested relationships and rapid aggregation queries. React provides a reactive, component-driven UI for real-time dashboard state updates, while Node.js and Express handle concurrent API requests with non-blocking I/O.

### Q2: How did you implement entity relationships in MongoDB?
**Answer:** While MongoDB is a document database, we implemented normalized relationships using Mongoose `Schema.Types.ObjectId` references (`ref: 'Member'`) in both the `Membership` and `Attendance` collections. We utilized Mongoose `.populate()` and MongoDB aggregation pipelines (`$lookup`, `$match`, `$group`) to query related entities and maintain relational integrity. When a member is deleted, our controller executes a cascade deletion removing all associated membership and attendance records.

### Q3: How is user authentication secured?
**Answer:** Passwords are never stored in plain text; they are hashed using `bcryptjs` with 10 salt rounds before persistence. Upon successful login, the server signs a JSON Web Token (JWT) containing the user ID with an expiration of 30 days. Protected routes use the `authMiddleware.js` (`protect`) function to extract the Bearer token from the `Authorization` header, verify the cryptographic signature, and reject unauthorized requests with HTTP 401.

### Q4: How does the application handle third-party authentication?
**Answer:** The system features an OAuth authentication integration endpoint (`POST /api/auth/oauth-login`). The frontend allows administrators to sign in with Google; the backend validates or provisions the account, assigns appropriate roles, and generates a signed JWT token allowing seamless dashboard access.

### Q5: How is CSV file upload implemented?
**Answer:** We utilize `multer` configured with memory storage (`multer.memoryStorage()`) to handle multipart form data uploads without writing temporary files to disk. The buffer is piped directly into a `csv-parser` stream, where each row is validated, mapped to member fields, upserted into the MongoDB collection, and assigned an initial membership plan.

### Q6: How do you calculate Renewal Rate from the database?
**Answer:** We execute a MongoDB aggregation pipeline using `$group` that sums conditional matches:
```javascript
renewedCount: { $sum: { $cond: [{ $eq: ['$renewed', true] }, 1, 0] } }
```
The renewal rate percentage is calculated as `(renewedCount / totalMembers) * 100`, ensuring the value is directly computed from active records.

### Q7: What is Bruno and why was it used instead of Postman?
**Answer:** Bruno is an open-source, Git-friendly API client. Unlike traditional tools that store API requests in proprietary cloud accounts, Bruno stores collection definitions as human-readable `.bru` plain-text files directly within our repository (`bruno/`). This allows API requests, environments, and automated assertions to be version-controlled alongside the application code.

### Q8: How is the application containerized with Docker?
**Answer:** We created a multi-container architecture orchestrated via `docker-compose.yml`:
1. `mongodb`: Official Mongo 7.0 image with persistent volume storage and ping healthchecks.
2. `backend`: Node 20 alpine image running the Express API.
3. `frontend`: Multi-stage Docker build that compiles Vite/React assets and serves them via Nginx with reverse proxy rules routing `/api` requests to the backend.

### Q9: What happens if MongoDB is offline or local mongod is not started?
**Answer:** In `backend/config/db.js`, we implemented robust connection handling with timeout configurations and clear console warnings advising the administrator to connect to MongoDB Atlas (`MONGODB_URI`). In addition, the seed script checks whether the database is empty and automatically provisions default accounts and member records upon first run.

### Q10: How does the AI feature prevent hallucination when generating retention insights?
**Answer:** The AI model is supplied with exact, verified database parameters in its prompt context (exact days inactive, number of visits, monthly spend, renewal state). Furthermore, our dual-engine architecture includes a deterministic local heuristic fallback engine that computes churn probabilities and intervention playbooks based on established fitness industry retention benchmarks.
