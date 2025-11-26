import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ChevronRight, Heart, Star, Clock, Volume2 } from 'lucide-react';
import Header from '../components/Header';
import FragranceCard from '../components/FragranceCard';
import api from '../utils/api';

function ResultPage() {
  const { scanId } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    loadScan();
  }, [scanId]);

  const loadScan = async () => {
    try {
      const data = await api.getScan(scanId);
      setScan(data);
    } catch (error) {
      console.error('Failed to load scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (isCorrect) => {
    if (!scan?.best_match) return;
    
    try {
      await api.submitFeedback(
        scanId,
        scan.best_match.fragrance.id,
        isCorrect
      );
      setFeedbackSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <Header title="Scan Result" showBack />
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

  if (!scan || !scan.best_match) {
    return (
      <div className="page">
        <div className="container">
          <Header title="Scan Result" showBack />
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: 'var(--text-secondary)',
          }}>
            <p>No match found for this scan.</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/')}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { best_match, alternatives } = scan;
  const fragrance = best_match.fragrance;

  return (
    <div className="page">
      <div className="container">
        <Header title="Scan Result" showBack />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-glass"
          style={{ marginBottom: 20, textAlign: 'center' }}
        >
          <div style={{
            width: 100,
            height: 100,
            borderRadius: 20,
            margin: '0 auto 16px',
            overflow: 'hidden',
            background: 'var(--surface-light)',
          }}>
            {fragrance.image_url ? (
              <img
                src={fragrance.image_url}
                alt={fragrance.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" />
                </svg>
              </div>
            )}
          </div>

          <span className={`badge ${best_match.confidence_score > 0.7 ? 'badge-success' : 'badge-warning'}`} style={{ marginBottom: 12 }}>
            {Math.round(best_match.confidence_score * 100)}% Match
          </span>

          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            {fragrance.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>
            {fragrance.brand}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
            {fragrance.avg_rating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Star size={18} fill="var(--warning)" color="var(--warning)" />
                <span style={{ fontWeight: 600 }}>{fragrance.avg_rating.toFixed(1)}</span>
              </div>
            )}
            {fragrance.longevity_hours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                <Clock size={18} />
                <span>{fragrance.longevity_hours}h</span>
              </div>
            )}
            {fragrance.projection && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                <Volume2 size={18} />
                <span>{fragrance.projection}</span>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => navigate(`/fragrance/${fragrance.id}`)}
          >
            View Details
            <ChevronRight size={18} />
          </button>
        </motion.div>

        {!feedbackSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
            style={{ marginBottom: 20 }}
          >
            <p style={{ textAlign: 'center', marginBottom: 16, fontSize: 14 }}>
              Was this identification correct?
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => handleFeedback(true)}
              >
                <CheckCircle size={18} color="var(--success)" />
                Yes
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => handleFeedback(false)}
              >
                <XCircle size={18} color="var(--error)" />
                No
              </button>
            </div>
          </motion.div>
        )}

        {feedbackSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ marginBottom: 20, textAlign: 'center', background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <CheckCircle size={24} color="var(--success)" style={{ marginBottom: 8 }} />
            <p style={{ color: 'var(--success)', fontSize: 14 }}>
              Thanks for your feedback! This helps improve our accuracy.
            </p>
          </motion.div>
        )}

        {alternatives && alternatives.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Similar Fragrances
            </h3>
            {alternatives.map((alt) => (
              <FragranceCard
                key={alt.fragrance.id}
                fragrance={alt.fragrance}
                showConfidence
                confidence={alt.confidence_score}
              />
            ))}
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: 20 }}
          onClick={() => navigate('/')}
        >
          Scan Another
        </motion.button>
      </div>
    </div>
  );
}

export default ResultPage;
