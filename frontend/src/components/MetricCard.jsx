import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, trend, trendType = 'neutral', color = 'indigo' }) => {
  const colorStyles = {
    indigo: {
      bg: 'rgba(99, 102, 241, 0.1)',
      border: 'rgba(99, 102, 241, 0.25)',
      icon: '#818cf8',
      text: '#c7d2fe'
    },
    emerald: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.25)',
      icon: '#34d399',
      text: '#a7f3d0'
    },
    amber: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.25)',
      icon: '#fbbf24',
      text: '#fde68a'
    },
    rose: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.25)',
      icon: '#f87171',
      text: '#fecdd3'
    },
    purple: {
      bg: 'rgba(168, 85, 247, 0.1)',
      border: 'rgba(168, 85, 247, 0.25)',
      icon: '#c084fc',
      text: '#e9d5ff'
    }
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div
      className="card-glass card-glass-hover"
      style={{
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.75rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {Icon && (
          <div
            style={{
              padding: '0.625rem',
              borderRadius: '0.75rem',
              backgroundColor: style.bg,
              border: `1px solid ${style.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon size={20} color={style.icon} />
          </div>
        )}
      </div>

      <div>
        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.1 }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
            {subtitle}
          </div>
        )}
      </div>

      {trend && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          <span
            style={{
              fontWeight: 600,
              color: trendType === 'positive' ? '#34d399' : trendType === 'negative' ? '#f87171' : '#94a3b8'
            }}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
