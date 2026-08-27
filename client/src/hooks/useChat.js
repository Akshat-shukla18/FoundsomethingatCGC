import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

// Note: For simplicity in MVP, we grab the userId from some global state or local storage.
// In production, the WebSocket connection should ideally authenticate via the secure session cookie.

export const useChat = (conversationId, userId) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!conversationId || !userId) return;

    // Connect to WebSocket server with reconnection logic (socket.io handles bounded backoff)
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { userId },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('join_conversation', { conversationId });
      setError(null);
    });

    newSocket.on('message.new', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('typing.start', ({ userId: typingUserId }) => {
      if (typingUserId !== userId) setIsTyping(true);
    });

    newSocket.on('typing.stop', ({ userId: typingUserId }) => {
      if (typingUserId !== userId) setIsTyping(false);
    });

    newSocket.on('error', (err) => {
      setError(err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId, userId]);

  const sendMessage = useCallback((text) => {
    if (socket && text.trim()) {
      socket.emit('message.send', { conversationId, text });
    }
  }, [socket, conversationId]);

  const startTyping = useCallback(() => {
    if (socket) socket.emit('typing.start', { conversationId });
  }, [socket, conversationId]);

  const stopTyping = useCallback(() => {
    if (socket) socket.emit('typing.stop', { conversationId });
  }, [socket, conversationId]);

  return {
    messages,
    setMessages, // For initial load
    sendMessage,
    startTyping,
    stopTyping,
    isTyping,
    error
  };
};

