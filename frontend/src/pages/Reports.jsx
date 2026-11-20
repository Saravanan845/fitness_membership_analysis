import React, { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard';
import { getAnalyticsOverview, getAtRiskMembers } from '../services/analyticsService';
import { getMembers } from '../services/memberService';
import { getAttendanceLogs } from '../services/attendanceService';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Users,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const Reports = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getAnalyticsOverview();
        setOverview(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helper to convert JSON array to CSV and trigger download
  const downloadCsv = (data, filename) => {
    if (!data || data.length === 0) {
      alert('No data available to export.');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map((header) => {
        const val = row[header] !== undefined && row[header] !== null ? row[header] : '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportAllMembersCsv = async () => {
    try {
      setExporting(true);
      const res = await getMembers({ limit: 1000 });
      const flatData = res.data.map((m) => ({
        Member_ID: m.memberId,
        Name: m.name,
        Email: m.email,
        Age: m.age,
        Gender: m.gender,
        Monthly_Spend: m.monthlySpend,
        Visits_Last_30_Days: m.visitsLast30Days,
        Classes_Attended: m.classesAttended,
        Days_Since_Last_Visit: m.daysSinceLastVisit,
        Renewed: m.renewed ? 1 : 0,
        Risk_Level: m.riskLevel,
        Engagement_Level: m.engagementLevel,
        Status: m.status
      }));
      downloadCsv(flatData, `fittrack_all_members_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      alert('Failed to export members');
    } finally {
      setExporting(false);
    }
  };

  const exportAtRiskMembersCsv = async () => {
    try {
      setExporting(true);
      const res = await getAtRiskMembers();
      const flatData = res.data.map((m) => ({
        Member_ID: m.memberId,
        Name: m.name,
        Email: m.email,
        Phone: m.phone || 'N/A',
        Days_Inactive: m.daysSinceLastVisit,
        Visits_Last_30_Days: m.visitsLast30Days,
        Renewed: m.renewed ? 'Yes' : 'No',
        Risk_Level: m.riskLevel,
        Identified_Risks: m.riskReasons?.join('; ') || 'N/A',
        Recommended_Action: m.recommendedAction
      }));
      downloadCsv(flatData, `fittrack_at_risk_members_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      alert('Failed to export at-risk members');
    } finally {
      setExporting(false);
    }
  };

  const exportAttendanceCsv = async () => {
    try {
      setExporting(true);
      const res = await getAttendanceLogs({ limit: 1000 });
      const flatData = res.data.map((log) => ({
        Date: new Date(log.checkInTime || log.date).toISOString().slice(0, 10),
        Time: new Date(log.checkInTime || log.date).toLocaleTimeString(),
        Member_ID: log.memberId?.memberId || 'N/A',
        Member_Name: log.memberId?.name || 'N/A',
        Activity: log.activityType,
        Duration_Minutes: log.durationMinutes,
        Notes: log.notes || ''
      }));
      downloadCsv(flatData, `fittrack_attendance_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (err) {
      alert('Failed to export attendance logs');
    } finally {
      setExporting(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Analytical Reports & Data Exports
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Generate executive compliance summaries and download raw analytical datasets
          </p>
        </div>

        <button onClick={printReport} className="btn-secondary">
          <Printer size={16} />
          <span>Print / Save PDF Report</span>
        </button>
      </div>

      {/* Export Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {/* Export All Members */}
        <div className="card-glass card-glass-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8' }}>
                <Users size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Full Member Dataset
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Export complete roster with demographic details, spend, visits, renewals, and calculated engagement categories.
            </p>
          </div>
          <button
            onClick={exportAllMembersCsv}
            disabled={exporting}
            className="btn-primary"
            style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.85rem' }}
          >
            <Download size={16} />
            <span>Download All Members (.CSV)</span>
          </button>
        </div>

        {/* Export At-Risk Members */}
        <div className="card-glass card-glass-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
                <AlertTriangle size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                At-Risk Watchlist Report
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Specialized outreach list containing high churn probability members, inactive days, and recommended re-engagement offers.
            </p>
          </div>
          <button
            onClick={exportAtRiskMembersCsv}
            disabled={exporting}
            className="btn-danger"
            style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.85rem' }}
          >
            <Download size={16} />
            <span>Download At-Risk List (.CSV)</span>
          </button>
        </div>

        {/* Export Attendance Logs */}
        <div className="card-glass card-glass-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399' }}>
                <FileSpreadsheet size={20} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                Facility Attendance Logs
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Detailed event logs of gym visits, timestamps, class participations, and workout durations for facility utilization analysis.
            </p>
          </div>
          <button
            onClick={exportAttendanceCsv}
            disabled={exporting}
            className="btn-secondary"
            style={{ marginTop: '1.25rem', width: '100%', fontSize: '0.85rem' }}
          >
            <Download size={16} />
            <span>Download Attendance Logs (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Printable Executive Retention Summary Document */}
      <div
        className="card-glass"
        style={{
          padding: '2rem',
          backgroundColor: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              FitTrack Executive Intelligence Report
            </span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>
              Quarterly Member Retention & Health Brief
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              Generated on: {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
              System Status: Active MERN
            </span>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mongoose Realtime Aggregations</div>
          </div>
        </div>

        {/* Executive Summary Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Total Active Members</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.2rem' }}>{overview?.totalMembers || 0}</div>
          </div>

          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Retention / Renewal Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>{overview?.renewalRate || 0}%</div>
          </div>

          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Attrition / Non-Renewal</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171', marginTop: '0.2rem' }}>{overview?.nonRenewalRate || 0}%</div>
          </div>

          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Facility Health Index</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc', marginTop: '0.2rem' }}>{overview?.healthScore || 0}/100</div>
          </div>
        </div>

        {/* Key Retention Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc' }}>
            Key Retention Takeaways & Strategic Interventions
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} color="#34d399" />
              <span>High Engagement cohort comprises <strong>{overview?.engagementBreakdown?.High || 0}</strong> members averaging &ge;12 visits per month.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} color="#f87171" />
              <span>Urgent focus required on <strong>{overview?.atRiskCount || 0}</strong> at-risk members with high inactivity exceeding 14 days.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle size={16} color="#34d399" />
              <span>Automated personal training check-ins and tailored renewal incentives have a projected <strong>+14% retention lift</strong>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
