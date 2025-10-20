'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Check, Loader2, RotateCcw } from 'lucide-react';

interface Version {
  id: string;
  version_number: number;
  is_current: boolean;
  created_by: string;
  change_summary: string;
  created_at: string;
}

interface Props {
  assessmentId: string;
  onVersionRestore?: () => void;
}

export default function VersionSelector({ assessmentId, onVersionRestore }: Props) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVersions();
  }, [assessmentId]);

  const loadVersions = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/assessment/${assessmentId}/versions`);
      if (!response.ok) throw new Error('Failed to load versions');

      const data = await response.json();
      setVersions(data.versions || []);

      const current = data.versions?.find((v: Version) => v.is_current);
      if (current) {
        setCurrentVersion(current.version_number);
      }
    } catch (err) {
      console.error('Error loading versions:', err);
      setError('Failed to load version history');
    } finally {
      setIsLoading(false);
    }
  };

  const restoreVersion = async (versionNumber: number) => {
    if (versionNumber === currentVersion) return;

    const confirmed = confirm(
      `Are you sure you want to restore to Version ${versionNumber}? This will replace your current results.`
    );

    if (!confirmed) return;

    setIsRestoring(true);
    setError('');

    try {
      const response = await fetch(`/api/assessment/${assessmentId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ version_number: versionNumber }),
      });

      if (!response.ok) throw new Error('Failed to restore version');

      // Notify parent and reload
      if (onVersionRestore) {
        onVersionRestore();
      }

      window.location.reload();
    } catch (err) {
      console.error('Error restoring version:', err);
      setError('Failed to restore version');
    } finally {
      setIsRestoring(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCreatedByLabel = (createdBy: string) => {
    switch (createdBy) {
      case 'initial':
        return 'Initial Generation';
      case 'user':
        return 'User Edit';
      case 'ai_suggestion':
        return 'AI Suggestion';
      default:
        return createdBy;
    }
  };

  if (versions.length <= 1) {
    return null; // Don't show if there's only one version
  }

  return (
    <div className="mb-8">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-600 transition-colors"
        >
          <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Version {currentVersion || 1} of {versions.length}
          </span>
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-10"
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white">Version History</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Select a version to restore previous results
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 text-sm text-red-800 dark:text-red-200">
                    {error}
                  </div>
                )}

                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {versions.map((version) => (
                        <button
                          key={version.id}
                          onClick={() => restoreVersion(version.version_number)}
                          disabled={isRestoring || version.is_current}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 ${
                            version.is_current ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  Version {version.version_number}
                                </span>
                                {version.is_current && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200 rounded">
                                    <Check className="w-3 h-3" />
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                {getCreatedByLabel(version.created_by)}
                              </p>
                              {version.change_summary && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                                  {version.change_summary}
                                </p>
                              )}
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {formatDate(version.created_at)}
                              </p>
                            </div>
                            {!version.is_current && (
                              <RotateCcw className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
