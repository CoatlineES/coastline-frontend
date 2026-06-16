import React from 'react';
import { motion } from 'motion/react';
import detectorCart from '../../assets/detector.png';

export default function CssDetectorCart() {
  return (
    <div className="relative w-full max-w-[500px] mx-auto flex items-center justify-center pointer-events-none">

      <div className="relative w-full h-full flex items-center justify-center">

        {/* --- SHADOW --- */}
        <div className="absolute bottom-[0%] w-[80%] h-[20px] bg-black/40 blur-[15px] rounded-full z-0"></div>

        <img
          src={detectorCart}
          alt="Leak Detector Cart"
          className="relative z-10 w-full h-auto object-contain drop-shadow-[0_30px_30px_rgba(0,0,0,0.7)]"
        />

        {/* --- SCREEN ANIMATION --- */}
        <div 
          className="absolute z-20 overflow-hidden bg-[#001c3a]/90 rounded-[3px] border-2 border-primary/40 flex flex-col items-center justify-between p-1"
          style={{ 
            top: '4.5%', 
            left: '68%', 
            width: '12%', 
            height: '9%',
            transform: 'perspective(150px) rotateX(15deg) rotateY(-10deg) rotateZ(22deg) skewX(8deg)',
            boxShadow: '0 0 10px rgba(0, 59, 112, 0.8) inset, 0 0 15px rgba(0, 59, 112, 0.6)'
          }}
        >
          {/* Scanning Line (Secondary color) */}
          <motion.div 
            animate={{ top: ['-10%', '110%', '-10%'] }} 
            transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
            className="absolute left-0 right-0 h-[2px] bg-secondary shadow-[0_0_8px_rgba(183,15,54,1)] z-10"
          />
          
          {/* Data Lines (Primary lightened color) */}
          <div className="w-full h-full flex flex-col justify-around opacity-90 pl-0.5">
            <motion.div animate={{ width: ['40%', '90%', '40%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }} className="h-[2px] bg-blue-300 rounded-full" />
            <motion.div animate={{ width: ['80%', '30%', '80%'] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} className="h-[2px] bg-blue-400 rounded-full" />
            <motion.div animate={{ width: ['60%', '100%', '60%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} className="h-[2px] bg-blue-300 rounded-full" />
            <motion.div animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity, ease: 'steps(2)' }} className="h-[3px] w-[20%] bg-secondary shadow-[0_0_5px_rgba(183,15,54,0.8)] rounded-full self-end mt-1" />
          </div>
        </div>

      </div>
    </div>
  );
}
