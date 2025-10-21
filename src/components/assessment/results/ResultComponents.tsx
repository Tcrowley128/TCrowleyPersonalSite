import { useState, useEffect } from 'react';
import { Zap, Clock, TrendingUp, DollarSign, Users, Target, Star, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Play, FileText, BookOpen, Award, Shield, Sparkles, X, Edit2, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import QuickResultEditor from '../QuickResultEditor';

// ============================================================================
// ASK AI BUTTON - Reusable component for contextual AI chat
// ============================================================================
function AskAIButton({ onClick, label = "Ask AI" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg transition-all hover:shadow-md"
      title={label}
    >
      <Sparkles size={14} />
      <span>{label}</span>
    </button>
  );
}

// ============================================================================
// OVERVIEW TAB - Better Executive Summary
// ============================================================================
export function OverviewTab({ maturity, priority, quickWinsCount, onQuickEdit }: any) {
  const [isDisclaimerExpanded, setIsDisclaimerExpanded] = useState(() => {
    // Load from localStorage, default to true if not found
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('disclaimerExpanded');
      return saved === null ? true : saved === 'true';
    }
    return true;
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('disclaimerExpanded', String(isDisclaimerExpanded));
    }
  }, [isDisclaimerExpanded]);

  return (
    <div className="space-y-6">
      {/* Stats Grid - 5 Maturity Scores */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Data Maturity" value={`${maturity?.data_strategy?.score || 0}/5`} icon={Target} color="blue" />
        <StatCard title="Automation" value={`${maturity?.automation_strategy?.score || 0}/5`} icon={TrendingUp} color="purple" />
        <StatCard title="AI Readiness" value={`${maturity?.ai_strategy?.score || 0}/5`} icon={Star} color="orange" />
        <StatCard title="UX & Design" value={`${maturity?.ux_strategy?.score || 0}/5`} icon={Palette} color="pink" />
        <StatCard title="People & Change" value={`${maturity?.people_strategy?.score || 0}/5`} icon={Users} color="teal" />
      </div>

      {/* Executive Summary - Clean Design */}
      <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="text-blue-600" />
          Executive Summary
        </h3>

        <div className="space-y-4">
          <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Zap className="text-green-600" size={18} />
              Quick Wins Ready: {quickWinsCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Immediate opportunities you can implement in the next 30 days</p>
          </div>

          <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Current State:</p>
            {onQuickEdit ? (
              <QuickResultEditor
                fieldName="priority_matrix"
                value={priority?.current_state || ''}
                onSave={async (newValue) => {
                  await onQuickEdit('priority_matrix', newValue, 'current_state');
                }}
                label="Current State"
                multiline
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{priority?.current_state}</p>
            )}
          </div>

          <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">🎯 Key Opportunity:</p>
            {onQuickEdit ? (
              <QuickResultEditor
                fieldName="priority_matrix"
                value={priority?.key_opportunity || ''}
                onSave={async (newValue) => {
                  await onQuickEdit('priority_matrix', newValue, 'key_opportunity');
                }}
                label="Key Opportunity"
                multiline
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{priority?.key_opportunity}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">🚀 Recommended Starting Point:</p>
            {onQuickEdit ? (
              <QuickResultEditor
                fieldName="priority_matrix"
                value={priority?.recommended_starting_point || ''}
                onSave={async (newValue) => {
                  await onQuickEdit('priority_matrix', newValue, 'recommended_starting_point');
                }}
                label="Recommended Starting Point"
                multiline
              />
            ) : (
              <p className="text-gray-900 dark:text-white">{priority?.recommended_starting_point}</p>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className={`${
        isDisclaimerExpanded
          ? 'bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500'
          : 'bg-gray-100 dark:bg-slate-700 border-l-4 border-gray-400 dark:border-gray-600'
      } rounded-lg shadow-sm transition-colors`}>
        <div className={`flex items-start gap-3 ${isDisclaimerExpanded ? 'p-4' : 'p-2'} transition-all`}>
          <Shield className={`${
            isDisclaimerExpanded
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-500 dark:text-gray-400'
          } mt-0.5 flex-shrink-0`} size={isDisclaimerExpanded ? 20 : 16} />
          <div className="flex-1">
            <h3 className={`font-semibold ${
              isDisclaimerExpanded
                ? 'text-amber-900 dark:text-amber-100 mb-1'
                : 'text-gray-700 dark:text-gray-300 text-sm'
            }`}>
              Important: Estimates Require Validation
            </h3>
            {isDisclaimerExpanded && (
              <p className="text-sm text-amber-800 dark:text-amber-200">
                All time savings, cost estimates, and impact projections shown in this roadmap are approximations based on general industry patterns.
                These recommendations should be validated with your specific business context, actual data, and operational requirements before implementation.
                Results may vary based on your unique environment and use cases.
              </p>
            )}
          </div>
          <button
            onClick={() => setIsDisclaimerExpanded(!isDisclaimerExpanded)}
            className={`${
              isDisclaimerExpanded
                ? 'text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            } transition-colors p-1`}
            title={isDisclaimerExpanded ? "Minimize" : "Expand"}
          >
            {isDisclaimerExpanded ? <ChevronUp size={20} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'teal' | 'pink';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colors: Record<'green' | 'blue' | 'purple' | 'orange' | 'teal' | 'pink', string> = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400'
  };

  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 text-center">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-3 mx-auto`}>
        <Icon size={24} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

// ============================================================================
// QUICK WINS TAB
// ============================================================================
export function QuickWinsTab({ quickWins, existing, onAskAI, onQuickEdit }: any) {
  return (
    <div className="space-y-8">
      {/* Overall Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 inline-flex items-center justify-center gap-2">
          <span className="-mt-0.5">⚡</span>
          <span>Quick Wins</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Start here for immediate impact with minimal effort</p>
      </div>

      {/* Quick Wins Section */}
      <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
        <div className="mb-6">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
            <span className="-mt-0.5">🎯</span>
            <span>30 Days to Impact</span>
          </h4>
        </div>

        {/* Recap Section */}
        <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
          <p className="text-sm text-gray-800 dark:text-gray-300">
            These are your highest-priority actions with the best effort-to-impact ratio. Start with one or two that align with your team's current bandwidth and skills. Each quick win builds momentum for larger transformation initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {quickWins && quickWins.length > 0 ? (
            quickWins.map((win: any, index: number) => (
              <QuickWinCard key={index} win={win} index={index} onAskAI={onAskAI} onQuickEdit={onQuickEdit} />
            ))
          ) : (
            <p className="text-gray-500">No quick wins available</p>
          )}
        </div>
      </div>

      {/* Existing Tool Opportunities */}
      {existing && existing.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
              <span className="-mt-0.5">💎</span>
              <span>Hidden Gems You Already Own</span>
            </h4>
          </div>

          {/* Recap Section */}
          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-emerald-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
            <p className="text-sm text-gray-800 dark:text-gray-300">
              You're already paying for these tools - maximizing their value requires zero new budget. These features often deliver surprising ROI because your team is already familiar with the platform. Start with the capabilities that solve your most pressing pain points.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {existing.map((opp: any, index: number) => (
              <ExistingToolCard key={index} opportunity={opp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickWinCard({ win, index, onAskAI, onQuickEdit }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const difficultyColors: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
    LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
      {/* Header with number, title, and action buttons */}
      <div className="flex items-start gap-3 mb-3">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          {onQuickEdit && isEditing ? (
            <>
              <QuickResultEditor
                fieldName="quick_wins"
                value={win.title}
                onSave={async (newValue) => {
                  await onQuickEdit('quick_wins', newValue, `items[${index}].title`);
                }}
                label="Quick Win Title"
              />
              <div className="mt-2">
                <QuickResultEditor
                  fieldName="quick_wins"
                  value={win.description}
                  onSave={async (newValue) => {
                    await onQuickEdit('quick_wins', newValue, `items[${index}].description`);
                  }}
                  label="Quick Win Description"
                  multiline
                />
              </div>
            </>
          ) : (
            <>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 break-words">{win.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 break-words">{win.description}</p>
            </>
          )}
        </div>
        {/* Action buttons in top right */}
        <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
          {onAskAI && (
            <AskAIButton
              onClick={() => onAskAI(`Tell me more about this quick win: "${win.title}". How can I implement it step-by-step, and what are the potential challenges I should watch out for?`)}
              label="Ask AI"
            />
          )}
          {onQuickEdit && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
              title={isEditing ? "Done editing" : "Edit quick win"}
            >
              {isEditing ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              ) : (
                <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Compact badges and metrics row */}
      <div className="flex flex-wrap items-center gap-2 mb-3 ml-11">
        {win.effort && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${difficultyColors[win.effort as keyof typeof difficultyColors] || difficultyColors.MEDIUM}`}>
            Effort: {win.effort}
          </span>
        )}
        {win.impact && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            win.impact === 'HIGH'
              ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
          }`}>
            Impact: {win.impact}
          </span>
        )}
        {win.pillar && (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
            {win.pillar}
          </span>
        )}
        {win.timeline && (
          <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Clock className="text-blue-600 flex-shrink-0" size={14} />
            {onQuickEdit && isEditing ? (
              <QuickResultEditor
                fieldName="quick_wins"
                value={win.timeline}
                onSave={async (newValue) => {
                  await onQuickEdit('quick_wins', newValue, `items[${index}].timeline`);
                }}
                label="Timeline"
              />
            ) : (
              win.timeline
            )}
          </span>
        )}
        {win.expected_outcome && (
          <span className="flex items-start gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Target className="text-purple-600 flex-shrink-0 mt-0.5" size={14} />
            {onQuickEdit && isEditing ? (
              <QuickResultEditor
                fieldName="quick_wins"
                value={win.expected_outcome}
                onSave={async (newValue) => {
                  await onQuickEdit('quick_wins', newValue, `items[${index}].expected_outcome`);
                }}
                label="Expected Outcome"
              />
            ) : (
              <span className="break-words">{win.expected_outcome}</span>
            )}
          </span>
        )}
      </div>

      {/* Compact implementation details */}
      <div className="ml-11 space-y-2">
        {win.steps && win.steps.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Steps:</p>
            <ol className="list-decimal list-inside space-y-0.5">
              {win.steps.map((step: string, i: number) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-400 break-words">
                  {step}
                </li>
              ))}
            </ol>
          </div>
        )}

        {win.tools && win.tools.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Tools:</p>
            <div className="flex flex-wrap gap-1.5">
              {win.tools.map((tool: string, i: number) => (
                <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs break-words">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {win.training_resources && win.training_resources.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📚 Training Resources:</p>
          <div className="space-y-2">
            {win.training_resources.map((resource: any, i: number) => (
              <TrainingResourceLink key={i} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TrainingResourceLink({ resource }: any) {
  const icons = {
    VIDEO: Play,
    ARTICLE: FileText,
    COURSE: BookOpen,
    DOCUMENTATION: FileText,
    CERTIFICATION: Award
  };
  const Icon = icons[resource.type as keyof typeof icons] || FileText;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline group"
    >
      <Icon size={14} className="flex-shrink-0" />
      <span className="flex-1">{resource.title}</span>
      {resource.duration && (
        <span className="text-xs text-gray-500 dark:text-gray-400">({resource.duration})</span>
      )}
      <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

function ExistingToolCard({ opportunity }: any) {
  return (
    <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white break-words">{opportunity.tool}</h4>
            <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded whitespace-nowrap">Already Owned</span>
          </div>

          {opportunity.current_usage && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 break-words">
              <span className="font-medium">Current usage:</span> {opportunity.current_usage}
            </p>
          )}

          {opportunity.untapped_capabilities && opportunity.untapped_capabilities.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Untapped capabilities:</p>
              <ul className="list-disc list-inside space-y-0.5">
                {opportunity.untapped_capabilities.map((cap: string, idx: number) => (
                  <li key={idx} className="text-xs text-gray-700 dark:text-gray-300 break-words">{cap}</li>
                ))}
              </ul>
            </div>
          )}

          {opportunity.quick_win && (
            <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Quick Win:</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 break-words">{opportunity.quick_win}</p>
            </div>
          )}

          {opportunity.learning_resources && opportunity.learning_resources.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">📚 Resources:</p>
              <div className="space-y-1">
                {opportunity.learning_resources.map((resource: any, idx: number) => (
                  <TrainingResourceLink key={idx} resource={resource} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RECOMMENDATIONS TAB
// ============================================================================
export function RecommendationsTab({ tier1, tier2, tier3, onAskAI }: any) {
  return (
    <div className="space-y-8">
      {/* Overall Header */}
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 inline-flex items-center justify-center gap-2">
          <span className="-mt-0.5">🛠️</span>
          <span>Your Toolkit of Technologies</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Curated recommendations organized by implementation complexity</p>
      </div>

      {/* Tier 1: Citizen-Led */}
      {tier1 && tier1.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <TierSection
            title="💡 Citizen-Led Solutions"
            subtitle="No IT required - business users can implement these"
            tools={tier1}
            tierColor="green"
            onAskAI={onAskAI}
          />
        </div>
      )}

      {/* Tier 2: Hybrid */}
      {tier2 && tier2.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <TierSection
            title="🤝 Hybrid Solutions"
            subtitle="Business + IT collaboration"
            tools={tier2}
            tierColor="blue"
            onAskAI={onAskAI}
          />
        </div>
      )}

      {/* Tier 3: Technical */}
      {tier3 && tier3.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <TierSection
            title="💻 Technical / Enterprise Solutions"
            subtitle="Requires development resources or IT implementation"
            tools={tier3}
            tierColor="purple"
            onAskAI={onAskAI}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ROADMAP TAB - TIMELINE/GANTT STYLE
// ============================================================================
export function RoadmapTab({ roadmap, onQuickEdit }: any) {
  const months = [
    { key: 'month_1', title: 'Days 1-30', label: 'Foundation', color: 'blue', data: roadmap?.month_1, days: [0, 30] },
    { key: 'month_2', title: 'Days 31-60', label: 'Scale', color: 'purple', data: roadmap?.month_2, days: [30, 60] },
    { key: 'month_3', title: 'Days 61-90', label: 'Optimize', color: 'green', data: roadmap?.month_3, days: [60, 90] }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 inline-flex items-center justify-center gap-2">
          <span className="-mt-0.5">📅</span>
          <span>Your 90-Day Transformation Timeline</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400">A visual roadmap showing parallel initiatives and milestones</p>
      </div>

      {/* Timeline Header */}
      <div className="bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="flex-1 flex items-center">
            <div className="flex-1 relative">
              {/* Timeline Bar */}
              <div className="h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex">
                <div className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <div className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600"></div>
              </div>

              {/* Day Markers */}
              <div className="flex justify-between mt-3">
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Day 1</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Day 30</span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Day 60</span>
                <span className="text-xs font-bold text-green-600 dark:text-green-400">Day 90</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Labels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {months.map((month) => (
            <div key={month.key} className={`text-center p-3 rounded-lg ${
              month.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
              month.color === 'purple' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' :
              'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            }`}>
              <div className={`text-lg font-bold mb-1 ${
                month.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                month.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                'text-green-600 dark:text-green-400'
              }`}>
                {month.label}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">{month.title}</div>
              {month.data?.focus && (
                <div className="text-xs text-gray-700 dark:text-gray-300 mt-2 font-medium">
                  {month.data.focus}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Actions by Phase */}
      <div className="space-y-6">
        {months.map((month, index) => (
          <RoadmapPhase key={month.key} month={month} index={index} onQuickEdit={onQuickEdit} />
        ))}
      </div>
    </div>
  );
}

function RoadmapPhase({ month, index, onQuickEdit }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      border: 'border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-600 text-white',
      text: 'text-blue-600 dark:text-blue-400'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/10',
      border: 'border-purple-200 dark:border-purple-800',
      badge: 'bg-purple-600 text-white',
      text: 'text-purple-600 dark:text-purple-400'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/10',
      border: 'border-green-200 dark:border-green-800',
      badge: 'bg-green-600 text-white',
      text: 'text-green-600 dark:text-green-400'
    }
  };

  const colors = colorClasses[month.color as keyof typeof colorClasses];

  // Handle both old schema (weeks with goals/deliverables) and new schema (actions)
  // Convert old format to new format for backwards compatibility
  let actions = month.data?.actions || [];
  if (!actions.length && month.data?.weeks) {
    // Convert old weeks format to actions format
    actions = month.data.weeks.map((week: any) => ({
      week: week.week,
      action: week.goals?.join(', ') || '',
      owner: 'Team',
      outcome: week.deliverables?.join(', ') || ''
    }));
  }

  return (
    <div className={`border-2 rounded-xl p-6 ${colors.bg} ${colors.border}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-4 py-2 rounded-full text-sm font-bold ${colors.badge}`}>
          Phase {index + 1}
        </span>
        <div className="flex-1">
          <h4 className={`text-xl font-bold ${colors.text}`}>{month.label}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">{month.title}</p>
        </div>
        {onQuickEdit && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
            title={isEditing ? "Done editing" : "Edit this month"}
          >
            {isEditing ? (
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            ) : (
              <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        )}
      </div>

      {month.data?.focus && (
        <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <Target size={16} className={colors.text} />
            Primary Focus:
          </p>
          {onQuickEdit && isEditing ? (
            <QuickResultEditor
              fieldName="roadmap"
              value={month.data.focus}
              onSave={async (newValue) => {
                await onQuickEdit('roadmap', newValue, `${month.key}.focus`);
              }}
              label="Primary Focus"
              multiline
            />
          ) : (
            <p className="text-gray-900 dark:text-white">{month.data.focus}</p>
          )}
        </div>
      )}

      {actions && actions.length > 0 && (
        <div className="space-y-3">
          {actions.map((action: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`${colors.text} font-bold text-sm px-3 py-1 bg-white dark:bg-slate-700 rounded-full border-2 ${colors.border} flex-shrink-0`}>
                  Week {action.week}
                </div>
                <div className="flex-1">
                  {onQuickEdit && isEditing ? (
                    <div className="mb-2">
                      <QuickResultEditor
                        fieldName="roadmap"
                        value={action.action}
                        onSave={async (newValue) => {
                          await onQuickEdit('roadmap', newValue, `${month.key}.actions[${idx}].action`);
                        }}
                        label="Action"
                      />
                    </div>
                  ) : (
                    <p className="font-semibold text-gray-900 dark:text-white mb-2 break-words">{action.action}</p>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2 text-sm min-w-0">
                      <Users size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      {onQuickEdit && isEditing ? (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-600 dark:text-gray-400">Owner: </span>
                          <QuickResultEditor
                            fieldName="roadmap"
                            value={action.owner}
                            onSave={async (newValue) => {
                              await onQuickEdit('roadmap', newValue, `${month.key}.actions[${idx}].owner`);
                            }}
                            label="Owner"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 break-words">
                          <span className="font-medium">Owner:</span> {action.owner}
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-2 text-sm min-w-0">
                      <CheckCircle2 size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      {onQuickEdit && isEditing ? (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-600 dark:text-gray-400">Outcome: </span>
                          <QuickResultEditor
                            fieldName="roadmap"
                            value={action.outcome}
                            onSave={async (newValue) => {
                              await onQuickEdit('roadmap', newValue, `${month.key}.actions[${idx}].outcome`);
                            }}
                            label="Outcome"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-600 dark:text-gray-400 break-words">
                          <span className="font-medium">Outcome:</span> {action.outcome}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MATURITY TAB
// ============================================================================
export function MaturityTab({ maturity, onAskAI }: any) {
  const pillars = [
    { key: 'data_strategy', title: 'Data Strategy', icon: TrendingUp, color: 'blue', data: maturity?.data_strategy },
    { key: 'automation_strategy', title: 'Automation Strategy', icon: Zap, color: 'purple', data: maturity?.automation_strategy },
    { key: 'ai_strategy', title: 'AI Strategy', icon: Star, color: 'orange', data: maturity?.ai_strategy },
    { key: 'ux_strategy', title: 'UX & Design Strategy', icon: Palette, color: 'pink', data: maturity?.ux_strategy },
    { key: 'people_strategy', title: 'People & Change', icon: Users, color: 'green', data: maturity?.people_strategy }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 inline-flex items-center justify-center gap-2">
          <span className="-mt-0.5">📊</span>
          <span>Digital Maturity Assessment</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Where you are today and where you're heading</p>
      </div>

      <div className="space-y-6">
        {pillars.map((pillar) => (
          <MaturityPillar key={pillar.key} pillar={pillar} onAskAI={onAskAI} />
        ))}
      </div>
    </div>
  );
}

function MaturityPillar({ pillar, onAskAI }: any) {
  const Icon = pillar.icon;
  const score = pillar.data?.score || 0;

  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    pink: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
  };

  const borderColorClasses = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    pink: 'border-pink-500',
    orange: 'border-orange-500',
    green: 'border-green-500'
  };

  return (
    <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[pillar.color as keyof typeof colorClasses]} flex items-center justify-center flex-shrink-0`}>
          <Icon size={24} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white break-words">{pillar.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1 flex-shrink-0">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-6 sm:w-8 h-2 rounded-full ${
                    level <= score
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300 whitespace-nowrap">{score}/5</span>
          </div>
        </div>
        {onAskAI && (
          <div className="flex-shrink-0 w-full sm:w-auto">
            <AskAIButton
              onClick={() => onAskAI(`How can I improve my ${pillar.title} score from ${score}/5? What are the most important steps to take and what quick wins should I prioritize?`)}
              label="Ask AI"
            />
          </div>
        )}
      </div>

      {/* Current Gaps */}
      <div className={`bg-gray-100 dark:bg-slate-800 border-l-4 ${borderColorClasses[pillar.color as keyof typeof borderColorClasses]} rounded-lg p-4 mb-4`}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Current Gaps:</p>
        <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
          {pillar.data?.gap_analysis || `Your ${pillar.title.toLowerCase()} capabilities show room for improvement in key areas. Focus on building foundational skills while implementing industry best practices. Prioritize initiatives that deliver measurable business value within 30-60 days to build momentum and stakeholder confidence.`}
        </p>
      </div>

      {/* Sub-Categories Breakdown */}
      {pillar.data?.sub_categories && pillar.data.sub_categories.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Detailed Breakdown:</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pillar.data.sub_categories.map((subCat: any, index: number) => (
              <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <h5 className="font-semibold text-gray-900 dark:text-white text-sm break-words min-w-0">{subCat.name}</h5>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`w-3 sm:w-4 h-1.5 rounded-full ${
                            level <= (subCat.score || 0)
                              ? 'bg-blue-600'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">{subCat.score || 0}/5</span>
                  </div>
                </div>

                {subCat.current_state && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">Current State:</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 break-words">{subCat.current_state}</p>
                  </div>
                )}

                {subCat.best_practices && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-3 mb-3 border-l-2 border-blue-500">
                    <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Best Practices:</p>
                    <p className="text-xs text-blue-800 dark:text-blue-200 break-words">{subCat.best_practices}</p>
                  </div>
                )}

                {subCat.quick_win && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 border-l-2 border-green-500">
                    <p className="text-xs font-medium text-green-900 dark:text-green-300 mb-1">Quick Win:</p>
                    <p className="text-xs text-green-800 dark:text-green-200 break-words">{subCat.quick_win}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`bg-gray-100 dark:bg-slate-800 border-l-4 ${borderColorClasses[pillar.color as keyof typeof borderColorClasses]} rounded-lg p-4 mt-4`}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">90-Day Target:</p>
        <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
          {pillar.data?.target || `Achieve a maturity level of ${Math.min(5, (pillar.data?.score || 0) + 1)}/5 in ${pillar.title}. Implement foundational processes, train team members on key tools, and establish metrics to track progress. Focus on completing 2-3 high-impact initiatives that demonstrate measurable ROI.`}
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// LONG-TERM VISION TAB
// ============================================================================
export function LongTermVisionTab({ vision, onQuickEdit }: any) {
  const [isEditingYear1, setIsEditingYear1] = useState(false);
  const [isEditingYear23, setIsEditingYear23] = useState(false);

  if (!vision) {
    return <div className="text-center text-gray-600 dark:text-gray-400">No long-term vision data available</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 inline-flex items-center justify-center gap-2">
          <span className="-mt-0.5">🚀</span>
          <span>Your Digital Transformation Journey</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400">A strategic roadmap for sustainable competitive advantage</p>
      </div>

      {/* Year 1 Goals */}
      {vision.year_1_goals && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">Year 1</span>
            <div className="h-1 flex-1 bg-blue-500 rounded"></div>
            {onQuickEdit && (
              <button
                onClick={() => setIsEditingYear1(!isEditingYear1)}
                className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                title={isEditingYear1 ? "Done editing" : "Edit Year 1"}
              >
                {isEditingYear1 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )}
          </div>

          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
            {onQuickEdit && isEditingYear1 ? (
              <QuickResultEditor
                fieldName="long_term_vision"
                value={vision.year_1_recommendations || 'Focus on building foundational capabilities first. Start with data quality and governance while simultaneously launching quick-win automation projects to build momentum. Establish clear success metrics and celebrate early wins to maintain stakeholder engagement throughout the year.'}
                onSave={async (newValue) => {
                  await onQuickEdit('long_term_vision', newValue, 'year_1_recommendations');
                }}
                label="Year 1 Recommendations"
                multiline
              />
            ) : (
              <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
                {vision.year_1_recommendations || 'Focus on building foundational capabilities first. Start with data quality and governance while simultaneously launching quick-win automation projects to build momentum. Establish clear success metrics and celebrate early wins to maintain stakeholder engagement throughout the year.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(vision.year_1_goals).map(([pillar, goal]: [string, any]) => (
              <div key={pillar} className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 capitalize flex items-center gap-2 break-words">
                  {pillar === 'data' && <TrendingUp className="text-blue-600 flex-shrink-0" size={20} />}
                  {pillar === 'automation' && <Zap className="text-purple-600 flex-shrink-0" size={20} />}
                  {pillar === 'ai' && <Star className="text-orange-600 flex-shrink-0" size={20} />}
                  {pillar === 'ux' && <Users className="text-pink-600 flex-shrink-0" size={20} />}
                  {pillar === 'people' && <Users className="text-green-600 flex-shrink-0" size={20} />}
                  {pillar}
                </h4>
                {onQuickEdit && isEditingYear1 ? (
                  <QuickResultEditor
                    fieldName="long_term_vision"
                    value={goal}
                    onSave={async (newValue) => {
                      await onQuickEdit('long_term_vision', newValue, `year_1_goals.${pillar}`);
                    }}
                    label={`Year 1 ${pillar}`}
                    multiline
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-300 text-sm break-words">{goal}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year 2-3 Aspirations */}
      {vision.year_2_3_aspirations && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">Years 2-3</span>
            <div className="h-1 flex-1 bg-purple-500 rounded"></div>
            {onQuickEdit && (
              <button
                onClick={() => setIsEditingYear23(!isEditingYear23)}
                className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                title={isEditingYear23 ? "Done editing" : "Edit Years 2-3"}
              >
                {isEditingYear23 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )}
          </div>

          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-purple-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
            {onQuickEdit && isEditingYear23 ? (
              <QuickResultEditor
                fieldName="long_term_vision"
                value={vision.year_2_3_recommendations || 'Build on Year 1 successes by scaling proven solutions across the organization. Focus on advanced capabilities like predictive analytics and AI-driven automation. Establish your organization as an industry leader by sharing best practices and attracting top digital talent with your cutting-edge technology stack.'}
                onSave={async (newValue) => {
                  await onQuickEdit('long_term_vision', newValue, 'year_2_3_recommendations');
                }}
                label="Years 2-3 Recommendations"
                multiline
              />
            ) : (
              <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
                {vision.year_2_3_recommendations || 'Build on Year 1 successes by scaling proven solutions across the organization. Focus on advanced capabilities like predictive analytics and AI-driven automation. Establish your organization as an industry leader by sharing best practices and attracting top digital talent with your cutting-edge technology stack.'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(vision.year_2_3_aspirations).map(([pillar, aspiration]: [string, any]) => (
              <div key={pillar} className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 capitalize flex items-center gap-2 break-words">
                  {pillar === 'data' && <TrendingUp className="text-blue-600 flex-shrink-0" size={20} />}
                  {pillar === 'automation' && <Zap className="text-purple-600 flex-shrink-0" size={20} />}
                  {pillar === 'ai' && <Star className="text-orange-600 flex-shrink-0" size={20} />}
                  {pillar === 'ux' && <Users className="text-pink-600 flex-shrink-0" size={20} />}
                  {pillar === 'people' && <Users className="text-green-600 flex-shrink-0" size={20} />}
                  {pillar}
                </h4>
                {onQuickEdit && isEditingYear23 ? (
                  <QuickResultEditor
                    fieldName="long_term_vision"
                    value={aspiration}
                    onSave={async (newValue) => {
                      await onQuickEdit('long_term_vision', newValue, `year_2_3_aspirations.${pillar}`);
                    }}
                    label={`Years 2-3 ${pillar}`}
                    multiline
                  />
                ) : (
                  <p className="text-gray-800 dark:text-gray-300 text-sm break-words">{aspiration}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Advantages */}
      {vision.competitive_advantages && vision.competitive_advantages.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="text-green-600" />
            Competitive Advantages You'll Gain
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vision.competitive_advantages.map((advantage: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-100 dark:bg-slate-800 border-l-4 border-green-500 rounded-lg">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-gray-800 dark:text-gray-300 text-sm break-words">{advantage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Benchmarks */}
      {vision.industry_benchmarks && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="text-blue-600" />
            Industry Leadership Position
          </h4>
          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-blue-500 rounded-lg p-4">
            {onQuickEdit ? (
              <QuickResultEditor
                fieldName="long_term_vision"
                value={vision.industry_benchmarks}
                onSave={async (newValue) => {
                  await onQuickEdit('long_term_vision', newValue, 'industry_benchmarks');
                }}
                label="Industry Benchmarks"
                multiline
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-300 text-sm break-words">{vision.industry_benchmarks}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANGE MANAGEMENT TAB
// ============================================================================
export function ChangeManagementTab({ changeMgmt, successMetrics, projectTracking, onAskAI, onQuickEdit }: any) {
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [isEditingStakeholder, setIsEditingStakeholder] = useState(false);
  const [isEditingPilots, setIsEditingPilots] = useState(false);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 inline-flex items-center justify-center gap-2">
          <span className="-mt-0.5">👥</span>
          <span>Change Management & Training</span>
        </h3>
        <p className="text-gray-600 dark:text-gray-400">Building adoption and driving sustainable change</p>
      </div>

      {/* Communication Strategy */}
      {changeMgmt?.communication_strategy && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-blue-600" size={24} />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">Communication Strategy</h4>
            </div>
            {onAskAI && (
              <AskAIButton
                onClick={() => onAskAI(`Can you provide specific examples and templates for my communication strategy? What are the best practices for communicating digital transformation to different stakeholder groups?`)}
                label="Ask AI"
              />
            )}
          </div>
          {onQuickEdit ? (
            <QuickResultEditor
              fieldName="change_management_plan"
              value={changeMgmt.communication_strategy}
              onSave={async (newValue) => {
                await onQuickEdit('change_management_plan', newValue, 'communication_strategy');
              }}
              label="Communication Strategy"
              multiline
            />
          ) : (
            <p className="text-gray-700 dark:text-gray-300 break-words">{changeMgmt.communication_strategy}</p>
          )}
        </div>
      )}

      {/* Stakeholder Engagement */}
      {changeMgmt?.stakeholder_engagement && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-purple-600 flex-shrink-0" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white break-words">Stakeholder Engagement</h4>
            <div className="flex-1"></div>
            {onQuickEdit && (
              <button
                onClick={() => setIsEditingStakeholder(!isEditingStakeholder)}
                className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                title={isEditingStakeholder ? "Done editing" : "Edit stakeholder engagement"}
              >
                {isEditingStakeholder ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )}
            {onAskAI && (
              <AskAIButton
                onClick={() => onAskAI(`How do I identify and engage key stakeholders for my transformation? Can you provide a stakeholder mapping framework and engagement tactics?`)}
                label="Ask AI"
              />
            )}
          </div>

          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-purple-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
            <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
              {changeMgmt.stakeholder_engagement?.approach || "Build a comprehensive stakeholder engagement strategy that identifies key decision-makers, influencers, and champions across the organization. Focus on early wins with executive sponsors while developing a network of transformation advocates at all levels."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {changeMgmt.stakeholder_engagement?.executive_buy_in && (
              <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>👔</span>
                  <span>Executive Buy-in:</span>
                </h5>
                <ul className="list-disc list-inside space-y-2">
                  {changeMgmt.stakeholder_engagement.executive_buy_in.map((item: string, idx: number) => (
                    <li key={idx} className="text-gray-800 dark:text-gray-300 text-sm">
                      {onQuickEdit && isEditingStakeholder ? (
                        <QuickResultEditor
                          fieldName="change_management_plan"
                          value={item}
                          onSave={async (newValue) => {
                            await onQuickEdit('change_management_plan', newValue, `stakeholder_engagement.executive_buy_in[${idx}]`);
                          }}
                          label={`Executive Buy-in ${idx + 1}`}
                        />
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {changeMgmt.stakeholder_engagement?.champion_network && (
              <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🏆</span>
                  <span>Champion Network:</span>
                </h5>
                <ul className="list-disc list-inside space-y-2">
                  {changeMgmt.stakeholder_engagement.champion_network.map((item: string, idx: number) => (
                    <li key={idx} className="text-gray-800 dark:text-gray-300 text-sm">
                      {onQuickEdit && isEditingStakeholder ? (
                        <QuickResultEditor
                          fieldName="change_management_plan"
                          value={item}
                          onSave={async (newValue) => {
                            await onQuickEdit('change_management_plan', newValue, `stakeholder_engagement.champion_network[${idx}]`);
                          }}
                          label={`Champion Network ${idx + 1}`}
                        />
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {changeMgmt.stakeholder_engagement?.team_communication && (
              <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4 lg:col-span-2">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>💬</span>
                  <span>Team Communication:</span>
                </h5>
                <ul className="list-disc list-inside space-y-2 columns-1 lg:columns-2 gap-6">
                  {changeMgmt.stakeholder_engagement.team_communication.map((item: string, idx: number) => (
                    <li key={idx} className="text-gray-800 dark:text-gray-300 text-sm break-inside-avoid">
                      {onQuickEdit && isEditingStakeholder ? (
                        <QuickResultEditor
                          fieldName="change_management_plan"
                          value={item}
                          onSave={async (newValue) => {
                            await onQuickEdit('change_management_plan', newValue, `stakeholder_engagement.team_communication[${idx}]`);
                          }}
                          label={`Team Communication ${idx + 1}`}
                        />
                      ) : (
                        item
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Training Approach */}
      {changeMgmt?.training_approach && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white break-words">Training Approach</h4>
            <div className="flex-1"></div>
            {onAskAI && (
              <AskAIButton
                onClick={() => onAskAI(`What specific training programs and materials should I create? How do I measure training effectiveness and ensure knowledge retention?`)}
                label="Ask AI"
              />
            )}
          </div>

          {/* Handle both old string format and new structured format */}
          {typeof changeMgmt.training_approach === 'string' ? (
            <>
              <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-green-500 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
                <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
                  {changeMgmt.training_approach || "Implement a blended learning approach that accommodates different learning styles and technical comfort levels. Combine hands-on workshops with self-paced resources, and establish peer mentoring programs to support ongoing skill development."}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>📚</span>
                    <span>Delivery Methods:</span>
                  </h5>
                  <ul className="space-y-2">
                    {["In-person workshops and hands-on labs", "Self-paced e-learning modules", "Peer mentoring and buddy systems", "Lunch-and-learn sessions"].map((method: string, idx: number) => (
                      <li key={idx} className="text-gray-800 dark:text-gray-300 text-sm">{method}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>🎯</span>
                    <span>Key Topics:</span>
                  </h5>
                  <ul className="space-y-2">
                    {["New tools and technologies", "Process and workflow changes", "Data literacy and analytics", "Change management and adoption"].map((topic: string, idx: number) => (
                      <li key={idx} className="text-gray-800 dark:text-gray-300 text-sm">{topic}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4 lg:col-span-2">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>✓</span>
                    <span>Best Practices:</span>
                  </h5>
                  <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {[
                      "Start training before the rollout to build confidence",
                      "Use real scenarios and data from your organization",
                      "Provide just-in-time support during initial adoption",
                      "Create role-specific training paths",
                      "Establish champions as go-to resources",
                      "Measure training effectiveness and iterate"
                    ].map((practice: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-300">
                        <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-green-500 rounded-lg p-4 mb-6">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
                <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
                  {changeMgmt.training_approach?.overview || "Implement a blended learning approach that accommodates different learning styles and technical comfort levels. Combine hands-on workshops with self-paced resources, and establish peer mentoring programs to support ongoing skill development."}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>📚</span>
                    <span>Delivery Methods:</span>
                  </h5>
                  <ul className="space-y-2">
                    {(changeMgmt.training_approach?.delivery_methods || ["In-person workshops and hands-on labs", "Self-paced e-learning modules", "Peer mentoring and buddy systems", "Lunch-and-learn sessions"]).map((method: string, idx: number) => (
                      <li key={idx} className="text-gray-800 dark:text-gray-300 text-sm">{method}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>🎯</span>
                    <span>Key Topics:</span>
                  </h5>
                  <ul className="space-y-2">
                    {(changeMgmt.training_approach?.key_topics || ["New tools and technologies", "Process and workflow changes", "Data literacy and analytics", "Change management and adoption"]).map((topic: string, idx: number) => (
                      <li key={idx} className="text-gray-800 dark:text-gray-300 text-sm">{topic}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4 lg:col-span-2">
                  <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <span>✓</span>
                    <span>Best Practices:</span>
                  </h5>
                  <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {(changeMgmt.training_approach?.best_practices || [
                      "Start training before the rollout to build confidence",
                      "Use real scenarios and data from your organization",
                      "Provide just-in-time support during initial adoption",
                      "Create role-specific training paths",
                      "Establish champions as go-to resources",
                      "Measure training effectiveness and iterate"
                    ]).map((practice: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-300">
                        <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Change Management Frameworks */}
      {changeMgmt?.recommended_frameworks && changeMgmt.recommended_frameworks.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="text-indigo-600" size={24} />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">Recommended Change Management Frameworks</h4>
            </div>
            {onAskAI && (
              <AskAIButton
                onClick={() => onAskAI(`Can you explain these change management frameworks in more detail? Which one would be best for my organization and how do I get started?`)}
                label="Ask AI"
              />
            )}
          </div>

          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-indigo-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
            <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
              Proven change management frameworks provide structured methodologies to guide your transformation. Choose a framework that aligns with your organization's culture and change readiness. Most successful transformations combine elements from multiple frameworks rather than rigidly following one approach.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {changeMgmt.recommended_frameworks.map((framework: any, index: number) => (
              <div key={index} className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4 flex flex-col">
                <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-2 break-words">{framework.name}</h5>
                <p className="text-sm text-gray-800 dark:text-gray-300 mb-3 break-words">{framework.description}</p>

                {framework.why_recommended && (
                  <div className="border-l-2 border-blue-500 pl-3 mb-3">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Why This Framework:</p>
                    <p className="text-xs text-gray-800 dark:text-gray-300 break-words">{framework.why_recommended}</p>
                  </div>
                )}

                {framework.getting_started && (
                  <div className="border-l-2 border-green-500 pl-3 mb-3">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Getting Started:</p>
                    <p className="text-xs text-gray-800 dark:text-gray-300 break-words">{framework.getting_started}</p>
                  </div>
                )}

                {framework.resources && framework.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">📚 Resources:</p>
                    <div className="space-y-1.5">
                      {framework.resources.map((resource: any, i: number) => (
                        <TrainingResourceLink key={i} resource={resource} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Change Management Tools */}
      {changeMgmt?.recommended_tools && changeMgmt.recommended_tools.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="text-purple-600" size={24} />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">Recommended Change Management Tools</h4>
            </div>
            {onAskAI && (
              <AskAIButton
                onClick={() => onAskAI(`Tell me more about these change management tools. How do I choose between them and what's the implementation process?`)}
                label="Ask AI"
              />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Practical tools to support training, communication, and feedback</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {changeMgmt.recommended_tools.map((tool: any, index: number) => (
              <ChangeManagementToolCard key={index} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Pilot Recommendations */}
      {changeMgmt?.pilot_recommendations && Array.isArray(changeMgmt.pilot_recommendations) && changeMgmt.pilot_recommendations.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-yellow-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Pilot Recommendations</h4>
            <div className="flex-1"></div>
            {onQuickEdit && (
              <button
                onClick={() => setIsEditingPilots(!isEditingPilots)}
                className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                title={isEditingPilots ? "Done editing" : "Edit pilot recommendations"}
              >
                {isEditingPilots ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )}
            {onAskAI && (
              <AskAIButton
                onClick={() => onAskAI(`Help me design a pilot program for my transformation. What metrics should I track, how do I select the pilot group, and what's the ideal timeline?`)}
                label="Ask AI"
              />
            )}
          </div>

          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-yellow-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
            <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
              {changeMgmt.pilot_approach || "Start with small, focused pilot programs in areas where success is most likely. Choose pilots that demonstrate quick value while building organizational capability and confidence. Use pilot results to refine your approach before broader rollout."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {changeMgmt.pilot_recommendations.map((pilot: any, idx: number) => (
              <div key={idx} className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🎯</span>
                  <span>
                    {onQuickEdit && isEditingPilots ? (
                      <QuickResultEditor
                        fieldName="change_management_plan"
                        value={pilot.focus_area}
                        onSave={async (newValue) => {
                          await onQuickEdit('change_management_plan', newValue, `pilot_recommendations[${idx}].focus_area`);
                        }}
                        label="Focus Area"
                      />
                    ) : (
                      pilot.focus_area
                    )}
                  </span>
                </h5>
                <div className="space-y-3 text-sm">
                  {pilot.scope && (
                    <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Scope:</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {onQuickEdit && isEditingPilots ? (
                          <QuickResultEditor
                            fieldName="change_management_plan"
                            value={pilot.scope}
                            onSave={async (newValue) => {
                              await onQuickEdit('change_management_plan', newValue, `pilot_recommendations[${idx}].scope`);
                            }}
                            label="Scope"
                          />
                        ) : (
                          pilot.scope
                        )}
                      </p>
                    </div>
                  )}
                  {pilot.duration && (
                    <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Duration:</p>
                      <p className="text-gray-700 dark:text-gray-300">
                        {onQuickEdit && isEditingPilots ? (
                          <QuickResultEditor
                            fieldName="change_management_plan"
                            value={pilot.duration}
                            onSave={async (newValue) => {
                              await onQuickEdit('change_management_plan', newValue, `pilot_recommendations[${idx}].duration`);
                            }}
                            label="Duration"
                          />
                        ) : (
                          pilot.duration
                        )}
                      </p>
                    </div>
                  )}
                  {pilot.success_criteria && Array.isArray(pilot.success_criteria) && (
                    <div className="border-l-2 border-green-500 pl-3">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Success Criteria:</p>
                      <ul className="space-y-1.5">
                        {pilot.success_criteria.map((criteria: string, cidx: number) => (
                          <li key={cidx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <span className="flex-1">
                              {onQuickEdit && isEditingPilots ? (
                                <QuickResultEditor
                                  fieldName="change_management_plan"
                                  value={criteria}
                                  onSave={async (newValue) => {
                                    await onQuickEdit('change_management_plan', newValue, `pilot_recommendations[${idx}].success_criteria[${cidx}]`);
                                  }}
                                  label={`Success Criteria ${cidx + 1}`}
                                />
                              ) : (
                                criteria
                              )}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Project Tracking */}
      {projectTracking && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-blue-600" size={24} />
              <h4 className="text-xl font-bold text-gray-900 dark:text-white">Project Tracking & Management</h4>
            </div>
            {onAskAI && (
              <AskAIButton
                onClick={() => onAskAI(`What project tracking tools and methodologies would work best for my organization? Can you provide guidance on implementing these recommendations?`)}
                label="Ask AI"
              />
            )}
          </div>

          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
            <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
              {projectTracking.recommended_approach || "Implement a lightweight project tracking system that balances visibility with simplicity. Focus on tracking key milestones, dependencies, and blockers rather than excessive detail. Ensure the tracking approach supports collaboration and keeps stakeholders informed."}
            </p>
          </div>

          {projectTracking.tools && projectTracking.tools.length > 0 && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Recommended tools to track your transformation initiatives:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {projectTracking.tools.map((tool: any, index: number) => (
                  <ProjectTrackingToolCard key={index} tool={tool} />
                ))}
              </div>
            </>
          )}

          {projectTracking.best_practices && projectTracking.best_practices.length > 0 && (
            <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-green-500 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Best Practices:</p>
              <ul className="space-y-2">
                {projectTracking.best_practices.map((practice: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-300">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                    <span className="break-words">{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Success Metrics */}
      {successMetrics && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-blue-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Success Metrics</h4>
            <div className="flex-1"></div>
            {onQuickEdit && (
              <button
                onClick={() => setIsEditingMetrics(!isEditingMetrics)}
                className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg border border-transparent hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                title={isEditingMetrics ? "Done editing" : "Edit success metrics"}
              >
                {isEditingMetrics ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            )}
          </div>

          <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
            <p className="text-sm text-gray-800 dark:text-gray-300 break-words">
              Establish clear, measurable KPIs at 30, 60, and 90-day intervals to track transformation progress. Focus on leading indicators (adoption rates, engagement) early, then transition to lagging indicators (efficiency gains, ROI) as initiatives mature. Review metrics weekly and adjust tactics based on data.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {successMetrics['30_day_kpis'] && successMetrics['30_day_kpis'].length > 0 && (
              <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>📊</span>
                  <span>30-Day KPIs:</span>
                </h5>
                <ul className="list-disc list-inside space-y-2">
                  {successMetrics['30_day_kpis'].map((kpi: string, i: number) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300 text-sm">
                      {onQuickEdit && isEditingMetrics ? (
                        <QuickResultEditor
                          fieldName="success_metrics"
                          value={kpi}
                          onSave={async (newValue) => {
                            await onQuickEdit('success_metrics', newValue, `30_day_kpis[${i}]`);
                          }}
                          label={`30-Day KPI ${i + 1}`}
                        />
                      ) : (
                        kpi
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {successMetrics['60_day_kpis'] && successMetrics['60_day_kpis'].length > 0 && (
              <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>📈</span>
                  <span>60-Day KPIs:</span>
                </h5>
                <ul className="list-disc list-inside space-y-2">
                  {successMetrics['60_day_kpis'].map((kpi: string, i: number) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300 text-sm">
                      {onQuickEdit && isEditingMetrics ? (
                        <QuickResultEditor
                          fieldName="success_metrics"
                          value={kpi}
                          onSave={async (newValue) => {
                            await onQuickEdit('success_metrics', newValue, `60_day_kpis[${i}]`);
                          }}
                          label={`60-Day KPI ${i + 1}`}
                        />
                      ) : (
                        kpi
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {successMetrics['90_day_kpis'] && successMetrics['90_day_kpis'].length > 0 && (
              <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
                <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span>🎯</span>
                  <span>90-Day KPIs:</span>
                </h5>
                <ul className="list-disc list-inside space-y-2">
                  {successMetrics['90_day_kpis'].map((kpi: string, i: number) => (
                    <li key={i} className="text-gray-700 dark:text-gray-300 text-sm">
                      {onQuickEdit && isEditingMetrics ? (
                        <QuickResultEditor
                          fieldName="success_metrics"
                          value={kpi}
                          onSave={async (newValue) => {
                            await onQuickEdit('success_metrics', newValue, `90_day_kpis[${i}]`);
                          }}
                          label={`90-Day KPI ${i + 1}`}
                        />
                      ) : (
                        kpi
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Common Objections */}
      {changeMgmt?.common_objections && changeMgmt.common_objections.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Addressing Common Objections</h4>
          </div>

          <div className="space-y-4">
            {changeMgmt.common_objections.map((item: any, i: number) => (
              <div key={i} className="border-l-4 border-orange-400 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2 break-words">"{item.objection}"</p>
                <p className="text-gray-700 dark:text-gray-300 break-words">{item.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TierSection({ title, subtitle, tools, tierColor, onAskAI }: any) {
  // Split emoji from title text for proper alignment
  const emojiMatch = title.match(/^([\u{1F000}-\u{1F9FF}])\s*(.+)$/u);
  const emoji = emojiMatch ? emojiMatch[1] : null;
  const titleText = emojiMatch ? emojiMatch[2] : title;

  const tierAccentColors: Record<'green' | 'blue' | 'purple', string> = {
    green: 'border-l-4 border-green-500',
    blue: 'border-l-4 border-blue-500',
    purple: 'border-l-4 border-purple-500'
  };

  const borderColor = tierAccentColors[tierColor as keyof typeof tierAccentColors] || tierAccentColors.blue;

  const tierRecaps: Record<'green' | 'blue' | 'purple', string> = {
    green: 'These are quick-win tools that your business users can adopt without IT involvement. They\'re typically low-cost, fast to implement, and deliver immediate value.',
    blue: 'These solutions require coordination between business and IT teams. They offer stronger capabilities than citizen-led tools while remaining relatively accessible.',
    purple: 'These are enterprise-grade solutions requiring significant IT resources and development expertise. They provide the most comprehensive capabilities for complex needs.'
  };

  return (
    <div>
      <div className="mb-6">
        {emoji ? (
          <h4 className="text-xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
            <span className="-mt-0.5">{emoji}</span>
            <span>{titleText}</span>
          </h4>
        ) : (
          <h4 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h4>
        )}
      </div>

      {/* Tier Recap */}
      <div className={`bg-gray-100 dark:bg-slate-800 ${borderColor} rounded-lg p-4 mb-6`}>
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Recommended Approach:</p>
        <p className="text-sm text-gray-800 dark:text-gray-300">
          {tierRecaps[tierColor as keyof typeof tierRecaps] || tierRecaps.blue}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool: any, index: number) => (
          <ToolCard key={index} tool={tool} tierColor={tierColor} onAskAI={onAskAI} />
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool, tierColor, onAskAI }: any) {
  const costIcons: Record<string, string> = {
    FREE: '🆓',
    '$': '💵',
    '$$': '💰',
    '$$$': '💎',
    '$$$$': '🏦'
  };

  return (
    <div className="bg-white dark:bg-slate-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-6">
      <div className="flex items-center justify-between mb-3 gap-2">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white flex-1 min-w-0 break-words">{tool.name}</h4>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onAskAI && (
            <AskAIButton
              onClick={() => onAskAI(`Why was ${tool.name} recommended for my company? Can you explain the implementation steps, costs, and expected ROI in detail?`)}
              label="Ask AI"
            />
          )}
          <span className="text-2xl leading-none">{costIcons[tool.cost] || '💰'}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 break-words">{tool.description}</p>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Why recommended:</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 break-words">{tool.why_recommended}</p>
      </div>

      {tool.use_cases && tool.use_cases.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Use cases:</p>
          <div className="flex flex-wrap gap-2">
            {tool.use_cases.map((useCase: string, i: number) => (
              <span key={i} className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600 break-words">
                {useCase}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-1">
          <Clock size={14} />
          <span>{tool.time_to_value}</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle size={14} />
          <span>{tool.difficulty}</span>
        </div>
      </div>

      {tool.training_resources && tool.training_resources.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Training Resources:</p>
          <div className="space-y-1.5">
            {tool.training_resources.map((resource: any, i: number) => (
              <TrainingResourceLink key={i} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ChangeManagementToolCard({ tool }: any) {
  const costIcons = {
    FREE: '🆓',
    '$': '💵',
    '$$': '💰',
    '$$$': '💎'
  };

  const categoryBorderColors = {
    TRAINING: 'border-blue-500',
    COMMUNICATION: 'border-purple-500',
    PROJECT_MANAGEMENT: 'border-green-500',
    FEEDBACK: 'border-orange-500'
  };

  return (
    <div className={`bg-gray-50 dark:bg-slate-800 border-l-4 ${categoryBorderColors[tool.category as keyof typeof categoryBorderColors] || 'border-gray-500'} border border-gray-200 dark:border-gray-600 rounded-lg p-4`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h5 className="font-bold text-gray-900 dark:text-white text-sm break-words flex-1 min-w-0">{tool.name}</h5>
        <span className="text-xl flex-shrink-0">{costIcons[tool.cost as keyof typeof costIcons] || '💰'}</span>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 uppercase font-semibold">{tool.category?.replace('_', ' ')}</p>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 break-words">{tool.description}</p>

      {tool.use_case && (
        <div className="border-l-2 border-blue-500 pl-3 mb-2">
          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Use Case:</p>
          <p className="text-xs text-gray-700 dark:text-gray-300 break-words">{tool.use_case}</p>
        </div>
      )}

      {tool.url && (
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2"
        >
          <ExternalLink size={12} />
          Visit Website
        </a>
      )}
    </div>
  );
}

function ProjectTrackingToolCard({ tool }: any) {
  const costIcons = {
    FREE: '🆓',
    '$': '💵',
    '$$': '💰',
    '$$$': '💎',
    '$$$$': '🏦'
  };

  return (
    <div className="bg-gray-100 dark:bg-slate-800 border-l-4 border-gray-500 dark:border-gray-400 rounded-lg p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h5 className="font-bold text-gray-900 dark:text-white break-words flex-1 min-w-0">{tool.name}</h5>
        <span className="text-2xl flex-shrink-0">{costIcons[tool.cost as keyof typeof costIcons] || '💰'}</span>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 uppercase font-semibold">{tool.tier} TIER</p>
      <p className="text-sm text-gray-800 dark:text-gray-300 mb-3 break-words">{tool.description}</p>

      {tool.why_recommended && (
        <div className="border-l-2 border-blue-500 pl-3 mb-3">
          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Why Recommended:</p>
          <p className="text-xs text-gray-800 dark:text-gray-300 break-words">{tool.why_recommended}</p>
        </div>
      )}

      {tool.integration_with_existing && (
        <div className="border-l-2 border-purple-500 pl-3 mb-3">
          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Integration:</p>
          <p className="text-xs text-gray-800 dark:text-gray-300 break-words">{tool.integration_with_existing}</p>
        </div>
      )}

      {tool.getting_started && (
        <div className="border-l-2 border-green-500 pl-3 mb-3">
          <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Getting Started:</p>
          <p className="text-xs text-gray-800 dark:text-gray-300 break-words">{tool.getting_started}</p>
        </div>
      )}

      {tool.url && (
        <a
          href={tool.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          <ExternalLink size={14} />
          Visit Website
        </a>
      )}

      {tool.training_resources && tool.training_resources.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Training Resources:</p>
          <div className="space-y-1.5">
            {tool.training_resources.map((resource: any, i: number) => (
              <TrainingResourceLink key={i} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
