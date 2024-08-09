import { create } from 'zustand';

export interface Segment {
    direction: 'up' | 'down' | 'left' | 'right';
    top: number;
    left: number;
}

interface SnakeState {
    body: Segment[];
    config: {
        currentDirection: 'up' | 'down' | 'left' | 'right';
        unitSize: number; // Size of each segment, used for movement
    };
    moveSnake: () => Promise<Segment[]>;
    changeDirection: (newDirection: 'up' | 'down' | 'left' | 'right') => void;
    growSnake: () => void;
}

const useSnake = create<SnakeState>((set, get) => ({
    body: [
        { direction: 'right', top: 50, left: 50 },
        { direction: 'right', top: 50, left: 40 },
        { direction: 'right', top: 50, left: 30 },
        { direction: 'right', top: 50, left: 20 },
        { direction: 'right', top: 50, left: 10 },
    ],
    config: {
        currentDirection: 'right',
        unitSize: 10, // Size of each segment
    },
    moveSnake: async () => {
        set((state) => {
            const newBody = state.body.map((segment, index) => {
                if (index === 0) {
                    // Update head position
                    switch (state.config.currentDirection) {
                        case 'up':
                            return { ...segment, top: segment.top - state.config.unitSize };
                        case 'down':
                            return { ...segment, top: segment.top + state.config.unitSize };
                        case 'left':
                            return { ...segment, left: segment.left - state.config.unitSize };
                        case 'right':
                            return { ...segment, left: segment.left + state.config.unitSize };
                        default:
                            return segment;
                    }
                } else {
                    // Other segments follow the previous one
                    const previousSegment = state.body[index - 1];
                    return { ...previousSegment };
                }
            });

            return { body: newBody };
        });

        return get().body
    },
    changeDirection: (newDirection) => {
        set((state) => ({
            config: { ...state.config, currentDirection: newDirection },
        }));
    },
    growSnake: () => {
      set((state) => {
          const lastSegment = state.body[state.body.length - 1];
          const newSegment = { ...lastSegment };

          // Adjust position for new segment based on direction
          switch (lastSegment.direction) {
              case 'up':
                  newSegment.top += state.config.unitSize;
                  break;
              case 'down':
                  newSegment.top -= state.config.unitSize;
                  break;
              case 'left':
                  newSegment.left += state.config.unitSize;
                  break;
              case 'right':
                  newSegment.left -= state.config.unitSize;
                  break;
          }

          return { body: [...state.body, newSegment] };
      });
  },
}));

export default useSnake;
