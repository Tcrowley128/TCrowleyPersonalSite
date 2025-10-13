'use client';

import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import SnakeGame from './SnakeGame';

export default function Footer() {
  const [showGame, setShowGame] = useState(false);

  return (
    <>
      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <p className="text-gray-300 dark:text-gray-400">
                © 2025 Tyler Crowley. Made with Claude Code.
              </p>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-800 dark:bg-slate-900 text-gray-300 dark:text-gray-400 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse"></span>
                  Built with AI
                </span>
                <a
                  href="/privacy"
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-200 dark:hover:text-gray-300 transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
            <button
              onClick={() => setShowGame(true)}
              className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 transition-colors duration-200 opacity-30 hover:opacity-100"
              title="Play Snake Game"
            >
              <Gamepad2 size={24} />
            </button>
          </div>
        </div>
      </footer>

      {showGame && (
        <SnakeGame
          isOpen={showGame}
          onClose={() => setShowGame(false)}
        />
      )}
    </>
  );
}