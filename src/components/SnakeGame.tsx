'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Play, Pause } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

interface SnakeGameProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SnakeGame({ isOpen, onClose }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 0, y: 0 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number | undefined>(undefined);

  const GRID_SIZE = 20;
  const CANVAS_SIZE = 400;
  const TILE_COUNT = CANVAS_SIZE / GRID_SIZE;

  const generateFood = useCallback((currentSnake: Position[]) => {
    const tileCount = CANVAS_SIZE / GRID_SIZE;
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPlaying(false);
    setIsPaused(false);
  }, [generateFood]);

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    setIsPlaying(true);
    setIsPaused(false);
    if (direction.x === 0 && direction.y === 0) {
      setDirection({ x: 1, y: 0 }); // Start moving right
    }
  };

  const pauseGame = () => {
    setIsPaused(!isPaused);
  };

  const gameLoop = useCallback(() => {
    if (!isPlaying || isPaused || gameOver) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      head.x += direction.x;
      head.y += direction.y;

      // Check wall collision
      if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prevScore => prevScore + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPlaying, isPaused, TILE_COUNT, generateFood]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw snake
    ctx.fillStyle = '#16a34a';
    snake.forEach((segment, index) => {
      if (index === 0) {
        // Draw head differently
        ctx.fillStyle = '#15803d';
      } else {
        ctx.fillStyle = '#16a34a';
      }
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(
      food.x * GRID_SIZE + 1,
      food.y * GRID_SIZE + 1,
      GRID_SIZE - 2,
      GRID_SIZE - 2
    );

    // Draw grid lines (optional)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(i * GRID_SIZE, 0);
      ctx.lineTo(i * GRID_SIZE, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * GRID_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * GRID_SIZE);
      ctx.stroke();
    }
  }, [snake, food, GRID_SIZE, TILE_COUNT]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isOpen) return;

      const { key } = e;

      if (key === ' ') {
        e.preventDefault();
        if (gameOver) {
          resetGame();
          startGame();
        } else if (isPlaying) {
          pauseGame();
        } else {
          startGame();
        }
        return;
      }

      if (!isPlaying || isPaused) return;

      let newDirection = { ...direction };

      switch (key) {
        case 'ArrowUp':
          if (direction.y !== 1) newDirection = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
          if (direction.y !== -1) newDirection = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) newDirection = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
          if (direction.x !== -1) newDirection = { x: 1, y: 0 };
          break;
      }

      setDirection(newDirection);
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [direction, isOpen, gameOver, isPlaying, isPaused, resetGame]);

  // Game loop
  useEffect(() => {
    if (isPlaying && !isPaused && !gameOver) {
      gameLoopRef.current = window.setInterval(gameLoop, 150);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, isPlaying, isPaused, gameOver]);

  // Draw game
  useEffect(() => {
    draw();
  }, [draw]);

  // Reset game when modal opens
  useEffect(() => {
    if (isOpen) {
      resetGame();
    }
  }, [isOpen, resetGame]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
            className="bg-white rounded-xl p-8 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Snake Game</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-center space-y-6">
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="border-2 border-gray-300 rounded-lg mx-auto block"
              />

              <div className="flex justify-between items-center">
                <div className="text-left">
                  <p className="text-lg font-semibold">Score: {score}</p>
                  <p className="text-sm text-gray-600">
                    {gameOver ? 'Game Over!' : isPlaying && !isPaused ? 'Playing' : 'Paused'}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={resetGame}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors duration-200 flex items-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Reset
                  </button>
                  <button
                    onClick={gameOver ? startGame : isPlaying ? pauseGame : startGame}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    {gameOver ? (
                      <>
                        <Play size={16} />
                        Start
                      </>
                    ) : isPlaying && !isPaused ? (
                      <>
                        <Pause size={16} />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play size={16} />
                        {isPlaying ? 'Resume' : 'Start'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>Use arrow keys to move</p>
                <p>Press spacebar to start/pause/restart</p>
                <p>Eat the yellow food to grow and score points!</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}