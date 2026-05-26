import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { to: '/app', icon: '🏠', label: 'Home' },
  { to: '/app/library', icon: '📚', label: 'Library' },
  { to: '/app/planner', icon: '📋', label: 'Planner' },
  { to: '/app/calendar', icon: '📅', label: 'Calendar' },
  { to: '/app/saved', icon: '💾', label: 'Saved' },
  { to: '/app/settings', icon: '⚙️', label: 'Settings' },
];

const Navigation = () => {
  return (
    <nav className="app-nav">
      {tabs.map(t => (
        <NavLink key={t.to} to={t.to} end={t.to === '/app'} className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">{t.icon}</span>
          <span className="nav-label">{t.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Navigation;
