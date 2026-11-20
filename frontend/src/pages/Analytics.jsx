import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { getAnalyticsOverview, getAtRiskMembers, getChartAnalytics } from '../services/analyticsService';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  Activity,
  Sparkles,
  RefreshCw,
  PieChart,
  ShieldAlert
} from 'lucide-react';

const Analytics = ({ onOpenAiModal, onOpenMembershipModal }) => {
  const [overview, setOverview] = useState(null);
  const [atRiskMembers, setAtRiskMembers] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [overviewRes, atRiskRes, chartRes] = await Promise.all([
        getAnalyticsOverview(),
        getAtRiskMembers(),
        getChartAnalytics()
      ]);

      setOverview(overviewRes.data);
      setAtRiskMembers(atRiskRes.data);
      setChartData(chartRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid #334155', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Executing MongoDB Aggregation Pipelines for retention analytics...</p>
      </div>
    );
  }

  const renewalPercent = overview?.renewalRate || 0;
  const nonRenewalPercent = overview?.nonRenewalRate || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Retention & Churn Risk Analytics
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Quantitative statistical analysis calculated from database records
          </p>
        </div>

        <button onClick={loadAnalytics} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
          <RefreshCw size={14} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* 6 Core Requirements KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* 1. Total Registered Members */}
        <MetricCard
          title="1. Total Registered"
          value={overview?.totalMembers || 0}
          subtitle="All active member accounts"
          icon={Users}
          color="indigo"
          trend="Total cohort size"
          trendType="neutral"
        />

        {/* 2. Renewal Rate */}
        <MetricCard
          title="2. Renewal Rate"
          value={`${overview?.renewalRate || 0}%`}
          subtitle={`${overview?.renewedCount || 0} of ${overview?.totalMembers || 0} renewed`}
          icon={TrendingUp}
          color="emerald"
          trend="Members who retained"
          trendType="positive"
        />

        {/* 3. Non-Renewal Rate */}
        <MetricCard
          title="3. Non-Renewal Rate"
          value={`${overview?.nonRenewalRate || 0}%`}
          subtitle={`${overview?.nonRenewedCount || 0} of ${overview?.totalMembers || 0} lapsed`}
          icon={TrendingDown}
          color="rose"
          trend="Attrition / churned"
          trendType="negative"
        />

        {/* 4. Average Attendance */}
        <MetricCard
          title="4. Avg Attendance"
          value={`${overview?.averageAttendance || 0} visits`}
          subtitle={`Avg ${overview?.averageClasses || 0} group classes`}
          icon={Activity}
          color="amber"
          trend="Past 30-day average"
          trendType="neutral"
        />

        {/* 5. Inactivity Period */}
        <MetricCard
          title="Avg Inactive Days"
          value={`${overview?.averageDaysInactive || 0} days`}
          subtitle="Days since last visit"
          icon={BarChart3}
          color="purple"
          trend="Across total membership"
          trendType="neutral"
        />

        {/* 6. Potentially At-Risk Members */}
        <MetricCard
          title="6. At-Risk Members"
          value={overview?.atRiskCount || 0}
          subtitle="High churn probability"
          icon={AlertTriangle}
          color="rose"
          trend="Immediate attention needed"
          trendType="negative"
        />
      </div>

      {/* Analytical Breakdown Visual Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Renewal Rate vs Churn Comparison Card */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <PieChart size={18} color="#818cf8" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Renewal vs. Non-Renewal Distribution
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Visual Bar Comparison */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.35rem' }}>
                <span style={{ color: '#34d399', fontWeight: 600 }}>Renewed ({renewalPercent}%)</span>
                <span style={{ color: '#f87171', fontWeight: 600 }}>Non-Renewed ({nonRenewalPercent}%)</span>
              </div>
              <div style={{ display: 'flex', height: '14px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#1e293b' }}>
                <div style={{ width: `${renewalPercent}%`, backgroundColor: '#10b981', transition: 'width 0.5s ease' }}></div>
                <div style={{ width: `${nonRenewalPercent}%`, backgroundColor: '#ef4444', transition: 'width 0.5s ease' }}></div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '0.5rem', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 700, textTransform: 'uppercase' }}>Retained Cohort</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  {overview?.renewedCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Members with active renewed status
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '0.5rem', padding: '1rem' }}>
                <div style={{ fontSize: '0.75rem', color: '#fecdd3', fontWeight: 700, textTransform: 'uppercase' }}>Non-Renewed / Lapsed</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginTop: '0.2rem' }}>
                  {overview?.nonRenewedCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                  Members requiring retention intervention
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Engagement Levels Breakdown */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Activity size={18} color="#34d399" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              5. Member Engagement Levels
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* High Engagement */}
            <div style={{ background: '#1e293b', padding: '0.875rem', borderRadius: '0.5rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>High Engagement (≥12 visits/mo)</span>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Consistent gym goers & class participants</div>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>
                  {overview?.engagementBreakdown?.High || 0}
                </span>
              </div>
            </div>

            {/* Moderate Engagement */}
            <div style={{ background: '#1e293b', padding: '0.875rem', borderRadius: '0.5rem', borderLeft: '4px solid #3b82f6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>Moderate Engagement (5 - 11 visits/mo)</span>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Regular attendees with steady habits</div>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>
                  {overview?.engagementBreakdown?.Moderate || 0}
                </span>
              </div>
            </div>

            {/* Low Engagement */}
            <div style={{ background: '#1e293b', padding: '0.875rem', borderRadius: '0.5rem', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>Low Engagement (&lt;5 visits/mo)</span>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Infrequent visits — prime candidate for churn</div>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>
                  {overview?.engagementBreakdown?.Low || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comprehensive Potentially At-Risk Members Table */}
      <div className="card-glass" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert size={20} color="#f87171" />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                6. Potentially At-Risk Members ({atRiskMembers.length} identified)
              </h3>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Real database records filtered by churn risk algorithms (inactive &gt;14 days, visits &le;3, or unrenewed)
            </p>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', background: '#1e293b', padding: '0.4rem 0.75rem', borderRadius: '0.375rem', border: '1px solid #334155' }}>
            Auto-calculated via Mongoose Aggregation
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Age / Spend</th>
                <th>Days Inactive</th>
                <th>Visits (30d)</th>
                <th>Identified Risk Drivers</th>
                <th>Recommended Retention Action</th>
                <th style={{ textAlign: 'right' }}>Outreach</th>
              </tr>
            </thead>
            <tbody>
              {atRiskMembers.length > 0 ? (
                atRiskMembers.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>{member.memberId}</div>
                    </td>
                    <td>
                      <div>Age {member.age}</div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399' }}>${member.monthlySpend}/mo</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, color: member.daysSinceLastVisit > 20 ? '#f87171' : '#fbbf24' }}>
                        {member.daysSinceLastVisit} days
                      </span>
                    </td>
                    <td>
                      <div>{member.visitsLast30Days} visits</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{member.classesAttended} classes</div>
                    </td>
                    <td>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        {member.riskReasons?.map((r, i) => (
                          <li key={i} style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
                            • {r}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#c7d2fe', fontWeight: 500 }}>
                      {member.recommendedAction}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => onOpenAiModal(member)}
                          className="btn-ai"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Generate AI retention strategy"
                        >
                          <Sparkles size={14} />
                          <span>AI Copilot</span>
                        </button>
                        <button
                          onClick={() => onOpenMembershipModal(member)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Renew Membership"
                        >
                          <RefreshCw size={14} color="#34d399" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No members are currently at risk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
