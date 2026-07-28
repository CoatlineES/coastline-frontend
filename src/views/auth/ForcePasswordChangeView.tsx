import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import logoUrl from '../../assets/logo.png';

export default function ForcePasswordChangeView() {
  const { user, completePasswordChange } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      return;
    }

    setIsSubmitting(true);
    // Simular el guardado de la nueva contraseña
    setTimeout(() => {
      completePasswordChange();
      // Navegamos al portal correspondiente
      navigate(user?.role === 'employee' ? '/app/empleado' : '/app/cliente');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative">
      <div className="absolute top-0 w-full h-64 bg-primary rounded-b-[3rem] shadow-lg"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600">
            <ShieldAlert size={32} />
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl text-center text-slate-800 mb-2">
          Acción Requerida
        </h1>
        <p className="font-sans text-sm text-center text-slate-500 mb-8">
          Por razones de seguridad corporativa, debe establecer una nueva contraseña para su cuenta antes de continuar al portal.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="bg-red-50 text-red-600 font-sans text-sm p-3 rounded border border-red-100 text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-sans font-semibold text-xs text-slate-600 uppercase tracking-wide">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 caracteres"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1">
            <label className="font-sans font-semibold text-xs text-slate-600 uppercase tracking-wide">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 mt-4 bg-primary text-white font-sans font-bold text-sm rounded-lg hover:bg-[#002a50] transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>Guardar y Continuar <ArrowRight size={16} /></>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
