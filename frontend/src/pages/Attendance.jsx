import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import StatusBadge from '../components/StatusBadge';
import { getAttendanceLogs, getAttendanceStats } from '../services/attendanceService';
import {
  CalendarCheck,
  Clock,
  Activity,
  Dumbbell,
  Search,
  Filter,
  CheckCircle,
  Plus
} from 'lucide-react';

const Attendance = ({ onOpenAttendanceModal }) => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [error, setError] = useState('');

  const loadAttendance = async (page = 1) => {
    try {
      setLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        getAttendanceLogs({ page, limit: 20, activityType: activityFilter || undefined }),
        getAttendanceStats()
      ]);

      setLogs(logsRes.data);
      setPagination(logsRes.pagination);
      setStats(statsRes.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(1);
  }, [activityFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Attendance & Facility Usage
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Real-time gym check-ins, class tracking and facility traffic metrics
          </p>
        </div>

        <button onClick={onOpenAttendanceModal} className="btn-primary">
          <CalendarCheck size={16} />
          <span>Record Member Check-in</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <MetricCard
          title="Today's Check-ins"
          value={stats?.todayCheckIns || 0}
          subtitle="Members logged today"
          icon={CalendarCheck}
          color="emerald"
          trend="Live check-in counter"
          trendType="positive"
        />

        <MetricCard
          title="Past 30 Days Total"
          value={stats?.last30DaysCheckIns || 0}
          subtitle="Cumulative check-ins"
          icon={Activity}
          color="indigo"
          trend="Facility utilization"
          trendType="neutral"
        />

        <MetricCard
          title="Daily Average"
          value={stats?.dailyAverage || 0}
          subtitle="Average check-ins per day"
          icon={Clock}
          color="amber"
          trend="Based on 30-day baseline"
          trendType="neutral"
        />

        <MetricCard
          title="Active Classes"
          value={stats?.activityBreakdown?.length || 0}
          subtitle="Distinct session categories"
          icon={Dumbbell}
          color="purple"
          trend="Group & individual tracks"
          trendType="neutral"
        />
      </div>

      {/* Filter Toolbar */}
      <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>Filter by Activity:</span>
          <select
            value={activityFilter}
            onChange={(e) => setActivityFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto' }}
          >
            <option value="">All Workout Activities</option>
            <option value="Open Gym">Open Gym</option>
            <option value="HIIT Class">HIIT Class</option>
            <option value="Yoga & Pilates">Yoga & Pilates</option>
            <option value="Spinning">Spinning</option>
            <option value="Strength Training">Strength Training</option>
            <option value="Zumba">Zumba</option>
          </select>
        </div>

        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
          Total logged events: {pagination.total}
        </span>
      </div>

      {/* Attendance Logs Table */}
      <div className="card-glass" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date / Time</th>
                <th>Member ID</th>
                <th>Member Name</th>
                <th>Activity Type</th>
                <th>Duration</th>
                <th>Engagement Tier</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Loading attendance entries...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {new Date(log.checkInTime || log.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(log.checkInTime || log.date).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {log.memberId?.memberId || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {log.memberId?.name || 'Anonymous Member'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {log.memberId?.email}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">
                        {log.activityType}
                      </span>
                    </td>
                    <td>{log.durationMinutes || 60} mins</td>
                    <td>
                      <StatusBadge type="engagement" value={log.memberId?.engagementLevel || 'Moderate'} />
                    </td>
                    <td style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                      {log.notes || '—'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No attendance records found. Click "Record Member Check-in" above to log a session!
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

export default Attendance;
