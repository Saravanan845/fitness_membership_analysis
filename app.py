import os
import streamlit as st
import pandas as pd
import numpy as np
from autocomplete_engine import AIAutocompleteEngine

st.set_page_config(page_title="FitTrack Analytics", page_icon="🏋️", layout="wide")

st.markdown("""
<style>
.main { background:#f8fafc; }
.metric-card {
    background:white;
    padding:20px;
    border-radius:14px;
    border:1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.metric-title {color:#64748b;font-size:12px;font-weight:700;letter-spacing:0.5px;}
.metric-value {font-size:32px;font-weight:800;margin-top:6px;color:#0f172a;}

.ai-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 20px;
    margin-top: 15px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
}

.ghost-text-box {
    background: #f1f5f9;
    border-left: 4px solid #6366f1;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    color: #334155;
    margin: 10px 0;
}

.suggestion-chip {
    background: #eef2ff;
    color: #4338ca;
    border: 1px solid #c7d2fe;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 8px;
    font-size: 13.5px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.member-badge-high {
    background: #fee2e2;
    color: #991b1b;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}
.member-badge-medium {
    background: #fef3c7;
    color: #92400e;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}
.member-badge-low {
    background: #dcfce7;
    color: #166534;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
}
</style>
""", unsafe_allow_html=True)

def demo_data():
    rng = np.random.default_rng(7)
    n = 80
    visits = rng.integers(1, 25, n)
    classes = rng.integers(0, 10, n)
    days = rng.integers(1, 45, n)
    renewed = ((visits >= 9) & (days <= 16) & (classes >= 2)).astype(int)
    return pd.DataFrame({
        "Member_ID": [f"M{1001+i}" for i in range(n)],
        "Age": rng.integers(18, 55, n),
        "Visits_Last_30_Days": visits,
        "Classes_Attended": classes,
        "Days_Since_Last_Visit": days,
        "Monthly_Spend": rng.integers(800, 5000, n),
        "Renewed": renewed
    })

