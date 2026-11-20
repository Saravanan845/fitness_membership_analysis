import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { getMemberships, getMembershipStats } from '../services/membershipService';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Zap
} from 'lucide-react';

const Membership = ({ onOpenMembershipModal }) => {
  const [memberships, setMemberships] = useState([]);
  const [stats, setStats] = useState(null);
  const [planTiers, setPlanTiers] = useState({});
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMemberships = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        getMemberships({ status: statusFilter || undefined }),
        getMembershipStats()
      ]);

      setMemberships(listRes.data);
      setPlanTiers(listRes.plans || {});
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemberships();
  }, [statusFilter]);

  const calculateDaysRemaining = (endDateStr) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Membership Plans & Renewals
        </h1>
        <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
          Monitor subscription lifecycles, renewal deadlines, and plan distributions
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard
          title="Active Plans"
          value={stats?.activeMemberships || 0}
          subtitle="Currently active subscriptions"
          icon={CheckCircle2}
          color="emerald"
          trend="Healthy members"
          trendType="positive"
        />

        <MetricCard
          title="Expiring Soon"
          value={stats?.expiringSoonMemberships || 0}
          subtitle="Expiring in ≤ 7 days"
          icon={Clock}
          color="amber"
          trend="High priority for renewal"
          trendType="negative"
        />

        <MetricCard
          title="Expired / Lapsed"
          value={stats?.expiredMemberships || 0}
          subtitle="Subscription elapsed"
          icon={AlertCircle}
          color="rose"
          trend="Re-engagement target"
          trendType="negative"
        />

        <MetricCard
          title="Membership Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          subtitle="Total recorded revenue"
          icon={CreditCard}
          color="indigo"
          trend="Cumulative subscription spend"
          trendType="neutral"
        />
      </div>

      {/* Membership Plan Tiers Showcase */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
          Club Membership Tiers
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {Object.entries(planTiers).map(([planName, details]) => (
            <div
              key={planName}
              className="card-glass card-glass-hover"
              style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderTop: planName === 'Elite VIP' ? '3px solid #ec4899' : planName === 'Pro Performance' ? '3px solid #6366f1' : '1px solid #334155'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
                    {planName}
                  </span>
                  {planName === 'Elite VIP' && (
                    <span className="badge badge-purple">VIP</span>
                  )}
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', margin: '0.5rem 0' }}>
                  ${details.price}
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 400 }}> / month</span>
                </div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem' }}>
                  {details.features?.map((f, i) => (
                    <li key={i} style={{ fontSize: '0.8rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={14} color="#34d399" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Memberships Table */}
      <div className="card-glass" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
              Subscription Roster & Expiry Deadlines
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Detailed tracking of every active and expiring membership
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Status Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
              style={{ width: 'auto' }}
            >
              <option value="">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon (≤ 7 days)</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Plan Tier</th>
                <th>Billing Cycle</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                <th>Countdown</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Loading subscriptions...
                  </td>
                </tr>
              ) : memberships.length > 0 ? (
                memberships.map((sub) => {
                  const daysRemaining = calculateDaysRemaining(sub.endDate);
                  return (
                    <tr key={sub._id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                          {sub.memberId?.name || 'Unknown Member'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#818cf8' }}>
                          {sub.memberId?.memberId}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{sub.planName}</span>
                        <div style={{ fontSize: '0.75rem', color: '#34d399' }}>${sub.price}</div>
                      </td>
                      <td>{sub.billingCycle}</td>
                      <td>{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td>{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td>
                        {daysRemaining > 7 ? (
                          <span style={{ color: '#34d399', fontWeight: 600 }}>{daysRemaining} days left</span>
                        ) : daysRemaining > 0 ? (
                          <span style={{ color: '#fbbf24', fontWeight: 700 }}>{daysRemaining} days (Expiring!)</span>
                        ) : (
                          <span style={{ color: '#f87171', fontWeight: 700 }}>Expired {Math.abs(daysRemaining)}d ago</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge type="status" value={sub.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => onOpenMembershipModal(sub.memberId)}
                          className="btn-primary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                        >
                          <RefreshCw size={14} />
                          <span>Renew</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No membership records match this filter.
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

export default Membership;
