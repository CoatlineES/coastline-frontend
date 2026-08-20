import api from './api';

export interface PlannedTaskWorker {
  id: string;
  projectTaskId: string;
  projectTaskComponentId?: string | null;
  userId?: string | null;
  user?: { id: string; name: string; email: string };
  contractorWorkerId?: string | null;
  contractorWorker?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskComponent {
  id: string;
  taskId: string;
  resourceId?: string;
  concept: string;
  unit?: string;
  quantity: number;
  unitCost: number;
  resourceType?: string;
  plannedWorkers?: PlannedTaskWorker[];
  dailyLogTaskWorkers?: any[]; // Executed workers from daily logs
}

export interface ProjectTask {
  id: string;
  planId: string;
  parentId: string | null;
  name: string;
  alias?: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  duration: number;
  durationDays?: number | null;
  durationMinutes?: number | null;
  progress: number;
  order: number;
  type: string;
  quantity?: number;
  unit?: string;
  resourceId?: string;
  margin?: number;
  children?: ProjectTask[];
  components?: ProjectTaskComponent[];
  inventoryRequests?: any[]; // Solicitudes de inventario para esta tarea
  baselineStartDate?: string | null;
  baselineEndDate?: string | null;
  isUnplanned?: boolean;
}

export interface ProjectPlan {
  id: string;
  version: string;
  isActive: boolean;
  projectId: string;
  project?: any;
  tasks?: ProjectTask[];
}

export const projectPlanningService = {
  getPlansByProjectId: async (projectId: string): Promise<ProjectPlan[]> => {
    const { data } = await api.get(`/project-planning/projects/${projectId}/plans`);
    return data;
  },

  getPlanTree: async (planId: string): Promise<ProjectPlan> => {
    const { data } = await api.get(`/project-planning/plans/${planId}`);
    return data;
  },

  getAllActivePlanTrees: async (): Promise<ProjectPlan[]> => {
    const { data } = await api.get('/project-planning/active-plans-trees');
    return data;
  },

  createPlan: async (projectId: string, version: string): Promise<ProjectPlan> => {
    const { data } = await api.post(`/project-planning/projects/${projectId}/plans`, { version });
    return data;
  },

  createTask: async (planId: string, taskData: Partial<ProjectTask>): Promise<ProjectTask> => {
    const { data } = await api.post(`/project-planning/plans/${planId}/tasks`, taskData);
    return data;
  },

  saveBaseline: async (planId: string): Promise<{message: string}> => {
    const { data } = await api.post(`/project-planning/plans/${planId}/baseline`);
    return data;
  },

  shiftPlanDates: async (planId: string, newStartDate: Date): Promise<{message: string}> => {
    const { data } = await api.post(`/project-planning/plans/${planId}/shift`, { newStartDate: newStartDate.toISOString() });
    return data;
  },

  shiftZoneDates: async (zoneId: string, newStartDate: Date): Promise<{message: string}> => {
    const { data } = await api.post(`/project-planning/zones/${zoneId}/shift`, { newStartDate: newStartDate.toISOString() });
    return data;
  },

  updateTask: async (taskId: string, taskData: Partial<ProjectTask>): Promise<ProjectTask> => {
    const { data } = await api.patch(`/project-planning/tasks/${taskId}`, taskData);
    return data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/project-planning/tasks/${taskId}`);
  },

  generateFromQuotation: async (projectId: string, quotationId: string): Promise<ProjectPlan> => {
    const { data } = await api.post(`/project-planning/projects/${projectId}/plans/generate-from-quotation`, { quotationId });
    return data;
  },

  generateQuotationFromPlan: (planId: string, accountId: string, dealId: string) =>
    api.post(`/project-planning/plans/${planId}/generate-quotation`, { accountId, dealId }).then(res => res.data),

  deletePlan: async (planId: string): Promise<void> => {
    await api.delete(`/project-planning/plans/${planId}`);
  },

  updatePlan: async (planId: string, version: string): Promise<ProjectPlan> => {
    const { data } = await api.patch(`/project-planning/plans/${planId}`, { version });
    return data;
  },

  // Components
  getTaskComponents: (taskId: string) => 
    api.get(`/project-planning/tasks/${taskId}/components`).then(res => res.data),

  recalculatePlan: (planId: string) => 
    api.post(`/project-planning/plans/${planId}/recalculate`).then(res => res.data),
  
  
  addTaskComponent: (taskId: string, data: Partial<ProjectTaskComponent>) => 
    api.post(`/project-planning/tasks/${taskId}/components`, data).then(res => res.data),
    
  updateTaskComponent: (componentId: string, data: Partial<ProjectTaskComponent>) => 
    api.put(`/project-planning/components/${componentId}`, data).then(res => res.data),
    
  deleteTaskComponent: (componentId: string) => 
    api.delete(`/project-planning/components/${componentId}`).then(res => res.data),

  // Planned Task Workers
  assignWorkerToComponent: (taskId: string, componentId: string, payload: { userId?: string; contractorWorkerId?: string; force?: boolean }): Promise<PlannedTaskWorker> =>
    api.post(`/project-planning/tasks/${taskId}/components/${componentId}/workers`, payload).then(res => res.data),

  removeWorkerFromComponent: (assignmentId: string): Promise<void> =>
    api.delete(`/project-planning/workers/${assignmentId}`).then(res => res.data),

  getProjectSummary: (projectId: string) =>
    api.get(`/project-planning/project/${projectId}/summary`).then(res => res.data),

  getWorkersSummary: (projectId: string) =>
    api.get(`/project-planning/project/${projectId}/workers-summary`).then(res => res.data),

  getProductionSummary: (projectId: string) =>
    api.get(`/project-planning/project/${projectId}/production-summary`).then(res => res.data),

  getTasksForDate: (projectId: string, date: string) =>
    api.get(`/project-planning/project/${projectId}/tasks-for-date`, { params: { date } }).then(res => res.data),
};
