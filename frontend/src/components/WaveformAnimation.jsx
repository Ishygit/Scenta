import React from 'react';
import { motion } from 'framer-motion';

function WaveformAnimation({ isActive }) {
  const bars = 20;
  
  if (!isActive) return null;
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      height: 60,
      marginTop: 30,
    }}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: 4,
            background: `linear-gradient(to top, var(--primary), var(--secondary))`,
            borderRadius: 2,
          }}
          animate={{
            height: [10, Math.random() * 40 + 20, 10],
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export default WaveformAnimation;
