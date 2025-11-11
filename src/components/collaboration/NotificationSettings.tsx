'use client';

import { useState, useEffect } from 'react';
import { Bell, Save, Loader2, Settings, MessageSquare, UserCheck, AlertCircle, Calendar, Shield } from 'lucide-react';

interface NotificationPreferences {
  // Comment notifications
  notify_all_comments: boolean;
  notify_mentions: boolean;
  notify_comment_replies: boolean;

  // Status change notifications
  notify_any_status_change: boolean;
  notify_assigned_status_change: boolean;
  notify_watched_status_change: boolean;

  // Assignment notifications
  notify_assigned_to_me: boolean;
  notify_team_assignments: boolean;

  // Sprint/Project notifications
  notify_sprint_changes: boolean;
  notify_project_updates: boolean;

  // Risk notifications
  notify_risk_created: boolean;
  notify_risk_escalated: boolean;

  // Deadline notifications
  notify_deadline_approaching: boolean;
  notify_deadline_passed: boolean;
}

interface NotificationSettingsProps {
  userId: string;
  onClose: () => void;
}

export function NotificationSettings({ userId, onClose }: NotificationSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    notify_all_comments: false,
    notify_mentions: true,
    notify_comment_replies: true,
    notify_any_status_change: false,
    notify_assigned_status_change: true,
    notify_watched_status_change: true,
    notify_assigned_to_me: true,
    notify_team_assignments: false,
    notify_sprint_changes: true,
    notify_project_updates: false,
    notify_risk_created: true,
    notify_risk_escalated: true,
    notify_deadline_approaching: true,
    notify_deadline_passed: true
  });

  useEffect(() => {
    fetchPreferences();
  }, [userId]);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notifications/preferences?user_id=${userId}`);

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          ...preferences
        })
      });

      if (response.ok) {
        onClose();
      } else {
        alert('Failed to save notification preferences');
      }
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      alert('An error occurred while saving preferences');
    } finally {
      setSaving(false);
    }
  };

  const togglePreference = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-12">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading preferences...</p>
        </div>
      </div>
    );
  }

  const settingSections = [
    {
      title: 'Comments & Mentions',
      icon: MessageSquare,
      settings: [
        {
          key: 'notify_mentions' as keyof NotificationPreferences,
          label: 'Mentions',
          description: 'When someone @mentions you in a comment'
        },
        {
          key: 'notify_comment_replies' as keyof NotificationPreferences,
          label: 'Comment Replies',
          description: 'When someone replies to your comment'
        },
        {
          key: 'notify_all_comments' as keyof NotificationPreferences,
          label: 'All Comments',
          description: 'Every comment on items you follow (can be noisy)'
        }
      ]
    },
    {
      title: 'Status Changes',
      icon: AlertCircle,
      settings: [
        {
          key: 'notify_assigned_status_change' as keyof NotificationPreferences,
          label: 'Items Assigned to Me',
          description: 'When status changes on your assigned items'
        },
        {
          key: 'notify_watched_status_change' as keyof NotificationPreferences,
          label: 'Items I\'m Watching',
          description: 'When status changes on items you watch'
        },
        {
          key: 'notify_any_status_change' as keyof NotificationPreferences,
          label: 'Any Status Change',
          description: 'All status changes across the project (very noisy)'
        }
      ]
    },
    {
      title: 'Assignments',
      icon: UserCheck,
      settings: [
        {
          key: 'notify_assigned_to_me' as keyof NotificationPreferences,
          label: 'Assigned to Me',
          description: 'When a task or item is assigned to you'
        },
        {
          key: 'notify_team_assignments' as keyof NotificationPreferences,
          label: 'Team Assignments',
          description: 'When any team member gets assigned'
        }
      ]
    },
    {
      title: 'Deadlines & Risks',
      icon: Calendar,
      settings: [
        {
          key: 'notify_deadline_approaching' as keyof NotificationPreferences,
          label: 'Approaching Deadlines',
          description: 'When deadlines are coming up soon'
        },
        {
          key: 'notify_deadline_passed' as keyof NotificationPreferences,
          label: 'Missed Deadlines',
          description: 'When deadlines are overdue'
        }
      ]
    },
    {
      title: 'Risks',
      icon: Shield,
      settings: [
        {
          key: 'notify_risk_created' as keyof NotificationPreferences,
          label: 'New Risks',
          description: 'When new risks are identified'
        },
        {
          key: 'notify_risk_escalated' as keyof NotificationPreferences,
          label: 'Risk Escalations',
          description: 'When risks are escalated to higher severity'
        }
      ]
    },
    {
      title: 'Projects & Sprints',
      icon: Settings,
      settings: [
        {
          key: 'notify_sprint_changes' as keyof NotificationPreferences,
          label: 'Sprint Changes',
          description: 'Sprint starts, ends, or updates'
        },
        {
          key: 'notify_project_updates' as keyof NotificationPreferences,
          label: 'Project Updates',
          description: 'Major project milestones and updates'
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between rounded-t-lg">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notification Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Customize when you receive notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {settingSections.map((section) => {
            const Icon = section.icon;

            return (
              <div key={section.title} className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700">
                    <Icon className="w-5 h-5 text-gray-900 dark:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                </div>

                <div className="space-y-3">
                  {section.settings.map((setting) => (
                    <label
                      key={setting.key}
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={preferences[setting.key]}
                        onChange={() => togglePreference(setting.key)}
                        className="mt-1 w-4 h-4 accent-gray-600 dark:accent-gray-500 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 dark:focus:ring-gray-500 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {setting.label}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {setting.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
