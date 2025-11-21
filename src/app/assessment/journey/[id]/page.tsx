'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Rocket, Plus, TrendingUp, CheckCircle2, Clock, AlertCircle, AlertTriangle, Kanban, LayoutGrid, Shield, Users, BarChart3, ArrowLeft, Sparkles, HelpCircle, Play } from 'lucide-react';
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
import IntroductionTour from '@/components/journey/IntroductionTour';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { storage } from '@/lib/utils/storage';

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
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
  const [runTour, setRunTour] = useState(false);
  const [projectStatusFilter, setProjectStatusFilter] = useState<string | null>(null);
  const [sprintMetrics, setSprintMetrics] = useState<{
    activeSprintsCount: number;
    completedSprintsCount: number;
    activeSprintRisksCount: number;
    averageVelocity: number;
  }>({
    activeSprintsCount: 0,
    completedSprintsCount: 0,
    activeSprintRisksCount: 0,
    averageVelocity: 0,
  });

  // Chat ref for programmatic control
  const chatRef = useRef<JourneyChatHandle>(null);

  // Check if user has seen tour before
  useEffect(() => {
    const tourKey = `journey-tour-seen-${assessmentId}`;
    const hasSeenTour = storage.getItem(tourKey);

    if (!hasSeenTour && projects.length > 0) {
      // Show tour automatically for first-time users
      setTimeout(() => setRunTour(true), 2000); // 2 second delay
    }
  }, [assessmentId, projects.length]);

  const handleTourComplete = () => {
    setRunTour(false);
    storage.setItem(`journey-tour-seen-${assessmentId}`, 'true');
  };

  const handleRestartTour = () => {
    // Switch to projects section (where tour starts)
    setActiveSection('projects');
    // Delay starting tour to ensure DOM is ready
    setTimeout(() => {
      setRunTour(true);
    }, 100);
  };

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

    // Handle risk deep-linking
    if (riskId) {
      setSelectedRiskId(riskId);
      // Auto-switch to risks section if a risk ID is provided
      if (!section) {
        setActiveSection('risks');
      }
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, [assessmentId]);

  // Fetch sprint metrics when sprints section is active
  useEffect(() => {
    const loadSprintMetrics = async () => {
      if (activeSection !== 'sprints') return;

      const inProgress = projects.filter(p => p.status === 'in_progress');
      if (inProgress.length === 0) return;

      try {
        let activeSprints = 0;
        let completedSprints = 0;
        let activeRisks = 0;
        let totalVelocity = 0;
        let velocityCount = 0;

        // Fetch sprint data for each in-progress project
        const sprintPromises = inProgress.map(async (project) => {
        try {
          // Fetch active sprints
          const activeResponse = await fetch(`/api/projects/${project.id}/sprints?status=active`);
          if (activeResponse.ok) {
            const activeData = await activeResponse.json();
            activeSprints += activeData.sprints?.length || 0;

            // Fetch risks for active sprints
            if (activeData.sprints && activeData.sprints.length > 0) {
              for (const sprint of activeData.sprints) {
                const risksResponse = await fetch(`/api/projects/${project.id}/risks?sprint_id=${sprint.id}`);
                if (risksResponse.ok) {
                  const risksData = await risksResponse.json();
                  activeRisks += risksData.risks?.length || 0;
                }
              }
            }
          }

          // Fetch completed sprints
          const completedResponse = await fetch(`/api/projects/${project.id}/sprints?status=completed`);
          if (completedResponse.ok) {
            const completedData = await completedResponse.json();
            const completedSprintsList = completedData.sprints || [];
            completedSprints += completedSprintsList.length;

            // Calculate velocity from completed sprints
            completedSprintsList.forEach((sprint: any) => {
              if (sprint.actual_velocity && sprint.actual_velocity > 0) {
                totalVelocity += sprint.actual_velocity;
                velocityCount++;
              }
            });
          }
          } catch (err) {
            console.error(`Error fetching sprint data for project ${project.id}:`, err);
          }
        });

        await Promise.all(sprintPromises);

        const averageVelocity = velocityCount > 0 ? Math.round(totalVelocity / velocityCount) : 0;

        setSprintMetrics({
          activeSprintsCount: activeSprints,
          completedSprintsCount: completedSprints,
          activeSprintRisksCount: activeRisks,
          averageVelocity,
        });
      } catch (err) {
        console.error('Error fetching sprint metrics:', err);
      }
    };

    loadSprintMetrics();
  }, [activeSection, projects]);

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
    <ErrorBoundary>
      <div className="h-full flex flex-col journey-dashboard">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-4 sm:mb-8">
          <div className="flex items-start sm:items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <button
                  onClick={() => router.push(`/assessment/results/${assessmentId}`)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                  title="Back to Assessment Results"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3 min-w-0">
                  <Rocket className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                  <span className="truncate">
                    {assessmentDetails?.company_name && (
                      <span className="hidden sm:inline">{assessmentDetails.company_name} - </span>
                    )}
                    <span className="hidden sm:inline">Transformation Journey</span>
                    <span className="sm:hidden">Journey</span>
                  </span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-10 sm:ml-14 hidden sm:block">
                Track and manage your digital transformation projects
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <button
                onClick={handleRestartTour}
                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors group"
                title="Take a Tour"
              >
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </button>
              <NotificationsDropdown userId={currentUserId} />
            </div>
          </div>
        </div>

        {/* Interactive Tour Banner - Show at top */}
        {runTour && (
          <IntroductionTour
            onComplete={handleTourComplete}
            onChangeSection={setActiveSection}
            showBannerOnly={true}
          />
        )}

        {/* Navigation Tabs */}
        <div className="mb-4 sm:mb-6 border-b border-gray-200 dark:border-gray-700 -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveSection('projects')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeSection === 'projects'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <LayoutGrid size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Projects Overview</span>
              <span className="sm:hidden">Projects</span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700">
                {projects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection('dashboard')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeSection === 'dashboard'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <BarChart3 size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Executive Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </button>
            <button
              onClick={() => setActiveSection('sprints')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeSection === 'sprints'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Kanban size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Sprint Management</span>
              <span className="sm:hidden">Sprints</span>
              <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-xs bg-gray-200 dark:bg-gray-700">
                {inProgressProjects.length}
              </span>
            </button>
            <button
              onClick={() => setActiveSection('risks')}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeSection === 'risks'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Shield size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Risk Overview</span>
              <span className="sm:hidden">Risks</span>
            </button>
            <button
              onClick={() => setActiveSection('collaboration')}
              className={`team-collaboration-tab flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 font-medium transition-colors border-b-2 whitespace-nowrap text-sm sm:text-base ${
                activeSection === 'collaboration'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Users size={16} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Team Collaboration</span>
              <span className="sm:hidden">Team</span>
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

        {/* Content Area */}
        <div className="pb-6">
          {/* Dashboard Section */}
          {activeSection === 'dashboard' && (
            <div className="executive-dashboard">
              <DashboardView
                projects={projects}
                assessmentId={assessmentId}
                onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
              />
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-6 pb-4">
              <ProjectStats
                projects={projects}
                onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
                selectedFilter={projectStatusFilter}
                onFilterChange={setProjectStatusFilter}
              />
              <div className="project-list">
                <ProjectBoard
                  projects={projects}
                  onProjectUpdate={handleProjectUpdate}
                  onRefresh={fetchData}
                  onAddProject={handleOpenRecommendations}
                  onAskAI={(message: string) => chatRef.current?.openWithMessage(message)}
                  statusFilter={projectStatusFilter}
                  onNavigateToSprints={(projectId: string) => {
                    const returnUrl = `/assessment/journey/${assessmentId}?section=sprints`;
                    router.push(`/projects/${projectId}?return=${encodeURIComponent(returnUrl)}`);
                  }}
                />
              </div>
            </div>
          )}

          {/* Sprint Management Section */}
          {activeSection === 'sprints' && (
            <div className="space-y-6 pb-4 sprint-management">
              {inProgressProjects.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-12 text-center sprint-empty-state">
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
                {/* Sprint Metrics Title */}
                <div className="mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Overall Sprint Statistics
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    These are stats across all projects
                  </p>
                </div>

                {/* Sprint Metrics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Active Sprints */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Sprints</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{sprintMetrics.activeSprintsCount}</p>
                      </div>
                      <Play className="text-blue-600" size={32} />
                    </div>
                  </div>

                  {/* Completed Sprints */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completed Sprints</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{sprintMetrics.completedSprintsCount}</p>
                      </div>
                      <CheckCircle2 className="text-green-600" size={32} />
                    </div>
                  </div>

                  {/* Active Sprint Risks */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Active Risks</p>
                        <p className="text-3xl font-bold text-orange-600 mt-2">{sprintMetrics.activeSprintRisksCount}</p>
                      </div>
                      <AlertTriangle className="text-orange-600" size={32} />
                    </div>
                  </div>

                  {/* Average Velocity */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Avg Velocity</p>
                        <p className="text-3xl font-bold text-purple-600 mt-2">{sprintMetrics.averageVelocity || 0}</p>
                      </div>
                      <TrendingUp className="text-purple-600" size={32} />
                    </div>
                  </div>
                </div>

                {/* Header with info and action */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Only projects with "In Progress" status are shown here · {inProgressProjects.length} project{inProgressProjects.length !== 1 ? 's' : ''}
                  </p>
                  <button
                    onClick={() => setActiveSection('projects')}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Add Project to Sprints</span>
                    <span className="inline sm:hidden">Add Project</span>
                  </button>
                </div>

                {/* Project Grid - Professional Cards */}
                {inProgressProjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sprint-project-grid">
                    {inProgressProjects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => {
                          const returnUrl = `/assessment/journey/${assessmentId}?section=sprints`;
                          router.push(`/projects/${project.id}?return=${encodeURIComponent(returnUrl)}`);
                        }}
                        className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 text-left hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg transition-all group flex flex-col min-h-[180px]"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                              {project.title}
                            </h3>
                          </div>
                          <Kanban className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                        <div className="flex-1" />
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
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
            <div className="pb-4 risk-overview">
              <RiskOverview
                assessmentId={assessmentId}
                projects={projects}
                selectedRiskId={selectedRiskId}
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
      </div>

      {/* Journey Chat Component */}
      <JourneyChat ref={chatRef} assessmentId={assessmentId} />

      {/* Floating AI Button */}
      <div className="ai-scrum-master">
        <FloatingAIButton
          onClick={() => chatRef.current?.openWithMessage("")}
        />
      </div>

      {/* Interactive Tour Overlays (rendered at bottom for z-index) */}
      {runTour && (
        <IntroductionTour
          onComplete={handleTourComplete}
          onChangeSection={setActiveSection}
          showBannerOnly={false}
        />
      )}
      </div>
    </ErrorBoundary>
  );
}
