import React from 'react';
import { motion } from 'framer-motion';

interface RepairLayerProps {
  currentPhase: number;
}

export const RepairLayer: React.FC<RepairLayerProps> = ({ currentPhase }) => {
  const isRepairing = currentPhase >= 4;

  return (
    <motion.g 
      transform="translate(250, 100)"
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        {/* Mesh Pattern */}
        <pattern id="mesh-pattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="scale(1, 0.3888) rotate(45)">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        </pattern>
        
        {/* Waterproof Coating Gradient */}
        <linearGradient id="waterproof-coat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4299e1" />
          <stop offset="50%" stopColor="#285a8a" />
          <stop offset="100%" stopColor="#1a3b5c" />
        </linearGradient>

        {/* Animation Clip Path for sweeping reveal (Top Left to Bottom Right) */}
        <clipPath id="reveal-clip">
          <motion.rect 
            x="-300" y="-150" 
            width="600" height="400"
            initial={{ translateX: -600 }}
            animate={{ translateX: isRepairing ? 0 : -600 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </clipPath>

        <clipPath id="coat-reveal-clip">
          <motion.rect 
            x="-300" y="-150" 
            width="600" height="400"
            initial={{ translateX: -600 }}
            animate={{ translateX: isRepairing ? 0 : -600 }}
            transition={{ duration: 2.5, delay: 1.0, ease: "easeInOut" }}
          />
        </clipPath>
      </defs>

      {/* Mesh Layer */}
      <g clipPath="url(#reveal-clip)">
        <path d="M 0 -20 L 180 50 L 0 120 L -180 50 Z" fill="url(#mesh-pattern)" opacity="0.9" />
      </g>

      {/* Coat Layer */}
      <g clipPath="url(#coat-reveal-clip)">
        {/* The Vibrant Coatline Waterproofing Coating over the texture */}
        <path d="M 0 -20 L 180 50 L 0 120 L -180 50 Z" fill="url(#waterproof-coat)" opacity="0.95" style={{ mixBlendMode: 'overlay' }} />
        
        {/* Gloss Highlight on top of roof */}
        <path d="M 0 -20 L 180 50 L 0 120 L -180 50 Z" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
        
        {/* Grid overlay to show "Engineering/Precision" */}
        <path d="M -90 15 L 90 85 M -45 32 L 135 102 M 45 -2 L 225 68" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 2" />
        <path d="M 90 15 L -90 85 M 45 32 L -135 102 M -45 -2 L -225 68" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 2" />
      </g>

      {/* Repaired Roof Image — appears in Phase 5 (final result) */}
      <g clipPath="url(#roof-clip)">
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: currentPhase >= 5 ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        >
          <image 
            href="/roof_texture_repaired.png" 
            x="-185" 
            y="-25" 
            width="370" 
            height="150" 
            preserveAspectRatio="none"
          />
          {/* Slight dark overlay to match the night scene */}
          <polygon 
            points="0,-20 180,50 0,120 -180,50" 
            fill="#0a1120" 
            opacity="0.15"
          />
        </motion.g>
      </g>
    </motion.g>
  );
};
