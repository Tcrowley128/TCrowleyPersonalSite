'use client';

import { useEffect, useState } from 'react';
import { History, User, Calendar, ArrowRight } from 'lucide-react';

interface Activity {
  id: string;
  activity_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  changed_by: string;
  changed_at: string;
  description: string | null;
}

interface ActivityLogProps {
  pbiId: string;
}

export function ActivityLog({ pbiId }: ActivityLogProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [pbiId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/pbis/${pbiId}/activity`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activity log:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'created':
        return <div className="w-2 h-2 rounded-full bg-green-500" />;
      case 'updated':
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      case 'status_changed':
        return <div className="w-2 h-2 rounded-full bg-purple-500" />;
      case 'assigned':
        return <div className="w-2 h-2 rounded-full bg-orange-500" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  const formatFieldValue = (value: string | null) => {
    if (!value || value === 'None') return <span className="text-gray-400 italic">None</span>;
    if (value.length > 50) return value.substring(0, 50) + '...';
    return value;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          className="flex gap-3 pb-3 border-b border-gray-200 dark:border-gray-700 last:border-0"
        >
          {/* Timeline indicator */}
          <div className="flex flex-col items-center pt-1">
            {getActivityIcon(activity.activity_type)}
            {index < activities.length - 1 && (
              <div className="w-px h-full bg-gray-200 dark:bg-gray-700 mt-1" />
            )}
          </div>

          {/* Activity content */}
          <div className="flex-1 min-w-0">
            {/* Description or field change */}
            {activity.description ? (
              <p className="text-sm text-gray-900 dark:text-white">
                {activity.description}
              </p>
            ) : activity.field_name ? (
              <div className="text-sm">
                <span className="font-medium text-gray-900 dark:text-white">
                  {activity.field_name.replace('_', ' ')}
                </span>
                <span className="text-gray-600 dark:text-gray-400"> changed</span>
                {activity.old_value && activity.new_value && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs">
                      {formatFieldValue(activity.old_value)}
                    </span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs">
                      {formatFieldValue(activity.new_value)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activity.activity_type.replace('_', ' ')}
              </p>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{activity.changed_by}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                <span>{formatDate(activity.changed_at)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
