'use client';

import { useState } from 'react';
import { Plus, Lightbulb, Clock, TrendingUp, Sparkles, Target } from 'lucide-react';

interface Recommendation {
  title: string;
  description?: string;
  solution?: string;
  why_recommended?: string;
  category?: string;
  timeline?: string;
  impact?: string;
  priority?: string;
  tools?: string[];
}

interface RecommendationsBrowserProps {
  assessmentId: string;
  quickWins: Recommendation[];
  tier1: Recommendation[];
  tier2: Recommendation[];
  tier3: Recommendation[];
  existingProjects: Array<{ source_recommendation_id: string }>;
  onProjectCreated: () => void;
}

export function RecommendationsBrowser({
  assessmentId,
  quickWins,
  tier1,
  tier2,
  tier3,
  existingProjects,
  onProjectCreated
}: RecommendationsBrowserProps) {
  const [creatingProjectId, setCreatingProjectId] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string>('quick_wins');

  const isAlreadyProject = (sourceId: string): boolean => {
    return existingProjects.some(p => p.source_recommendation_id === sourceId);
  };

  const handleCreateProject = async (
    recommendation: Recommendation,
    sourceId: string,
    recommendationType: string,
    complexity: string,
    estimatedDays: number
  ) => {
    setCreatingProjectId(sourceId);

    try {
      const response = await fetch(`/api/assessment/${assessmentId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: recommendation.title || recommendation.solution,
          description: recommendation.description || recommendation.why_recommended || '',
          category: recommendation.category || determineCategory(recommendation.title || ''),
          priority: recommendation.priority || getPriorityForType(recommendationType),
          complexity: complexity,
          source_recommendation_id: sourceId,
          recommendation_type: recommendationType,
          recommended_tools: recommendation.tools || null,
          estimated_effort: getEffortForComplexity(complexity),
          estimated_impact: recommendation.impact || 'medium',
          estimated_timeline_days: estimatedDays,
          status: 'not_started',
          progress_percentage: 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      onProjectCreated();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setCreatingProjectId(null);
    }
  };

  const determineCategory = (title: string): string => {
    const titleLower = title?.toLowerCase() || '';
    if (titleLower.includes('data') || titleLower.includes('analytics') || titleLower.includes('dashboard')) {
      return 'data';
    } else if (titleLower.includes('automat') || titleLower.includes('workflow') || titleLower.includes('process')) {
      return 'automation';
    } else if (titleLower.includes('ai') || titleLower.includes('chatgpt') || titleLower.includes('claude')) {
      return 'ai';
    } else if (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('user')) {
      return 'ux';
    } else if (titleLower.includes('training') || titleLower.includes('team') || titleLower.includes('people')) {
      return 'people';
    }
    return 'other';
  };

  const getPriorityForType = (type: string): string => {
    if (type === '30_day' || type === 'quick_win') return 'high';
    if (type === '60_day' || type === 'tier1') return 'high';
    if (type === 'tier2') return 'medium';
    return 'medium';
  };

  const getEffortForComplexity = (complexity: string): string => {
    if (complexity === 'simple') return 'low';
    if (complexity === 'moderate') return 'medium';
    return 'high';
  };

  const renderRecommendationCard = (
    rec: Recommendation,
    sourceId: string,
    type: string,
    complexity: string,
    days: number,
    icon: React.ElementType,
    color: string
  ) => {
    const alreadyAdded = isAlreadyProject(sourceId);
    const Icon = icon;

    return (
      <div
        key={sourceId}
        className={`bg-white dark:bg-slate-700 rounded-lg shadow p-4 border-l-4 ${
          alreadyAdded ? 'border-green-500 opacity-60' : `border-${color}-500`
        }`}
      >
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <Icon className={`text-${color}-600 mt-1 flex-shrink-0`} size={20} />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {rec.title || rec.solution}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {rec.description || rec.why_recommended}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {rec.category && (
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                  {rec.category}
                </span>
              )}
              {rec.timeline && (
                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  {rec.timeline}
                </span>
              )}
              {rec.impact && (
                <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                  Impact: {rec.impact}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => handleCreateProject(rec, sourceId, type, complexity, days)}
            disabled={alreadyAdded || creatingProjectId === sourceId}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
              alreadyAdded
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 cursor-not-allowed'
                : creatingProjectId === sourceId
                ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 cursor-wait'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {alreadyAdded ? (
              <>
                <Target size={16} />
                Added
              </>
            ) : creatingProjectId === sourceId ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const sections = [
    {
      id: 'quick_wins',
      title: 'Quick Wins (30 Days)',
      icon: Sparkles,
      color: 'yellow',
      recommendations: quickWins,
      type: '30_day',
      complexity: 'simple',
      days: 30
    },
    {
      id: 'tier1',
      title: 'Tier 1: Citizen-Led Solutions',
      icon: Lightbulb,
      color: 'blue',
      recommendations: tier1,
      type: 'tier1',
      complexity: 'simple',
      days: 30
    },
    {
      id: 'tier2',
      title: 'Tier 2: Hybrid Solutions',
      icon: TrendingUp,
      color: 'purple',
      recommendations: tier2,
      type: 'tier2',
      complexity: 'moderate',
      days: 60
    },
    {
      id: 'tier3',
      title: 'Tier 3: Technical Solutions',
      icon: Target,
      color: 'orange',
      recommendations: tier3,
      type: 'tier3',
      complexity: 'complex',
      days: 90
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="text-yellow-500" size={28} />
          Browse Recommendations
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Select additional recommendations from your assessment to add as projects
        </p>
      </div>

      <div className="space-y-4">
        {sections.map(section => {
          const SectionIcon = section.icon;
          const hasRecommendations = section.recommendations && section.recommendations.length > 0;
          const isExpanded = expandedSection === section.id;

          if (!hasRecommendations) return null;

          return (
            <div key={section.id} className="border border-gray-200 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setExpandedSection(isExpanded ? '' : section.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <SectionIcon className={`text-${section.color}-600`} size={24} />
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {section.recommendations.length} recommendations
                    </p>
                  </div>
                </div>
                <div className="text-gray-400">
                  {isExpanded ? '▲' : '▼'}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4 pt-0 space-y-3">
                  {section.recommendations.map((rec, index) => {
                    const sourceId = `${section.id}_${index}`;
                    return renderRecommendationCard(
                      rec,
                      sourceId,
                      section.type,
                      section.complexity,
                      section.days,
                      SectionIcon,
                      section.color
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
