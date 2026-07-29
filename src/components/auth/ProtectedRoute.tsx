import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth, UserRole } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  allowedPermissions?: string[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, allowedPermissions, children }: ProtectedRouteProps) {
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
  const userPermissions = user.customPermissions || [];

  const hasRequiredRole = Boolean(allowedRoles && roleName && allowedRoles.includes(roleName as any));
  const hasRequiredPerm = Boolean(allowedPermissions && userPermissions.some(p => allowedPermissions.includes(p)));

  // If restrictions are defined, user must have either the role OR the permission
  const hasRestrictions = Boolean(allowedRoles?.length || allowedPermissions?.length);
  const hasAccess = !hasRestrictions || hasRequiredRole || hasRequiredPerm;

  if (!hasAccess) {
    // Si el rol no está permitido, lo enviamos a su home base
    const redirectPath = roleName === 'CLIENT' ? '/app/cliente' : '/app/empleado';
    return <Navigate to={redirectPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
