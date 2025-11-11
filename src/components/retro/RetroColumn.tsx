"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { RetroColumn as RetroColumnType } from "@/lib/retro-templates";
import RetroCard, { RetroCardData } from "./RetroCard";

interface RetroColumnProps {
  column: RetroColumnType;
  cards: RetroCardData[];
  currentUserId: string;
  currentUserName: string;
  userVotes: number;
  maxVotes: number;
  userVotedCardIds: Set<string>;
  onAddCard: (columnId: string, content: string) => void;
  onVote: (cardId: string) => void;
  onUnvote: (cardId: string) => void;
  onEditCard: (cardId: string, content: string) => void;
  onDeleteCard: (cardId: string) => void;
  onConvertToAction?: (card: RetroCardData) => void;
}

export default function RetroColumn({
  column,
  cards,
  currentUserId,
  currentUserName,
  userVotes,
  maxVotes,
  userVotedCardIds,
  onAddCard,
  onVote,
  onUnvote,
  onEditCard,
  onDeleteCard,
  onConvertToAction,
}: RetroColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newCardContent, setNewCardContent] = useState("");

  const handleAdd = () => {
    if (newCardContent.trim()) {
      onAddCard(column.id, newCardContent.trim());
      setNewCardContent("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewCardContent("");
    setIsAdding(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`p-4 rounded-t-xl border-2 ${column.color}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{column.emoji}</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {column.title}
            </h3>
          </div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {cards.length}
          </span>
        </div>
        {column.description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {column.description}
          </p>
        )}
      </div>

      {/* Column Content */}
      <div
        className={`flex-1 p-4 border-2 border-t-0 rounded-b-xl ${column.color} bg-white/50 dark:bg-slate-900/50 overflow-y-auto space-y-3`}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <RetroCard
              key={card.id}
              card={card}
              currentUserId={currentUserId}
              userVotes={userVotes}
              maxVotes={maxVotes}
              hasVoted={userVotedCardIds.has(card.id)}
              onVote={onVote}
              onUnvote={onUnvote}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onConvertToAction={onConvertToAction}
            />
          ))}
        </AnimatePresence>

        {/* Add Card Form */}
        {isAdding ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
          >
            <textarea
              value={newCardContent}
              onChange={(e) => setNewCardContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (newCardContent.trim()) {
                    handleAdd();
                  }
                }
              }}
              placeholder="Enter your thought... (Press Enter to submit, Shift+Enter for new line)"
              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAdd}
                disabled={!newCardContent.trim()}
                className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded text-sm font-medium disabled:cursor-not-allowed"
              >
                Add Card
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add Card</span>
          </button>
        )}
      </div>
    </div>
  );
}
