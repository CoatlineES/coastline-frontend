import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, FileText, CheckSquare, LogOut, Menu, X, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import logoUrl from '../../assets/logo.png';

export default function ClientLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: "Resumen de Obras", path: "/app/cliente", icon: <Home size={18} /> },
    { name: "Mis Informes", path: "/app/cliente/informes", icon: <FileText size={18} /> },
    { name: "Presupuestos y Certificaciones", path: "/app/cliente/certificaciones", icon: <CheckSquare size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f8] font-sans flex flex-col">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <img src={logoUrl} alt="Coatline" className="h-8 md:h-10 filter invert brightness-0" />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-2">
              {navItems.map((item, idx) => (
                <NavLink
                  key={idx}
                  to={item.path}
                  end={item.path === "/app/cliente"}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-bold ${
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-right">
              <div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{user?.name}</p>
                <p className="text-xs text-slate-500">Portal de Cliente</p>
              </div>
              <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center text-slate-600">
                <User size={20} />
              </div>
            </div>
            
            <button onClick={handleLogout} className="hidden md:flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-700 transition-colors ml-4 pl-4 border-l border-slate-200">
              <LogOut size={16} /> Salir
            </button>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-slate-800">
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-b border-slate-200 shadow-lg absolute top-20 left-0 w-full z-30"
          >
            <nav className="flex flex-col p-4">
              {navItems.map((item, idx) => (
                <NavLink
                  key={idx}
                  to={item.path}
                  end={item.path === "/app/cliente"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-bold mb-1 ${
                      isActive ? 'bg-primary/5 text-primary' : 'text-slate-600'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ))}
              <div className="h-px bg-slate-100 my-2" />
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-10">
        <Outlet />
      </main>

    </div>
  );
}
