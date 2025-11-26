import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, LogOut, Clock, Heart, ChevronRight, Bluetooth, Wifi } from 'lucide-react';
import Header from '../components/Header';
import { useAuth } from '../utils/AuthContext';
import api from '../utils/api';

function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({ scans: 0, favorites: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [scans, favorites] = await Promise.all([
        api.getScanHistory(1000),
        api.getFavorites()
      ]);
      setStats({
        scans: scans.length,
        favorites: favorites.length
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page">
      <div className="container">
        <Header title="Profile" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-glass" style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <User size={36} color="white" />
            </div>
            
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {user?.name || 'User'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Mail size={14} />
              {user?.email}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div className="card" style={{ textAlign: 'center' }}>
              <Clock size={24} color="var(--primary)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 24, fontWeight: 700 }}>{stats.scans}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Scans</p>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <Heart size={24} color="var(--accent)" style={{ marginBottom: 8 }} />
              <p style={{ fontSize: 24, fontWeight: 700 }}>{stats.favorites}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Favorites</p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 20, padding: 0 }}>
            <button
              onClick={() => navigate('/history')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'transparent',
                color: 'var(--text)',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Clock size={20} color="var(--primary-light)" />
                <span>Scan History</span>
              </div>
              <ChevronRight size={20} color="var(--text-muted)" />
            </button>
            
            <button
              onClick={() => navigate('/favorites')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                background: 'transparent',
                color: 'var(--text)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Heart size={20} color="var(--accent)" />
                <span>My Favorites</span>
              </div>
              <ChevronRight size={20} color="var(--text-muted)" />
            </button>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-secondary)' }}>
              Sensor Connection
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: 'rgba(34, 197, 94, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Wifi size={22} color="var(--success)" />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14 }}>Demo Mode Active</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Using simulated sensor data</p>
              </div>
            </div>
            
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              To use a real sensor, connect an ESP32 with MQ-series gas sensors via Bluetooth or WiFi.
            </p>
          </div>

          <div className="card" style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
              About ScentID
            </h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              ScentID uses advanced machine learning to identify fragrances from VOC (Volatile Organic Compound) signatures. 
              Our database contains 50+ popular fragrances with detailed notes profiles.
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
              Version 1.0.0
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="btn"
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--error)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}

export default ProfilePage;
