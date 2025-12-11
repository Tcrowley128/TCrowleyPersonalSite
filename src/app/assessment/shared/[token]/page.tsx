'use client';

import { use, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Eye, Lock, Calendar, AlertCircle, Rocket } from 'lucide-react';
import {
  OverviewTab,
  QuickWinsTab,
  RecommendationsTab,
  RoadmapTab,
  MaturityTab,
  LongTermVisionTab,
  ChangeManagementTab,
  OperationalAreasTab
} from '@/components/assessment/results/ResultComponents';

export default function SharedAssessmentResults({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);
  const [shareInfo, setShareInfo] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchSharedResults();
  }, [token]);

  const fetchSharedResults = async () => {
    try {
      const response = await fetch(`/api/assessment/shared/${token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load shared results');
        return;
      }

      setResults(data.results);
      setShareInfo(data.share_info);
    } catch (err) {
      console.error('Error fetching shared results:', err);
      setError('Failed to load shared results');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading shared assessment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg max-w-md text-center border-2 border-gray-200 dark:border-gray-700"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          {error.includes('expired') && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This share link has expired. Please request a new link from the assessment owner.
            </p>
          )}
          {error.includes('limit') && (
            <p className="text-sm text-gray-500 dark:text-gray-500">
              This share link has reached its view limit. Please request a new link from the assessment owner.
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">No results found</p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'operational', label: 'Operational Focus', icon: Calendar },
    { id: 'quick-wins', label: 'Quick Wins', icon: AlertCircle },
    { id: 'recommendations', label: 'Solutions', icon: Lock },
    { id: 'roadmap', label: 'Roadmap', icon: Calendar },
    { id: 'maturity', label: 'Maturity', icon: Eye },
    { id: 'vision', label: 'Long-term Vision', icon: Lock },
    { id: 'change', label: 'Change Management', icon: AlertCircle }
  ];

  const handleViewJourney = () => {
    window.location.href = `/assessment/journey/shared/${token}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-8 sm:py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shared View Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-500 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 flex-wrap justify-between">
              <div className="flex items-center gap-3">
                <Eye className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={24} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">Shared Assessment Results</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    View-only access
                    {shareInfo?.max_views && ` • ${shareInfo.view_count} / ${shareInfo.max_views} views used`}
                    {!shareInfo?.max_views && ` • Viewed ${shareInfo?.view_count || 0} times`}
                    {shareInfo?.expires_at && ` • Expires ${new Date(shareInfo.expires_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleViewJourney}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium whitespace-nowrap"
              >
                <Rocket size={16} />
                View Transformation Journey
              </button>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            <span className="text-gray-900 dark:text-white">{results.company_name || 'Company'}</span>
            {' '}
            <span className="text-gray-600 dark:text-gray-400">Digital Transformation Roadmap</span>
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {results.industry && <span className="capitalize">{results.industry}</span>}
            {results.company_size && <span> • {results.company_size} employees</span>}
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <OverviewTab
              results={results}
              isSharedView={true}
            />
          )}
          {activeTab === 'operational' && (
            <OperationalAreasTab
              results={results}
              isSharedView={true}
            />
          )}
          {activeTab === 'quick-wins' && (
            <QuickWinsTab
              results={results}
              isSharedView={true}
            />
          )}
          {activeTab === 'recommendations' && (
            <RecommendationsTab
              results={results}
              isSharedView={true}
            />
          )}
          {activeTab === 'roadmap' && (
            <RoadmapTab
              results={results}
              isSharedView={true}
            />
          )}
          {activeTab === 'maturity' && (
            <MaturityTab
              results={results}
              isSharedView={true}
            />
          )}
          {activeTab === 'vision' && (
            <LongTermVisionTab
              results={results}
              isSharedView={true}
            />
          )}
          {activeTab === 'change' && (
            <ChangeManagementTab
              results={results}
              isSharedView={true}
            />
          )}
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          <p>This is a view-only shared assessment. Some features are disabled.</p>
          <p className="mt-1">
            Want your own personalized assessment?{' '}
            <a href="/assessment" className="text-blue-600 dark:text-blue-400 hover:underline">
              Start your free assessment
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
