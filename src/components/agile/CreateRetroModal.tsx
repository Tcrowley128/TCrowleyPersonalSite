'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, Brain, Sparkles, RefreshCw, Lightbulb, MessageSquare } from 'lucide-react';

interface Sprint {
  id: string;
  name: string;
  sprint_number: number;
}

interface CreateRetroModalProps {
  projectId: string;
  sprint: Sprint;
  onClose: () => void;
  onRetroCreated: (retroId: string) => void;
}

export function CreateRetroModal({
  projectId,
  sprint,
  onClose,
  onRetroCreated,
}: CreateRetroModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [title, setTitle] = useState(`${sprint.name} Retrospective`);
  const [facilitator, setFacilitator] = useState('');
  const [creating, setCreating] = useState(false);
  const [analyzingSprint, setAnalyzingSprint] = useState(false);
  const [sprintAnalysis, setSprintAnalysis] = useState<{
    summary: string;
    recommendedTemplate: string;
    recommendedReason: string;
    suggestedTopics: string[];
    metrics: {
      velocityTrend: string;
      completionRate: string;
      keyInsights: string[];
    };
  } | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const templates = [
    { id: 'start-stop-continue', name: 'Start, Stop, Continue', icon: '🔄', description: 'Classic retrospective format' },
    { id: 'mad-sad-glad', name: 'Mad, Sad, Glad', icon: '😊', description: 'Emotional sentiment analysis' },
    { id: 'four-ls', name: '4 Ls', icon: '💡', description: 'Liked, Learned, Lacked, Longed For' },
    { id: 'sailboat', name: 'Sailboat', icon: '⛵', description: 'Navigate towards your goals' },
    { id: 'went-well-improve', name: 'Went Well / To Improve', icon: '🎯', description: 'Simple two-column format' },
    { id: 'rose-bud-thorn', name: 'Rose, Bud, Thorn', icon: '🌹', description: 'Highlights, opportunities, challenges' },
  ];

  const analyzeSprint = async () => {
    setAnalyzingSprint(true);
    try {
      const response = await fetch(`/api/ai/analyze-sprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId: sprint.id,
          projectId
        })
      });

      if (response.ok) {
        const analysis = await response.json();
        setSprintAnalysis(analysis);
        setShowAnalysis(true);
        // Auto-select the recommended template
        if (analysis.recommendedTemplate) {
          setSelectedTemplate(analysis.recommendedTemplate);
        }
      } else {
        console.error('Failed to analyze sprint');
      }
    } catch (error) {
      console.error('Error analyzing sprint:', error);
    } finally {
      setAnalyzingSprint(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedTemplate || !title.trim()) return;

    setCreating(true);
    try {
      const response = await fetch('/api/retro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          sprintId: sprint.id,
          templateId: selectedTemplate,
          title: title.trim(),
          facilitatorName: facilitator.trim() || 'Anonymous',
        }),
      });

      if (!response.ok) throw new Error('Failed to create retrospective');

      const retro = await response.json();
      onRetroCreated(retro.id);
    } catch (error) {
      console.error('[CreateRetroModal] Error:', error);
      alert('Failed to create retrospective');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Create Sprint Retrospective</h2>
          <p className="text-sm text-purple-100">{sprint.name}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI Sprint Analysis Button */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 dark:bg-blue-500 rounded-lg p-2">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">AI Sprint Analysis</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Get AI-powered insights to guide your retrospective</p>
                </div>
              </div>
              <button
                type="button"
                onClick={analyzeSprint}
                disabled={analyzingSprint}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {analyzingSprint ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Sprint
                  </>
                )}
              </button>
            </div>

            {/* Analysis Results */}
            {showAnalysis && sprintAnalysis && (
              <div className="mt-4 space-y-4">
                {/* Sprint Summary */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-2">Sprint Performance Summary</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{sprintAnalysis.summary}</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Completion Rate</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{sprintAnalysis.metrics.completionRate}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Velocity Trend</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{sprintAnalysis.metrics.velocityTrend}</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Key Insights</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{sprintAnalysis.metrics.keyInsights.length}</div>
                  </div>
                </div>

                {/* Recommended Template */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1">Recommended Template</h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{templates.find(t => t.id === sprintAnalysis.recommendedTemplate)?.name}</span>
                        {' - '}
                        {sprintAnalysis.recommendedReason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Suggested Discussion Topics */}
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Suggested Discussion Topics</h4>
                  <div className="space-y-2">
                    {sprintAnalysis.suggestedTopics.map((topic, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{topic}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regenerate Button */}
                <button
                  type="button"
                  onClick={analyzeSprint}
                  disabled={analyzingSprint}
                  className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-center gap-1 py-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerate Analysis
                </button>
              </div>
            )}
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Retrospective Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Sprint 1 Retrospective"
            />
          </div>

          {/* Facilitator Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Facilitator Name (Optional)
            </label>
            <input
              type="text"
              value={facilitator}
              onChange={(e) => setFacilitator(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              placeholder="Your name"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Template
            </label>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{template.icon}</span>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      {template.name}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {template.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3 justify-end bg-gray-50 dark:bg-slate-900">
          <button
            onClick={onClose}
            disabled={creating}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!selectedTemplate || !title.trim() || creating}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4" />
                Create Retrospective
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
