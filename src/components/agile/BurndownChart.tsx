'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingDown } from 'lucide-react';

interface BurndownChartProps {
  sprint: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    committed_story_points?: number;
    scope_creep_story_points?: number;
  };
  completedStoryPoints: number;
}

export function BurndownChart({ sprint, completedStoryPoints }: BurndownChartProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate sprint days
  const startDate = new Date(sprint.start_date);
  const endDate = new Date(sprint.end_date);
  const today = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.min(
    Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    totalDays
  );

  const committedPoints = Number(sprint.committed_story_points) || 0;
  const scopeCreepPoints = Number(sprint.scope_creep_story_points) || 0;
  const totalPoints = committedPoints + scopeCreepPoints;
  const remainingPoints = totalPoints - Number(completedStoryPoints);

  // If no committed points, don't render the chart
  if (totalPoints === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
          <TrendingDown className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">Sprint Burndown</h3>
            <p className="text-sm">No story points committed to this sprint yet</p>
          </div>
        </div>
      </div>
    );
  }

  // Generate ideal burndown line (based on committed points only, not scope creep)
  const idealBurndown = Array.from({ length: totalDays + 1 }, (_, i) => ({
    day: i,
    points: committedPoints - (committedPoints / totalDays) * i
  }));

  // Generate actual burndown (simplified - just showing current status)
  // Start at committed points (original plan) and current is at total points - completed
  const actualBurndown = [
    { day: 0, points: committedPoints }, // Started with committed points
    { day: daysElapsed, points: remainingPoints } // Currently at this point (includes scope creep)
  ];

  // Calculate dimensions for SVG
  const width = 600;
  const height = 300;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const xScale = (day: number) => padding + (day / totalDays) * chartWidth;
  const yScale = (points: number) => height - padding - (points / totalPoints) * chartHeight;

  // Generate SVG path for ideal line
  const idealPath = idealBurndown
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${xScale(point.day)} ${yScale(point.points)}`)
    .join(' ');

  // Generate SVG path for actual line
  const actualPath = actualBurndown
    .map((point, i) => `${i === 0 ? 'M' : 'L'} ${xScale(point.day)} ${yScale(point.points)}`)
    .join(' ');

  return (
    <div className="bg-white dark:bg-slate-800">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors border-t border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3">
          <TrendingDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">Sprint Burndown</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {remainingPoints} of {totalPoints} points remaining • Day {daysElapsed} of {totalDays}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Chart - Expandable */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto"
            style={{ maxHeight: '300px' }}
          >
            {/* Grid lines */}
            {Array.from({ length: 5 }, (_, i) => {
              const y = padding + (i * chartHeight) / 4;
              const points = totalPoints - (i * totalPoints) / 4;
              return (
                <g key={`grid-${i}`}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-gray-200 dark:text-gray-700"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding - 10}
                    y={y + 5}
                    textAnchor="end"
                    className="text-xs fill-gray-600 dark:fill-gray-400"
                  >
                    {Math.round(points)}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {Array.from({ length: Math.min(totalDays + 1, 8) }, (_, i) => {
              const day = Math.floor((i * totalDays) / Math.min(totalDays, 7));
              return (
                <text
                  key={`x-label-${i}`}
                  x={xScale(day)}
                  y={height - padding + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                >
                  Day {day}
                </text>
              );
            })}

            {/* Axes */}
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="currentColor"
              strokeWidth="2"
              className="text-gray-400 dark:text-gray-600"
            />

            {/* Ideal burndown line */}
            <path
              d={idealPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="text-gray-400 dark:text-gray-500"
            />

            {/* Actual burndown line */}
            <path
              d={actualPath}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              className="text-blue-600 dark:text-blue-400"
            />

            {/* Current position marker */}
            <circle
              cx={xScale(daysElapsed)}
              cy={yScale(remainingPoints)}
              r="6"
              fill="currentColor"
              className="text-blue-600 dark:text-blue-400"
            />

            {/* Labels */}
            <text
              x={width - padding}
              y={padding + 20}
              textAnchor="end"
              className="text-sm fill-gray-600 dark:fill-gray-400"
            >
              <tspan className="text-gray-400">- - - Ideal</tspan>
            </text>
            <text
              x={width - padding}
              y={padding + 40}
              textAnchor="end"
              className="text-sm fill-blue-600 dark:fill-blue-400 font-medium"
            >
              <tspan>━━━ Actual</tspan>
            </text>
          </svg>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalPoints}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Committed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {completedStoryPoints}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {remainingPoints}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
