import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'SUPERVISOR' | 'EMPLEADO' | 'TECNICO' | 'PEON' | 'CLIENT' | 'CONTRATISTA' | 'OBRERO' | null;

export interface Contract {
  contractType: string;
  startDate: string;
  endDate?: string;
  salary?: number;
  workingHours: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  contract?: Contract | null;
  customPermissions?: string[] | null;
  requirePasswordChange?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, jwtToken: string) => void;
  logout: () => void;
  completePasswordChange: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Persistence on load
  useEffect(() => {
    const storedUser = localStorage.getItem('coastline_user');
    const storedToken = localStorage.getItem('coastline_token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (userData: User, jwtToken: string) => {
    // Forçamos cambio de contraseña solo en simulación o si el backend lo indicara. 
    // Lo mantendremos en false a menos que el backend nos diga otra cosa.
    const userToSave = { ...userData, requirePasswordChange: userData.requirePasswordChange ?? false };
    
    // Limpiar cualquier sub-usuario de contratista anterior al iniciar sesión
    localStorage.removeItem('contractor_worker_id');
    localStorage.removeItem('contractor_worker_name');

    setUser(userToSave);
    setToken(jwtToken);
    localStorage.setItem('coastline_user', JSON.stringify(userToSave));
    localStorage.setItem('coastline_token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('coastline_user');
    localStorage.removeItem('coastline_token');
    localStorage.removeItem('contractor_worker_id');
    localStorage.removeItem('contractor_worker_name');
  };

  const completePasswordChange = () => {
    if (user) {
      const updatedUser = { ...user, requirePasswordChange: false };
      setUser(updatedUser);
      localStorage.setItem('coastline_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, completePasswordChange }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
