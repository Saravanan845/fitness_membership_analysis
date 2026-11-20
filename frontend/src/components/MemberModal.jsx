import React, { useState, useEffect } from 'react';
import { X, Save, UserPlus } from 'lucide-react';

const MemberModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    memberId: '',
    name: '',
    email: '',
    phone: '',
    age: 25,
    gender: 'Prefer not to say',
    monthlySpend: 2200,
    renewed: true,
    visitsLast30Days: 10,
    classesAttended: 3,
    daysSinceLastVisit: 2,
    planName: 'Standard Fit',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        memberId: initialData.memberId || '',
        name: initialData.name || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        age: initialData.age || 25,
        gender: initialData.gender || 'Prefer not to say',
        monthlySpend: initialData.monthlySpend || 2200,
        renewed: initialData.renewed !== undefined ? initialData.renewed : true,
        visitsLast30Days: initialData.visitsLast30Days || 0,
        classesAttended: initialData.classesAttended || 0,
        daysSinceLastVisit: initialData.daysSinceLastVisit || 0,
        planName: initialData.planName || 'Standard Fit',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        memberId: '',
        name: '',
        email: '',
        phone: '',
        age: 25,
        gender: 'Prefer not to say',
        monthlySpend: 2200,
        renewed: true,
        visitsLast30Days: 10,
        classesAttended: 3,
        daysSinceLastVisit: 2,
        planName: 'Standard Fit',
        notes: ''
      });
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save member.');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!initialData?._id;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <UserPlus size={20} color="#818cf8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              {isEdit ? `Edit Member: ${initialData.name}` : 'Add New Member'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Member ID (Optional)</label>
              <input
                type="text"
                name="memberId"
                value={formData.memberId}
                onChange={handleChange}
                placeholder="e.g. M1016 (Auto if blank)"
                disabled={isEdit}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma"
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="rahul@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 00000"
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Age *</label>
              <input
                type="number"
                name="age"
                required
                min="12"
                max="100"
                value={formData.age}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="input-field">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Monthly Spend ($)</label>
              <input
                type="number"
                name="monthlySpend"
                min="0"
                value={formData.monthlySpend}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>

          {/* Retention & Activity Metrics */}
          <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
              Retention & Activity Statistics
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Visits (Last 30 Days)</label>
                <input
                  type="number"
                  name="visitsLast30Days"
                  min="0"
                  value={formData.visitsLast30Days}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Classes Attended</label>
                <input
                  type="number"
                  name="classesAttended"
                  min="0"
                  value={formData.classesAttended}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginBottom: '0.25rem' }}>Days Since Last Visit</label>
                <input
                  type="number"
                  name="daysSinceLastVisit"
                  min="0"
                  value={formData.daysSinceLastVisit}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
              <input
                type="checkbox"
                id="renewed"
                name="renewed"
                checked={formData.renewed}
                onChange={handleChange}
                style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }}
              />
              <label htmlFor="renewed" style={{ fontSize: '0.85rem', color: '#f8fafc', cursor: 'pointer', fontWeight: 600 }}>
                Membership is Currently Renewed (Active)
              </label>
            </div>
          </div>

          {!isEdit && (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Initial Plan Assignment</label>
              <select name="planName" value={formData.planName} onChange={handleChange} className="input-field">
                <option value="Basic Pass">Basic Pass ($1,500/mo)</option>
                <option value="Standard Fit">Standard Fit ($2,200/mo)</option>
                <option value="Pro Performance">Pro Performance ($2,800/mo)</option>
                <option value="Elite VIP">Elite VIP ($3,500/mo)</option>
              </select>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Member' : 'Save Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MemberModal;
