'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Rocket, Plus, TrendingUp, CheckCircle2, Clock, AlertCircle, Kanban, LayoutGrid, Shield, Users, BarChart3, ArrowLeft, Sparkles } from 'lucide-react';
import { ProjectBoard } from '@/components/journey/ProjectBoard';
import { ProjectStats } from '@/components/journey/ProjectStats';
import { RecommendationsBrowser } from '@/components/journey/RecommendationsBrowser';
import { SprintManagement } from '@/components/agile/SprintManagement';
import { RiskOverview } from '@/components/journey/RiskOverview';
import { NotificationsDropdown } from '@/components/collaboration/NotificationsDropdown';
import { TeamCollaborationDashboard } from '@/components/collaboration/TeamCollaborationDashboard';
import { DashboardView } from '@/components/journey/DashboardView';
import { useAuth } from '@/contexts/AuthContext';
import JourneyChat, { JourneyChatHandle } from '@/components/journey/JourneyChat';
import { FloatingAIButton } from '@/components/journey/FloatingAIButton';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  complexity: string;
  progress_percentage: number;
  estimated_timeline_days: number;
  target_completion_date: string | null;
  created_at: string;
  source_recommendation_id?: string;
  tasks?: { count: number }[];
}

interface AssessmentResults {
  quick_wins?: any[];
  tier1_citizen_led?: any[];
  tier2_hybrid?: any[];
  tier3_technical?: any[];
}

