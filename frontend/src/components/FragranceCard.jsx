import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

function FragranceCard({ fragrance, showConfidence, confidence, onFavoriteChange }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = React.useState(fragrance.is_favorite);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;
    
    setIsUpdating(true);
    try {
      if (isFavorite) {
        await api.removeFavorite(fragrance.id);
      } else {
        await api.addFavorite(fragrance.id);
      }
      setIsFavorite(!isFavorite);
      if (onFavoriteChange) {
        onFavoriteChange(fragrance.id, !isFavorite);
      }
    } catch (error) {
      console.error('Failed to update favorite:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      className="card"
      style={{
        display: 'flex',
        gap: 12,
        cursor: 'pointer',
        marginBottom: 12,
      }}
      onClick={() => navigate(`/fragrance/${fragrance.id}`)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div style={{
        width: 70,
        height: 70,
        borderRadius: 12,
        background: 'var(--surface-light)',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {fragrance.image_url ? (
          <img
            src={fragrance.image_url}
            alt={fragrance.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" />
            </svg>
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {fragrance.name}
            </h3>
            <p style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              marginBottom: 6,
            }}>
              {fragrance.brand}
            </p>
          </div>
          
          <button
            onClick={handleFavoriteClick}
            style={{
              background: 'transparent',
              padding: 8,
              marginRight: -8,
              marginTop: -4,
            }}
          >
            <Heart
              size={20}
              fill={isFavorite ? 'var(--accent)' : 'none'}
              color={isFavorite ? 'var(--accent)' : 'var(--text-muted)'}
            />
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {showConfidence && confidence !== undefined && (
            <span className={`badge ${confidence > 0.7 ? 'badge-success' : 'badge-warning'}`}>
              {Math.round(confidence * 100)}% match
            </span>
          )}
          
          {fragrance.avg_rating > 0 && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              color: 'var(--text-secondary)',
            }}>
              <Star size={12} fill="var(--warning)" color="var(--warning)" />
              {fragrance.avg_rating.toFixed(1)}
            </span>
          )}
          
          {fragrance.concentration && (
            <span className="badge">{fragrance.concentration}</span>
          )}
        </div>
        
        {fragrance.top_notes && fragrance.top_notes.length > 0 && (
          <p style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginTop: 6,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {fragrance.top_notes.slice(0, 3).join(' • ')}
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default FragranceCard;
