import React, { useState } from 'react';
import { X, CheckCircle, CalendarCheck } from 'lucide-react';
import { recordAttendance } from '../services/attendanceService';

const AttendanceModal = ({ isOpen, onClose, members = [], onSuccess }) => {
  const [memberId, setMemberId] = useState('');
  const [activityType, setActivityType] = useState('Open Gym');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!memberId) {
      setError('Please select or enter a member.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await recordAttendance({
        memberId,
        activityType,
        durationMinutes: Number(durationMinutes),
        notes
      });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to record check-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CalendarCheck size={20} color="#34d399" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Record Member Check-in
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
          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
              Select Member *
            </label>
            <select
              required
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="input-field"
            >
              <option value="">-- Choose Member --</option>
              {members.map((m) => (
                <option key={m._id} value={m.memberId}>
                  {m.memberId} - {m.name} ({m.engagementLevel} Engagement)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
              Workout / Class Type
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="input-field"
            >
              <option value="Open Gym">Open Gym / Free Weights</option>
              <option value="HIIT Class">HIIT Class</option>
              <option value="Yoga & Pilates">Yoga & Pilates</option>
              <option value="Spinning">Spinning</option>
              <option value="Strength Training">Strength Training</option>
              <option value="Zumba">Zumba</option>
              <option value="Personal Training">Personal Training</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
              Session Duration (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="240"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Completed upper body cycle"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid #1e293b', paddingTop: '1rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              <CheckCircle size={16} />
              <span>{loading ? 'Recording...' : 'Confirm Check-in'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AttendanceModal;
