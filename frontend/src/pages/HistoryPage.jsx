import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import FragranceCard from '../components/FragranceCard';
import api from '../utils/api';

function HistoryPage() {
  const navigate = useNavigate();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await api.getScanHistory();
      setScans(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, scanId) => {
    e.stopPropagation();
    try {
      await api.deleteScan(scanId);
      setScans(scans.filter(s => s.id !== scanId));
    } catch (error) {
      console.error('Failed to delete scan:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <Header title="Scan History" />
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="animate-spin" style={{
              width: 40,
              height: 40,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%'
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <Header title="Scan History" />

        {scans.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--text-secondary)',
            }}
          >
            <Clock size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p style={{ marginBottom: 8 }}>No scans yet</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Start scanning fragrances to build your history
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/')}
            >
              Start Scanning
            </button>
          </motion.div>
        ) : (
          <div>
            {scans.map((scan, index) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/result/${scan.id}`)}
                style={{ cursor: 'pointer', position: 'relative' }}
              >
                {scan.fragrance ? (
                  <div style={{ position: 'relative' }}>
                    <FragranceCard
                      fragrance={scan.fragrance}
                      showConfidence
                      confidence={scan.confidence_score}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 16,
                      right: 50,
                      fontSize: 11,
                      color: 'var(--text-muted)',
                    }}>
                      {formatDate(scan.scanned_at)}
                    </div>
                  </div>
                ) : (
                  <div className="card" style={{ marginBottom: 12 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                          Unknown fragrance
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                          {formatDate(scan.scanned_at)}
                        </p>
                      </div>
                      <span className="badge badge-warning">
                        {Math.round(scan.confidence_score * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
