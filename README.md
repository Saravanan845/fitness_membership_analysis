# FitTrack Analytics - Engagement & Retention Dashboard

FitTrack Analytics is an intelligent Streamlit dashboard for fitness-center member engagement, churn risk prediction, and retention analytics.

## 🚀 Key Features

- **Executive Analytics Overview:** Real-time KPI cards tracking Total Members, Renewal Rate, Active Members, and High-Risk Members.
- **Visual Distributions:** Bar charts for engagement levels (High, Moderate, Low) and retention risk categories.
- **Retention Insights & Watchlist:** Identifies members needing immediate attention based on visit frequency, class participation, and inactive days.
- **⚡ AI-Powered Autocomplete & Re-engagement Copilot:**
  - **Context-Aware Completions:** Generates tailored outreach suggestions that dynamically incorporate member metrics (days inactive, visit counts, class attendance, risk level).
  - **Real-Time Inline Ghost Text:** Visualizes predictive sentence continuations as you type.
  - **Quick-Apply Suggestion Chips:** 1-click application of AI completions directly into your draft message.
  - **Dual Engine Architecture:** Runs instantly out of the box using a built-in semantic completion engine, with optional live cloud LLM generation via Google Gemini API (`GEMINI_API_KEY`).
  - **Multi-Goal Communication:** Supports Re-engagement Outreach, Special Retention Offers, Class Recommendations, and Check-in & Feedback Inquiries.
- **Data Export:** Instant CSV export for downstream CRM or outreach campaigns.

## 🛠️ Quickstart

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Application
```bash
streamlit run app.py
```

### 3. (Optional) Enable Google Gemini LLM
You can enter your Google Gemini API key in the sidebar settings or set it in your environment:
```bash
export GEMINI_API_KEY="your-api-key"
```

## 📊 Dataset Requirements
The application works out of the box with sample data or uploaded CSVs with the following columns:
- `Member_ID`: Unique member identifier (e.g. M1001)
- `Age`: Member age
- `Visits_Last_30_Days`: Total gym visits in the past month
- `Classes_Attended`: Group fitness sessions attended
- `Days_Since_Last_Visit`: Days elapsed since the member's last visit
- `Monthly_Spend`: Membership and ancillary expenditure
- `Renewed`: 1 (renewed) or 0 (churned/at-risk)
