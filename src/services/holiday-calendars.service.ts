import api from './api';

export interface Holiday {
  id: string;
  date: string;
  description: string | null;
  holidayCalendarId: string;
}

export interface HolidayCalendar {
  id: string;
  name: string;
  year: number | null;
  holidays: Holiday[];
  createdAt: string;
  updatedAt: string;
}

export const holidayCalendarsService = {
  getAll: async (): Promise<HolidayCalendar[]> => {
    const res = await api.get('/holiday-calendars');
    return res.data;
  },

  getById: async (id: string): Promise<HolidayCalendar> => {
    const res = await api.get(`/holiday-calendars/${id}`);
    return res.data;
  },

  create: async (data: { name: string; year?: number }): Promise<HolidayCalendar> => {
    const res = await api.post('/holiday-calendars', data);
    return res.data;
  },

  update: async (id: string, data: { name?: string; year?: number }): Promise<HolidayCalendar> => {
    const res = await api.put(`/holiday-calendars/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/holiday-calendars/${id}`);
  },

  addHoliday: async (calendarId: string, data: { date: string; description?: string }): Promise<Holiday> => {
    const res = await api.post(`/holiday-calendars/${calendarId}/holidays`, data);
    return res.data;
  },

  removeHoliday: async (calendarId: string, holidayId: string): Promise<void> => {
    await api.delete(`/holiday-calendars/${calendarId}/holidays/${holidayId}`);
  }
};
