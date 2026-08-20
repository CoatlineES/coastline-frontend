import React from 'react';

interface BaseBuildingProps {
  bgX: number;
  bgY: number;
  bgScale: number;
}

export const BaseBuilding: React.FC<BaseBuildingProps> = ({ bgX, bgY, bgScale }) => {
  return (
    <g transform="translate(250, 100)">
      <defs>
        {/* --- CLIP PATH GLOBAL PARA CAPAS SUPERIORES (animaciones) --- */}
        <clipPath id="roof-clip">
          <polygon points="-180,50 0,-40 180,50 0,140" />
        </clipPath>

        {/* --- FILTRO 1: Textura granulada de concreto/asfalto --- */}
        <filter id="roof-grain" x="-5%" y="-5%" width="110%" height="110%">
          {/* Capa de ruido fino: simula la textura granulada del concreto */}
          <feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="5" seed="42" result="fineNoise" />
          <feColorMatrix type="saturate" values="0" in="fineNoise" result="grayNoise" />
          <feComponentTransfer in="grayNoise" result="subtleNoise">
            <feFuncA type="linear" slope="0.12" intercept="0" />
          </feComponentTransfer>
          
          {/* Capa de manchas grandes: simula la irregularidad y manchas de humedad */}
          <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="3" seed="7" result="stains" />
          <feColorMatrix type="saturate" values="0" in="stains" result="grayStains" />
          <feComponentTransfer in="grayStains" result="subtleStains">
            <feFuncA type="linear" slope="0.08" intercept="0" />
          </feComponentTransfer>
          
          {/* Mezcla: textura fina sobre la superficie base */}
          <feComposite operator="in" in="subtleNoise" in2="SourceGraphic" result="croppedNoise" />
          <feBlend mode="overlay" in="croppedNoise" in2="SourceGraphic" result="textured" />
          
          {/* Mezcla: manchas grandes sobre la textura */}
          <feComposite operator="in" in="subtleStains" in2="textured" result="croppedStains" />
          <feBlend mode="multiply" in="croppedStains" in2="textured" />
        </filter>

        {/* --- FILTRO 2: Sombra interior perimetral (profundidad del pretil) --- */}
        <filter id="roof-depth" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="8" result="blur" />
          <feOffset dx="0" dy="3" in="blur" result="offsetBlur" />
          <feComposite operator="out" in="SourceGraphic" in2="offsetBlur" result="inverse" />
          <feFlood floodColor="#0f172a" floodOpacity="0.5" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>

        {/* Gradiente para iluminación direccional del techo (luz desde arriba-izquierda) */}
        <linearGradient id="roof-light" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.15" />
          <stop offset="50%" stopColor="transparent" stopOpacity="0" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      {/* --- EDIFICIO PRINCIPAL (IMAGEN IA) --- */}
      <g transform={`translate(${bgX}, ${bgY}) scale(${bgScale})`}>
        <image 
          href="/corporate_building_v3_nobg.png" 
          x="0" 
          y="0" 
          width="1024" 
          height="1024" 
        />
      </g>

      {/* ============================================= */}
      {/* === SUPERFICIE DEL TECHO (imagen realista)  == */}
      {/* ============================================= */}
      
      {/* Imagen realista de techo recortada a la forma del rombo */}
      <g clipPath="url(#roof-clip)">
        <image 
          href="/roof_texture_realistic.png" 
          x="-250" 
          y="-100" 
          width="500" 
          height="300" 
          preserveAspectRatio="none"
          opacity="0.9"
        />
        {/* Oscurecimiento sutil para integrar con la escena nocturna */}
        <polygon 
          points="0,-40 180,50 0,140 -180,50" 
          fill="#0a1120" 
          opacity="0.25"
        />
      </g>

      {/* Iluminación direccional sobre la textura */}
      <polygon 
        points="0,-40 180,50 0,140 -180,50" 
        fill="url(#roof-light)" 
      />

      {/* ============================================= */}
      {/* === PRETIL (borde perimetral del techo)     == */}
      {/* ============================================= */}
      
      {/* Cara izquierda del pretil */}
      <polygon points="-180,50 0,140 0,147 -180,57" fill="#1e293b" />
      {/* Cara derecha del pretil */}
      <polygon points="0,140 180,50 180,57 0,147" fill="#334155" />
      
      {/* Borde superior metálico (flasheo/coping) */}
      <polyline points="-180,50 0,140 180,50" fill="none" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
      {/* Borde inferior oscuro (sombra base del pretil) */}
      <polyline points="-180,57 0,147 180,57" fill="none" stroke="#0f172a" strokeWidth="2" opacity="0.8" />
    </g>
  );
};
