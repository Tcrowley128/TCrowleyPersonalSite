import { useState } from 'react';
import { X, Plus, Zap, Target, Clock } from 'lucide-react';

interface RecommendationsBrowserProps {
  results: any;
  onClose: () => void;
  onCreateProject: (projectData: any) => void;
}

export function RecommendationsBrowser({ results, onClose, onCreateProject }: RecommendationsBrowserProps) {
  const [selectedTab, setSelectedTab] = useState<'quick_wins' | 'tier1' | 'tier2' | 'tier3'>('quick_wins');

  const recommendations = {
    quick_wins: results?.quick_wins || [],
    tier1: results?.tier1_citizen_led || [],
    tier2: results?.tier2_hybrid || [],
    tier3: results?.tier3_technical || []
  };

  const handleCreateFromRecommendation = (rec: any, type: string) => {
    const projectData = {
      title: rec.title || rec.name || 'New Project',
      description: rec.description || rec.why_recommended || '',
      category: rec.pillar?.toLowerCase() || 'general',
      operational_area: rec.operational_area || null,
      priority: rec.impact === 'HIGH' ? 'high' : 'medium',
      complexity: rec.complexity || (type === 'tier1' ? 'low' : type === 'tier2' ? 'medium' : 'high'),
      estimated_timeline_days: rec.timeframe === '30_days' ? 30 : 60,
      source_recommendation_id: rec.title || rec.name,
      source_type: type,
      status: 'not_started'
    };

    onCreateProject(projectData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Browse Recommendations
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b-2 border-gray-200 dark:border-gray-700 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('quick_wins')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              selectedTab === 'quick_wins'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Zap size={16} className="inline mr-2" />
            Quick Wins ({recommendations.quick_wins.length})
          </button>
          <button
            onClick={() => setSelectedTab('tier1')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              selectedTab === 'tier1'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Tier 1 ({recommendations.tier1.length})
          </button>
          <button
            onClick={() => setSelectedTab('tier2')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              selectedTab === 'tier2'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Tier 2 ({recommendations.tier2.length})
          </button>
          <button
            onClick={() => setSelectedTab('tier3')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
              selectedTab === 'tier3'
                ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Tier 3 ({recommendations.tier3.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
          <div className="space-y-4">
            {recommendations[selectedTab].map((rec: any, index: number) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {rec.title || rec.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {rec.description || rec.why_recommended}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {rec.pillar && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded">
                          {rec.pillar}
                        </span>
                      )}
                      {rec.operational_area && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs rounded">
                          {rec.operational_area}
                        </span>
                      )}
                      {rec.complexity && (
                        <span className="px-2 py-1 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-300 text-xs rounded">
                          {rec.complexity} complexity
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateFromRecommendation(rec, selectedTab)}
                    className="ml-4 flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Plus size={16} />
                    Add Project
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
