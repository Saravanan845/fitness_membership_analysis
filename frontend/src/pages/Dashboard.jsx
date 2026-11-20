import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { getAnalyticsOverview, getAtRiskMembers } from '../services/analyticsService';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  CalendarCheck,
  UserPlus
} from 'lucide-react';

const Dashboard = ({ onOpenMemberModal, onOpenAttendanceModal, onOpenAiModal }) => {
  const [metrics, setMetrics] = useState(null);
  const [atRiskList, setAtRiskList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, atRiskRes] = await Promise.all([
        getAnalyticsOverview(),
        getAtRiskMembers()
      ]);

      setMetrics(overviewRes.data);
      setAtRiskList(atRiskRes.data.slice(0, 5)); // Top 5 critical members
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        <div style={{ width: '40px', height: '40px', margin: '0 auto 1rem', border: '3px solid #334155', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading database retention metrics...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title & Quick Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Retention & Membership Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Live performance indicators calculated directly from active MongoDB records
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={onOpenAttendanceModal} className="btn-secondary" style={{ fontSize: '0.85rem' }}>
            <CalendarCheck size={16} />
            <span>Check-in</span>
          </button>
          <button onClick={onOpenMemberModal} className="btn-primary" style={{ fontSize: '0.85rem' }}>
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>
          <button onClick={onOpenAiModal} className="btn-ai" style={{ fontSize: '0.85rem' }}>
            <Sparkles size={16} />
            <span>AI Copilot</span>
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard
          title="Total Members"
          value={metrics?.totalMembers || 0}
          subtitle="Registered gym members"
          icon={Users}
          color="indigo"
          trend="100% database active"
          trendType="neutral"
        />

        <MetricCard
          title="Renewed Members"
          value={metrics?.renewedCount || 0}
          subtitle={`Renewal Rate: ${metrics?.renewalRate || 0}%`}
          icon={UserCheck}
          color="emerald"
          trend={`${metrics?.renewalRate}% retention`}
          trendType="positive"
        />

        <MetricCard
          title="Non-Renewals"
          value={metrics?.nonRenewedCount || 0}
          subtitle={`Churn Rate: ${metrics?.nonRenewalRate || 0}%`}
          icon={UserX}
          color="rose"
          trend={`${metrics?.nonRenewalRate}% at-risk/lapsed`}
          trendType="negative"
        />

        <MetricCard
          title="Avg Attendance"
          value={`${metrics?.averageAttendance || 0}`}
          subtitle="Visits / member (30 days)"
          icon={Activity}
          color="amber"
          trend={`Avg ${metrics?.averageClasses || 0} classes attended`}
          trendType="neutral"
        />

        <MetricCard
          title="At-Risk Members"
          value={metrics?.atRiskCount || 0}
          subtitle="High churn probability"
          icon={AlertTriangle}
          color="rose"
          trend="Requires intervention"
          trendType="negative"
        />

        <MetricCard
          title="Retention Health"
          value={`${metrics?.healthScore || 0}/100`}
          subtitle="Composite health score"
          icon={TrendingUp}
          color="purple"
          trend={metrics?.healthScore > 70 ? 'Optimal engagement' : 'Attention needed'}
          trendType={metrics?.healthScore > 70 ? 'positive' : 'negative'}
        />
      </div>

      {/* Main Section: Engagement Breakdown & At-Risk Watchlist */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.25rem' }}>
        {/* Engagement Level Visual Distribution */}
        <div className="card-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.25rem' }}>
              Member Engagement Levels
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              Classified by 30-day visit frequency
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* High Engagement */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>High Engagement (≥12 visits)</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    {metrics?.engagementBreakdown?.High || 0} members
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${metrics?.totalMembers ? ((metrics.engagementBreakdown.High / metrics.totalMembers) * 100) : 0}%`,
                      backgroundColor: '#10b981',
                      borderRadius: '4px'
                    }}
                  ></div>
                </div>
              </div>

              {/* Moderate Engagement */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#60a5fa', fontWeight: 600 }}>Moderate (5 - 11 visits)</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    {metrics?.engagementBreakdown?.Moderate || 0} members
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${metrics?.totalMembers ? ((metrics.engagementBreakdown.Moderate / metrics.totalMembers) * 100) : 0}%`,
                      backgroundColor: '#3b82f6',
                      borderRadius: '4px'
                    }}
                  ></div>
                </div>
              </div>

              {/* Low Engagement */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#f87171', fontWeight: 600 }}>Low Engagement (&lt;5 visits)</span>
                  <span style={{ color: '#f8fafc', fontWeight: 700 }}>
                    {metrics?.engagementBreakdown?.Low || 0} members
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${metrics?.totalMembers ? ((metrics.engagementBreakdown.Low / metrics.totalMembers) * 100) : 0}%`,
                      backgroundColor: '#ef4444',
                      borderRadius: '4px'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase' }}>
              Average Inactivity
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>
              {metrics?.averageDaysInactive || 0} Days
            </div>
            <p style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '0.2rem' }}>
              Average days elapsed since members last checked into the facility.
            </p>
          </div>
        </div>

        {/* At-Risk Member Watchlist Preview */}
        <div className="card-glass" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Priority Churn Risk Watchlist
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Members identified as highly probable non-renewals
              </p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem' }}
            >
              <span>View All At-Risk</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Inactive Days</th>
                  <th>Visits</th>
                  <th>Risk Level</th>
                  <th>Recommended Action</th>
                </tr>
              </thead>
              <tbody>
                {atRiskList.length > 0 ? (
                  atRiskList.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{m.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.memberId}</div>
                      </td>
                      <td>
                        <span style={{ color: m.daysSinceLastVisit > 20 ? '#f87171' : '#fbbf24', fontWeight: 700 }}>
                          {m.daysSinceLastVisit} days
                        </span>
                      </td>
                      <td>{m.visitsLast30Days} visits</td>
                      <td>
                        <StatusBadge type="risk" value={m.riskLevel} />
                      </td>
                      <td style={{ fontSize: '0.775rem', color: '#cbd5e1' }}>
                        {m.recommendedAction}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                      No critical at-risk members found. Excellent member retention!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
