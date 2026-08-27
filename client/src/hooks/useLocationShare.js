import { useState, useEffect, useCallback } from 'react';

export const useLocationShare = (socket, conversationId, currentUserId) => {
  const [activeShares, setActiveShares] = useState({}); // { [userId]: { latitude, longitude, expiresAt, locationShareId } }
  const [isSharing, setIsSharing] = useState(false);
  const [myShareId, setMyShareId] = useState(null);
  const [error, setError] = useState(null);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('location.start', (data) => {
      const { userId, locationShareId, latitude, longitude, expiresAt } = data;
      setActiveShares(prev => ({
        ...prev,
        [userId]: { locationShareId, latitude, longitude, expiresAt: new Date(expiresAt) }
      }));
      if (userId === currentUserId) {
        setIsSharing(true);
        setMyShareId(locationShareId);
      }
    });

    socket.on('location.update', (data) => {
      const { userId, latitude, longitude } = data;
      setActiveShares(prev => {
        if (!prev[userId]) return prev;
        return {
          ...prev,
          [userId]: { ...prev[userId], latitude, longitude }
        };
      });
    });

    socket.on('location.stop', (data) => {
      const { userId } = data;
      setActiveShares(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      if (userId === currentUserId) {
        setIsSharing(false);
        setMyShareId(null);
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          setWatchId(null);
        }
      }
    });

    return () => {
      socket.off('location.start');
      socket.off('location.update');
      socket.off('location.stop');
    };
  }, [socket, currentUserId, watchId]);

  // Check Expiry Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      let updated = false;
      const nextShares = { ...activeShares };
      
      Object.keys(nextShares).forEach(userId => {
        if (nextShares[userId].expiresAt <= now) {
          delete nextShares[userId];
          updated = true;
          if (userId === currentUserId) {
             setIsSharing(false);
             setMyShareId(null);
             if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          }
        }
      });
      
      if (updated) setActiveShares(nextShares);
    }, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, [activeShares, currentUserId, watchId]);

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('location.start', { conversationId, latitude, longitude });

        // Start watching for updates
        const id = navigator.geolocation.watchPosition(
          (pos) => {
            if (myShareId) {
               socket.emit('location.update', { 
                 locationShareId: myShareId, 
                 conversationId, 
                 latitude: pos.coords.latitude, 
                 longitude: pos.coords.longitude 
               });
            }
          },
          (err) => setError(err.message),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
        setWatchId(id);
        setError(null);
      },
      (err) => setError(err.message)
    );
  }, [socket, conversationId, myShareId]);

  const stopSharing = useCallback(() => {
    if (myShareId) {
      socket.emit('location.stop', { locationShareId: myShareId, conversationId });
      setIsSharing(false);
      setMyShareId(null);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
    }
  }, [socket, conversationId, myShareId, watchId]);

  return { activeShares, isSharing, startSharing, stopSharing, error };
};