def prepare(df):
    df = df.copy()
    required = ["Member_ID", "Visits_Last_30_Days", "Classes_Attended", "Days_Since_Last_Visit", "Renewed"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        st.error("Missing columns: " + ", ".join(missing))
        st.stop()
    for c in required[1:]:
        df[c] = pd.to_numeric(df[c], errors="coerce").fillna(0)

    def risk(r):
        score = 0
        if r.Days_Since_Last_Visit > 21: score += 3
        elif r.Days_Since_Last_Visit > 14: score += 2
        elif r.Days_Since_Last_Visit > 7: score += 1
        if r.Visits_Last_30_Days < 5: score += 2
        elif r.Visits_Last_30_Days < 10: score += 1
        if r.Classes_Attended == 0: score += 1
        return "High" if score >= 4 else ("Medium" if score >= 2 else "Low")

    df["Risk_Level"] = df.apply(risk, axis=1)
    df["Engagement"] = pd.cut(df["Visits_Last_30_Days"], [-1, 4, 9, 100], labels=["Low", "Moderate", "High"])
    return df

st.title("🏋️ FitTrack Analytics")
st.caption("Member engagement & retention analytics dashboard with AI-Powered Copilot")

with st.sidebar:
    st.header("⚙️ Data & Settings")
    upload = st.file_uploader("Upload member CSV", type=["csv"])
    df = prepare(pd.read_csv(upload)) if upload else prepare(demo_data())
    if not upload:
        st.info("Showing sample dataset (80 members)")
    risks = st.multiselect("Filter Risk Level", ["High", "Medium", "Low"], ["High", "Medium", "Low"])
    
    st.markdown("---")
    st.header("🤖 AI Autocomplete Settings")
    api_key_input = st.text_input(
        "Google Gemini API Key (Optional)",
        value=os.environ.get("GEMINI_API_KEY", ""),
        type="password",
        help="Optional: Enter a Gemini API Key to enable live cloud LLM completions. Leave blank to use built-in AI semantic engine."
    )
    if api_key_input:
        st.success("✨ Gemini LLM API active")
    else:
        st.info("🟢 Built-in Semantic AI Engine active")

total = len(df)
renewal = df.Renewed.mean() * 100
active = (df.Days_Since_Last_Visit <= 14).mean() * 100
high = (df.Risk_Level == "High").sum()

cols = st.columns(4)
metrics = [
    ("TOTAL MEMBERS", total, "Members in dataset"),
    ("RENEWAL RATE", f"{renewal:.0f}%", "Current sample renewal"),
    ("ACTIVE MEMBERS", f"{active:.0f}%", "Visited in last 14 days"),
    ("HIGH-RISK MEMBERS", high, "Need re-engagement")
]
for c, (a, b, d) in zip(cols, metrics):
    c.markdown(
        f'<div class="metric-card"><div class="metric-title">{a}</div>'
        f'<div class="metric-value">{b}</div>'
        f'<div style="color:#64748b;font-size:12px;margin-top:4px;">{d}</div></div>',
        unsafe_allow_html=True
    )

left, right = st.columns(2)
with left:
    st.subheader("Engagement Distribution")
    st.bar_chart(df.Engagement.value_counts().reindex(["High", "Moderate", "Low"]).fillna(0))
with right:
    st.subheader("Retention Risk")
    st.bar_chart(df.Risk_Level.value_counts().reindex(["Low", "Medium", "High"]).fillna(0))

st.subheader("📌 Retention Insights")
a, b, c = st.columns(3)
a.info(f"**{(df.Visits_Last_30_Days < 5).sum()} members** have fewer than 5 visits this month.")
b.warning(f"**{(df.Days_Since_Last_Visit > 14).sum()} members** have not visited for more than 14 days.")
c.success(f"**{(df.Classes_Attended >= 4).sum()} members** attended 4+ classes.")

st.subheader("⚠️ Members Needing Attention")
table = df[df.Risk_Level.isin(risks) & df.Risk_Level.isin(["High", "Medium"])].sort_values("Days_Since_Last_Visit", ascending=False)
st.dataframe(
    table[["Member_ID", "Age", "Visits_Last_30_Days", "Classes_Attended", "Days_Since_Last_Visit", "Risk_Level", "Renewed"]],
    use_container_width=True,
    hide_index=True
)

# =========================================================
# ⚡ AI-POWERED AUTOCOMPLETE & MEMBER OUTREACH COPILOT
# =========================================================
st.markdown("---")
st.subheader("⚡ AI Autocomplete & Member Re-engagement Copilot")
st.caption("Draft personalized member communications and retention offers with real-time AI autocomplete assistance.")

# Initialize session state for draft text
if "ai_draft_text" not in st.session_state:
    st.session_state.ai_draft_text = "We noticed you haven't visited"

engine = AIAutocompleteEngine(api_key=api_key_input if api_key_input else None)

ai_col1, ai_col2 = st.columns([1, 1])

with ai_col1:
    st.markdown("##### 1. Select Target Member & Context")
    member_options = ["None (General Campaign)"] + [
        f"{row.Member_ID} (Risk: {row.Risk_Level}, Inactive: {int(row.Days_Since_Last_Visit)}d, Visits: {int(row.Visits_Last_30_Days)})"
        for _, row in table.iterrows()
    ]
    selected_member_str = st.selectbox("Target Member", member_options, index=1 if len(member_options) > 1 else 0)
    
    # Extract member metrics for context
    member_context = None
    if selected_member_str != "None (General Campaign)":
        m_id = selected_member_str.split(" ")[0]
        m_row = df[df.Member_ID == m_id].iloc[0]
        member_context = {
            "member_id": m_id,
            "risk_level": m_row.Risk_Level,
            "days_inactive": int(m_row.Days_Since_Last_Visit),
            "visits": int(m_row.Visits_Last_30_Days),
            "classes": int(m_row.Classes_Attended),
            "monthly_spend": int(m_row.Monthly_Spend)
        }
        badge_class = f"member-badge-{m_row.Risk_Level.lower()}"
        st.markdown(
            f'<div style="background:#f8fafc;padding:10px 14px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:12px;">'
            f'<strong>Context:</strong> Member <b>{m_id}</b> | '
            f'<span class="{badge_class}">{m_row.Risk_Level} Risk</span> | '
            f'<b>{int(m_row.Days_Since_Last_Visit)}</b> days inactive | '
            f'<b>{int(m_row.Visits_Last_30_Days)}</b> visits this month | '
            f'<b>{int(m_row.Classes_Attended)}</b> classes attended'
            f'</div>',
            unsafe_allow_html=True
        )

    outreach_category = st.radio(
        "Communication Goal",
        ["Re-engagement Outreach", "Special Retention Offer", "Class & Training Recommendation", "Check-in & Feedback Inquiry"],
        horizontal=True
    )

    st.markdown("##### 2. Quick Starter Phrases")
    chip_cols = st.columns(4)
    if chip_cols[0].button("👋 'We noticed...'"):
        st.session_state.ai_draft_text = "We noticed you haven't visited"
        st.rerun()
    if chip_cols[1].button("🎯 'To help you...'"):
        st.session_state.ai_draft_text = "To help you stay on track"
        st.rerun()
    if chip_cols[2].button("🎁 'Renew your...'"):
        st.session_state.ai_draft_text = "Renew your membership this week"
        st.rerun()
    if chip_cols[3].button("🌟 'As a valued...'"):
        st.session_state.ai_draft_text = "As a valued member of FitTrack"
        st.rerun()

    draft_input = st.text_area(
        "Type your message draft (AI will suggest context-aware completions):",
        value=st.session_state.ai_draft_text,
        height=110,
        help="Type or select a completion suggestion from the right panel to autocomplete your outreach message."
    )
    if draft_input != st.session_state.ai_draft_text:
        st.session_state.ai_draft_text = draft_input

with ai_col2:
    st.markdown("##### 3. AI Autocomplete Suggestions")
    
    # Generate completions using the engine
    completions = engine.get_completions(
        prefix=st.session_state.ai_draft_text,
        category=outreach_category,
        member_context=member_context,
        max_suggestions=3
    )

    if completions:
        st.markdown(
            f'<div class="ghost-text-box">'
            f'<b>🤖 Inline Autocomplete Preview:</b><br>'
            f'<span>{st.session_state.ai_draft_text}</span> '
            f'<span style="color:#6366f1;font-weight:600;">{completions[0]}</span>'
            f'</div>',
            unsafe_allow_html=True
        )

        st.markdown("**Click an AI suggestion below to autocomplete your draft:**")
        for idx, comp in enumerate(completions):
            col_comp_text, col_comp_btn = st.columns([4, 1])
            with col_comp_text:
                st.markdown(
                    f'<div style="background:#f8fafc;padding:9px 12px;border-radius:6px;border:1px solid #cbd5e1;font-size:13px;margin-bottom:6px;">'
                    f'✨ <i>"...{comp}"</i>'
                    f'</div>',
                    unsafe_allow_html=True
                )
            with col_comp_btn:
                if st.button("Apply", key=f"apply_comp_{idx}"):
                    # Append completion seamlessly
                    current = st.session_state.ai_draft_text.rstrip()
                    if current and not current.endswith((".", "!", "?")):
                        st.session_state.ai_draft_text = f"{current} {comp}"
                    else:
                        st.session_state.ai_draft_text = f"{current} {comp}".strip()
                    st.rerun()
    else:
        st.info("Keep typing to see dynamic AI completions...")

    st.markdown("##### 4. Ready-to-Send Outreach Preview")
    full_preview = st.session_state.ai_draft_text.strip()
    recipient_tag = f"To: {member_context['member_id']} (Gym Member)" if member_context else "To: Member"
    st.markdown(
        f'<div style="background:white;padding:16px;border-radius:10px;border:1px solid #cbd5e1;box-shadow:0 1px 3px rgba(0,0,0,0.05);">'
        f'<div style="font-size:11px;color:#94a3b8;font-weight:700;text-transform:uppercase;margin-bottom:6px;">{recipient_tag}</div>'
        f'<div style="font-size:14px;color:#1e293b;line-height:1.5;">{full_preview if full_preview else "Draft message is empty."}</div>'
        f'</div>',
        unsafe_allow_html=True
    )
    
    col_clear, col_copy = st.columns([1, 1])
    if col_clear.button("🗑️ Clear Draft"):
        st.session_state.ai_draft_text = ""
        st.rerun()
    if col_copy.button("✅ Confirm & Ready to Send"):
        st.success("Outreach message ready! Copied to campaign queue.")

st.markdown("---")
st.subheader("💡 Recommended Retention Strategies")
st.markdown("""
- **High risk:** Personal follow-up + suitable class/training offer (use the AI Copilot above to draft outreach).
- **Medium risk:** Reminder + promote relevant classes.
- **Low risk:** Maintain engagement using progress updates and loyalty benefits.
""")

st.download_button(
    "⬇️ Download Analyzed Data",
    df.to_csv(index=False).encode(),
    "fitness_engagement_analysis.csv",
    "text/csv"
)
