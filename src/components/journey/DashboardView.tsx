'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Zap,
  TrendingUpIcon,
  Award,
  Timer,
  ChevronDown,
  ChevronUp,
  Rss,
  Sparkles
} from 'lucide-react';
import { AskAIButton } from './AskAIButton';

type TimePeriod = 'year' | 'quarter' | 'month';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  complexity: string;
  category: string;
  operational_area: string | null;
  progress_percentage: number;
  estimated_timeline_days: number;
  target_completion_date: string | null;
  actual_completion_date: string | null;
  created_at: string;
}

interface DashboardViewProps {
  projects: Project[];
  assessmentId?: string;
  onAskAI?: (message: string) => void;
}

interface AssessmentVersion {
  id: string;
  version_number: number;
  is_current: boolean;
  created_by: string;
  change_summary: string;
  created_at: string;
}

export function DashboardView({ projects, assessmentId, onAskAI }: DashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedOperationalArea, setSelectedOperationalArea] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('year');
  const [showAllProjects, setShowAllProjects] = useState<boolean>(false);
  const [assessmentVersions, setAssessmentVersions] = useState<AssessmentVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showAllUpdates, setShowAllUpdates] = useState<boolean>(false);
  const [showAllVersions, setShowAllVersions] = useState<boolean>(false);

  // Get unique operational areas from projects
  const operationalAreas = useMemo(() => {
    const areas = new Set(projects.map(p => p.operational_area).filter(Boolean));
    return Array.from(areas).sort();
  }, [projects]);

  // Fetch assessment versions for live feed
  useEffect(() => {
    console.log('[DashboardView] useEffect triggered, assessmentId:', assessmentId);
    if (!assessmentId) {
      console.log('[DashboardView] No assessmentId, skipping fetch');
      return;
    }

    const fetchVersions = async () => {
      console.log('[DashboardView] Fetching versions for:', assessmentId);
      setLoadingVersions(true);
      try {
        const url = `/api/assessment/${assessmentId}/versions`;
        console.log('[DashboardView] Fetch URL:', url);
        const response = await fetch(url);
        console.log('[DashboardView] Response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[DashboardView] Received data:', data);
          console.log('[DashboardView] Versions count:', data.versions?.length || 0);
          // Only show the most recent 10 versions
          setAssessmentVersions((data.versions || []).slice(0, 10));
        } else {
          console.error('[DashboardView] Response not OK:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('[DashboardView] Error fetching assessment versions:', error);
      } finally {
        setLoadingVersions(false);
      }
    };

    fetchVersions();
    // Poll for new versions every 30 seconds
    const interval = setInterval(fetchVersions, 30000);
    return () => clearInterval(interval);
  }, [assessmentId]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && p.priority !== selectedPriority) return false;
      if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
      if (selectedOperationalArea !== 'all' && p.operational_area !== selectedOperationalArea) return false;
      return true;
    });
  }, [projects, selectedCategory, selectedPriority, selectedStatus, selectedOperationalArea]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const total = filteredProjects.length;
    const completed = filteredProjects.filter(p => p.status === 'completed').length;
    const inProgress = filteredProjects.filter(p => p.status === 'in_progress').length;
    const notStarted = filteredProjects.filter(p => p.status === 'not_started').length;
    const blocked = filteredProjects.filter(p => p.status === 'blocked').length;

    const avgProgress = total > 0
      ? Math.round(filteredProjects.reduce((sum, p) => sum + p.progress_percentage, 0) / total)
      : 0;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Extract savings from descriptions - use "Expected Annual Savings" as the overall target
    const totalExpectedSavings = filteredProjects.reduce((sum, p) => {
      const match = p.description?.match(/Expected Annual Savings: \$(\d+(?:\.\d+)?)[KM]/i);
      if (match) {
        const value = parseFloat(match[1]);
        const multiplier = match[0].toUpperCase().includes('M') ? 1000000 : 1000;
        return sum + (value * multiplier);
      }
      return sum;
    }, 0);

    // Calculate realized savings from completed projects
    const realizedSavings = filteredProjects
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => {
        const match = p.description?.match(/Actual Annual Savings: \$(\d+(?:\.\d+)?)[KM]/i);
        if (match) {
          const value = parseFloat(match[1]);
          const multiplier = match[0].toUpperCase().includes('M') ? 1000000 : 1000;
          return sum + (value * multiplier);
        }
        return sum;
      }, 0);

    // Calculate target savings from in-progress and not-started projects
    const targetSavings = filteredProjects
      .filter(p => p.status === 'in_progress' || p.status === 'not_started')
      .reduce((sum, p) => {
        const match = p.description?.match(/Target Annual Savings: \$(\d+(?:\.\d+)?)[KM]/i);
        if (match) {
          const value = parseFloat(match[1]);
          const multiplier = match[0].toUpperCase().includes('M') ? 1000000 : 1000;
          return sum + (value * multiplier);
        }
        return sum;
      }, 0);

    const overallTargetProgress = totalExpectedSavings > 0
      ? Math.round((realizedSavings / totalExpectedSavings) * 100)
      : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      blocked,
      avgProgress,
      completionRate,
      totalExpectedSavings,
      realizedSavings,
      targetSavings,
      overallTargetProgress
    };
  }, [filteredProjects]);

  // Category breakdown
  const categoryData = useMemo(() => {
    const categories = ['automation', 'data', 'ai', 'ux', 'people'];
    return categories.map(cat => ({
      name: cat,
      count: filteredProjects.filter(p => p.category === cat).length,
      completed: filteredProjects.filter(p => p.category === cat && p.status === 'completed').length
    }));
  }, [filteredProjects]);

  // Priority breakdown
  const priorityData = useMemo(() => {
    const priorities = ['critical', 'high', 'medium', 'low'];
    return priorities.map(pri => ({
      name: pri,
      count: filteredProjects.filter(p => p.priority === pri).length
    }));
  }, [filteredProjects]);

  // Dynamic qualitative benefits - calculated from filtered projects
  const qualitativeBenefits = useMemo(() => {
    if (filteredProjects.length === 0) {
      return [
        { label: 'Customer Satisfaction', value: 0 },
        { label: 'Employee Productivity', value: 0 },
        { label: 'Process Efficiency', value: 0 },
        { label: 'Regulatory Compliance', value: 0 },
        { label: 'Data Quality', value: 0 },
        { label: 'Risk Mitigation', value: 0 }
      ];
    }

    const completedCount = filteredProjects.filter(p => p.status === 'completed').length;
    const total = filteredProjects.length;
    const completionRate = (completedCount / total) * 100;

    // Base values that scale with completion
    const baseCustomerSat = 60;
    const baseProductivity = 50;
    const baseEfficiency = 55;
    const baseCompliance = 70;
    const baseQuality = 45;
    const baseRisk = 55;

    // Scale factors based on completion rate
    const scale = completionRate / 100;

    return [
      { label: 'Customer Satisfaction', value: Math.round(baseCustomerSat + (35 * scale)) },
      { label: 'Employee Productivity', value: Math.round(baseProductivity + (40 * scale)) },
      { label: 'Process Efficiency', value: Math.round(baseEfficiency + (40 * scale)) },
      { label: 'Regulatory Compliance', value: Math.round(baseCompliance + (28 * scale)) },
      { label: 'Data Quality', value: Math.round(baseQuality + (45 * scale)) },
      { label: 'Risk Mitigation', value: Math.round(baseRisk + (40 * scale)) }
    ];
  }, [filteredProjects]);

  // Operational area breakdown
  const operationalAreaData = useMemo(() => {
    const areas = Array.from(new Set(filteredProjects.map(p => p.operational_area).filter(Boolean)));
    return areas.map(area => ({
      name: area!,
      count: filteredProjects.filter(p => p.operational_area === area).length,
      completed: filteredProjects.filter(p => p.operational_area === area && p.status === 'completed').length
    })).sort((a, b) => b.count - a.count);
  }, [filteredProjects]);

  // Dynamic hours saved by operational area
  const hoursSavedData = useMemo(() => {
    const areaHours: { [key: string]: number } = {};

    filteredProjects
      .filter(p => p.operational_area && p.status === 'completed')
      .forEach(p => {
        const area = p.operational_area!;
        // Extract hours from description or estimate based on complexity
        const complexityHours = {
          'low': 2000,
          'medium': 4000,
          'high': 6000,
          'very_high': 8000
        };
        const hours = complexityHours[p.complexity as keyof typeof complexityHours] || 3000;
        areaHours[area] = (areaHours[area] || 0) + hours;
      });

    const entries = Object.entries(areaHours)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const maxHours = entries.length > 0 ? entries[0][1] : 1;

    return entries.map(([area, hours]) => ({
      area,
      hours,
      percentage: Math.round((hours / maxHours) * 100)
    }));
  }, [filteredProjects]);

  // Dynamic new business growth - from completed projects by operational area
  const newBusinessGrowth = useMemo(() => {
    const growthByArea: { [key: string]: { revenue: number; metrics: any } } = {};

    filteredProjects
      .filter(p => p.operational_area && p.status === 'completed')
      .forEach(p => {
        const area = p.operational_area!;
        // Extract revenue from savings or estimate
        const savingsMatch = p.description?.match(/Actual Annual Savings: \$(\d+(?:\.\d+)?)[KM]/i);
        let revenue = 0;
        if (savingsMatch) {
          const value = parseFloat(savingsMatch[1]);
          const multiplier = savingsMatch[0].toUpperCase().includes('M') ? 1000000 : 1000;
          revenue = value * multiplier * 0.3; // 30% of savings translates to new revenue opportunity
        }

        if (!growthByArea[area]) {
          growthByArea[area] = { revenue: 0, metrics: {} };
        }
        growthByArea[area].revenue += revenue;
      });

    return Object.entries(growthByArea)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 3);
  }, [filteredProjects]);

  // Time series savings data - sample data for demonstration
  const savingsTimeSeriesData = useMemo(() => {
    // Generate sample monthly data for the selected time period
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const years = ['2023', '2024', '2025'];

    let labels: string[];
    let dataPoints: number;

    if (timePeriod === 'month') {
      labels = months.slice(0, 6); // Last 6 months
      dataPoints = 6;
    } else if (timePeriod === 'quarter') {
      labels = quarters;
      dataPoints = 4;
    } else {
      labels = years;
      dataPoints = 3;
    }

    // Calculate actual savings progression based on completed projects
    const totalExpected = metrics.totalExpectedSavings;
    const realized = metrics.realizedSavings;

    // Generate sample data with realistic progression
    const data = labels.map((_, idx) => {
      const progress = (idx + 1) / dataPoints;
      const actualSavings = realized * progress;
      const targetSavings = totalExpected * progress;
      const cost = totalExpected * 0.15 * progress; // Assume 15% cost of transformation

      return {
        label: labels[idx],
        actualSavings,
        targetSavings,
        cost
      };
    });

    return data;
  }, [timePeriod, metrics.totalExpectedSavings, metrics.realizedSavings]);

  // Gantt chart data - projects with timelines
  const ganttData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1); // Start 1 month ago
    const endDate = new Date(today);
    endDate.setMonth(today.getMonth() + 6); // End 6 months from now

    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // Get projects with dates
    const projectsWithDates = filteredProjects
      .filter(p => p.target_completion_date || p.actual_completion_date || p.created_at)
      .map(p => {
        const createdDate = new Date(p.created_at);
        const targetDate = p.target_completion_date ? new Date(p.target_completion_date) : null;
        const actualDate = p.actual_completion_date ? new Date(p.actual_completion_date) : null;

        // For completed projects, show from creation to actual completion
        // For in-progress, show from creation to target
        // For not started, show estimated timeline from today to target
        const start = p.status === 'not_started' ? today : createdDate;
        const end = actualDate || targetDate || new Date(start.getTime() + (p.estimated_timeline_days || 90) * 24 * 60 * 60 * 1000);

        // Calculate position and width as percentages
        const startOffset = Math.max(0, (start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        const leftPercent = (startOffset / totalDays) * 100;
        const widthPercent = (duration / totalDays) * 100;

        return {
          id: p.id,
          title: p.title,
          status: p.status,
          priority: p.priority,
          progress: p.progress_percentage,
          leftPercent: Math.max(0, Math.min(100, leftPercent)),
          widthPercent: Math.max(2, Math.min(100 - leftPercent, widthPercent)),
          startDate: start,
          endDate: end,
          isOverdue: targetDate && !actualDate && today > targetDate
        };
      })
      .sort((a, b) => {
        // Sort by priority first, then by start date
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 4;
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 4;
        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.startDate.getTime() - b.startDate.getTime();
      });

    // Generate month markers
    const monthMarkers = [];
    const currentMarker = new Date(startDate);
    currentMarker.setDate(1);

    while (currentMarker <= endDate) {
      const offset = (currentMarker.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const percent = (offset / totalDays) * 100;

      monthMarkers.push({
        date: new Date(currentMarker),
        label: currentMarker.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        percent: Math.max(0, Math.min(100, percent)),
        isToday: currentMarker.getMonth() === today.getMonth() && currentMarker.getFullYear() === today.getFullYear()
      });

      currentMarker.setMonth(currentMarker.getMonth() + 1);
    }

    // Today marker
    const todayOffset = (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const todayPercent = (todayOffset / totalDays) * 100;

    return {
      projects: projectsWithDates, // Show all filtered projects
      monthMarkers,
      todayPercent: Math.max(0, Math.min(100, todayPercent)),
      totalProjects: projectsWithDates.length
    };
  }, [filteredProjects]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedPriority('all');
    setSelectedStatus('all');
    setSelectedOperationalArea('all');
  };

  // Check if any filters are active
  const hasActiveFilters = selectedCategory !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all' || selectedOperationalArea !== 'all';

  // Handle click on background to clear filters
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only clear filters if clicking directly on the background div
    if (e.target === e.currentTarget) {
      clearAllFilters();
    }
  };

  return (
    <div className="space-y-6" onClick={handleBackgroundClick}>
      {/* Time Period Filters */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Executive Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-2">Time Period:</span>
          <button
            onClick={() => setTimePeriod('year')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timePeriod === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Year
          </button>
          <button
            onClick={() => setTimePeriod('quarter')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timePeriod === 'quarter'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Quarter
          </button>
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              timePeriod === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center gap-1"
            >
              <span>Clear All Filters</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Operational Area</label>
            <select
              value={selectedOperationalArea}
              onChange={(e) => setSelectedOperationalArea(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">All Areas</option>
              {operationalAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              <option value="automation">Automation</option>
              <option value="data">Data</option>
              <option value="ai">AI</option>
              <option value="ux">UX</option>
              <option value="people">People</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Priority</label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Key Metrics</h2>
          {onAskAI && (
            <AskAIButton
              onClick={() => onAskAI("Analyze my key transformation metrics and provide recommendations for improvement. Focus on overall progress, completion rate, and target achievement.")}
              label="Analyze Metrics"
              size="sm"
            />
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Overall Progress"
            value={`${metrics.avgProgress}%`}
            icon={Activity}
            trend={metrics.avgProgress >= 50 ? 'up' : 'down'}
            color="blue"
          />
          <MetricCard
            title="Completion Rate"
            value={`${metrics.completionRate}%`}
            subtitle={`${metrics.completed} of ${metrics.total} projects`}
            icon={CheckCircle2}
            trend={metrics.completionRate >= 60 ? 'up' : 'down'}
            color="green"
          />
          <MetricCard
            title="Target Achievement"
            value={`${metrics.overallTargetProgress}%`}
            subtitle={`${formatCurrency(metrics.realizedSavings)} of ${formatCurrency(metrics.totalExpectedSavings)}`}
            icon={Target}
            trend={metrics.overallTargetProgress >= 60 ? 'up' : 'down'}
            color="purple"
          />
          <MetricCard
            title="Realized Savings"
            value={formatCurrency(metrics.realizedSavings)}
            subtitle={`${formatCurrency(metrics.targetSavings)} remaining`}
            icon={DollarSign}
            trend="up"
            color="emerald"
          />
        </div>
      </div>

      {/* Assessment Progress Updates - Minimized */}
      {assessmentId && assessmentVersions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4" onClick={(e) => e.stopPropagation()}>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowAllUpdates(!showAllUpdates)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Digital Maturity Progress
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {metrics.completed} of {metrics.total} projects completed • {assessmentVersions.length} improvements tracked
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  +{Math.round((metrics.completed / Math.max(metrics.total, 1)) * 100)}%
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Score Improvement
                </div>
              </div>
              <button className="p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                {showAllUpdates ? (
                  <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Expanded Updates */}
          {showAllUpdates && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {(showAllVersions ? assessmentVersions : assessmentVersions.slice(0, 5)).map((version, index) => {
                  // Calculate mock score improvement based on version
                  const baseScore = 2.5;
                  const improvement = ((10 - version.version_number) * 0.15).toFixed(1);
                  const currentScore = (baseScore + parseFloat(improvement)).toFixed(1);

                  return (
                    <div
                      key={version.id}
                      className="bg-gray-50 dark:bg-slate-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <TrendingUp className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                              {version.change_summary || 'Assessment updated'}
                            </p>
                            {index === 0 && (
                              <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs font-medium">
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                              {new Date(version.created_at).toLocaleDateString()}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              Maturity: {currentScore}/5.0
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">•</span>
                            <span className="text-gray-600 dark:text-gray-300">
                              {version.created_by}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {assessmentVersions.length > 5 && !showAllVersions && (
                <div className="mt-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllVersions(true);
                    }}
                    className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
                  >
                    View all {assessmentVersions.length} updates →
                  </button>
                </div>
              )}
              {showAllVersions && assessmentVersions.length > 5 && (
                <div className="mt-3 text-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllVersions(false);
                    }}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                  >
                    Show less ↑
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onClick={(e) => e.stopPropagation()}>
        {/* Operational Area Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Projects by Operational Area</h3>
            </div>
            <div className="flex items-center gap-2">
              {onAskAI && (
                <AskAIButton
                  onClick={() => onAskAI(`How should I prioritize these operational areas? Current distribution: ${operationalAreaData.map(a => `${a.name} (${a.count} projects, ${a.completed} completed)`).join(', ')}. Provide strategic recommendations.`)}
                  label="Ask AI"
                  size="sm"
                />
              )}
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-3">
            {operationalAreaData.map((area) => (
              <div
                key={area.name}
                onClick={() => setSelectedOperationalArea(area.name)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded p-2 -m-2 transition-colors"
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{area.name}</span>
                  <span className="text-gray-600 dark:text-gray-400">{area.count} projects</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${metrics.total > 0 ? (area.count / metrics.total) * 100 : 0}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {area.completed} completed ({area.count > 0 ? Math.round((area.completed / area.count) * 100) : 0}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution - Simplified Colors */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Projects by Priority</h3>
            </div>
            <div className="flex items-center gap-2">
              {onAskAI && (
                <AskAIButton
                  onClick={() => onAskAI(`Help me balance my project priorities. Current distribution: ${priorityData.map(p => `${p.name}: ${p.count}`).join(', ')}. Should I adjust priorities or resource allocation?`)}
                  label="Ask AI"
                  size="sm"
                />
              )}
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div className="space-y-3">
            {priorityData.map((pri) => {
              // Simplified color palette - only use red for critical, blue for rest
              const getColor = (priority: string) => {
                if (priority === 'critical') return 'bg-red-600';
                return 'bg-blue-600';
              };

              return (
                <div
                  key={pri.name}
                  onClick={() => setSelectedPriority(pri.name)}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded p-2 -m-2 transition-colors"
                >
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="capitalize text-gray-700 dark:text-gray-300">{pri.name}</span>
                    <span className="text-gray-600 dark:text-gray-400">{pri.count} projects</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`${getColor(pri.name)} h-full rounded-full transition-all`}
                      style={{
                        width: `${metrics.total > 0 ? (pri.count / metrics.total) * 100 : 0}%`,
                        opacity: pri.name === 'high' ? 0.8 : pri.name === 'medium' ? 0.6 : pri.name === 'low' ? 0.4 : 1
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Business Impact Metrics - 3 Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" onClick={(e) => e.stopPropagation()}>
        {/* Qualitative Benefits */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Qualitative Benefits</h3>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Overall transformation impact</p>
              </div>
              <Award className="w-5 h-5 text-gray-400" />
            </div>
            {onAskAI && (
              <div className="mt-3">
                <AskAIButton
                  onClick={() => onAskAI(`How can we improve these qualitative benefit scores? Current scores: ${qualitativeBenefits.map(b => `${b.label}: ${b.value}%`).join(', ')}. What initiatives would have the most impact?`)}
                  label="Improve Scores"
                  size="sm"
                  className="w-full justify-center"
                />
              </div>
            )}
          </div>
          <div className="space-y-4">
            {qualitativeBenefits.map((benefit) => (
              <div key={benefit.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{benefit.label}</span>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">{benefit.value}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${benefit.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hours Saved */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Annual Hours Saved</h3>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Efficiency gains by operational area</p>
              </div>
              <Timer className="w-5 h-5 text-gray-400" />
            </div>
            {onAskAI && hoursSavedData.length > 0 && (
              <div className="mt-3">
                <AskAIButton
                  onClick={() => onAskAI(`What other areas can we optimize for time savings? Currently saved: ${hoursSavedData.reduce((sum, item) => sum + item.hours, 0).toLocaleString()} hours/year across ${hoursSavedData.length} operational areas. Suggest opportunities for further efficiency gains.`)}
                  label="Find More Savings"
                  size="sm"
                  className="w-full justify-center"
                />
              </div>
            )}
          </div>
          <div className="space-y-4">
            {hoursSavedData.length > 0 ? (
              <>
                {hoursSavedData.map((item) => (
                  <div
                    key={item.area}
                    onClick={() => setSelectedOperationalArea(item.area)}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded p-2 -m-2 transition-colors"
                  >
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{item.area}</span>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {item.hours.toLocaleString()} hrs
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {hoursSavedData.reduce((sum, item) => sum + item.hours, 0).toLocaleString()} hrs/year
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Equivalent to {Math.round(hoursSavedData.reduce((sum, item) => sum + item.hours, 0) / 2080)} FTE positions
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No hours saved data for completed projects</p>
              </div>
            )}
          </div>
        </div>

        {/* New Business Growth */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Business Growth</h3>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Top 3 revenue-generating initiatives</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            {onAskAI && newBusinessGrowth.length > 0 && (
              <div className="mt-3">
                <AskAIButton
                  onClick={() => onAskAI(`How can we maximize revenue from these transformation initiatives? Top revenue areas: ${newBusinessGrowth.map(([area, data]) => `${area}: ${formatCurrency(data.revenue)}`).join(', ')}. What strategies would accelerate growth?`)}
                  label="Maximize Revenue"
                  size="sm"
                  className="w-full justify-center"
                />
              </div>
            )}
          </div>
          <div className="space-y-4">
            {newBusinessGrowth.length > 0 ? (
              <>
                {newBusinessGrowth.map(([area, data], idx) => (
                  <div
                    key={area}
                    onClick={() => setSelectedOperationalArea(area)}
                    className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{area}</span>
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {formatCurrency(data.revenue)}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Revenue opportunity from transformation</p>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <div className="flex justify-between">
                          <span>From completed projects</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredProjects.filter(p => p.operational_area === area && p.status === 'completed').length} projects</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p className="text-sm">No business growth data for completed projects</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gantt Chart Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Timeline - Gantt View</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {showAllProjects
                ? `Showing all ${ganttData.projects.length} projects by priority`
                : `Showing top ${Math.min(10, ganttData.projects.length)} of ${ganttData.projects.length} projects by priority`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {ganttData.projects.length > 10 && (
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
              >
                {showAllProjects ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All
                  </>
                )}
              </button>
            )}
            {onAskAI && ganttData.projects.length > 0 && (
              <AskAIButton
                onClick={() => onAskAI(`Help me optimize this project timeline. I have ${ganttData.projects.length} projects shown. ${ganttData.projects.filter(p => p.isOverdue).length > 0 ? `${ganttData.projects.filter(p => p.isOverdue).length} project(s) are overdue.` : ''} How can I improve scheduling and resource allocation?`)}
                label="Optimize Timeline"
                size="sm"
              />
            )}
            <Target className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {ganttData.projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No projects with timeline data</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Month Headers */}
            <div className="relative h-8 border-b border-gray-200 dark:border-gray-700">
              {ganttData.monthMarkers.map((marker, idx) => (
                <div
                  key={idx}
                  className="absolute top-0 h-full"
                  style={{ left: `${marker.percent}%` }}
                >
                  <div className="flex flex-col items-start">
                    <span className={`text-xs font-medium ${marker.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {marker.label}
                    </span>
                    <div className="w-px h-full bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              ))}

              {/* Today marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-blue-600 dark:bg-blue-400 z-10"
                style={{ left: `${ganttData.todayPercent}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-600 dark:bg-blue-400 text-white text-xs rounded whitespace-nowrap">
                  Today
                </div>
              </div>
            </div>

            {/* Project Bars */}
            <div className="space-y-2 mt-6">
              {(showAllProjects ? ganttData.projects : ganttData.projects.slice(0, 10)).map((project) => {
                const statusColors = {
                  completed: 'bg-green-500 dark:bg-green-600',
                  in_progress: 'bg-blue-500 dark:bg-blue-600',
                  not_started: 'bg-gray-400 dark:bg-gray-500',
                  blocked: 'bg-red-500 dark:bg-red-600'
                };

                const priorityBorders = {
                  critical: 'border-2 border-red-600 dark:border-red-400',
                  high: 'border-2 border-gray-500 dark:border-gray-400',
                  medium: 'border border-gray-300 dark:border-gray-600',
                  low: 'border border-gray-200 dark:border-gray-700'
                };

                return (
                  <div key={project.id} className="relative h-10 group">
                    {/* Project name */}
                    <div className="absolute left-0 w-64 pr-4 truncate text-sm text-gray-700 dark:text-gray-300 flex items-center h-full">
                      <span className="truncate" title={project.title}>
                        {project.title}
                      </span>
                      {project.isOverdue && (
                        <AlertCircle className="w-4 h-4 text-red-500 ml-2 flex-shrink-0" />
                      )}
                    </div>

                    {/* Timeline area */}
                    <div className="absolute left-64 right-0 h-full">
                      {/* Background grid */}
                      <div className="absolute inset-0 flex">
                        {ganttData.monthMarkers.map((marker, idx) => (
                          <div
                            key={idx}
                            className="border-l border-gray-100 dark:border-gray-800"
                            style={{ left: `${marker.percent}%`, position: 'absolute', height: '100%' }}
                          />
                        ))}
                      </div>

                      {/* Project bar */}
                      <div
                        className={`absolute h-7 rounded ${statusColors[project.status as keyof typeof statusColors]} ${priorityBorders[project.priority as keyof typeof priorityBorders]} transition-all hover:h-8 hover:-translate-y-0.5 cursor-pointer shadow-sm hover:shadow-md`}
                        style={{
                          left: `${project.leftPercent}%`,
                          width: `${project.widthPercent}%`,
                          top: '50%',
                          transform: 'translateY(-50%)'
                        }}
                        title={`${project.title}\n${project.startDate.toLocaleDateString()} - ${project.endDate.toLocaleDateString()}\nProgress: ${project.progress}%`}
                      >
                        {/* Progress indicator inside bar */}
                        {project.status === 'in_progress' && (
                          <div
                            className="h-full bg-black/20 rounded-l transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        )}

                        {/* Percentage label if bar is wide enough */}
                        {project.widthPercent > 8 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-medium text-white drop-shadow">
                              {project.progress}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-400 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Not Started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Blocked</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="w-4 h-4 border-2 border-red-600 rounded" />
                <span className="text-gray-600 dark:text-gray-400">Critical Priority</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-500 rounded" />
                <span className="text-gray-600 dark:text-gray-400">High Priority</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Savings Time Series Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Progression & Break-Even Analysis</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track actual vs target savings and identify break-even point
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onAskAI && (
              <AskAIButton
                onClick={() => onAskAI("Analyze my savings progression and break-even timeline. When will we achieve positive ROI? What can we do to accelerate time to value?")}
                label="Analyze ROI"
                size="sm"
              />
            )}
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Simple line chart visualization */}
        <div className="space-y-4">
          {/* Chart area with proper padding for Y-axis */}
          <div className="pl-16">
            <div className="relative h-64 border-l-2 border-b-2 border-gray-300 dark:border-gray-600 pl-4 pb-2">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 -ml-16 h-full flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400 pr-2">
                <span className="text-right">{formatCurrency(Math.max(...savingsTimeSeriesData.map(d => Math.max(d.actualSavings, d.targetSavings, d.cost))))}</span>
                <span className="text-right">{formatCurrency(Math.max(...savingsTimeSeriesData.map(d => Math.max(d.actualSavings, d.targetSavings, d.cost))) * 0.5)}</span>
                <span className="text-right">$0</span>
              </div>

              {/* Chart lines */}
              <div className="relative h-full">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" strokeWidth="0.2" className="text-gray-200 dark:text-gray-700" />
                  <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.2" className="text-gray-200 dark:text-gray-700" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.2" className="text-gray-200 dark:text-gray-700" />
                  <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.2" className="text-gray-200 dark:text-gray-700" />

                  {/* Target Savings Line (dashed) */}
                  <polyline
                    points={savingsTimeSeriesData.map((d, i) => {
                      const x = (i / (savingsTimeSeriesData.length - 1)) * 100;
                      const maxValue = Math.max(...savingsTimeSeriesData.map(d => Math.max(d.actualSavings, d.targetSavings, d.cost)));
                      const y = 100 - (d.targetSavings / maxValue) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />

                  {/* Actual Savings Line */}
                  <polyline
                    points={savingsTimeSeriesData.map((d, i) => {
                      const x = (i / (savingsTimeSeriesData.length - 1)) * 100;
                      const maxValue = Math.max(...savingsTimeSeriesData.map(d => Math.max(d.actualSavings, d.targetSavings, d.cost)));
                      const y = 100 - (d.actualSavings / maxValue) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="0.8"
                  />

                  {/* Cost Line */}
                  <polyline
                    points={savingsTimeSeriesData.map((d, i) => {
                      const x = (i / (savingsTimeSeriesData.length - 1)) * 100;
                      const maxValue = Math.max(...savingsTimeSeriesData.map(d => Math.max(d.actualSavings, d.targetSavings, d.cost)));
                      const y = 100 - (d.cost / maxValue) * 100;
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="0.8"
                  />

                  {/* Data points */}
                  {savingsTimeSeriesData.map((d, i) => {
                    const x = (i / (savingsTimeSeriesData.length - 1)) * 100;
                    const maxValue = Math.max(...savingsTimeSeriesData.map(d => Math.max(d.actualSavings, d.targetSavings, d.cost)));
                    const yActual = 100 - (d.actualSavings / maxValue) * 100;
                    const yCost = 100 - (d.cost / maxValue) * 100;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={yActual} r="1" fill="#10B981" />
                        <circle cx={x} cy={yCost} r="1" fill="#EF4444" />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                {savingsTimeSeriesData.map((d, i) => (
                  <span key={i}>{d.label}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-green-600" />
              <span className="text-gray-700 dark:text-gray-300">Actual Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-gray-400 border-t-2 border-dashed border-gray-400" />
              <span className="text-gray-700 dark:text-gray-300">Target Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-0.5 bg-red-600" />
              <span className="text-gray-700 dark:text-gray-300">Cost</span>
            </div>
          </div>

          {/* Key insights */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(savingsTimeSeriesData[savingsTimeSeriesData.length - 1].actualSavings)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Current Actual Savings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                {formatCurrency(savingsTimeSeriesData[savingsTimeSeriesData.length - 1].targetSavings)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Current Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(savingsTimeSeriesData[savingsTimeSeriesData.length - 1].cost)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total Cost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Key Insights</h3>
              {onAskAI && (
                <AskAIButton
                  onClick={() => onAskAI("Provide deeper analysis of my transformation journey insights. What trends do you see? What should I focus on next? Are there any risks or opportunities I should be aware of?")}
                  label="Deep Analysis"
                  size="sm"
                />
              )}
            </div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  {metrics.completed} projects completed with {formatCurrency(metrics.realizedSavings)} in realized savings
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  {metrics.inProgress} projects currently in progress averaging {metrics.avgProgress}% completion
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                <span>
                  {metrics.overallTargetProgress}% of overall savings target achieved ({formatCurrency(metrics.realizedSavings)} of {formatCurrency(metrics.totalExpectedSavings)})
                </span>
              </li>
              {metrics.blocked > 0 && (
                <li className="flex items-start gap-2">
                  <span className="text-red-600 dark:text-red-400 mt-1">⚠</span>
                  <span className="text-red-700 dark:text-red-300">
                    {metrics.blocked} project{metrics.blocked !== 1 ? 's' : ''} currently blocked - immediate attention required
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  trend?: 'up' | 'down';
  color: string;
}

function MetricCard({ title, value, subtitle, icon: Icon, trend, color }: MetricCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 ${trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

interface StatusCardProps {
  label: string;
  count: number;
  percentage: number;
  color: string;
  icon: any;
}

function StatusCard({ label, count, percentage, color, icon: Icon }: StatusCardProps) {
  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    gray: 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
  };

  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-5 h-5" />
        <span className="text-2xl font-bold">{count}</span>
      </div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-xs opacity-80">{percentage}% of total</div>
    </div>
  );
}
