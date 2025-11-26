import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function Header({ title, showBack = false, rightAction = null }) {
  const navigate = useNavigate();

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 0',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              padding: 8,
              margin: -8,
              color: 'var(--text)',
            }}
          >
            <ArrowLeft size={24} />
          </button>
        )}
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>{title}</h1>
      </div>
      {rightAction}
    </header>
  );
}

export default Header;
