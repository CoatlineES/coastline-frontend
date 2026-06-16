import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, User, Lock, ArrowRight } from 'lucide-react';
import { ScreenId } from '../types';
import logoUrl from '../assets/logo.png';

interface LoginViewProps {
  onNavigate: (screen: ScreenId, transition: 'none' | 'push') => void;
}

export default function LoginView({ onNavigate }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState<'cliente' | 'empleado'>('cliente');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Por favor, rellena todos los campos.');
      return;
    }
    
    // Simulate API call
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setErrorMsg('Credenciales incorrectas o usuario no registrado.');
    }, 1500);
  };

  return (
    <div className="flex-grow w-full bg-[#001c3a] text-white flex flex-col justify-center items-center relative p-6 py-20">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10 relative z-10 text-slate-800"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logoUrl} alt="Coatline Logo" className="h-10 w-auto filter invert brightness-0" />
        </div>

        <div className="text-center mb-8">
          <h1 className="font-display font-black text-4xl text-primary uppercase tracking-widest mb-6">
            Acceso
          </h1>
          
          <div className="flex bg-slate-100 p-1.5 rounded-lg max-w-[260px] mx-auto mb-6">
            <button
              type="button"
              onClick={() => setRole('cliente')}
              className={`flex-1 py-2 text-sm font-sans font-bold rounded-md transition-all ${role === 'cliente' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => setRole('empleado')}
              className={`flex-1 py-2 text-sm font-sans font-bold rounded-md transition-all ${role === 'empleado' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Empleado
            </button>
          </div>

          <p className="font-sans text-sm text-slate-500">
            {role === 'cliente' 
              ? 'Inicia sesión para acceder al portal de seguimiento y facturación.'
              : 'Acceso exclusivo para el personal y técnicos operativos.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 font-sans text-sm p-3 rounded border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-sans font-semibold text-xs text-slate-600 uppercase tracking-wide">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@empresa.com"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-sans font-semibold text-xs text-slate-600 uppercase tracking-wide">
                Contraseña
              </label>
              <a href="#" className="font-sans text-xs text-secondary font-semibold hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-secondary text-white font-sans font-bold text-sm rounded-lg hover:bg-secondary-container transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>Acceder <ArrowRight size={16} /></>
            )}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="font-sans text-xs text-slate-500">
            ¿No tienes cuenta? <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('contact', 'push'); }} className="text-[#001c3a] font-bold hover:text-secondary transition-colors">Solicita información</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
