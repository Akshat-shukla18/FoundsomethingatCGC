import api from './api';

export const chatService = {
  getConversations: async () => {
    const response = await api.get('/conversations');
    return response.data; // { conversations: [...] }
  },

  initiateConversation: async ({ reportId, recipientId, initialMessage }) => {
    const response = await api.post('/conversations/initiate', {
      reportId,
      recipientId,
      initialMessage
    });
    return response.data; // { conversation }
  },

  acceptConversation: async (id) => {
    const response = await api.patch(`/conversations/${id}/accept`);
    return response.data; // { conversation }
  },

  rejectConversation: async (id) => {
    const response = await api.patch(`/conversations/${id}/reject`);
    return response.data;
  },

  getMessages: async (id) => {
    const response = await api.get(`/conversations/${id}/messages`);
    return response.data; // { messages: [...] }
  },

  sendMessage: async (id, payload) => {
    const response = await api.post(`/conversations/${id}/messages`, payload);
    return response.data; // { message }
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/conversations/${id}/read`);
    return response.data;
  },

  getUnreadSummary: async () => {
    const response = await api.get('/conversations/unread-summary');
    return response.data; // { unreadCount, pendingRequestsCount, hasNotification }
  }
};
