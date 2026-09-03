import api from './api';

export const reportService = {
  getLostReports: async (cursor, limit = 20) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append('cursor', cursor);
    
    const response = await api.get(`/reports/lost?${params.toString()}`);
    return response.data; // { items, nextCursor, hasMore }
  },

  getFoundReports: async (cursor, limit = 20) => {
    const params = new URLSearchParams({ limit });
    if (cursor) params.append('cursor', cursor);

    const response = await api.get(`/reports/found?${params.toString()}`);
    return response.data;
  },

  searchFoundReports: async (filters) => {
    const params = new URLSearchParams();
    if (filters.q) params.append('q', filters.q);
    if (filters.category) params.append('category', filters.category);
    if (filters.startTime) params.append('startTime', filters.startTime);
    if (filters.endTime) params.append('endTime', filters.endTime);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.cursor) params.append('cursor', filters.cursor);

    const response = await api.get(`/search/found?${params.toString()}`);
    return response.data;
  },

  getMyReports: async (type) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);

    const response = await api.get(`/reports/my?${params.toString()}`);
    return response.data; // { items: [...] }
  },

  markResolved: async (id) => {
    const response = await api.patch(`/reports/${id}`, { status: 'RESOLVED' });
    return response.data; // { report: ... }
  }
};

