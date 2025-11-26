import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', minHeight: '100vh' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '20px 0' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 12,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary)" />
                    <stop offset="100%" stopColor="var(--secondary)" />
                  </linearGradient>
                </defs>
                <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <h1 style={{
                fontSize: 32,
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                ScentID
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome back! Sign in to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="input"
                  style={{ paddingLeft: 44 }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input"
                  style={{ paddingLeft: 44, paddingRight: 44 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    padding: 4,
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="var(--text-muted)" />
                  ) : (
                    <Eye size={20} color="var(--text-muted)" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: 16,
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 12,
                  color: 'var(--error)',
                  fontSize: 14,
                }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginBottom: 16 }}
            >
              {loading ? (
                <div className="animate-spin" style={{
                  width: 20,
                  height: 20,
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%'
                }} />
              ) : (
                'Sign In'
              )}
            </button>

            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
                Sign Up
              </Link>
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
