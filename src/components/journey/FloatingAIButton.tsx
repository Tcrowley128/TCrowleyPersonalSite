import { Sparkles } from 'lucide-react';

interface FloatingAIButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingAIButton({ onClick, label = "Tyler's AI" }: FloatingAIButtonProps) {
  return (
    <button
      onClick={onClick}
      className="group fixed bottom-24 right-6 z-40 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 p-3"
      title={label}
    >
      <Sparkles className="w-5 h-5 flex-shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out group-hover:mr-1">
        {label}
      </span>
    </button>
  );
}
