'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, User, Calendar, Trash2, Edit2, X } from 'lucide-react';

interface Comment {
  id: string;
  entity_type: string;
  entity_id: string;
  content: string;
  parent_comment_id: string | null;
  thread_level: number;
  user_id: string;
  user_name: string | null;
  mentioned_users: string[];
  edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
  reactions?: Record<string, string[]>; // {"👍": ["user1@example.com"], "❤️": ["user2@example.com"]}
}

interface CommentsSectionProps {
  entityType: string;
  entityId: string;
  currentUserId: string;
  currentUserName: string;
}

export function CommentsSection({
  entityType,
  entityId,
  currentUserId,
  currentUserName
}: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const REACTION_EMOJIS = ['👍', '❤️', '😊', '🎉', '🚀', '👀'];

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/comments?entity_type=${entityType}&entity_id=${entityId}`
      );

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          content: newComment,
          parent_comment_id: replyTo,
          thread_level: replyTo ? 1 : 0,
          user_id: currentUserId,
          user_name: currentUserName
        })
      });

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || submitting) return;

    try {
      setSubmitting(true);

      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      });

      if (response.ok) {
        setEditingId(null);
        setEditContent('');
        fetchComments();
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      const hasReacted = comment?.reactions?.[emoji]?.includes(currentUserId);
      const action = hasReacted ? 'remove' : 'add';

      const response = await fetch(`/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, user_id: currentUserId, action })
      });

      if (response.ok) {
        const { reactions } = await response.json();
        // Update the comment in state
        setComments(prev => prev.map(c =>
          c.id === commentId ? { ...c, reactions } : c
        ));
        setShowReactionPicker(null);
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return date.toLocaleDateString();
  };

  const highlightMentions = (text: string) => {
    return text.split(/(@[a-zA-Z0-9._@-]+)/g).map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-blue-600 dark:text-blue-400 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const rootComments = comments.filter(c => !c.parent_comment_id);
  const getReplies = (commentId: string) =>
    comments.filter(c => c.parent_comment_id === commentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments ({comments.length})
        </h3>
      </div>

      {/* Comment Form */}
      <div className="space-y-3">
        {replyTo && (
          <div className="flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Replying to comment
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              // Submit on Ctrl+Enter or Cmd+Enter
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                handleSubmitComment(e);
              }
            }}
            placeholder="Add a comment... (use @username to mention someone, Ctrl+Enter to submit)"
            className="w-full px-4 py-3 pr-12 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white resize-none"
            rows={3}
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSubmitComment(e);
            }}
            disabled={!newComment.trim() || submitting}
            className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
            title="Send comment (or press Ctrl+Enter)"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-[18px] w-[18px] border-b-2 border-white"></div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Use @username to mention team members in your comment
        </p>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {rootComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          rootComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              {/* Main Comment */}
              <div className="bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                      {(comment.user_name || comment.user_id)[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.user_name || comment.user_id}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.created_at)}
                        {comment.edited && ' (edited)'}
                      </div>
                    </div>
                  </div>

                  {comment.user_id === currentUserId && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditComment(comment.id)}
                        disabled={submitting}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent('');
                        }}
                        className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {highlightMentions(comment.content)}
                    </p>

                    {/* Reactions Display */}
                    {comment.reactions && Object.keys(comment.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(comment.reactions).map(([emoji, users]) => (
                          users.length > 0 && (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => handleReaction(comment.id, emoji)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                                users.includes(currentUserId)
                                  ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                                  : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                              }`}
                              title={users.join(', ')}
                            >
                              <span>{emoji}</span>
                              <span className="text-gray-600 dark:text-gray-400 font-medium">
                                {users.length}
                              </span>
                            </button>
                          )
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(comment.id);
                          textareaRef.current?.focus();
                        }}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 font-medium"
                      >
                        Reply
                      </button>

                      {/* Reaction Picker */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowReactionPicker(
                            showReactionPicker === comment.id ? null : comment.id
                          )}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                        >
                          React
                        </button>

                        {showReactionPicker === comment.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                            {REACTION_EMOJIS.map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => handleReaction(comment.id, emoji)}
                                className="text-2xl hover:scale-125 transition-transform p-1"
                                title={emoji}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div
                  key={reply.id}
                  className="ml-8 bg-gray-50 dark:bg-slate-900 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-medium">
                        {(reply.user_name || reply.user_id)[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {reply.user_name || reply.user_id}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(reply.created_at)}
                          {reply.edited && ' (edited)'}
                        </div>
                      </div>
                    </div>

                    {reply.user_id === currentUserId && (
                      <button
                        type="button"
                        onClick={() => handleDeleteComment(reply.id)}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {highlightMentions(reply.content)}
                  </p>

                  {/* Reply Reactions Display */}
                  {reply.reactions && Object.keys(reply.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.entries(reply.reactions).map(([emoji, users]) => (
                        users.length > 0 && (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReaction(reply.id, emoji)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                              users.includes(currentUserId)
                                ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500 dark:border-blue-400'
                                : 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                            title={users.join(', ')}
                          >
                            <span>{emoji}</span>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">
                              {users.length}
                            </span>
                          </button>
                        )
                      ))}
                    </div>
                  )}

                  {/* Reply Action Buttons */}
                  <div className="flex items-center gap-3 mt-2 relative">
                    <button
                      type="button"
                      onClick={() => setShowReactionPicker(
                        showReactionPicker === reply.id ? null : reply.id
                      )}
                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium"
                    >
                      React
                    </button>

                    {showReactionPicker === reply.id && (
                      <div className="absolute left-0 top-full mt-1 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                        {REACTION_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleReaction(reply.id, emoji)}
                            className="text-2xl hover:scale-125 transition-transform p-1"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
