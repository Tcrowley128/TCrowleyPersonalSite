import { Sparkles } from 'lucide-react';

interface AskAIButtonProps {
  onClick: () => void;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function AskAIButton({ onClick, label = "Ask AI", size = 'sm', className = '' }: AskAIButtonProps) {
  const sizeClasses = size === 'sm'
    ? 'px-3 py-1.5 text-xs'
    : 'px-4 py-2 text-sm';

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all hover:shadow-md ${sizeClasses} ${className}`}
      title={label}
    >
      <Sparkles className={iconSize} />
      <span>{label}</span>
    </button>
  );
}
