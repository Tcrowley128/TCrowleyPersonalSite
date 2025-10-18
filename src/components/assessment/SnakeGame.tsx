'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 150;

interface Position {
  x: number;
  y: number;
}

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
  }, [generateFood]);

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying && !gameOver && (e.key.startsWith('Arrow') || ['w', 'a', 's', 'd'].includes(e.key))) {
        setIsPlaying(true);
      }

      const currentDir = directionRef.current;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, gameOver]);

  // Game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const gameInterval = setInterval(() => {
      setSnake(currentSnake => {
        const newHead = {
          x: (currentSnake[0].x + directionRef.current.x + GRID_SIZE) % GRID_SIZE,
          y: (currentSnake[0].y + directionRef.current.y + GRID_SIZE) % GRID_SIZE
        };

        // Check self collision
        if (currentSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          setIsPlaying(false);
          if (score > highScore) {
            setHighScore(score);
          }
          return currentSnake;
        }

        const newSnake = [newHead, ...currentSnake];

        // Check if food is eaten
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1);
          setFood(generateFood(newSnake));
          return newSnake;
        }

        // Remove tail if no food eaten
        newSnake.pop();
        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(gameInterval);
  }, [isPlaying, gameOver, food, score, highScore, generateFood]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Play Snake While You Wait!
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Use arrow keys or WASD to play
        </p>
      </div>

      {/* Score Display */}
      <div className="flex gap-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Score</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{score}</p>
        </div>
        {highScore > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">High Score</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{highScore}</p>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div
        className="relative border-4 border-blue-600 dark:border-blue-400 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE
        }}
      >
        {/* Snake */}
        {snake.map((segment, index) => (
          <motion.div
            key={`${segment.x}-${segment.y}-${index}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`absolute rounded-sm ${
              index === 0
                ? 'bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600'
                : 'bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700'
            }`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE - 2,
              height: CELL_SIZE - 2,
            }}
          />
        ))}

        {/* Food */}
        <motion.div
          key={`${food.x}-${food.y}`}
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          className="absolute bg-gradient-to-br from-red-500 to-red-600 rounded-full"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE - 2,
            height: CELL_SIZE - 2,
          }}
        />

        {/* Game Over Overlay */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center"
          >
            <div className="text-center">
              <h4 className="text-2xl font-bold text-white mb-2">Game Over!</h4>
              <p className="text-white mb-4">Score: {score}</p>
              <button
                onClick={resetGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}

        {/* Start Overlay */}
        {!isPlaying && !gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
          >
            <div className="text-center">
              <p className="text-white font-semibold mb-2">Press any arrow key or WASD to start</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Controls (optional for touch devices) */}
      <div className="grid grid-cols-3 gap-2 md:hidden">
        <div></div>
        <button
          onClick={() => {
            if (!isPlaying && !gameOver) setIsPlaying(true);
            if (directionRef.current.y === 0) setDirection({ x: 0, y: -1 });
          }}
          className="w-12 h-12 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all"
        >
          ↑
        </button>
        <div></div>
        <button
          onClick={() => {
            if (!isPlaying && !gameOver) setIsPlaying(true);
            if (directionRef.current.x === 0) setDirection({ x: -1, y: 0 });
          }}
          className="w-12 h-12 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all"
        >
          ←
        </button>
        <button
          onClick={() => {
            if (!isPlaying && !gameOver) setIsPlaying(true);
            if (directionRef.current.y === 0) setDirection({ x: 0, y: 1 });
          }}
          className="w-12 h-12 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all"
        >
          ↓
        </button>
        <button
          onClick={() => {
            if (!isPlaying && !gameOver) setIsPlaying(true);
            if (directionRef.current.x === 0) setDirection({ x: 1, y: 0 });
          }}
          className="w-12 h-12 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 active:scale-95 transition-all"
        >
          →
        </button>
      </div>
    </div>
  );
}