export default function JourneyWorkspace() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const [assessmentDetails, setAssessmentDetails] = useState<{ company_name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeSection, setActiveSection] = useState<'dashboard' | 'projects' | 'sprints' | 'risks' | 'collaboration'>('projects');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Chat ref for programmatic control
  const chatRef = useRef<JourneyChatHandle>(null);

  // Get current user from auth context
  const currentUserId = user?.email || '';
  const currentUserName = user?.user_metadata?.full_name || user?.email || 'Team Member';

  // Handle URL query parameters for deep linking
  useEffect(() => {
    const section = searchParams.get('section');
    const pbiId = searchParams.get('pbi');
    const projectId = searchParams.get('project');
    const riskId = searchParams.get('risk');

    if (section) {
      setActiveSection(section as 'dashboard' | 'projects' | 'sprints' | 'risks' | 'collaboration');
    }

    if (projectId) {
      setSelectedProjectId(projectId);
    }

    // If navigating to a PBI, fetch its project_id
    if (pbiId && !projectId) {
      fetch(`/api/pbis/${pbiId}`)
        .then(res => res.json())
        .then(data => {
          if (data.pbi && data.pbi.project_id) {
            setSelectedProjectId(data.pbi.project_id);
          }
        })
        .catch(err => console.error('Error fetching PBI project:', err));
    }

    // TODO: Add logic to handle riskId when the component supports it
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [assessmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch assessment details (company name, etc.)
      const assessmentResponse = await fetch(`/api/assessment/${assessmentId}`);
      if (assessmentResponse.ok) {
        const assessmentData = await assessmentResponse.json();
        setAssessmentDetails(assessmentData.assessment);
      }

      // Fetch only projects initially (with limit)
      const projectsResponse = await fetch(`/api/assessment/${assessmentId}/projects?limit=50`);
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.projects || []);
      }

      // Only fetch assessment results when needed (lazy load)
      // This will be fetched when user opens recommendations browser
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load journey workspace');
    } finally {
      setLoading(false);
    }
  };

  // Lazy load assessment results only when recommendations browser is opened
  const handleOpenRecommendations = async () => {
    if (!assessmentResults) {
      try {
        const resultsResponse = await fetch(`/api/assessment/${assessmentId}/results`);
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          setAssessmentResults(resultsData.results || null);
        }
      } catch (err) {
        console.error('Error fetching assessment results:', err);
      }
    }
    setShowRecommendations(true);
  };

  const handleProjectUpdate = async (projectId: string, updates: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchData(); // Refresh data
      }
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });

      if (response.ok) {
        fetchData(); // Refresh data
        setShowRecommendations(false);
      }
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your transformation journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 dark:bg-slate-900 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // Get in-progress projects for sprint management
  const inProgressProjects = projects.filter(p => p.status === 'in_progress');

  return (
    <div className="h-full">
      <div className="max-w-7xl mx-auto px-4 py-8 h-full flex flex-col">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.push(`/assessment/results/${assessmentId}`)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Back to Assessment Results"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <Rocket className="text-blue-600" />
                  {assessmentDetails?.company_name && (
                    <span>{assessmentDetails.company_name} - </span>
                  )}
                  Transformation Journey
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 ml-14">
                Track and manage your digital transformation projects
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationsDropdown userId={currentUserId} />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection('projects')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeSection === 'projects'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <LayoutGrid size={20} />
              Projects Overview
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700">
                {projects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeSection === 'dashboard'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BarChart3 size={20} />
              Executive Dashboard
            </button>
            <button
              onClick={() => setActiveSection('sprints')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeSection === 'sprints'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Kanban size={20} />
              Sprint Management
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700">
                {inProgressProjects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection('risks')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeSection === 'risks'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Shield size={20} />
              Risk Overview
            </button>
            <button
              onClick={() => setActiveSection('collaboration')}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                activeSection === 'collaboration'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Users size={20} />
              Team Collaboration
            </button>
          </div>
        </div>

        {/* Recommendations Browser Modal */}
        {showRecommendations && (
          <RecommendationsBrowser
            results={assessmentResults}
            onClose={() => setShowRecommendations(false)}
            onCreateProject={handleCreateProject}
          />
        )}

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pr-4 pb-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <DashboardView
              projects={projects}
              assessmentId={assessmentId}
              onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
            />
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-6 pb-4">
              <ProjectStats
                projects={projects}
                onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
              />
              <ProjectBoard
                projects={projects}
                onProjectUpdate={handleProjectUpdate}
                onRefresh={fetchData}
                onAddProject={handleOpenRecommendations}
                onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
              />
            </div>
          )}

          {/* Sprint Management Section */}
          {activeSection === 'sprints' && (
            <div className="space-y-6 pb-4">
              {inProgressProjects.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-12 text-center">
                <Kanban className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Active Projects
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Move a project to "In Progress" status to start sprint management
                </p>
                <button
                  onClick={() => setActiveSection('projects')}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
                >
                  View All Projects
                </button>
              </div>
            ) : (
              <>
                {/* Header with info and action */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Only projects with "In Progress" status are shown here · {inProgressProjects.length} project{inProgressProjects.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => setActiveSection('projects')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add Project to Sprints</span>
                    <span className="inline sm:hidden">Add Project</span>
                  </button>
                </div>

                {/* Project Grid */}
                {inProgressProjects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {inProgressProjects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => {
                          const returnUrl = `/assessment/journey/${assessmentId}?section=sprints`;
                          router.push(`/projects/${project.id}?return=${encodeURIComponent(returnUrl)}`);
                        }}
                        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-left hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                              {project.title}
                            </h3>
                            {project.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                {project.description}
                              </p>
                            )}
                          </div>
                          <Kanban className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                            In Progress
                          </span>
                          <span className={`px-2 py-1 rounded-full font-medium ${
                            project.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {project.priority}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                            {project.category}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
                    <Kanban className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Projects Ready for Sprint Management
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Move a project to "In Progress" status to start managing sprints, backlogs, and tracking progress
                    </p>
                    <button
                      onClick={() => setActiveSection('projects')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                    >
                      <Plus size={16} />
                      Go to Projects Overview
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          )}

          {/* Risk Overview Section */}
          {activeSection === 'risks' && (
            <div className="pb-4">
              <RiskOverview
                assessmentId={assessmentId}
                projects={projects}
                onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
              />
            </div>
          )}

          {/* Team Collaboration Section */}
          {activeSection === 'collaboration' && (
            <div className="pb-4">
              <TeamCollaborationDashboard
                assessmentId={assessmentId}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
              />
            </div>
          )}
        </div>
      </div>

      {/* Journey Chat Component */}
      <JourneyChat ref={chatRef} assessmentId={assessmentId} />

      {/* Floating AI Button */}
      <FloatingAIButton
        onClick={() => chatRef.current?.openWithMessage("")}
      />
    </div>
  );
}
