import streamlit as st
import pandas as pd
import numpy as np

st.set_page_config(page_title="FitTrack Analytics", page_icon="🏋️", layout="wide")

st.markdown("""
<style>
.main { background:#f6f8fb; }
.metric-card {background:white;padding:18px;border-radius:14px;border:1px solid #e5e9ef;}
.metric-title {color:#687386;font-size:12px;font-weight:700;}
.metric-value {font-size:30px;font-weight:800;margin-top:6px;}
</style>
""", unsafe_allow_html=True)

def demo_data():
    rng=np.random.default_rng(7); n=80
    visits=rng.integers(1,25,n); classes=rng.integers(0,10,n); days=rng.integers(1,45,n)
    renewed=((visits>=9)&(days<=16)&(classes>=2)).astype(int)
    return pd.DataFrame({
        "Member_ID":[f"M{1001+i}" for i in range(n)],
        "Age":rng.integers(18,55,n),
        "Visits_Last_30_Days":visits,
        "Classes_Attended":classes,
        "Days_Since_Last_Visit":days,
        "Monthly_Spend":rng.integers(800,5000,n),
        "Renewed":renewed
    })

def prepare(df):
    df=df.copy()
    required=["Member_ID","Visits_Last_30_Days","Classes_Attended","Days_Since_Last_Visit","Renewed"]
    missing=[c for c in required if c not in df.columns]
    if missing:
        st.error("Missing columns: "+", ".join(missing)); st.stop()
    for c in required[1:]:
        df[c]=pd.to_numeric(df[c],errors="coerce").fillna(0)

    def risk(r):
        score=0
        if r.Days_Since_Last_Visit>21: score+=3
        elif r.Days_Since_Last_Visit>14: score+=2
        elif r.Days_Since_Last_Visit>7: score+=1
        if r.Visits_Last_30_Days<5: score+=2
        elif r.Visits_Last_30_Days<10: score+=1
        if r.Classes_Attended==0: score+=1
        return "High" if score>=4 else ("Medium" if score>=2 else "Low")

    df["Risk_Level"]=df.apply(risk,axis=1)
    df["Engagement"]=pd.cut(df["Visits_Last_30_Days"],[-1,4,9,100],labels=["Low","Moderate","High"])
    return df

st.title("🏋️ FitTrack Analytics")
st.caption("Member engagement & retention analytics dashboard")

with st.sidebar:
    st.header("Data")
    upload=st.file_uploader("Upload member CSV",type=["csv"])
    df=prepare(pd.read_csv(upload)) if upload else prepare(demo_data())
    if not upload: st.info("Showing sample data")
    risks=st.multiselect("Risk level",["High","Medium","Low"],["High","Medium","Low"])

total=len(df); renewal=df.Renewed.mean()*100
active=(df.Days_Since_Last_Visit<=14).mean()*100
high=(df.Risk_Level=="High").sum()

cols=st.columns(4)
metrics=[("TOTAL MEMBERS",total,"Members in dataset"),
         ("RENEWAL RATE",f"{renewal:.0f}%","Current sample renewal"),
         ("ACTIVE MEMBERS",f"{active:.0f}%","Visited in last 14 days"),
         ("HIGH-RISK MEMBERS",high,"Need re-engagement")]
for c,(a,b,d) in zip(cols,metrics):
    c.markdown(f'<div class="metric-card"><div class="metric-title">{a}</div><div class="metric-value">{b}</div><div style="color:#7b8494;font-size:12px">{d}</div></div>',unsafe_allow_html=True)

left,right=st.columns(2)
with left:
    st.subheader("Engagement Distribution")
    st.bar_chart(df.Engagement.value_counts().reindex(["High","Moderate","Low"]).fillna(0))
with right:
    st.subheader("Retention Risk")
    st.bar_chart(df.Risk_Level.value_counts().reindex(["Low","Medium","High"]).fillna(0))

st.subheader("📌 Retention Insights")
a,b,c=st.columns(3)
a.info(f"**{(df.Visits_Last_30_Days<5).sum()} members** have fewer than 5 visits this month.")
b.warning(f"**{(df.Days_Since_Last_Visit>14).sum()} members** have not visited for more than 14 days.")
c.success(f"**{(df.Classes_Attended>=4).sum()} members** attended 4+ classes.")

st.subheader("⚠️ Members Needing Attention")
table=df[df.Risk_Level.isin(risks)&df.Risk_Level.isin(["High","Medium"])].sort_values("Days_Since_Last_Visit",ascending=False)
st.dataframe(table[["Member_ID","Age","Visits_Last_30_Days","Classes_Attended","Days_Since_Last_Visit","Risk_Level","Renewed"]],use_container_width=True,hide_index=True)

st.subheader("💡 Recommended Actions")
st.markdown("""
- **High risk:** Personal follow-up + suitable class/training offer.
- **Medium risk:** Reminder + promote relevant classes.
- **Low risk:** Maintain engagement using progress updates and loyalty benefits.
""")

st.download_button("⬇️ Download Analyzed Data",df.to_csv(index=False).encode(), "fitness_engagement_analysis.csv","text/csv")
