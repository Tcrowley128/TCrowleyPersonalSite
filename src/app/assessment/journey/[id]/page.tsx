'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Target, Plus, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { ProjectBoard } from '@/components/journey/ProjectBoard';
import { ProjectStats } from '@/components/journey/ProjectStats';
import { RecommendationsBrowser } from '@/components/journey/RecommendationsBrowser';

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
  const assessmentId = params.id as string;
  const [projects, setProjects] = useState<Project[]>([]);
  const [assessmentResults, setAssessmentResults] = useState<AssessmentResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    fetchData();
  }, [assessmentId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch projects
      const projectsResponse = await fetch(`/api/assessment/${assessmentId}/projects`);
      if (!projectsResponse.ok) {
        throw new Error('Failed to fetch projects');
      }
      const projectsData = await projectsResponse.json();
      setProjects(projectsData.projects || []);

      // Fetch assessment results
      const resultsResponse = await fetch(`/api/assessment/${assessmentId}/results`);
      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setAssessmentResults(resultsData.results || {});
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    // Toggle recommendations browser
    setShowRecommendations(!showRecommendations);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">Error Loading Journey</h2>
            <p className="text-red-600 dark:text-red-300">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Target className="text-blue-600" size={36} />
              Transformation Journey
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Track your digital transformation progress and manage projects
            </p>
          </div>

          <button
            onClick={handleCreateProject}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            {showRecommendations ? 'Hide Recommendations' : 'Browse Recommendations'}
          </button>
        </div>

        {/* Stats Overview */}
        <ProjectStats projects={projects} />

        {/* Recommendations Browser */}
        {showRecommendations && assessmentResults && (
          <RecommendationsBrowser
            assessmentId={assessmentId}
            quickWins={assessmentResults.quick_wins || []}
            tier1={assessmentResults.tier1_citizen_led || []}
            tier2={assessmentResults.tier2_hybrid || []}
            tier3={assessmentResults.tier3_technical || []}
            existingProjects={projects.map(p => ({ source_recommendation_id: p.source_recommendation_id || '' }))}
            onProjectCreated={fetchData}
          />
        )}

        {/* Project Board */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Projects Board
          </h2>

          {projects.length === 0 ? (
            <div className="text-center py-16">
              <Target className="mx-auto text-gray-400 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Projects Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Get started by browsing recommendations from your assessment
              </p>
              <button
                onClick={handleCreateProject}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
              >
                <Plus size={20} />
                Browse Recommendations
              </button>
            </div>
          ) : (
            <ProjectBoard projects={projects} onProjectUpdate={fetchData} />
          )}
        </div>
      </div>
    </div>
  );
}
