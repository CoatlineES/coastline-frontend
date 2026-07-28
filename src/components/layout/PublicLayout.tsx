import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ScreenId } from '../../types';

export default function PublicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transitionMode, setTransitionMode] = useState<'none' | 'push'>('none');

  // Convert current pathname to ScreenId for Navbar compatibility
  const getScreenId = (): ScreenId => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.includes('deteccion')) return 'detection';
    if (path.includes('casos')) return 'cases';
    if (path.includes('contacto')) return 'contact';
    if (path.includes('login')) return 'login';
    if (path.includes('legal')) return 'legal';
    if (path.includes('privacy')) return 'privacy';
    if (path.includes('cookies')) return 'cookies';
    return 'home';
  };

  const handleNav = (screen: ScreenId, mode: 'none' | 'push' = 'none') => {
    setTransitionMode(mode);
    setIsMobileMenuOpen(false);
    
    // Map screenId to route
    switch (screen) {
      case 'home': navigate('/'); break;
      case 'detection': navigate('/deteccion'); break;
      case 'cases': navigate('/casos'); break;
      case 'contact': navigate('/contacto'); break;
      case 'login': navigate('/login'); break;
      case 'legal': navigate('/legal'); break;
      case 'privacy': navigate('/privacy'); break;
      case 'cookies': navigate('/cookies'); break;
      default: navigate('/');
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
        currentScreen={getScreenId()} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        onNavigate={handleNav} 
      />

      {/* Main Content Area with Router and Motion Transitions */}
      <main className="flex-grow pt-20 overflow-x-hidden">
        <AnimatePresence mode="wait" custom={transitionMode}>
          <motion.div
            key={location.pathname}
            custom={transitionMode}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
            className="w-full h-full flex flex-col"
          >
            {/* Cloned Element to pass the onNavigate prop to the View components */}
            {React.cloneElement(React.Children.only(<Outlet /> as React.ReactElement), { onNavigate: handleNav })}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer onNavigate={handleNav} />
    </div>
  );
}
