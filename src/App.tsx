import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ScreenId } from './types';

import HomeView from './views/HomeView';
import DetectionView from './views/DetectionView';
import CasesView from './views/CasesView';
import ContactView from './views/ContactView';
import LoginView from './views/LoginView';
import LegalView from './views/LegalView';
import PrivacyView from './views/PrivacyView';
import CookiesView from './views/CookiesView';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>('home');
  const [transitionMode, setTransitionMode] = useState<'none' | 'push'>('none');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top on screen change
  useEffect(() => {
    if (!window.location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
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
      case 'login':
        return <LoginView onNavigate={handleNav} />;
      case 'legal':
        return <LegalView onNavigate={handleNav} />;
      case 'privacy':
        return <PrivacyView onNavigate={handleNav} />;
      case 'cookies':
        return <CookiesView onNavigate={handleNav} />;
      default:
        return <HomeView onNavigate={handleNav} />;
    }
  };

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
      
      <Navbar 
        currentScreen={currentScreen} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        onNavigate={handleNav} 
      />

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
            className="w-full h-full flex flex-col"
          >
            {renderActiveScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNav} />

    </div>
  );
}
