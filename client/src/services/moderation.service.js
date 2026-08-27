import api from './api';

export const moderationService = {
  submitReport: async (targetType, targetId, reason, details) => {
    const response = await api.post('/moderation/reports', {
      targetType, targetId, reason, details
    });
    return response.data;
  },
  
  // Admin only
  getPendingReports: async () => {
    const response = await api.get('/moderation/admin/reports');
    return response.data;
  },
  resolveReport: async (reportId, resolution) => {
    const response = await api.patch(`/moderation/admin/mod-reports/${reportId}`, { resolution });
    return response.data;
  },
  updateItemStatus: async (itemId, status, reason) => {
    const response = await api.patch(`/moderation/admin/items/${itemId}/status`, { status, reason });
    return response.data;
  },
  updateUserStatus: async (userId, status, reason) => {
    const response = await api.patch(`/moderation/admin/users/${userId}/status`, { status, reason });
    return response.data;
  },
  getAuditLogs: async () => {
    const response = await api.get('/moderation/admin/audit-logs');
    return response.data;
  }
};

