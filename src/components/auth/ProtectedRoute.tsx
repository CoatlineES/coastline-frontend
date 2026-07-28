import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si requiere cambiar la clave y no está ya en la ruta de cambio de clave
  if (user.requirePasswordChange && location.pathname !== '/app/cambiar-clave') {
    return <Navigate to="/app/cambiar-clave" replace />;
  }

  const roleName = typeof user.role === 'object' && user.role !== null ? (user.role as any).name : user.role;

  if (allowedRoles && roleName && !allowedRoles.includes(roleName)) {
    // Si el rol no está permitido, lo enviamos a su home base
    const redirectPath = roleName === 'CLIENT' ? '/app/cliente' : '/app/empleado';
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
