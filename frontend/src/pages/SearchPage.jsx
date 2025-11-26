import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import Header from '../components/Header';
import FragranceCard from '../components/FragranceCard';
import api from '../utils/api';

function SearchPage() {
  const [query, setQuery] = useState('');
  const [fragrances, setFragrances] = useState([]);
  const [popularFragrances, setPopularFragrances] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query || selectedBrand || selectedGender) {
        searchFragrances();
      } else {
        setFragrances([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selectedBrand, selectedGender]);

  const loadInitialData = async () => {
    try {
      const [popularData, brandsData] = await Promise.all([
        api.getPopularFragrances(10),
        api.getBrands()
      ]);
      setPopularFragrances(popularData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchFragrances = async () => {
    setLoading(true);
    try {
      const params = {};
      if (query) params.q = query;
      if (selectedBrand) params.brand = selectedBrand;
      if (selectedGender) params.gender = selectedGender;
      
      const data = await api.getFragrances(params);
      setFragrances(data);
    } catch (error) {
      console.error('Failed to search:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedBrand('');
    setSelectedGender('');
    setQuery('');
  };

  const hasActiveFilters = selectedBrand || selectedGender;
  const displayFragrances = (query || hasActiveFilters) ? fragrances : popularFragrances;
  const displayTitle = (query || hasActiveFilters) ? 'Search Results' : 'Popular Fragrances';

  return (
    <div className="page">
      <div className="container">
        <Header 
          title="Search" 
          rightAction={
            <button
              className="btn btn-ghost"
              onClick={() => setShowFilters(!showFilters)}
              style={{ padding: 8, margin: -8 }}
            >
              <Filter size={22} color={hasActiveFilters ? 'var(--primary)' : 'var(--text-secondary)'} />
            </button>
          }
        />

        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: 14, 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} 
          />
          <input
            type="text"
            placeholder="Search fragrances, brands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: 44 }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                padding: 4,
              }}
            >
              <X size={18} color="var(--text-muted)" />
            </button>
          )}
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card"
            style={{ marginBottom: 16, padding: 12 }}
          >
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Brand
              </label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="input"
                style={{ fontSize: 14 }}
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Gender
              </label>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="input"
                style={{ fontSize: 14 }}
              >
                <option value="">All</option>
                <option value="Masculine">Masculine</option>
                <option value="Feminine">Feminine</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                className="btn btn-ghost"
                style={{ width: '100%', fontSize: 14 }}
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}

        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>
          {displayTitle}
        </h3>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div className="animate-spin" style={{
              width: 40,
              height: 40,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--primary)',
              borderRadius: '50%'
            }} />
          </div>
        ) : displayFragrances.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 40,
            color: 'var(--text-secondary)',
          }}>
            <Search size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
            <p>No fragrances found</p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>
              Try a different search term or filter
            </p>
          </div>
        ) : (
          <div>
            {displayFragrances.map((fragrance, index) => (
              <motion.div
                key={fragrance.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <FragranceCard fragrance={fragrance} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
