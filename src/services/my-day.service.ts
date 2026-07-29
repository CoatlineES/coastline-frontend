import api from './api';

export interface MyDayTask {
  id: string; // ProjectTask id
  planId: string;
  name: string;
  description: string;
  isUnplanned?: boolean;
  quantity?: number;
  unit?: string;
  plan: {
    project: {
      id: string;
      name: string;
    };
  };
  components?: {
    id: string;
    concept: string;
    resourceType?: string;
    plannedWorkers?: any[];
  }[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  clockInLocation?: string | null;
  clockOutLocation?: string | null;
}

const getWorkerParams = () => {
  const workerId = localStorage.getItem('contractor_worker_id');
  return workerId ? { workerId } : {};
};

const getWorkerBody = (body: any = {}) => {
  const workerId = localStorage.getItem('contractor_worker_id');
  return workerId ? { ...body, workerId } : body;
};

export const myDayService = {
  getTodayAttendance: async (): Promise<AttendanceRecord[]> => {
    const { data } = await api.get(`/my-day/attendance/today`, { params: { t: Date.now(), ...getWorkerParams() } });
    return Array.isArray(data) ? data : (data ? [data] : []);
  },

  getAttendanceHistory: async (): Promise<AttendanceRecord[]> => {
    const { data } = await api.get(`/my-day/attendance/history`, { params: { t: Date.now(), ...getWorkerParams() } });
    return Array.isArray(data) ? data : [];
  },

  getWorkLogsHistory: async (): Promise<any[]> => {
    const { data } = await api.get(`/my-day/logs/history`, { params: { t: Date.now(), ...getWorkerParams() } });
    return Array.isArray(data) ? data : [];
  },

  clockIn: async (location?: string): Promise<AttendanceRecord> => {
    const { data } = await api.post('/my-day/attendance/clock-in', getWorkerBody({ location }));
    return data;
  },

  clockOut: async (location?: string): Promise<AttendanceRecord> => {
    const { data } = await api.post('/my-day/attendance/clock-out', getWorkerBody({ location }));
    return data;
  },

  getSuggestedTasks: async (): Promise<MyDayTask[]> => {
    const { data } = await api.get('/my-day/tasks/suggested', { params: getWorkerParams() });
    return data;
  },

  getWeeklyTasks: async (): Promise<any[]> => {
    const { data } = await api.get('/my-day/tasks/weekly', { params: getWorkerParams() });
    return data;
  },

  logWork: async (date: string, logs: Array<{ projectId: string; taskId: string; hours: number; quantityDone?: number; notes?: string }>): Promise<{ success: boolean; count: number }> => {
    const { data } = await api.post('/my-day/tasks/log', getWorkerBody({ date, logs }));
    return data;
  },

  getFeed: async (projectId: string, dateStr: string): Promise<Array<{id: string, time: string, author: string, actionType: string, text: string, photoUrls?: string[], taskId?: string}>> => {
    const { data } = await api.get('/my-day/feed', { params: { projectId, dateStr, ...getWorkerParams() } });
    return data;
  },

  logFeedEntry: async (entryData: {
    projectId: string;
    dateStr: string;
    text: string;
    actionType: string;
    taskId?: string;
    componentId?: string;
    hours?: number;
    quantityDone?: number;
    photoUrls?: string[];
  }): Promise<{ success: boolean; notes: string }> => {
    const { data } = await api.post('/my-day/feed', getWorkerBody(entryData));
    return data;
  },

  deleteFeedEntry: async (entryId: string, projectId: string, dateStr: string): Promise<{ success: boolean }> => {
    const { data } = await api.delete(`/my-day/feed/${entryId}`, {
      params: { projectId, dateStr }
    });
    return data;
  }
};
