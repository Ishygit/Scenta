import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Header from '../components/Header';
import FragranceCard from '../components/FragranceCard';
import api from '../utils/api';

function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const data = await api.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = (fragranceId, isFavorite) => {
    if (!isFavorite) {
      setFavorites(favorites.filter(f => f.fragrance.id !== fragranceId));
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <Header title="Favorites" />
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
        <Header title="Favorites" />

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--text-secondary)',
            }}
          >
            <Heart size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p style={{ marginBottom: 8 }}>No favorites yet</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
              Tap the heart icon on any fragrance to save it here
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={() => navigate('/search')}
            >
              Browse Fragrances
            </button>
          </motion.div>
        ) : (
          <div>
            {favorites.map((fav, index) => (
              <motion.div
                key={fav.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <FragranceCard
                  fragrance={{ ...fav.fragrance, is_favorite: true }}
                  onFavoriteChange={handleFavoriteChange}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;
