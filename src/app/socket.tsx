'use client';

import { useEffect } from 'react';
import { socket } from '@/lib/socket';

export function Socket() {
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();

      socket.on('connect', handleConnect);

      // Desconectar ao saída
      return () => {
        socket.off('connect', handleConnect);
        if (socket.connected) {
          socket.disconnect();
        }
      };
    }
  }, []);

  const handleConnect = () => {
    console.log('Connected to server with id:', socket.id);
    socket.emit('join', {
      id: socket.id, // Utilize o ID único gerado pelo Socket.io
      data: [
        { direction: 'right', top: 50, left: 50 },
        { direction: 'right', top: 50, left: 40 },
        { direction: 'right', top: 50, left: 30 },
        { direction: 'right', top: 50, left: 20 },
        { direction: 'right', top: 50, left: 10 },
      ],
    });
  };

  return null;
}