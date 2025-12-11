'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, Eye, Lock, AlertCircle, ArrowLeft, LayoutGrid, Kanban } from 'lucide-react';
import { ProjectStats } from '@/components/journey/ProjectStats';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  complexity: string;
  operational_area: string | null;
  progress_percentage: number;
  estimated_timeline_days: number;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  created_at: string;
  tasks?: { count: number }[];
}

export default function SharedJourneyWorkspace({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [assessmentDetails, setAssessmentDetails] = useState<{ company_name: string } | null>(null);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'projects' | 'sprints'>('dashboard');

  useEffect(() => {
    fetchSharedJourneyData();
  }, [token]);

  const fetchSharedJourneyData = async () => {
    try {
      setLoading(true);

      // Fetch assessment details with share token
      const assessmentResponse = await fetch(`/api/assessment/shared/${token}/journey`);

      if (!assessmentResponse.ok) {
        const errorData = await assessmentResponse.json();
        setError(errorData.error || 'Failed to load shared journey');
        return;
      }

      const data = await assessmentResponse.json();
      setAssessmentDetails(data.assessment);
      setProjects(data.projects || []);
      setShareInfo(data.share_info);

    } catch (err) {
      console.error('Error fetching shared journey:', err);
      setError('Failed to load shared transformation journey');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-md text-center border-2 border-gray-200 dark:border-gray-700"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <a
            href="/assessment"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Start Your Assessment
          </a>
        </motion.div>
      </div>
    );
  }

  const inProgressProjects = projects.filter(p => p.status === 'in_progress');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Shared View Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-500 rounded-lg p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <Eye className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white">Shared Transformation Journey</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  View-only access
                  {shareInfo?.expires_at && ` • Expires ${new Date(shareInfo.expires_at).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Rocket className="text-blue-600 dark:text-blue-400" size={32} />
              <span>{assessmentDetails?.company_name || 'Company'} Transformation Journey</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track projects, sprints, and progress toward digital transformation
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 mb-6 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeSection === 'dashboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <LayoutGrid size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveSection('projects')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeSection === 'projects'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Rocket size={18} />
              <span>Projects</span>
            </button>
            <button
              onClick={() => setActiveSection('sprints')}
              className={`flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2 ${
                activeSection === 'sprints'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              <Kanban size={18} />
              <span>Sprints</span>
            </button>
          </div>
        </div>

        {/* Content Sections */}
        {activeSection === 'dashboard' && (
          <div className="space-y-6">
            <ProjectStats projects={projects} />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Projects</div>
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{projects.length}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {projects.filter(p => p.status === 'in_progress').length}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Not Started</div>
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                  {projects.filter(p => p.status === 'not_started').length}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'projects' && (
          <div className="space-y-6">
            <ProjectStats projects={projects} />

            {/* Projects List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.title}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : project.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600 dark:text-gray-400">
                        Priority: <span className="font-medium">{project.priority}</span>
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        Complexity: <span className="font-medium">{project.complexity}</span>
                      </span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {project.progress_percentage}% Complete
                    </div>
                  </div>
                  {project.progress_percentage > 0 && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.progress_percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'sprints' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
            <Kanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Sprint Management
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sprint details are not available in the shared view
            </p>
          </div>
        )}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>This is a view-only shared transformation journey. Editing features are disabled.</p>
          <p className="mt-1">
            Want to create your own transformation journey?{' '}
            <a href="/assessment" className="text-blue-600 dark:text-blue-400 hover:underline">
              Start your free assessment
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
