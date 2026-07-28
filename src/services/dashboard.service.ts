import api from './api';

export interface AdminDashboardSummary {
  facturacionMTD: number;
  proyectosActivos: number;
  personalActivo: number;
  cotizacionesPendientes: number;
  cotizacionesAprobadasMTD: number;
  systemAlerts: Array<{
    type: 'warning' | 'info' | 'error';
    title: string;
    desc: string;
  }>;
  trends: {
    facturacion: string;
    proyectos: string;
    personal: string;
    aprobadas: string;
  };
}

export const dashboardService = {
  getAdminSummary: async (): Promise<AdminDashboardSummary> => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  getLaborCosts: async (): Promise<any> => {
    const response = await api.get('/dashboard/labor-costs');
    return response.data;
  }
};
