import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star, Clock, Volume2, ExternalLink, ChevronRight } from 'lucide-react';
import Header from '../components/Header';
import FragranceCard from '../components/FragranceCard';
import api from '../utils/api';

function FragranceDetailPage() {
  const { fragranceId } = useParams();
  const navigate = useNavigate();
  const [fragrance, setFragrance] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadFragrance();
  }, [fragranceId]);

  const loadFragrance = async () => {
    try {
      const [fragranceData, similarData] = await Promise.all([
        api.getFragrance(fragranceId),
        api.getSimilarFragrances(fragranceId, 5)
      ]);
      setFragrance(fragranceData);
      setIsFavorite(fragranceData.is_favorite);
      setSimilar(similarData);
    } catch (error) {
      console.error('Failed to load fragrance:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await api.removeFavorite(fragranceId);
      } else {
        await api.addFavorite(fragranceId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to update favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <Header title="" showBack />
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

  if (!fragrance) {
    return (
      <div className="page">
        <div className="container">
          <Header title="" showBack />
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Fragrance not found
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <Header 
          title="" 
          showBack 
          rightAction={
            <button
              onClick={toggleFavorite}
              style={{ background: 'transparent', padding: 8, margin: -8 }}
            >
              <Heart
                size={24}
                fill={isFavorite ? 'var(--accent)' : 'none'}
                color={isFavorite ? 'var(--accent)' : 'var(--text)'}
              />
            </button>
          }
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{
            width: 160,
            height: 160,
            borderRadius: 24,
            margin: '0 auto 20px',
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
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" />
                </svg>
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
              {fragrance.name}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16 }}>
              {fragrance.brand}
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
              {fragrance.concentration && (
                <span className="badge">{fragrance.concentration}</span>
              )}
              {fragrance.gender && (
                <span className="badge">{fragrance.gender}</span>
              )}
              {fragrance.year_released && (
                <span className="badge">{fragrance.year_released}</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 24 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <Star size={20} fill="var(--warning)" color="var(--warning)" />
                <span style={{ fontSize: 20, fontWeight: 700 }}>{fragrance.avg_rating?.toFixed(1) || 'N/A'}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {fragrance.review_count?.toLocaleString() || 0} reviews
              </span>
            </div>
            
            {fragrance.longevity_hours && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                  <Clock size={20} color="var(--primary-light)" />
                  <span style={{ fontSize: 20, fontWeight: 700 }}>{fragrance.longevity_hours}h</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Longevity</span>
              </div>
            )}
            
            {fragrance.projection && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                  <Volume2 size={20} color="var(--secondary)" />
                  <span style={{ fontSize: 16, fontWeight: 600 }}>{fragrance.projection}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Projection</span>
              </div>
            )}
          </div>

          {fragrance.description && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Description
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text)' }}>
                {fragrance.description}
              </p>
            </div>
          )}

          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
              Notes Pyramid
            </h3>
            
            {fragrance.top_notes && fragrance.top_notes.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Top Notes
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {fragrance.top_notes.map(note => (
                    <span key={note} className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {fragrance.mid_notes && fragrance.mid_notes.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Heart Notes
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {fragrance.mid_notes.map(note => (
                    <span key={note} className="badge" style={{ background: 'rgba(168, 85, 247, 0.2)' }}>
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {fragrance.base_notes && fragrance.base_notes.length > 0 && (
              <div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
                  Base Notes
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {fragrance.base_notes.map(note => (
                    <span key={note} className="badge" style={{ background: 'rgba(244, 114, 182, 0.2)' }}>
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(fragrance.price_min || fragrance.price_max) && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>
                Price Range
              </h3>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>
                ${fragrance.price_min?.toFixed(0)} - ${fragrance.price_max?.toFixed(0)}
              </p>
              {fragrance.price_url && (
                <a
                  href={fragrance.price_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                  style={{ marginTop: 12, width: '100%' }}
                >
                  <ExternalLink size={16} />
                  Shop Now
                </a>
              )}
            </div>
          )}

          {similar.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                Similar Fragrances
              </h3>
              {similar.map(frag => (
                <FragranceCard key={frag.id} fragrance={frag} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default FragranceDetailPage;
