'use client';

import { User } from 'lucide-react';

interface UserAvatarProps {
  email?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  className?: string;
}

export function UserAvatar({
  email,
  name,
  size = 'md',
  showTooltip = true,
  className = ''
}: UserAvatarProps) {
  const getInitials = (emailOrName?: string | null): string => {
    if (!emailOrName) return '?';

    // If it's a name with spaces, get first letters of each word
    if (emailOrName.includes(' ')) {
      const parts = emailOrName.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return emailOrName.substring(0, 2).toUpperCase();
    }

    // If it's an email, get first two letters before @
    if (emailOrName.includes('@')) {
      const username = emailOrName.split('@')[0];
      return username.substring(0, 2).toUpperCase();
    }

    // Otherwise just get first two characters
    return emailOrName.substring(0, 2).toUpperCase();
  };

  const getColorFromString = (str?: string | null): string => {
    if (!str) return 'bg-gray-400 dark:bg-gray-600';

    // Generate a consistent color based on the string
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
      'bg-blue-500 dark:bg-blue-600',
      'bg-green-500 dark:bg-green-600',
      'bg-purple-500 dark:bg-purple-600',
      'bg-pink-500 dark:bg-pink-600',
      'bg-indigo-500 dark:bg-indigo-600',
      'bg-teal-500 dark:bg-teal-600',
      'bg-orange-500 dark:bg-orange-600',
      'bg-cyan-500 dark:bg-cyan-600',
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const initials = getInitials(name || email);
  const colorClass = getColorFromString(email || name);
  const displayName = name || email || 'Unknown';

  if (!email && !name) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ${className}`}
        title={showTooltip ? 'Unassigned' : undefined}
      >
        <User className="w-1/2 h-1/2 text-gray-500 dark:text-gray-400" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      title={showTooltip ? displayName : undefined}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{ email?: string | null; name?: string | null }>;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarGroup({ users, max = 3, size = 'sm', className = '' }: AvatarGroupProps) {
  const displayUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className={`flex items-center -space-x-2 ${className}`}>
      {displayUsers.map((user, index) => (
        <div key={index} className="ring-2 ring-white dark:ring-slate-800 rounded-full">
          <UserAvatar
            email={user.email}
            name={user.name}
            size={size}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={`${size === 'xs' ? 'w-6 h-6 text-xs' : size === 'sm' ? 'w-8 h-8 text-sm' : size === 'md' ? 'w-10 h-10 text-base' : 'w-12 h-12 text-lg'} rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 font-semibold ring-2 ring-white dark:ring-slate-800`}
          title={`+${remaining} more`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
