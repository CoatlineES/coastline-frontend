import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RealisticRainEngine, WeatherState } from './RealisticRainEngine';
import { BaseBuilding } from './RoofLayers/BaseBuilding';
import { DamageLayer } from './RoofLayers/DamageLayer';
import { ScanningLayer } from './RoofLayers/ScanningLayer';
import { RepairLayer } from './RoofLayers/RepairLayer';
import { HUDOverlay } from './UI/HUDOverlay';
import { StoryTimeline } from './UI/StoryTimeline';

export default function WaterproofingShield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<RealisticRainEngine | null>(null);

  // Alignment controls for the generated image
  const [bgX, setBgX] = useState(-259);
  const [bgY, setBgY] = useState(-76);
  const [bgScale, setBgScale] = useState(0.5);

  // Calibration mode
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Story Orchestration
  const [currentPhase, setCurrentPhase] = useState(1);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  
  // Weather state
  const [weather, setWeather] = useState<WeatherState>('storm');
  const [manualWeather, setManualWeather] = useState<boolean>(false);

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new RealisticRainEngine(canvasRef.current);
    engine.theme = 'dark';
    engine.start();
    engineRef.current = engine;

    return () => {
      engine.destroy();
    };
  }, []);

  // Sync phase and weather with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.currentPhase = currentPhase;
      
      // Auto weather based on phase (if user hasn't taken manual control)
      if (!manualWeather) {
        if (currentPhase === 1 || currentPhase === 2) setWeather('clear');
        else if (currentPhase === 3 || currentPhase === 4) setWeather('rain');
        else if (currentPhase === 5) setWeather('storm');
      }
      
      engineRef.current.weather = weather;
    }
  }, [currentPhase, weather, manualWeather]);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlay) return;

    // Stop at the last phase
    if (currentPhase === 5) {
      setIsAutoPlay(false);
      return;
    }

    const phaseDuration = currentPhase === 4 ? 6000 : 4000;

    const timer = setTimeout(() => {
      setCurrentPhase(prev => prev + 1);
    }, phaseDuration);

    return () => clearTimeout(timer);
  }, [currentPhase, isAutoPlay]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!engineRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const centerX = rect.width / 2;
    const wind = ((x - centerX) / centerX) * 20;
    engineRef.current.targetWindX = wind;
  };

  const handleMouseEnter = () => {
    // Only pause if we are not already finished
    if (currentPhase !== 5) {
      setIsAutoPlay(false);
    }
  };

  const handleMouseLeave = () => {
    if (engineRef.current) {
      engineRef.current.targetWindX = 0;
    }
  };

  const changeWeather = (newWeather: WeatherState) => {
    setManualWeather(true);
    setWeather(newWeather);
  };

  const handleToggleAutoPlay = () => {
    if (!isAutoPlay && currentPhase === 5) {
      setCurrentPhase(1);
      setIsAutoPlay(true);
    } else {
      setIsAutoPlay(!isAutoPlay);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
      className="relative w-full overflow-hidden cursor-crosshair transition-all duration-700 rounded-3xl shadow-[0_30px_100px_rgba(26,76,138,0.25)] border border-white/10 ring-1 ring-white/5 h-full min-h-[500px] max-h-[700px] bg-[#1a253a]"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Dynamic Background Atmosphere (Slightly Lighter Theme) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transition-colors duration-1000">
        <div className={`absolute inset-0 transition-opacity duration-1000 ${weather === 'clear' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-[#2a68c0] to-[#1a253a]`}></div>
        <div className={`absolute inset-0 transition-opacity duration-1000 ${weather !== 'clear' ? 'opacity-100' : 'opacity-0'} bg-gradient-to-b from-[#344d78] to-[#1a253a]`}></div>
        
        {/* Sun Flare for Clear Weather */}
        <AnimatePresence>
          {weather === 'clear' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 2 }}
              className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-200/20 rounded-full blur-[100px]"
            />
          )}
        </AnimatePresence>
      </div>

      {/* UI Overlay Flex Container */}
      <div className="absolute inset-0 z-40 pointer-events-none flex flex-col justify-between p-4 md:p-8">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="w-full md:w-auto">
            <HUDOverlay currentPhase={currentPhase} />
          </div>
          
          <div className="pointer-events-auto flex flex-row md:flex-col gap-2 self-start md:self-auto bg-black/20 md:bg-transparent p-2 md:p-0 rounded-2xl md:rounded-none backdrop-blur-md md:backdrop-blur-none border border-white/10 md:border-none">
            <WeatherButton icon="☀️" active={weather === 'clear'} onClick={() => changeWeather('clear')} label="Despejado" />
            <WeatherButton icon="🌧️" active={weather === 'rain'} onClick={() => changeWeather('rain')} label="Lluvia" />
            <WeatherButton icon="⛈️" active={weather === 'storm'} onClick={() => changeWeather('storm')} label="Tormenta" />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="w-full pb-2 md:pb-0 pointer-events-auto">
          <StoryTimeline 
            currentPhase={currentPhase} 
            setPhase={setCurrentPhase} 
            isAutoPlay={isAutoPlay} 
            toggleAutoPlay={handleToggleAutoPlay} 
          />
        </div>
      </div>

      {/* ISOMETRIC STRUCTURE (SVG Layers) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none drop-shadow-2xl" ref={svgContainerRef}>
        <motion.svg 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          viewBox="0 0 500 400" 
          className="w-[450px] md:w-[600px] h-auto translate-y-8 overflow-visible"
        >
          <BaseBuilding bgX={bgX} bgY={bgY} bgScale={bgScale} />
          <DamageLayer currentPhase={currentPhase} />
          <ScanningLayer currentPhase={currentPhase} />
          <RepairLayer currentPhase={currentPhase} />
        </motion.svg>
      </div>

      {/* RAIN PHYSICS ENGINE CANVAS */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-20 pointer-events-none"
      />
    </motion.div>
  );
}

// Weather Widget Button
const WeatherButton: React.FC<{ icon: string, active: boolean, onClick: () => void, label: string }> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 backdrop-blur-md border ${active ? 'bg-white/20 border-white/50 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-black/20 border-white/10 hover:bg-white/10'}`}
  >
    <span className="text-lg">{icon}</span>
    <span className="absolute top-12 right-auto md:top-auto md:right-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none border border-white/10 z-50">
      {label}
    </span>
  </button>
);
