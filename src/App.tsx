/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Layers, Menu, X, ArrowUpRight, Globe, Share2, Phone, Mail, MapPin } from 'lucide-react';

import { ScreenId } from './types';
import HomeView from './components/HomeView';
import DetectionView from './components/DetectionView';
import CasesView from './components/CasesView';
import ContactView from './components/ContactView';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [transitionMode, setTransitionMode] = useState<'none' | 'push'>('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top on screen change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [currentScreen]);

  const handleNav = (screen: ScreenId, mode: 'none' | 'push' = 'none') => {
    setTransitionMode(mode);
    setCurrentScreen(screen);
    setIsMobileMenuOpen(false);
  };

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeView onNavigate={handleNav} />;
      case 'detection':
        return <DetectionView onNavigate={handleNav} />;
      case 'cases':
        return <CasesView onNavigate={handleNav} />;
      case 'contact':
        return <ContactView onNavigate={handleNav} />;
      default:
        return <HomeView onNavigate={handleNav} />;
    }
  };

  // Define motion variables depending on the transition mode
  const pageVariants = {
    initial: (mode: 'none' | 'push') => ({
      opacity: 0,
      x: mode === 'push' ? '100vw' : 0,
    }),
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: (mode: 'none' | 'push') => ({
      opacity: 0,
      x: mode === 'push' ? '-100vw' : 0,
    }),
  };

  const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: transitionMode === 'push' ? 0.45 : 0.15,
  };

  return (
    <div className="bg-background text-on-surface font-sans antialiased min-h-screen flex flex-col justify-between">
      
      {/* TopNavBar Header (Persistent) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-16 h-20 flex items-center justify-between">
          
          {/* Logo Brand / xpath element matches: //a[.//span[contains(text(), 'Coatline')]] */}
          <a 
            className="flex items-center gap-2 hover:opacity-90 transition-opacity shrink-0 group" 
            href="#" 
            onClick={(e) => { e.preventDefault(); handleNav('home', 'none'); }}
          >
            <span className="material-symbols-outlined text-secondary text-2xl group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>
              layers
            </span>
            <span className="font-display text-xl md:text-2xl font-bold text-primary">Coatline</span>
          </a>

          {/* Large Screen Links */}
          <div className="hidden md:flex items-center gap-6 justify-end">
            <span className="font-sans font-semibold text-xs uppercase tracking-widest text-slate-400">Servicios</span>
            <span className="font-sans font-semibold text-xs uppercase tracking-widest text-slate-400">Nosotros</span>
            <span className="font-sans font-semibold text-xs uppercase tracking-widest text-slate-400">FAQs</span>
            <div className="w-px h-4 bg-outline-variant/30 mx-1"></div>
            
            {/* Nav targets */}
            <a 
              className={`font-sans font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1 py-1.5 px-2.5 rounded ${
                currentScreen === 'detection' 
                  ? 'text-secondary bg-secondary/5 font-extrabold' 
                  : 'text-on-surface hover:text-primary'
              }`} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNav('detection', 'none'); }}
            >
              Detección Eléctrica <ArrowUpRight size={14} className="opacity-70 shrink-0" />
            </a>
            
            <a 
              className={`font-sans font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1 py-1.5 px-2.5 rounded ${
                currentScreen === 'cases' 
                  ? 'text-secondary bg-secondary/5 font-extrabold' 
                  : 'text-on-surface hover:text-primary'
              }`} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNav('cases', 'none'); }}
            >
              Casos Reales <ArrowUpRight size={14} className="opacity-70 shrink-0" />
            </a>
            
            <a 
              className={`font-sans font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1 py-1.5 px-2.5 rounded ${
                currentScreen === 'contact' 
                  ? 'text-secondary bg-secondary/5 font-extrabold' 
                  : 'text-on-surface hover:text-primary'
              }`} 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNav('contact', 'none'); }}
            >
              Contacto <ArrowUpRight size={14} className="opacity-70 shrink-0" />
            </a>
            
            {/* Push Transition Button */}
            <a 
              className="ml-4 px-6 py-2.5 bg-secondary text-white font-sans font-bold text-xs rounded hover:bg-secondary-container transition-all uppercase tracking-widest leading-none shadow-md hover:shadow-lg hover:-translate-y-0.5" 
              href="#" 
              onClick={(e) => { e.preventDefault(); handleNav('contact', 'push'); }}
            >
              Solicitar Información
            </a>
          </div>

          {/* Mobile Hamburguer button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden text-primary p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer (Absolute top layout overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-0 right-0 bg-white z-40 border-b border-slate-200 shadow-xl md:hidden p-6 text-left space-y-6"
          >
            <div className="flex flex-col gap-4">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">Navegación Móvil</div>
              
              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('home', 'none'); }}
                className={`py-2 font-display font-semibold text-base ${currentScreen === 'home' ? 'text-secondary' : 'text-primary'}`}
              >
                Inicio / Sobre Nosotros V2
              </a>

              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('detection', 'none'); }}
                className={`py-2 font-display font-semibold text-base flex items-center justify-between ${currentScreen === 'detection' ? 'text-secondary font-bold' : 'text-primary'}`}
              >
                Detección Eléctrica <ArrowUpRight size={16} />
              </a>

              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('cases', 'none'); }}
                className={`py-2 font-display font-semibold text-base flex items-center justify-between ${currentScreen === 'cases' ? 'text-secondary font-bold' : 'text-primary'}`}
              >
                Casos Reales <ArrowUpRight size={16} />
              </a>

              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('contact', 'none'); }}
                className={`py-2 font-display font-semibold text-base flex items-center justify-between ${currentScreen === 'contact' ? 'text-secondary font-bold' : 'text-primary'}`}
              >
                Contacto <ArrowUpRight size={16} />
              </a>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <a 
                href="#"
                onClick={(e) => { e.preventDefault(); handleNav('contact', 'push'); }}
                className="block text-center py-3 bg-secondary text-white font-sans font-bold text-xs rounded uppercase tracking-widest shadow-md"
              >
                Solicitar Información
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area with Router and Motion Transitions */}
      <main className="flex-grow pt-20 overflow-x-hidden">
        <AnimatePresence mode="wait" custom={transitionMode}>
          <motion.div
            key={currentScreen}
            custom={transitionMode}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full"
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer (Matches precisely image specifications in Spanish) */}
      <footer className="bg-[#001c3a] text-white w-full relative border-t border-white/5">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-16 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
            
            {/* Branding Column */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>layers</span>
                <span className="font-display text-lg md:text-xl font-bold text-white">Coatline</span>
              </div>
              <p className="font-sans text-sm text-slate-300 leading-relaxed">
                Mantenga sus superficies siempre en perfecto estado con soluciones de ingeniería premium.
              </p>
              <div className="flex gap-4 pt-2">
                <a className="text-white/80 hover:text-secondary transition-colors" href="#" aria-label="Language options">
                  <Globe size={18} />
                </a>
                <a className="text-white/80 hover:text-secondary transition-colors" href="#" aria-label="Share options">
                  <Share2 size={18} />
                </a>
              </div>
            </div>

            {/* Column 2: Servicios */}
            <div>
              <h4 className="font-sans font-bold text-xs text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-2">
                SERVICIOS
              </h4>
              <ul className="space-y-3 text-xs md:text-sm text-slate-300 font-semibold">
                <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('detection', 'none'); }}>Zero Filtraciones</a></li>
                <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('home', 'none'); }}>Mantenimiento</a></li>
                <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('cases', 'none'); }}>Impermeabilización</a></li>
                <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('home', 'none'); }}>Eficiencia Energética</a></li>
              </ul>
            </div>

            {/* Column 3: Empresa */}
            <div>
              <h4 className="font-sans font-bold text-xs text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-2">
                EMPRESA
              </h4>
              <ul className="space-y-3 text-xs md:text-sm text-slate-300 font-semibold">
                <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('home', 'none'); }}>Sobre Nosotros</a></li>
                <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('contact', 'none'); }}>Contacto</a></li>
                <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('contact', 'none'); }}>Aviso Legal</a></li>
                <li><a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('contact', 'none'); }}>Política de Privacidad</a></li>
              </ul>
            </div>

            {/* Column 4: Contacto */}
            <div>
              <h4 className="font-sans font-bold text-xs text-white mb-6 uppercase tracking-widest border-b border-white/10 pb-2">
                CONTACTO
              </h4>
              <ul className="space-y-3.5 text-xs text-slate-300 font-semibold">
                <li className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-secondary shrink-0 mt-0.5" />
                  <span>Calle de la Resina, 35. Nave 7<br />28021 Madrid</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone size={16} className="text-secondary" />
                  <span>+34 91 491 61 97</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail size={16} className="text-secondary" />
                  <span className="break-all">comercial@coatline.es</span>
                </li>
              </ul>
            </div>

          </div>
          
          {/* Subfooter */}
          <div className="border-t border-white/10 py-8 text-center mt-12 space-y-4">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-xs">
              <a className="text-white/40 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('contact', 'none'); }}>Aviso Legal</a>
              <span className="hidden md:block text-white/10">|</span>
              <a className="text-white/40 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('contact', 'none'); }}>Política de Privacidad</a>
              <span className="hidden md:block text-white/10">|</span>
              <a className="text-white/40 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); handleNav('contact', 'none'); }}>Cookies</a>
            </div>
            <p className="text-xs text-white/40 font-medium font-sans">
              © {new Date().getFullYear()} Coatline Architectural Maintenance. All rights reserved.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
