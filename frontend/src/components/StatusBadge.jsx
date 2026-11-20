import React from 'react';

const StatusBadge = ({ type, value }) => {
  if (!value) return null;

  // Risk Level badge
  if (type === 'risk') {
    switch (value.toLowerCase()) {
      case 'high':
        return <span className="badge badge-danger">● High Risk</span>;
      case 'moderate':
        return <span className="badge badge-warning">● Moderate Risk</span>;
      case 'low':
      default:
        return <span className="badge badge-success">● Low Risk</span>;
    }
  }

  // Engagement Level badge
  if (type === 'engagement') {
    switch (value.toLowerCase()) {
      case 'high':
        return <span className="badge badge-success">★ High ({value})</span>;
      case 'moderate':
        return <span className="badge badge-info">◆ Moderate ({value})</span>;
      case 'low':
      default:
        return <span className="badge badge-warning">▼ Low ({value})</span>;
    }
  }

  // Renewal / Status badge
  if (type === 'status' || type === 'renewal') {
    if (value === true || value === 'Active' || value === 'Renewed') {
      return <span className="badge badge-success">Active / Renewed</span>;
    }
    if (value === 'Expiring Soon') {
      return <span className="badge badge-warning">Expiring Soon</span>;
    }
    if (value === false || value === 'Expired' || value === 'Cancelled' || value === 'Lapsed') {
      return <span className="badge badge-danger">Expired / Lapsed</span>;
    }
    return <span className="badge badge-info">{value}</span>;
  }

  return <span className="badge badge-info">{value}</span>;
};

export default StatusBadge;
