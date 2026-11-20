import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  CreditCard,
  BarChart3,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Members', path: '/members', icon: Users },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Membership', path: '/membership', icon: CreditCard },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Reports', path: '/reports', icon: FileSpreadsheet }
];

const Sidebar = ({ onOpenUploadModal }) => {
  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#0f172a',
        borderRight: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '1.25rem 0.875rem',
        minHeight: 'calc(100vh - 68px)',
        position: 'sticky',
        top: '68px'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0.5rem 0.75rem', letterSpacing: '0.05em' }}>
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#94a3b8',
                backgroundColor: isActive ? '#312e81' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* CSV Dataset Upload Quick Callout */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '1px solid #334155',
          borderRadius: '0.75rem',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c7d2fe', fontSize: '0.8rem', fontWeight: 600 }}>
          <UploadCloud size={16} />
          <span>Batch Dataset</span>
        </div>
        <p style={{ fontSize: '0.725rem', color: '#94a3b8', lineHeight: 1.4 }}>
          Upload Kalvium <code>sample_members.csv</code> to sync member retention records.
        </p>
        <button
          onClick={onOpenUploadModal}
          className="btn-secondary"
          style={{ width: '100%', fontSize: '0.75rem', padding: '0.45rem 0.5rem' }}
        >
          Upload CSV
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
