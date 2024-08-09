'use client';

import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

interface Position {
  top: number;
  left: number;
}

interface Snake {
  id: string;
  body: Position[];
}

export default function Page() {
  const [fruits, setFruits] = useState<Position[]>([]);
  const [snakes, setSnakes] = useState<Snake[]>([]);

  useEffect(() => {
    // Handle user input to change direction
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          socket.emit('move', { direction: 'up' });
          break;
        case 'ArrowDown':
          socket.emit('move', { direction: 'down' });
          break;
        case 'ArrowLeft':
          socket.emit('move', { direction: 'left' });
          break;
        case 'ArrowRight':
          socket.emit('move', { direction: 'right' });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // Intervalo para solicitar o gameState ao servidor
    const interval = setInterval(() => {
      socket.emit('requestGameState');
    }, 100);

    // Inicializa o estado do jogo com dados iniciais
    socket.on('init', (initialGameState) => {
      setSnakes(initialGameState.snakes);
      setFruits(initialGameState.fruits);
    });

    // Atualiza o estado do jogo com dados do servidor
    socket.on('update', (updatedGameState) => {
      setSnakes(updatedGameState.snakes);
      setFruits(updatedGameState.fruits);
    });

    return () => {
      clearInterval(interval);
      socket.off('init');
      socket.off('update');
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '1200px',
        height: '950px',
        overflow: 'hidden', // Evita rolagem
        border: '1px solid black', // Visível para facilitar a depuração
      }}
    >
      {snakes.map(({ id, body }) =>
        body.map(({ top, left }, i) => (
          <div
            key={`${id}-${i}`}
            style={{
              width: '10px',
              height: '10px',
              position: 'absolute',
              top,
              left,
              border: '1px solid',
            }}
          ></div>
        ))
      )}
      {fruits.map(({ top, left }, i) => (
        <div
          key={`fruit-${i}`}
          style={{
            width: '10px',
            height: '10px',
            position: 'absolute',
            top,
            left,
            border: '1px solid red',
            backgroundColor: 'red',
            borderRadius: '50%',
          }}
        ></div>
      ))}
    </div>
  );
}