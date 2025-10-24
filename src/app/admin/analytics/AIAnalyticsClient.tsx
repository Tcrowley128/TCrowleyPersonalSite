'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, DollarSign, Zap, TrendingUp, BarChart3,
  Clock, RefreshCw, Calendar, Activity, Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface AIUsageData {
  assessment_id: string;
  company_name: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  regeneration_count: number;
  model_version: string;
  created_at: string;
  cost: number;
}

interface AnalyticsData {
  summary: {
    totalGenerations: number;
    totalTokens: number;
    totalCost: number;
    avgTokensPerGeneration: number;
    totalRegenerations: number;
  };
  byPeriod: {
    today: { generations: number; tokens: number; cost: number };
    thisWeek: { generations: number; tokens: number; cost: number };
    thisMonth: { generations: number; tokens: number; cost: number };
  };
  usage: AIUsageData[];
}

export default function AIAnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/analytics');

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Loading Analytics...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-4 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Admin Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-indigo-600 dark:text-indigo-400" size={32} />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Tyler's AI Usage & Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed insights into Claude AI usage, token consumption, and associated costs
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Summary Stats */}
            <div className="grid md:grid-cols-5 gap-4 mb-8">
              <StatCard
                title="Total Generations"
                value={data.summary.totalGenerations.toLocaleString()}
                icon={Zap}
                color="indigo"
              />
              <StatCard
                title="Total Tokens"
                value={`${(data.summary.totalTokens / 1000).toFixed(1)}k`}
                icon={Activity}
                color="blue"
              />
              <StatCard
                title="Total Cost"
                value={`$${data.summary.totalCost.toFixed(2)}`}
                icon={DollarSign}
                color="green"
              />
              <StatCard
                title="Avg Tokens/Gen"
                value={data.summary.avgTokensPerGeneration.toLocaleString()}
                icon={BarChart3}
                color="purple"
              />
              <StatCard
                title="Regenerations"
                value={data.summary.totalRegenerations.toLocaleString()}
                icon={RefreshCw}
                color="orange"
              />
            </div>

            {/* Period Breakdown */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <PeriodCard
                title="Today"
                generations={data.byPeriod.today.generations}
                tokens={data.byPeriod.today.tokens}
                cost={data.byPeriod.today.cost}
              />
              <PeriodCard
                title="This Week"
                generations={data.byPeriod.thisWeek.generations}
                tokens={data.byPeriod.thisWeek.tokens}
                cost={data.byPeriod.thisWeek.cost}
              />
              <PeriodCard
                title="This Month"
                generations={data.byPeriod.thisMonth.generations}
                tokens={data.byPeriod.thisMonth.tokens}
                cost={data.byPeriod.thisMonth.cost}
              />
            </div>

            {/* Usage Details Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Detailed Usage Log
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Individual AI generation records with token counts and costs
                </p>
              </div>

              {data.usage.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No AI usage data available yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Input Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Output Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Regenerations
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Model
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.usage.map((record) => (
                        <UsageRow key={record.assessment_id} record={record} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Cost Breakdown Info */}
            <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
                <DollarSign size={20} />
                Cost Calculation
              </h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                Costs are calculated based on Claude Sonnet 4 pricing: $3.00 per 1M input tokens and $15.00 per 1M output tokens.
                These are estimated costs and may vary based on actual Anthropic pricing and prompt caching benefits.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: any;
  color: 'indigo' | 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colors: Record<typeof color, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg"
    >
      <div className={`w-12 h-12 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon size={24} />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </motion.div>
  );
}

interface PeriodCardProps {
  title: string;
  generations: number;
  tokens: number;
  cost: number;
}

function PeriodCard({ title, generations, tokens, cost }: PeriodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="text-indigo-600 dark:text-indigo-400" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Generations:</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{generations}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Tokens:</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {(tokens / 1000).toFixed(1)}k
          </span>
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Cost:</span>
          <span className="text-xl font-bold text-green-600 dark:text-green-400">
            ${cost.toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function UsageRow({ record }: { record: AIUsageData }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {record.company_name || 'Anonymous'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {record.assessment_id.slice(0, 8)}...
          </p>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {record.prompt_tokens.toLocaleString()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {record.completion_tokens.toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-gray-900 dark:text-white">
          {record.total_tokens.toLocaleString()}
        </span>
      </td>
      <td className="px-6 py-4">
        {record.regeneration_count > 0 ? (
          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-xs font-semibold">
            {record.regeneration_count}x
          </span>
        ) : (
          <span className="text-gray-400">—</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${record.cost.toFixed(3)}
        </span>
      </td>
      <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">
        {record.model_version || 'claude-sonnet-4'}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Clock size={14} className="mr-1" />
          {new Date(record.created_at).toLocaleDateString()}
        </div>
      </td>
    </tr>
  );
}
