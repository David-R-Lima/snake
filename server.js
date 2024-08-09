import { createServer } from 'node:http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3333;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const GAME_TICK = 100; 
const GAME_WIDTH = 1200;
const GAME_HEIGHT = 950;
const INITIAL_FRUITS_COUNT = 5; 

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  let gameState = {
    snakes: [],
    fruits: Array.from({ length: INITIAL_FRUITS_COUNT }, generateNewFruit),
  };

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.emit('init', gameState);

    socket.on('join', (playerData) => {
      let newSnake = { id: socket.id, body: playerData.data, direction: 'right' };
      gameState.snakes.push(newSnake);
      io.emit('update', gameState);
    });

    socket.on('move', (data) => {
      const clientSnake = gameState.snakes.find(s => s.id === socket.id);
      if (clientSnake) {
        clientSnake.direction = data.direction;
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
      gameState.snakes = gameState.snakes.filter(snake => snake.id !== socket.id);
      io.emit('update', gameState);
    });
  });

  // Game loop to update snake positions and game state
  setInterval(() => {
    gameState.snakes.forEach(snake => {
      // Update the snake's position based on its direction
      snake.body = moveSnake(snake.body, snake.direction);

      // Check if the snake has eaten any fruit
      const fruitIndex = gameState.fruits.findIndex(fruit => 
        fruit.top === snake.body[0].top && fruit.left === snake.body[0].left
      );

      if (fruitIndex !== -1) {
        // Grow the snake
        snake.body = growSnake(snake.body, snake.direction);
        // Remove the eaten fruit
        gameState.fruits.splice(fruitIndex, 1);
        // Add a new fruit
        gameState.fruits.push(generateNewFruit());
      }
    });

    io.emit('update', gameState); // Emit to all clients

  }, GAME_TICK);

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });

  // Helper function to move the snake
  function moveSnake(body, direction) {
    const newBody = body.map((segment, index) => {

      if (index === 0) {

        let newTop = segment.top;
        let newLeft = segment.left;
        // Move the head of the snake
        switch (direction) {
          case 'up':
            newTop -= 10;
            break;
          case 'down':
            newTop += 10;
            break;
          case 'left':
            newLeft -= 10;
            break;
          case 'right':
            newLeft += 10;
            break;
        }
  
        // Verifica se a cabeça da cobra ultrapassou os limites
        if (newTop < 0 || newTop >= GAME_HEIGHT || newLeft < 0 || newLeft >= GAME_WIDTH) {
          return resetSnakePosition();
        }
  
        return { ...segment, top: newTop, left: newLeft };
      } else {
        // Move the segment to the previous segment's position
        return { ...body[index - 1] };
      }
    });
    return newBody;
  }

  // Helper function to grow the snake
  function growSnake(body, direction) {
    const lastSegment = body[body.length - 1];
    const newSegment = { ...lastSegment };

    switch (direction) {
      case 'up':
        newSegment.top += 10;
        break;
      case 'down':
        newSegment.top -= 10;
        break;
      case 'left':
        newSegment.left += 10;
        break;
      case 'right':
        newSegment.left -= 10;
        break;
    }

    return [...body, newSegment];
  }

  // Helper function to generate a new fruit
  function generateNewFruit() {
    const randomX = Math.floor(Math.random() * (GAME_WIDTH / 10)) * 10;
    const randomY = Math.floor(Math.random() * (GAME_HEIGHT / 10)) * 10;
    return { top: randomY, left: randomX };
  }

  // Helper function to reset the snake's position
  function resetSnakePosition() {
    return { top: 50, left: 50 }; // Posição inicial, ajuste conforme necessário
  }
});