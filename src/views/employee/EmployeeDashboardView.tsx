import React, { Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Importación perezosa de los submódulos del dashboard para optimizar la carga
const AdminDashboard = React.lazy(() => import('./dashboards/AdminDashboard'));
const SupervisorDashboard = React.lazy(() => import('./dashboards/SupervisorDashboard'));
const TecnicoDashboard = React.lazy(() => import('./dashboards/TecnicoDashboard'));

export default function EmployeeDashboardView() {
  const { user } = useAuth();
  
  // Extraemos el rol. Puede venir como string o como objeto dependiendo del backend/Prisma
  const roleName = typeof user?.role === 'object' ? (user.role as any).name : user?.role;

  // Renderizador dinámico basado en rol
  const renderDashboard = () => {
    switch (roleName) {
      case 'SUPERADMIN':
      case 'ADMIN':
        return <AdminDashboard />;
        
      case 'SUPERVISOR':
        return <SupervisorDashboard />;
        
      case 'TECNICO':
      case 'PEON':
      case 'EMPLEADO':
      default:
        // Por seguridad, si el rol no se reconoce o es nivel base, se muestra el operativo
        return <TecnicoDashboard />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-20 text-slate-400">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-secondary rounded-full animate-spin mb-4" />
          <p className="font-bold font-sans text-sm">Cargando tu espacio de trabajo...</p>
        </div>
      }>
        {renderDashboard()}
      </Suspense>
    </div>
  );
}
