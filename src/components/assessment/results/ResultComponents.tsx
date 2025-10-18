import { Zap, Clock, TrendingUp, DollarSign, Users, Target, Star, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Play, FileText, BookOpen, Award } from 'lucide-react';

// ============================================================================
// OVERVIEW TAB - Better Executive Summary
// ============================================================================
export function OverviewTab({ maturity, priority, quickWinsCount }: any) {
  return (
    <div className="space-y-6">
      {/* Executive Summary - Clean Design */}
      <div className="bg-white dark:bg-slate-700 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Target className="text-blue-600" />
          Executive Summary
        </h3>

        <div className="space-y-4">
          <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Current State:</p>
            <p className="text-gray-900 dark:text-white">{priority?.current_state}</p>
          </div>

          <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">🎯 Key Opportunity:</p>
            <p className="text-gray-900 dark:text-white">{priority?.key_opportunity}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">🚀 Recommended Starting Point:</p>
            <p className="text-gray-900 dark:text-white">{priority?.recommended_starting_point}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - 5 cards to emphasize People Strategy */}
      <div className="grid md:grid-cols-5 gap-4">
        <StatCard title="Quick Wins Ready" value={quickWinsCount} icon={Zap} color="green" />
        <StatCard title="Data Maturity" value={`${maturity?.data_strategy?.score || 0}/5`} icon={Target} color="blue" />
        <StatCard title="Automation" value={`${maturity?.automation_strategy?.score || 0}/5`} icon={TrendingUp} color="purple" />
        <StatCard title="AI Readiness" value={`${maturity?.ai_strategy?.score || 0}/5`} icon={Star} color="orange" />
        <StatCard title="People & Change" value={`${maturity?.people_strategy?.score || 0}/5`} icon={Users} color="teal" />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: any;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'teal';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colors: Record<'green' | 'blue' | 'purple' | 'orange' | 'teal', string> = {
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400'
  };

  return (
    <div className="bg-white dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
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
export function QuickWinsTab({ quickWins, existing }: any) {
  return (
    <div className="space-y-8">
      {/* Quick Wins Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-yellow-500" size={32} />
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">30-Day Quick Wins</h3>
            <p className="text-gray-600 dark:text-gray-400">Start here for immediate impact</p>
          </div>
        </div>

        <div className="grid gap-4">
          {quickWins && quickWins.length > 0 ? (
            quickWins.map((win: any, index: number) => (
              <QuickWinCard key={index} win={win} index={index} />
            ))
          ) : (
            <p className="text-gray-500">No quick wins available</p>
          )}
        </div>
      </div>

      {/* Existing Tool Opportunities */}
      {existing && existing.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="text-green-500" size={32} />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Hidden Gems You Already Own</h3>
              <p className="text-gray-600 dark:text-gray-400">Underutilized features in your current tools</p>
            </div>
          </div>

          <div className="grid gap-4">
            {existing.map((opp: any, index: number) => (
              <ExistingToolCard key={index} opportunity={opp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QuickWinCard({ win, index }: any) {
  const difficultyColors: Record<'LOW' | 'MEDIUM' | 'HIGH', string> = {
    LOW: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  };

  return (
    <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
            {index + 1}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{win.title}</h4>
            <p className="text-gray-600 dark:text-gray-300">{win.description}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${difficultyColors[win.difficulty as keyof typeof difficultyColors] || difficultyColors.MEDIUM}`}>
          {win.difficulty}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="text-blue-600" size={16} />
          <span className="text-gray-600 dark:text-gray-400">{win.time_to_implement}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="text-green-600" size={16} />
          <span className="text-gray-600 dark:text-gray-400">{win.estimated_time_saved}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Target className="text-purple-600" size={16} />
          <span className="text-gray-600 dark:text-gray-400">{win.success_metric}</span>
        </div>
      </div>

      {win.required_resources && win.required_resources.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Required:</p>
          <div className="flex flex-wrap gap-2">
            {win.required_resources.map((resource: string, i: number) => (
              <span key={i} className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                {resource}
              </span>
            ))}
          </div>
        </div>
      )}

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
    <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="text-green-600 flex-shrink-0" size={24} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{opportunity.tool}</h4>
            <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Already Owned</span>
          </div>
          <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">{opportunity.feature}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-3">{opportunity.use_case}</p>

          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 mt-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">How to get started:</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{opportunity.implementation}</p>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={16} />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Expected Impact: {opportunity.impact}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// RECOMMENDATIONS TAB
// ============================================================================
export function RecommendationsTab({ tier1, tier2, tier3 }: any) {
  return (
    <div className="space-y-8">
      {/* Tier 1: Citizen-Led */}
      {tier1 && tier1.length > 0 && (
        <TierSection
          title="💡 Citizen-Led Solutions"
          subtitle="No IT required - business users can implement these"
          tools={tier1}
          tierColor="green"
        />
      )}

      {/* Tier 2: Hybrid */}
      {tier2 && tier2.length > 0 && (
        <TierSection
          title="🤝 Hybrid Solutions"
          subtitle="Business + IT collaboration"
          tools={tier2}
          tierColor="blue"
        />
      )}

      {/* Tier 3: Technical */}
      {tier3 && tier3.length > 0 && (
        <TierSection
          title="💻 Technical / Enterprise Solutions"
          subtitle="Requires development resources or IT implementation"
          tools={tier3}
          tierColor="purple"
        />
      )}
    </div>
  );
}

// ============================================================================
// ROADMAP TAB - TIMELINE/GANTT STYLE
// ============================================================================
export function RoadmapTab({ roadmap }: any) {
  const months = [
    { key: 'month_1', title: 'Days 1-30', label: 'Foundation', color: 'blue', data: roadmap?.month_1, days: [0, 30] },
    { key: 'month_2', title: 'Days 31-60', label: 'Scale', color: 'purple', data: roadmap?.month_2, days: [30, 60] },
    { key: 'month_3', title: 'Days 61-90', label: 'Optimize', color: 'green', data: roadmap?.month_3, days: [60, 90] }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your 90-Day Transformation Timeline</h3>
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
          <RoadmapPhase key={month.key} month={month} index={index} />
        ))}
      </div>
    </div>
  );
}

function RoadmapPhase({ month, index }: any) {
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
      </div>

      {month.data?.focus && (
        <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
            <Target size={16} className={colors.text} />
            Primary Focus:
          </p>
          <p className="text-gray-900 dark:text-white">{month.data.focus}</p>
        </div>
      )}

      {month.data?.actions && month.data.actions.length > 0 && (
        <div className="space-y-3">
          {month.data.actions.map((action: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className={`${colors.text} font-bold text-sm px-3 py-1 bg-white dark:bg-slate-700 rounded-full border-2 ${colors.border} flex-shrink-0`}>
                  Week {action.week}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white mb-2">{action.action}</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={14} className="text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Owner:</span> {action.owner}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={14} className="text-gray-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Outcome:</span> {action.outcome}
                      </span>
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
export function MaturityTab({ maturity }: any) {
  const pillars = [
    { key: 'data_strategy', title: 'Data Strategy', icon: TrendingUp, color: 'blue', data: maturity?.data_strategy },
    { key: 'automation_strategy', title: 'Automation Strategy', icon: Zap, color: 'purple', data: maturity?.automation_strategy },
    { key: 'ai_strategy', title: 'AI Strategy', icon: Star, color: 'orange', data: maturity?.ai_strategy },
    { key: 'people_strategy', title: 'People & Change', icon: Users, color: 'green', data: maturity?.people_strategy }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Digital Maturity Assessment</h3>
        <p className="text-gray-600 dark:text-gray-400">Where you are today and where you're heading</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {pillars.map((pillar) => (
          <MaturityPillar key={pillar.key} pillar={pillar} />
        ))}
      </div>
    </div>
  );
}

function MaturityPillar({ pillar }: any) {
  const Icon = pillar.icon;
  const score = pillar.data?.score || 0;

  const colorClasses = {
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    orange: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    green: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
  };

  return (
    <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[pillar.color as keyof typeof colorClasses]} flex items-center justify-center`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">{pillar.title}</h4>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <div
                  key={level}
                  className={`w-8 h-2 rounded-full ${
                    level <= score
                      ? 'bg-blue-600'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{score}/5</span>
          </div>
        </div>
      </div>

      {pillar.data?.gap_analysis && (
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Current Gaps:</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{pillar.data.gap_analysis}</p>
        </div>
      )}

      {/* Sub-Categories Breakdown */}
      {pillar.data?.sub_categories && pillar.data.sub_categories.length > 0 && (
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Detailed Breakdown:</p>
          {pillar.data.sub_categories.map((subCat: any, index: number) => (
            <div key={index} className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-2">
                <h5 className="font-semibold text-gray-900 dark:text-white text-sm">{subCat.name}</h5>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-4 h-1.5 rounded-full ${
                          level <= (subCat.score || 0)
                            ? 'bg-blue-600'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{subCat.score || 0}/5</span>
                </div>
              </div>

              {subCat.current_state && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">Current:</span> {subCat.current_state}
                </p>
              )}

              {subCat.best_practices && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 mb-2">
                  <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">Best Practices:</p>
                  <p className="text-xs text-blue-800 dark:text-blue-200">{subCat.best_practices}</p>
                </div>
              )}

              {subCat.quick_win && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded p-2">
                  <p className="text-xs font-medium text-green-900 dark:text-green-300 mb-1">Quick Win:</p>
                  <p className="text-xs text-green-800 dark:text-green-200">{subCat.quick_win}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pillar.data?.target && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800 mt-4">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">90-Day Target:</p>
          <p className="text-sm text-blue-800 dark:text-blue-200">{pillar.data.target}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LONG-TERM VISION TAB
// ============================================================================
export function LongTermVisionTab({ vision }: any) {
  if (!vision) {
    return <div className="text-center text-gray-600 dark:text-gray-400">No long-term vision data available</div>;
  }

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your Digital Transformation Journey</h3>
        <p className="text-gray-600 dark:text-gray-400">A strategic roadmap for sustainable competitive advantage</p>
      </div>

      {/* Year 1 Goals */}
      {vision.year_1_goals && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">Year 1</span>
            <div className="h-1 flex-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(vision.year_1_goals).map(([pillar, goal]: [string, any]) => (
              <div key={pillar} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 capitalize flex items-center gap-2">
                  {pillar === 'data' && <TrendingUp className="text-blue-600" size={20} />}
                  {pillar === 'automation' && <Zap className="text-purple-600" size={20} />}
                  {pillar === 'ai' && <Star className="text-orange-600" size={20} />}
                  {pillar === 'people' && <Users className="text-green-600" size={20} />}
                  {pillar}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{goal}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year 2-3 Aspirations */}
      {vision.year_2_3_aspirations && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">Years 2-3</span>
            <div className="h-1 flex-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(vision.year_2_3_aspirations).map(([pillar, aspiration]: [string, any]) => (
              <div key={pillar} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 capitalize flex items-center gap-2">
                  {pillar === 'data' && <TrendingUp className="text-blue-600" size={20} />}
                  {pillar === 'automation' && <Zap className="text-purple-600" size={20} />}
                  {pillar === 'ai' && <Star className="text-orange-600" size={20} />}
                  {pillar === 'people' && <Users className="text-green-600" size={20} />}
                  {pillar}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{aspiration}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competitive Advantages */}
      {vision.competitive_advantages && vision.competitive_advantages.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
          <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="text-green-600" />
            Competitive Advantages You'll Gain
          </h4>
          <div className="space-y-3">
            {vision.competitive_advantages.map((advantage: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-gray-700 dark:text-gray-300">{advantage}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Industry Benchmarks */}
      {vision.industry_benchmarks && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
          <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
            <Star />
            Industry Leadership Position
          </h4>
          <p className="text-blue-100 text-lg">{vision.industry_benchmarks}</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANGE MANAGEMENT TAB
// ============================================================================
export function ChangeManagementTab({ changeMgmt, successMetrics, projectTracking }: any) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Change Management & Training</h3>
        <p className="text-gray-600 dark:text-gray-400">Building adoption and driving sustainable change</p>
      </div>

      {/* Communication Strategy */}
      {changeMgmt?.communication_strategy && (
        <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-blue-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Communication Strategy</h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{changeMgmt.communication_strategy}</p>
        </div>
      )}

      {/* Stakeholder Engagement */}
      {changeMgmt?.stakeholder_engagement && (
        <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-purple-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Stakeholder Engagement</h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{changeMgmt.stakeholder_engagement}</p>
        </div>
      )}

      {/* Training Approach */}
      {changeMgmt?.training_approach && (
        <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-green-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Training Approach</h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{changeMgmt.training_approach}</p>
        </div>
      )}

      {/* Change Management Frameworks */}
      {changeMgmt?.recommended_frameworks && changeMgmt.recommended_frameworks.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="text-indigo-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Recommended Change Management Frameworks</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Proven methodologies to guide your transformation</p>

          <div className="space-y-4">
            {changeMgmt.recommended_frameworks.map((framework: any, index: number) => (
              <div key={index} className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{framework.name}</h5>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{framework.description}</p>

                {framework.why_recommended && (
                  <div className="bg-white dark:bg-slate-800 rounded p-3 mb-3">
                    <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-300 mb-1">Why This Framework:</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300">{framework.why_recommended}</p>
                  </div>
                )}

                {framework.getting_started && (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded p-3 mb-3">
                    <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-1">Getting Started:</p>
                    <p className="text-xs text-green-800 dark:text-green-200">{framework.getting_started}</p>
                  </div>
                )}

                {framework.resources && framework.resources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-indigo-200 dark:border-indigo-800">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">📚 Resources:</p>
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
        <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-purple-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Recommended Change Management Tools</h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Practical tools to support training, communication, and feedback</p>

          <div className="grid md:grid-cols-2 gap-4">
            {changeMgmt.recommended_tools.map((tool: any, index: number) => (
              <ChangeManagementToolCard key={index} tool={tool} />
            ))}
          </div>
        </div>
      )}

      {/* Pilot Recommendations */}
      {changeMgmt?.pilot_recommendations && (
        <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="text-yellow-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Pilot Recommendations</h4>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{changeMgmt.pilot_recommendations}</p>
        </div>
      )}

      {/* Project Tracking */}
      {projectTracking && (
        <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-blue-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Project Tracking & Management</h4>
          </div>

          {projectTracking.recommended_approach && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Recommended Approach:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{projectTracking.recommended_approach}</p>
            </div>
          )}

          {projectTracking.tools && projectTracking.tools.length > 0 && (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Recommended tools to track your transformation initiatives:</p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {projectTracking.tools.map((tool: any, index: number) => (
                  <ProjectTrackingToolCard key={index} tool={tool} />
                ))}
              </div>
            </>
          )}

          {projectTracking.best_practices && projectTracking.best_practices.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-3">Best Practices:</p>
              <ul className="space-y-2">
                {projectTracking.best_practices.map((practice: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={16} />
                    <span>{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Success Metrics */}
      {successMetrics && (
        <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-blue-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Success Metrics</h4>
          </div>

          <div className="space-y-4">
            {successMetrics['30_day_kpis'] && successMetrics['30_day_kpis'].length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">30-Day KPIs:</p>
                <ul className="list-disc list-inside space-y-1">
                  {successMetrics['30_day_kpis'].map((kpi: string, i: number) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400">{kpi}</li>
                  ))}
                </ul>
              </div>
            )}

            {successMetrics['60_day_kpis'] && successMetrics['60_day_kpis'].length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">60-Day KPIs:</p>
                <ul className="list-disc list-inside space-y-1">
                  {successMetrics['60_day_kpis'].map((kpi: string, i: number) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400">{kpi}</li>
                  ))}
                </ul>
              </div>
            )}

            {successMetrics['90_day_kpis'] && successMetrics['90_day_kpis'].length > 0 && (
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">90-Day KPIs:</p>
                <ul className="list-disc list-inside space-y-1">
                  {successMetrics['90_day_kpis'].map((kpi: string, i: number) => (
                    <li key={i} className="text-gray-600 dark:text-gray-400">{kpi}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Common Objections */}
      {changeMgmt?.common_objections && changeMgmt.common_objections.length > 0 && (
        <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-orange-600" size={24} />
            <h4 className="text-xl font-bold text-gray-900 dark:text-white">Addressing Common Objections</h4>
          </div>

          <div className="space-y-4">
            {changeMgmt.common_objections.map((item: any, i: number) => (
              <div key={i} className="border-l-4 border-orange-400 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">"{item.objection}"</p>
                <p className="text-gray-700 dark:text-gray-300">{item.response}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TierSection({ title, subtitle, tools, tierColor }: any) {
  return (
    <div>
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {tools.map((tool: any, index: number) => (
          <ToolCard key={index} tool={tool} tierColor={tierColor} />
        ))}
      </div>
    </div>
  );
}

function ToolCard({ tool, tierColor }: any) {
  const tierColors = {
    green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10',
    blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10',
    purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10'
  };

  const costIcons = {
    FREE: '🆓',
    '$': '💵',
    '$$': '💰',
    '$$$': '💎',
    '$$$$': '🏦'
  };

  return (
    <div className={`border-2 rounded-lg p-6 ${tierColors[tierColor] || tierColors.blue}`}>
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{tool.name}</h4>
        <span className="text-2xl">{costIcons[tool.cost] || '💰'}</span>
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{tool.description}</p>

      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 mb-3">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Why recommended:</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{tool.why_recommended}</p>
      </div>

      {tool.use_cases && tool.use_cases.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Use cases:</p>
          <div className="flex flex-wrap gap-2">
            {tool.use_cases.map((useCase: string, i: number) => (
              <span key={i} className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">
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

  const categoryColors = {
    TRAINING: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
    COMMUNICATION: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800',
    PROJECT_MANAGEMENT: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
    FEEDBACK: 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
  };

  return (
    <div className={`border rounded-lg p-4 ${categoryColors[tool.category as keyof typeof categoryColors] || 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800'}`}>
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-bold text-gray-900 dark:text-white text-sm">{tool.name}</h5>
        <span className="text-xl">{costIcons[tool.cost as keyof typeof costIcons] || '💰'}</span>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 uppercase font-semibold">{tool.category?.replace('_', ' ')}</p>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{tool.description}</p>

      {tool.use_case && (
        <div className="bg-white dark:bg-slate-800 rounded p-2 mb-2">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Use Case:</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{tool.use_case}</p>
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

  const tierColors = {
    CITIZEN: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800',
    HYBRID: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800',
    ENTERPRISE: 'bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${tierColors[tool.tier as keyof typeof tierColors] || 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800'}`}>
      <div className="flex items-start justify-between mb-2">
        <h5 className="font-bold text-gray-900 dark:text-white">{tool.name}</h5>
        <span className="text-2xl">{costIcons[tool.cost as keyof typeof costIcons] || '💰'}</span>
      </div>

      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 uppercase font-semibold">{tool.tier} TIER</p>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{tool.description}</p>

      {tool.why_recommended && (
        <div className="bg-white dark:bg-slate-800 rounded p-3 mb-3">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Why Recommended:</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{tool.why_recommended}</p>
        </div>
      )}

      {tool.integration_with_existing && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2 mb-3">
          <p className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-1">Integration:</p>
          <p className="text-xs text-blue-800 dark:text-blue-200">{tool.integration_with_existing}</p>
        </div>
      )}

      {tool.getting_started && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 mb-3">
          <p className="text-xs font-semibold text-green-900 dark:text-green-300 mb-1">Getting Started:</p>
          <p className="text-xs text-green-800 dark:text-green-200">{tool.getting_started}</p>
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
