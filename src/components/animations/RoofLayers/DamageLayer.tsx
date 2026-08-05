import React from 'react';
import { motion } from 'framer-motion';

interface DamageLayerProps {
  currentPhase: number;
}

export const DamageLayer: React.FC<DamageLayerProps> = ({ currentPhase }) => {
  // Visible only in phases 1, 2, and 3. Fades out in phase 4 (repair).
  const isVisible = currentPhase < 4;

  return (
    <motion.g 
      transform="translate(250, 100)"
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 0.8 : 0 }}
      transition={{ duration: 1.5 }}
      style={{ pointerEvents: 'none' }}
    >
      {/* SVG Filters for realistic water puddles and concrete damage */}
      <defs>
        <filter id="puddle-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.8" />
          </feComponentTransfer>
        </filter>
        <filter id="crack-filter">
          <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="2" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Grid elements to give it perspective (under the puddles) */}
      <path d="M -90 15 L 90 85 M -45 32 L 135 102 M 45 -2 L 225 68" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 2" />
      <path d="M 90 15 L -90 85 M 45 32 L -135 102 M -45 -2 L -225 68" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 2" />

      {/* Isometric Puddles / Humidity Zones */}
      {/* We apply a skew/rotate to match the roof perspective */}
      <g transform="translate(0, 50) scale(1, 0.3888) rotate(45)">
        {/* Puddle 1 (Top Left area) */}
        <path d="M -50 -70 Q -20 -90 10 -60 T 0 -30 T -60 -40 Z" fill="#0f172a" filter="url(#puddle-filter)" opacity="0.9" />
        {/* Puddle 2 (Bottom Right area) */}
        <path d="M 40 30 Q 70 10 90 40 T 60 80 T 30 50 Z" fill="#0f172a" filter="url(#puddle-filter)" opacity="0.8" />
        {/* Puddle 3 (Center small) */}
        <path d="M -10 10 Q 10 -10 30 15 T 0 30 Z" fill="#0f172a" filter="url(#puddle-filter)" opacity="0.7" />
        
        {/* Cracks */}
        <path d="M -80 -20 L -60 -10 L -40 -30 L -20 -15" fill="none" stroke="#000000" strokeWidth="2" filter="url(#crack-filter)" opacity="0.6" />
        <path d="M 20 60 L 40 80 L 70 70" fill="none" stroke="#000000" strokeWidth="2" filter="url(#crack-filter)" opacity="0.5" />
      </g>
    </motion.g>
  );
};
