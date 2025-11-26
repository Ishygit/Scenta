import React from 'react';
import { motion } from 'framer-motion';

function ScanButton({ onClick, isScanning, disabled }) {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      {isScanning && (
        <>
          <motion.div
            style={{
              position: 'absolute',
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
        </>
      )}
      
      <motion.button
        onClick={onClick}
        disabled={disabled || isScanning}
        style={{
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          color: 'white',
          fontSize: 18,
          fontWeight: 700,
          border: 'none',
          boxShadow: '0 10px 40px rgba(99, 102, 241, 0.5)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        whileHover={!disabled && !isScanning ? { scale: 1.05 } : {}}
        whileTap={!disabled && !isScanning ? { scale: 0.95 } : {}}
        animate={isScanning ? {
          boxShadow: [
            '0 10px 40px rgba(99, 102, 241, 0.5)',
            '0 10px 60px rgba(168, 85, 247, 0.7)',
            '0 10px 40px rgba(99, 102, 241, 0.5)',
          ],
        } : {}}
        transition={{
          duration: 1,
          repeat: isScanning ? Infinity : 0,
        }}
      >
        {isScanning ? (
          <>
            <motion.div
              style={{
                width: 24,
                height: 24,
                border: '3px solid rgba(255, 255, 255, 0.3)',
                borderTopColor: 'white',
                borderRadius: '50%',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <span style={{ fontSize: 14 }}>Scanning...</span>
          </>
        ) : (
          <>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span>SCAN</span>
          </>
        )}
      </motion.button>
    </div>
  );
}

export default ScanButton;
