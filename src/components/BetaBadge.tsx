import { motion } from 'framer-motion';

interface BetaBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BetaBadge({ className = '', size = 'sm' }: BetaBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <motion.span
      initial={{ rotate: -8, opacity: 0, scale: 0.8 }}
      animate={{ rotate: -8, opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 0.2
      }}
      className={`inline-block ${sizeClasses[size]} ${className}`}
      style={{
        fontFamily: "'Caveat', cursive",
        fontWeight: 700,
        background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
        color: '#78350f',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transform: 'rotate(-8deg)',
        transformOrigin: 'center',
        border: '1.5px solid #d97706',
      }}
    >
      beta
    </motion.span>
  );
}
