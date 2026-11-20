import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Sparkles, LogOut, User, ShieldCheck } from 'lucide-react';

const Navbar = ({ onOpenAiModal }) => {
  const { user, logout } = useAuth();

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Brand & Subtitle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            padding: '0.5rem',
            borderRadius: '0.625rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Activity size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              FitTrack
            </span>
            <span style={{ fontSize: '0.7rem', background: '#312e81', color: '#c7d2fe', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
              MERN
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Fitness Center Retention & Engagement Analytics
          </div>
        </div>
      </div>

      {/* Right Action Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* AI Assistant Quick Pill Button */}
        <button
          onClick={onOpenAiModal}
          className="btn-ai"
          style={{ fontSize: '0.825rem', padding: '0.5rem 1rem' }}
          title="Open AI Retention Insights Assistant"
        >
          <Sparkles size={16} />
          <span>AI Retention Assistant</span>
        </button>

        {/* User Profile & Role */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.375rem 0.75rem',
            backgroundColor: '#1e293b',
            borderRadius: '0.625rem',
            border: '1px solid #334155'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem'
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#f1f5f9' }}>
              {user?.name || 'Administrator'}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'capitalize' }}>
              {user?.role || 'Admin'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="btn-secondary"
          style={{ padding: '0.5rem', borderRadius: '0.5rem' }}
          title="Log Out"
        >
          <LogOut size={18} color="#94a3b8" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
