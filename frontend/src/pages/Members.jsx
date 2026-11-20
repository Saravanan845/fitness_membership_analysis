import React, { useState, useEffect } from 'react';
import StatusBadge from '../components/StatusBadge';
import { getMembers, createMember, updateMember, deleteMember } from '../services/memberService';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Sparkles,
  RefreshCw,
  CalendarCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Members = ({ onOpenMemberModal, onOpenAttendanceModal, onOpenMembershipModal, onOpenAiModal }) => {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [renewedFilter, setRenewedFilter] = useState('');
  const [error, setError] = useState('');

  const fetchMembersList = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search.trim() || undefined,
        riskLevel: riskFilter || undefined,
        status: statusFilter || undefined,
        renewed: renewedFilter !== '' ? renewedFilter : undefined
      };

      const res = await getMembers(params);
      setMembers(res.data);
      setPagination(res.pagination);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchMembersList(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, riskFilter, statusFilter, renewedFilter]);

  const handleDelete = async (member) => {
    if (window.confirm(`Are you sure you want to delete member ${member.name} (${member.memberId})? This will also remove their attendance history and membership records.`)) {
      try {
        await deleteMember(member._id);
        fetchMembersList(pagination.page);
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete member');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Member Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
            Total Registered: {pagination.total} members across all tiers
          </p>
        </div>

        <button onClick={() => onOpenMemberModal(null)} className="btn-primary">
          <UserPlus size={16} />
          <span>Add New Member</span>
        </button>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.75rem', color: '#f87171' }}>
          {error}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="card-glass" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by name, ID or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto' }}
          >
            <option value="">All Risk Levels</option>
            <option value="High">High Risk</option>
            <option value="Moderate">Moderate Risk</option>
            <option value="Low">Low Risk</option>
          </select>

          <select
            value={renewedFilter}
            onChange={(e) => setRenewedFilter(e.target.value)}
            className="input-field"
            style={{ width: 'auto' }}
          >
            <option value="">All Renewal States</option>
            <option value="true">Renewed / Active</option>
            <option value="false">Non-Renewed / Lapsed</option>
          </select>

          {(search || riskFilter || statusFilter || renewedFilter) && (
            <button
              onClick={() => {
                setSearch('');
                setRiskFilter('');
                setStatusFilter('');
                setRenewedFilter('');
              }}
              className="btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Members Table */}
      <div className="card-glass" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Member ID</th>
                <th>Name / Email</th>
                <th>Age / Spend</th>
                <th>Visits (30d)</th>
                <th>Inactive Days</th>
                <th>Renewal</th>
                <th>Risk Level</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Loading member database...
                  </td>
                </tr>
              ) : members.length > 0 ? (
                members.map((member) => (
                  <tr key={member._id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#818cf8', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        {member.memberId}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{member.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{member.email}</div>
                    </td>
                    <td>
                      <div>Age {member.age}</div>
                      <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>${member.monthlySpend}/mo</div>
                    </td>
                    <td>
                      <div>{member.visitsLast30Days} visits</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{member.classesAttended} classes</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: member.daysSinceLastVisit > 20 ? '#f87171' : member.daysSinceLastVisit > 10 ? '#fbbf24' : '#34d399' }}>
                        {member.daysSinceLastVisit} days ago
                      </span>
                    </td>
                    <td>
                      <StatusBadge type="renewal" value={member.renewed} />
                    </td>
                    <td>
                      <StatusBadge type="risk" value={member.riskLevel} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                        {/* AI Insights Button */}
                        <button
                          onClick={() => onOpenAiModal(member)}
                          className="btn-ai"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}
                          title="Generate AI Retention Insights"
                        >
                          <Sparkles size={14} />
                        </button>

                        {/* Renew Membership */}
                        <button
                          onClick={() => onOpenMembershipModal(member)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}
                          title="Renew Membership"
                        >
                          <RefreshCw size={14} color="#34d399" />
                        </button>

                        {/* Check-in */}
                        <button
                          onClick={() => onOpenAttendanceModal(member)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}
                          title="Check-in Member"
                        >
                          <CalendarCheck size={14} color="#60a5fa" />
                        </button>

                        {/* Edit Member */}
                        <button
                          onClick={() => onOpenMemberModal(member)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}
                          title="Edit Member"
                        >
                          <Edit2 size={14} color="#94a3b8" />
                        </button>

                        {/* Delete Member */}
                        <button
                          onClick={() => handleDelete(member)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.5rem', fontSize: '0.7rem' }}
                          title="Delete Member"
                        >
                          <Trash2 size={14} color="#f87171" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No members match your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Showing Page {pagination.page} of {pagination.pages} ({pagination.total} total)
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchMembersList(pagination.page - 1)}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.65rem' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchMembersList(pagination.page + 1)}
                className="btn-secondary"
                style={{ padding: '0.35rem 0.65rem' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Members;
