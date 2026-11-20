import React, { useState, useEffect } from 'react';
import { X, CreditCard, RefreshCw } from 'lucide-react';
import { renewMembership } from '../services/membershipService';

const MembershipModal = ({ isOpen, onClose, member, onSuccess }) => {
  const [planName, setPlanName] = useState('Standard Fit');
  const [durationMonths, setDurationMonths] = useState(1);
  const [autoRenew, setAutoRenew] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setPlanName('Standard Fit');
      setDurationMonths(1);
      setAutoRenew(true);
      setError('');
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const planPrices = {
    'Basic Pass': 1500,
    'Standard Fit': 2200,
    'Pro Performance': 2800,
    'Elite VIP': 3500
  };

  const totalPrice = (planPrices[planName] || 2200) * Number(durationMonths);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await renewMembership({
        memberId: member.memberId || member._id,
        planName,
        durationMonths: Number(durationMonths),
        autoRenew
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Renewal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CreditCard size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Renew Membership: {member.name}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ margin: '1rem 1.25rem 0', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: '#1e293b', padding: '0.875rem', borderRadius: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <div>Member ID: <strong style={{ color: '#f8fafc' }}>{member.memberId}</strong></div>
            <div>Current Status: <strong style={{ color: member.renewed ? '#34d399' : '#f87171' }}>{member.renewed ? 'Active' : 'Unrenewed / Lapsed'}</strong></div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
              Choose Plan Tier
            </label>
            <select
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="input-field"
            >
              <option value="Basic Pass">Basic Pass ($1,500/mo)</option>
              <option value="Standard Fit">Standard Fit ($2,200/mo)</option>
              <option value="Pro Performance">Pro Performance ($2,800/mo)</option>
              <option value="Elite VIP">Elite VIP ($3,500/mo)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
              Duration Cycle
            </label>
            <select
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              className="input-field"
            >
              <option value="1">1 Month (Monthly)</option>
              <option value="3">3 Months (Quarterly - 5% discount)</option>
              <option value="12">12 Months (Annual - 15% discount)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="checkbox"
              id="autoRenew"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
            />
            <label htmlFor="autoRenew" style={{ fontSize: '0.85rem', color: '#f8fafc', cursor: 'pointer' }}>
              Enable Automatic Recurring Renewal
            </label>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '0.5rem', padding: '0.875rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#c7d2fe' }}>Total Renewal Fee:</span>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>${totalPrice.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <RefreshCw size={16} />
              <span>{loading ? 'Processing...' : 'Confirm Renewal'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipModal;
