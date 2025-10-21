'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiProps {
  duration?: number;
}

export default function Confetti({ duration = 3500 }: ConfettiProps) {
  const [pieces, setPieces] = useState<Array<{ id: number; x: number; color: string; delay: number; rotation: number }>>([]);
  const [documentHeight, setDocumentHeight] = useState(0);

  useEffect(() => {
    // Get the full document height
    setDocumentHeight(document.documentElement.scrollHeight);

    // Website theme colors: blues, purples, and white
    const colors = [
      '#3b82f6', // blue-500
      '#60a5fa', // blue-400
      '#2563eb', // blue-600
      '#8b5cf6', // purple-500
      '#a78bfa', // purple-400
      '#7c3aed', // purple-600
      '#ffffff', // white
      '#f3f4f6', // gray-100 (light)
    ];
    const newPieces = Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.6,
      rotation: Math.random() * 360
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden" style={{ height: documentHeight }}>
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{
            x: `${piece.x}vw`,
            y: -20,
            rotate: piece.rotation,
            opacity: 1
          }}
          animate={{
            y: documentHeight,
            rotate: piece.rotation + 720,
            opacity: 0
          }}
          transition={{
            duration: duration / 1000,
            delay: piece.delay,
            ease: 'linear'
          }}
          className="absolute w-3 h-3 rounded-full"
          style={{ backgroundColor: piece.color }}
        />
      ))}
    </div>
  );
}
