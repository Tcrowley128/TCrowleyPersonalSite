'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Loader2, DollarSign, MessageSquare, TrendingUp, BarChart3,
  Clock, Users, Activity, Sparkles, MessagesSquare
} from 'lucide-react';
import Link from 'next/link';

interface ConversationData {
  conversation_id: string;
  assessment_id: string;
  company_name: string;
  industry: string;
  title: string;
  message_count: number;
  user_messages: number;
  assistant_messages: number;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost: number;
  created_at: string;
  updated_at: string;
}

interface AnalyticsData {
  summary: {
    totalConversations: number;
    totalMessages: number;
    totalTokens: number;
    totalCost: number;
    avgMessagesPerConversation: number;
    avgTokensPerConversation: number;
  };
  byPeriod: {
    today: { conversations: number; messages: number; tokens: number; cost: number };
    thisWeek: { conversations: number; messages: number; tokens: number; cost: number };
    thisMonth: { conversations: number; messages: number; tokens: number; cost: number };
  };
  conversations: ConversationData[];
  topQuestions: Array<{
    title: string;
    company_name: string;
    message_count: number;
    created_at: string;
  }>;
}

export default function ChatAnalyticsClient() {
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
      const response = await fetch('/api/admin/chat-analytics');

      if (!response.ok) {
        throw new Error('Failed to load chat analytics');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error loading chat analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chat analytics');
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
            Loading Chat Analytics...
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
            <MessagesSquare className="text-indigo-600 dark:text-indigo-400" size={32} />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Chat Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Insights into how users are interacting with the AI assistant in assessment results
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
            <div className="grid md:grid-cols-6 gap-4 mb-8">
              <StatCard
                title="Conversations"
                value={data.summary.totalConversations.toLocaleString()}
                icon={MessagesSquare}
                color="indigo"
              />
              <StatCard
                title="Total Messages"
                value={data.summary.totalMessages.toLocaleString()}
                icon={MessageSquare}
                color="blue"
              />
              <StatCard
                title="Avg Msg/Conv"
                value={data.summary.avgMessagesPerConversation.toLocaleString()}
                icon={BarChart3}
                color="purple"
              />
              <StatCard
                title="Total Tokens"
                value={`${(data.summary.totalTokens / 1000).toFixed(1)}k`}
                icon={Activity}
                color="cyan"
              />
              <StatCard
                title="Avg Tokens/Conv"
                value={`${(data.summary.avgTokensPerConversation / 1000).toFixed(1)}k`}
                icon={TrendingUp}
                color="green"
              />
              <StatCard
                title="Total Cost"
                value={`$${data.summary.totalCost.toFixed(2)}`}
                icon={DollarSign}
                color="orange"
              />
            </div>

            {/* Period Breakdown */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <PeriodCard
                title="Today"
                conversations={data.byPeriod.today.conversations}
                messages={data.byPeriod.today.messages}
                tokens={data.byPeriod.today.tokens}
                cost={data.byPeriod.today.cost}
              />
              <PeriodCard
                title="This Week"
                conversations={data.byPeriod.thisWeek.conversations}
                messages={data.byPeriod.thisWeek.messages}
                tokens={data.byPeriod.thisWeek.tokens}
                cost={data.byPeriod.thisWeek.cost}
              />
              <PeriodCard
                title="This Month"
                conversations={data.byPeriod.thisMonth.conversations}
                messages={data.byPeriod.thisMonth.messages}
                tokens={data.byPeriod.thisMonth.tokens}
                cost={data.byPeriod.thisMonth.cost}
              />
            </div>

            {/* Top Questions */}
            {data.topQuestions.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Recent Conversations
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Latest questions users are asking the AI assistant
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {data.topQuestions.map((q, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white mb-1">
                              {q.title}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {q.company_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageSquare size={14} />
                                {q.message_count} messages
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {new Date(q.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Conversation Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  All Conversations
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Detailed breakdown of all AI chat conversations
                </p>
              </div>

              {data.conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessagesSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No chat conversations yet
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
                          First Message
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Messages
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tokens
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Started
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {data.conversations.map((conv) => (
                        <ConversationRow key={conv.conversation_id} conversation={conv} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Cost Info */}
            <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
              <h3 className="font-semibold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-2">
                <DollarSign size={20} />
                Cost Calculation
              </h3>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                Costs are calculated based on Claude Sonnet 4 pricing: $3.00 per 1M input tokens and $15.00 per 1M output tokens.
                These are estimated costs for AI chat conversations in assessment results pages.
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
  color: 'indigo' | 'blue' | 'purple' | 'cyan' | 'green' | 'orange';
}

function StatCard({ title, value, icon: Icon, color }: StatCardProps) {
  const colors: Record<typeof color, string> = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
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
  conversations: number;
  messages: number;
  tokens: number;
  cost: number;
}

function PeriodCard({ title, conversations, messages, tokens, cost }: PeriodCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-indigo-600 dark:text-indigo-400" size={20} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Conversations:</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{conversations}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Messages:</span>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">{messages}</span>
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

function ConversationRow({ conversation }: { conversation: ConversationData }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">
            {conversation.company_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {conversation.industry}
          </p>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 max-w-md truncate">
          {conversation.title || 'No title'}
        </p>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm">
          <p className="font-semibold text-gray-900 dark:text-white">
            {conversation.message_count}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {conversation.user_messages}U / {conversation.assistant_messages}A
          </p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-gray-900 dark:text-white">
          {conversation.total_tokens.toLocaleString()}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-green-600 dark:text-green-400">
          ${conversation.cost.toFixed(3)}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Clock size={14} className="mr-1" />
          {new Date(conversation.created_at).toLocaleDateString()}
        </div>
      </td>
    </tr>
  );
}
