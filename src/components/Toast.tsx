'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 5000 }: ToastProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      // Update progress bar
      const interval = setInterval(() => {
        setProgress((prev) => {
          const decrement = (100 / duration) * 50;
          return Math.max(0, prev - decrement);
        });
      }, 50);

      return () => {
        clearTimeout(timer);
        clearInterval(interval);
      };
    }
  }, [duration, onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: AlertCircle,
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const progressColors = {
    success: 'bg-green-500 dark:bg-green-400',
    error: 'bg-red-500 dark:bg-red-400',
    info: 'bg-blue-500 dark:bg-blue-400',
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 40
      }}
      className={`${colors[type]} border rounded-lg shadow-xl p-4 flex flex-col gap-2 min-w-[320px] max-w-md backdrop-blur-sm relative overflow-hidden`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-1 rounded-full ${type === 'success' ? 'bg-green-100 dark:bg-green-800' : type === 'error' ? 'bg-red-100 dark:bg-red-800' : 'bg-blue-100 dark:bg-blue-800'}`}>
          <Icon className={`w-5 h-5 flex-shrink-0 ${iconColors[type]}`} />
        </div>
        <p className="flex-1 text-sm font-semibold">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity p-1 rounded hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5">
        <motion.div
          className={`h-full ${progressColors[type]}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed top-24 right-4 z-[100] space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
