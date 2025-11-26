import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Bluetooth } from 'lucide-react';
import ScanButton from '../components/ScanButton';
import WaveformAnimation from '../components/WaveformAnimation';
import api from '../utils/api';

function ScanPage() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const [sensorStatus, setSensorStatus] = useState('simulated');

  const handleScan = async () => {
    setError(null);
    setIsScanning(true);

    try {
      const sensorData = await api.simulateSensorData();
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = await api.scan(
        sensorData.voc_vector,
        sensorData.device_id,
        sensorData.temperature,
        sensorData.humidity
      );

      navigate(`/result/${result.id}`);
    } catch (err) {
      setError(err.message || 'Scan failed. Please try again.');
      setIsScanning(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 160px)',
          textAlign: 'center',
          padding: '20px 0',
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: 40 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              marginBottom: 8,
            }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2">
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
                fontSize: 28,
                fontWeight: 800,
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                ScentID
              </h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
              Identify any fragrance instantly
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ScanButton
              onClick={handleScan}
              isScanning={isScanning}
              disabled={false}
            />
          </motion.div>

          <WaveformAnimation isActive={isScanning} />

          <AnimatePresence>
            {isScanning && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 20,
                  color: 'var(--text-secondary)',
                  fontSize: 14,
                }}
              >
                Analyzing scent signature...
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  marginTop: 20,
                  padding: '12px 20px',
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
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{
              marginTop: 50,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              background: 'var(--surface)',
              borderRadius: 20,
              fontSize: 13,
              color: 'var(--text-secondary)',
            }}
          >
            {sensorStatus === 'simulated' ? (
              <>
                <Wifi size={16} color="var(--success)" />
                <span>Demo Mode - Simulated Sensor</span>
              </>
            ) : sensorStatus === 'connected' ? (
              <>
                <Bluetooth size={16} color="var(--success)" />
                <span>Sensor Connected</span>
              </>
            ) : (
              <>
                <WifiOff size={16} color="var(--warning)" />
                <span>No Sensor Detected</span>
              </>
            )}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              marginTop: 24,
              fontSize: 12,
              color: 'var(--text-muted)',
              maxWidth: 280,
              lineHeight: 1.5,
            }}
          >
            Point your sensor toward the fragrance source and tap Scan to identify.
          </motion.p>
        </div>
      </div>
    </div>
  );
}

export default ScanPage;
