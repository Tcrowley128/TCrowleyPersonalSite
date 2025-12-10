'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, Copy, Check, X, Calendar, Eye, Trash2, Loader2 } from 'lucide-react';

interface ShareToken {
  id: string;
  token: string;
  assessment_id: string;
  created_by: string;
  permission_level: string;
  expires_at: string | null;
  max_views: number | null;
  view_count: number;
  is_active: boolean;
  created_at: string;
  last_accessed_at: string | null;
}

interface ShareModalProps {
  assessmentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ShareModal({ assessmentId, isOpen, onClose }: ShareModalProps) {
  const [shareTokens, setShareTokens] = useState<ShareToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // Settings for new token
  const [expiresInDays, setExpiresInDays] = useState<string>('');
  const [maxViews, setMaxViews] = useState<string>('');

  // Fetch existing tokens when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchShareTokens();
    }
  }, [isOpen, assessmentId]);

  const fetchShareTokens = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/share`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch share links');
      }

      if (data.success) {
        setShareTokens(data.share_tokens);
      }
    } catch (err) {
      console.error('Failed to fetch share tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to load share links');
    } finally {
      setIsLoading(false);
    }
  };

  const createShareLink = async () => {
    setIsCreating(true);
    setError('');

    try {
      const expires_at = expiresInDays
        ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const max_views_num = maxViews ? parseInt(maxViews) : null;

      const response = await fetch(`/api/assessment/${assessmentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expires_at,
          max_views: max_views_num
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share link');
      }

      if (data.success) {
        setShareTokens([data.share_token, ...shareTokens]);

        // Copy to clipboard immediately
        await navigator.clipboard.writeText(data.share_url);
        setCopiedToken(data.share_token.id);
        setTimeout(() => setCopiedToken(null), 3000);

        // Reset form
        setExpiresInDays('');
        setMaxViews('');
      }
    } catch (err) {
      console.error('Failed to create share link:', err);
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (token: string, tokenId: string) => {
    const shareUrl = `${window.location.origin}/assessment/shared/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedToken(tokenId);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      setError('Failed to copy link to clipboard');
    }
  };

  const revokeToken = async (tokenId: string) => {
    if (!confirm('Are you sure you want to revoke this share link? Anyone with this link will no longer be able to access your results.')) {
      return;
    }

    try {
      const response = await fetch(`/api/assessment/${assessmentId}/share?token_id=${tokenId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke link');
      }

      setShareTokens(shareTokens.filter(t => t.id !== tokenId));
    } catch (err) {
      console.error('Failed to revoke token:', err);
      setError(err instanceof Error ? err.message : 'Failed to revoke share link');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Link2 className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Share Results</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Create a link to share your assessment results</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Create New Link Section */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Create New Share Link</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expires After (Optional)
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Never</option>
                    <option value="1">1 day</option>
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Views (Optional)
                  </label>
                  <input
                    type="number"
                    value={maxViews}
                    onChange={(e) => setMaxViews(e.target.value)}
                    placeholder="Unlimited"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                onClick={createShareLink}
                disabled={isCreating}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating Link...
                  </>
                ) : (
                  <>
                    <Link2 size={18} />
                    Create Share Link
                  </>
                )}
              </button>
            </div>

            {/* Existing Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Active Share Links ({shareTokens.length})
              </h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : shareTokens.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">No active share links</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Create one above to share your results
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shareTokens.map((token) => {
                    const isExpired = token.expires_at ? new Date(token.expires_at) < new Date() : false;
                    const isMaxedOut = token.max_views ? token.view_count >= token.max_views : false;

                    return (
                      <div
                        key={token.id}
                        className={`p-4 border-2 rounded-lg transition-colors ${
                          isExpired || isMaxedOut
                            ? 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/50 opacity-60'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <code className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded font-mono">
                                ...{token.token.slice(-8)}
                              </code>
                              {token.expires_at && (
                                <span className={`text-xs flex items-center gap-1 ${
                                  isExpired ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  <Calendar size={12} />
                                  {isExpired ? 'Expired' : 'Expires'} {new Date(token.expires_at).toLocaleDateString()}
                                </span>
                              )}
                              {isMaxedOut && (
                                <span className="text-xs text-red-600 dark:text-red-400">
                                  Max views reached
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <span className="flex items-center gap-1">
                                <Eye size={14} />
                                {token.view_count}
                                {token.max_views ? ` / ${token.max_views}` : ''} views
                              </span>
                              <span>•</span>
                              <span>Created {new Date(token.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(token.token, token.id)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="Copy link"
                              disabled={isExpired || isMaxedOut}
                            >
                              {copiedToken === token.id ? (
                                <Check size={18} className="text-green-600" />
                              ) : (
                                <Copy size={18} className={isExpired || isMaxedOut ? 'text-gray-400' : ''} />
                              )}
                            </button>

                            <button
                              onClick={() => revokeToken(token.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                              title="Revoke link"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
