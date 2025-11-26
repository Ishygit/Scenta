import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, History, Heart, Search, User } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const navItems = [
  { path: '/', icon: Home, label: 'Scan' },
  { path: '/history', icon: History, label: 'History' },
  { path: '/favorites', icon: Heart, label: 'Favorites' },
  { path: '/search', icon: Search, label: 'Search' },
  { path: '/profile', icon: User, label: 'Profile' },
];

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return null;
  }

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'rgba(15, 15, 35, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border)',
      padding: '8px 0',
      zIndex: 100,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 16px',
                background: 'transparent',
                color: isActive ? 'var(--primary-light)' : 'var(--text-muted)',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 400 }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default Navigation;
