'use client';

import { useState, useEffect } from 'react';
import { Users, Activity as ActivityIcon, MessageSquare, TrendingUp, LayoutGrid } from 'lucide-react';
import { ActivityFeed } from './ActivityFeed';
import { CommentsSection } from './CommentsSection';

interface TeamCollaborationDashboardProps {
  assessmentId: string;
  currentUserId: string;
  currentUserName: string;
}

interface Stats {
  activitiesToday: number;
  commentsThisWeek: number;
  activeTeamMembers: number;
  engagementScore: number;
}

export function TeamCollaborationDashboard({
  assessmentId,
  currentUserId,
  currentUserName
}: TeamCollaborationDashboardProps) {
  const [activeTab, setActiveTab] = useState<'activity' | 'overview'>('activity');
  const [stats, setStats] = useState<Stats>({
    activitiesToday: 0,
    commentsThisWeek: 0,
    activeTeamMembers: 0,
    engagementScore: 0
  });
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    }
  }, [activeTab, assessmentId]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);

      // Fetch activities for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      // Fetch all activities to calculate stats
      const activitiesResponse = await fetch(`/api/activity?assessment_id=${assessmentId}&limit=1000`);

      if (activitiesResponse.ok) {
        const { activities } = await activitiesResponse.json();

        // Calculate stats
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Activities today
        const activitiesToday = activities.filter((a: any) =>
          new Date(a.created_at) >= today
        ).length;

        // Comments this week
        const commentsThisWeek = activities.filter((a: any) =>
          a.activity_type === 'commented' && new Date(a.created_at) >= weekAgo
        ).length;

        // Active team members (unique users in last week)
        const uniqueUsers = new Set(
          activities
            .filter((a: any) => new Date(a.created_at) >= weekAgo)
            .map((a: any) => a.user_id)
        );
        const activeTeamMembers = uniqueUsers.size;

        // Engagement score (activities per day over last week)
        const activitiesThisWeek = activities.filter((a: any) =>
          new Date(a.created_at) >= weekAgo
        ).length;
        const engagementScore = Math.round(activitiesThisWeek / 7);

        setStats({
          activitiesToday,
          commentsThisWeek,
          activeTeamMembers,
          engagementScore
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="text-blue-600" />
            Team Collaboration
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            See what your team is working on and stay in sync
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('activity')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'activity'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <ActivityIcon size={20} />
            Activity Feed
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <LayoutGrid size={20} />
            Overview
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'activity' && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
              Live feed of all changes across your transformation workspace
            </p>
          </div>
          <ActivityFeed assessmentId={assessmentId} limit={100} />
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <ActivityIcon className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {loadingStats ? '...' : stats.activitiesToday}
              </div>
              <div className="text-blue-100 text-sm">Activities Today</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {loadingStats ? '...' : stats.commentsThisWeek}
              </div>
              <div className="text-green-100 text-sm">Comments This Week</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {loadingStats ? '...' : stats.activeTeamMembers}
              </div>
              <div className="text-purple-100 text-sm">Active Team Members</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="text-3xl font-bold mb-1">
                {loadingStats ? '...' : stats.engagementScore}
              </div>
              <div className="text-orange-100 text-sm">Engagement Score</div>
            </div>
          </div>

          {/* Info Card */}
          <div className="lg:col-span-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Collaboration Features Enabled
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Your team now has access to powerful collaboration tools:
                </p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>Real-time Activity Feed</strong> - See all changes across projects, sprints, and tasks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>Comments & @Mentions</strong> - Discuss work items and tag teammates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>Notifications</strong> - Get notified when you're mentioned or assigned</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span><strong>Transparency</strong> - Everyone can see progress and stay aligned</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
