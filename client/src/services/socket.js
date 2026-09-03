import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId) => {
  if (socket && socket.connected) {
    return socket;
  }

  // Connect to backend server
  const serverUrl = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:5000';

  socket = io(serverUrl, {
    withCredentials: true,
    auth: {
      userId
    },
    transports: ['websocket', 'polling']
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
