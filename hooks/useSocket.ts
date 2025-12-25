
import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = (userEmail?: string, role?: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL, { reconnection: true });

    s.on('connect', () => {
      console.log('Socket Connected:', s.id);
      setIsConnected(true);
      
      if (userEmail) {
        if (role === 'doctor') {
          s.emit('join_doctor', userEmail);
        } else if (role === 'admin') {
          s.emit('join_admin', 'admin_room');
        } else {
          s.emit('join_user', userEmail);
        }
      }
    });

    s.on('disconnect', () => {
      setIsConnected(false);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [userEmail, role]);

  return { socket, isConnected };
};
