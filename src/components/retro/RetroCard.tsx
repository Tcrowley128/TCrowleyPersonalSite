"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ThumbsUp, Trash2, Edit2, Save, X, ListChecks } from "lucide-react";

export interface RetroCardData {
  id: string;
  retro_id: string;
  column_id: string;
  content: string;
  author_id?: string;
  author_name?: string;
  color: string;
  position_x: number;
  position_y: number;
  votes: number;
  created_at: string;
  updated_at: string;
}

interface RetroCardProps {
  card: RetroCardData;
  currentUserId: string;
  userVotes: number;
  maxVotes: number;
  hasVoted: boolean;
  onVote: (cardId: string) => void;
  onUnvote: (cardId: string) => void;
  onEdit: (cardId: string, content: string) => void;
  onDelete: (cardId: string) => void;
  onConvertToAction?: (card: RetroCardData) => void;
}

export default function RetroCard({
  card,
  currentUserId,
  userVotes,
  maxVotes,
  hasVoted,
  onVote,
  onUnvote,
  onEdit,
  onDelete,
  onConvertToAction,
}: RetroCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(card.content);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isAuthor = card.author_id === currentUserId;
  const canVote = !hasVoted && userVotes < maxVotes;

  const handleSave = () => {
    if (editContent.trim() && editContent !== card.content) {
      onEdit(card.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(card.content);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(card.id);
    setShowDeleteConfirm(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`p-4 rounded-lg shadow-md ${
        card.color === "yellow"
          ? "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300"
          : card.color === "blue"
          ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300"
          : card.color === "green"
          ? "bg-green-100 dark:bg-green-900/30 border-green-300"
          : card.color === "pink"
          ? "bg-pink-100 dark:bg-pink-900/30 border-pink-300"
          : card.color === "red"
          ? "bg-red-100 dark:bg-red-900/30 border-red-300"
          : card.color === "purple"
          ? "bg-purple-100 dark:bg-purple-900/30 border-purple-300"
          : card.color === "orange"
          ? "bg-orange-100 dark:bg-orange-900/30 border-orange-300"
          : "bg-gray-100 dark:bg-gray-900/30 border-gray-300"
      } border-2`}
    >
      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
            >
              <Save className="w-3 h-3" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-xs font-medium"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap">
            {card.content}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {card.author_name && (
                <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  {card.author_name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Vote button */}
              <button
                onClick={() => (hasVoted ? onUnvote(card.id) : onVote(card.id))}
                disabled={!hasVoted && !canVote}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  hasVoted
                    ? "bg-blue-600 text-white"
                    : canVote
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                {card.votes}
              </button>

              {/* Convert to Action button */}
              {onConvertToAction && (
                <button
                  onClick={() => onConvertToAction(card)}
                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                  title="Convert to action"
                >
                  <ListChecks className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </button>
              )}

              {/* Edit button (only for author) */}
              {isAuthor && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                  title="Edit card"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                </button>
              )}

              {/* Delete button (only for author) */}
              {isAuthor && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Delete card"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Card?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this card? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteClick}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
