import React from 'react';
import { motion } from 'framer-motion';

interface ScanningLayerProps {
  currentPhase: number;
}

export const ScanningLayer: React.FC<ScanningLayerProps> = ({ currentPhase }) => {
  const isScanning = currentPhase === 2;
  const isDiagnostics = currentPhase === 3;
  const isVisible = isScanning || isDiagnostics;

  return (
    <motion.g 
      transform="translate(250, 100)"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      style={{ pointerEvents: 'none' }}
    >
      {/* 1. Topographic Grid Scanner (Phase 2) */}
      {isScanning && (
        <g clipPath="url(#roof-clip)">
          {/* Main Laser Line */}
          <motion.line 
            x1="-200" y1="-30" x2="200" y2="60"
            stroke="#0ea5e9" 
            strokeWidth="3" 
            style={{ filter: 'drop-shadow(0px 0px 10px #0ea5e9)' }}
            initial={{ translateY: -80, translateX: -80 }}
            animate={{ 
              translateY: [ -80, 180, -80 ], 
              translateX: [ -80, 80, -80 ] 
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Grid Scanner Trail */}
          <motion.g
            initial={{ translateY: -80, translateX: -80 }}
            animate={{ 
              translateY: [ -80, 180, -80 ], 
              translateX: [ -80, 80, -80 ] 
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Holographic Projection Area */}
            <polygon 
              points="-200,-30 200,60 200,-20 -200,-100"
              fill="url(#electric-gradient)"
              opacity="0.6"
            />
            {/* Small scanning nodes / sparks on the line */}
            <circle cx="0" cy="15" r="3" fill="#fff" style={{ filter: 'drop-shadow(0px 0px 5px #fff)' }} />
            <circle cx="-80" cy="-3" r="2" fill="#fff" />
            <circle cx="100" cy="37" r="2.5" fill="#fff" />
          </motion.g>
        </g>
      )}

      {/* Electric Gradient Def */}
      <defs>
        <linearGradient id="electric-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* 2. Diagnostic Warning Markers (Phase 3) */}
      {isDiagnostics && (
        <g>
          <WarningMarker x="-50" y="20" delay={0} />
          <WarningMarker x="60" y="80" delay={0.2} />
          <WarningMarker x="10" y="55" delay={0.4} />
        </g>
      )}
    </motion.g>
  );
};

const WarningMarker: React.FC<{ x: string | number, y: string | number, delay: number }> = ({ x, y, delay }) => {
  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Sci-Fi Pulse */}
      <motion.circle 
        r="15" 
        fill="none" 
        stroke="#ef4444" 
        strokeWidth="1.5"
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: 2, repeat: Infinity, delay, ease: "easeOut" }}
      />
      {/* Core Node */}
      <circle r="3" fill="#ef4444" style={{ filter: 'drop-shadow(0px 0px 6px #ef4444)' }} />
      {/* Reticle Lines */}
      <path d="M -8 0 L -4 0 M 4 0 L 8 0 M 0 -8 L 0 -4 M 0 4 L 0 8" stroke="#ef4444" strokeWidth="1" />
      {/* Indicator Line */}
      <line x1="0" y1="-4" x2="15" y2="-25" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 2" opacity="0.8" />
      <line x1="15" y1="-25" x2="35" y2="-25" stroke="#ef4444" strokeWidth="1" opacity="0.8" />
      {/* Text Label */}
      <text x="38" y="-22" fill="#fca5a5" fontSize="7" fontFamily="monospace" fontWeight="bold" letterSpacing="1">
        FUGA
      </text>
    </g>
  );
};
