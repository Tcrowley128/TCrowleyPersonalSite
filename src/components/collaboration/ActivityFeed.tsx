'use client';

import { useState, useEffect } from 'react';
import { Activity, User, Calendar, ArrowRight, MessageSquare, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

interface ActivityItem {
  id: string;
  entity_type: string;
  entity_id: string;
  activity_type: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  user_id: string;
  user_name: string | null;
  created_at: string;
  description: string | null;
  metadata: any;
  project_id: string | null;
  assessment_id: string | null;
  entity_title: string | null;
  project_title: string | null;
}

interface ActivityFeedProps {
  assessmentId?: string;
  projectId?: string;
  entityType?: string;
  entityId?: string;
  limit?: number;
}

export function ActivityFeed({
  assessmentId,
  projectId,
  entityType,
  entityId,
  limit = 50
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [assessmentId, projectId, entityType, entityId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (assessmentId) params.append('assessment_id', assessmentId);
      if (projectId) params.append('project_id', projectId);
      if (entityType) params.append('entity_type', entityType);
      if (entityId) params.append('entity_id', entityId);
      params.append('limit', limit.toString());

      const response = await fetch(`/api/activity?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      } else {
        setError('Failed to load activity feed');
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Failed to load activity feed');
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
        return <Zap className="w-4 h-4 text-green-500" />;
      case 'updated':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'status_changed':
        return <CheckCircle2 className="w-4 h-4 text-purple-500" />;
      case 'assigned':
        return <User className="w-4 h-4 text-orange-500" />;
      case 'commented':
        return <MessageSquare className="w-4 h-4 text-cyan-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      project: 'Project',
      task: 'Task',
      pbi: 'Backlog Item',
      sprint: 'Sprint',
      risk: 'Risk',
      comment: 'Comment'
    };
    return labels[type] || type;
  };

  const getEntityUrl = (activity: ActivityItem): string | null => {
    const { entity_type, entity_id, assessment_id, project_id } = activity;

    if (!assessment_id) return null;

    // Base journey URL
    const journeyBase = `/assessment/journey/${assessment_id}`;

    switch (entity_type) {
      case 'pbi':
        // PBIs are viewed in the sprint management section
        // Include project_id if available to auto-select the right project
        if (project_id) {
          return `${journeyBase}?section=sprints&project=${project_id}&pbi=${entity_id}`;
        }
        return `${journeyBase}?section=sprints&pbi=${entity_id}`;
      case 'project':
        // Projects are in the projects section
        return `${journeyBase}?section=projects&project=${entity_id}`;
      case 'risk':
        // Risks are in the risks section
        // Include project_id if available
        if (project_id) {
          return `${journeyBase}?section=risks&project=${project_id}&risk=${entity_id}`;
        }
        return `${journeyBase}?section=risks&risk=${entity_id}`;
      default:
        // Default to journey page
        return journeyBase;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <Activity className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p className="text-lg font-medium mb-2">No activity yet</p>
        <p className="text-sm">Activity will appear here as your team collaborates</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {activities.map((activity, index) => {
        const entityUrl = getEntityUrl(activity);
        const ActivityWrapper = entityUrl ? 'a' : 'div';
        const wrapperProps = entityUrl ? { href: entityUrl, className: 'block' } : {};

        return (
          <ActivityWrapper
            key={activity.id}
            {...wrapperProps}
          >
            <div
              className="flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              {/* Icon */}
              <div className="flex-shrink-0 pt-1">
                {getActivityIcon(activity.activity_type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Description */}
                {activity.description ? (
                  <p className="text-sm text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                ) : (
                  <div className="text-sm">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {activity.user_name || activity.user_id}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {' '}{activity.activity_type.replace('_', ' ')}{' '}
                      {getEntityTypeLabel(activity.entity_type)}
                    </span>
                  </div>
                )}

                {/* Entity context - show what was commented on */}
                {activity.entity_title && (
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{getEntityTypeLabel(activity.entity_type)}:</span>{' '}
                    <span className="text-gray-700 dark:text-gray-300">{activity.entity_title}</span>
                    {activity.project_title && activity.entity_type !== 'project' && (
                      <>
                        {' '}in{' '}
                        <span className="text-gray-700 dark:text-gray-300">{activity.project_title}</span>
                      </>
                    )}
                  </div>
                )}

            {/* Field change details */}
            {activity.field_name && activity.old_value && activity.new_value && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {activity.field_name.replace('_', ' ')}:
                </span>
                <span className="px-2 py-0.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-xs max-w-[100px] truncate">
                  {activity.old_value}
                </span>
                <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
                <span className="px-2 py-0.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-xs max-w-[100px] truncate">
                  {activity.new_value}
                </span>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User size={11} />
                <span>{activity.user_name || activity.user_id}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={11} />
                <span>{formatDate(activity.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </ActivityWrapper>
    );
  })}
    </div>
  );
}
