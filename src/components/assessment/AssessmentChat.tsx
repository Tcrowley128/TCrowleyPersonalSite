'use client';

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface AssessmentChatProps {
  assessmentId: string;
}

export interface AssessmentChatHandle {
  openWithMessage: (message: string) => void;
}

const AssessmentChat = forwardRef<AssessmentChatHandle, AssessmentChatProps>(({ assessmentId }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Expose method to parent component
  useImperativeHandle(ref, () => ({
    openWithMessage: (message: string) => {
      setIsOpen(true);
      setInputMessage(message);
      // Auto-send after a brief delay to allow UI to open
      setTimeout(() => {
        setInputMessage(message);
        setTimeout(() => {
          sendMessageWithContent(message);
        }, 100);
      }, 300);
    }
  }));

  // Load conversation history when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadConversationHistory();
    }
  }, [isOpen]);

  const loadConversationHistory = async () => {
    try {
      const response = await fetch(`/api/assessment/${assessmentId}/chat`);
      if (!response.ok) return;

      const data = await response.json();
      if (data.conversations && data.conversations.length > 0) {
        // Load the most recent conversation
        const latestConv = data.conversations[0];
        setConversationId(latestConv.id);
        setMessages(latestConv.messages || []);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  };

  const sendMessageWithContent = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage = messageContent.trim();
    setInputMessage('');
    setError('');

    // Add user message to UI immediately
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/assessment/${assessmentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      // Update conversation ID if it's a new conversation
      if (data.conversation_id && !conversationId) {
        setConversationId(data.conversation_id);
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Remove the optimistically added user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = () => {
    sendMessageWithContent(inputMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestedQuestions = [
    "Why was this tool recommended for my company?",
    "What's the best place to start?",
    "How long will implementation take?",
    "What resources do I need?",
    "Can you explain this recommendation in more detail?"
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 group"
          >
            <Sparkles className="w-6 h-6" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold">
              Ask Tyler's AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            />

            {/* Chat Panel */}
            <motion.div
              initial={{ opacity: 0, x: 100, y: 100 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 100, y: 100 }}
              className="fixed bottom-6 right-6 z-50 w-[450px] h-[600px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-lg">Tyler's AI Assistant</h3>
                    <p className="text-xs text-blue-100">Ask me anything about your assessment</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-4">
                    <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Welcome! I'm here to help.
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      I have full context of your assessment results. Ask me anything!
                    </p>
                    <div className="space-y-2 w-full">
                      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Try asking:
                      </p>
                      {suggestedQuestions.slice(0, 3).map((question, i) => (
                        <button
                          key={i}
                          onClick={() => setInputMessage(question)}
                          className="w-full text-left text-xs bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-900 dark:text-blue-300 p-2 rounded-lg transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                          }`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-1">
                              <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                Tyler's AI
                              </span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-slate-700 rounded-2xl px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Tyler's AI is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                  <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your assessment..."
                    disabled={isLoading}
                    className="flex-1 resize-none bg-gray-100 dark:bg-slate-700 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                    rows={2}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white p-3 rounded-xl transition-colors disabled:cursor-not-allowed self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
});

AssessmentChat.displayName = 'AssessmentChat';

export default AssessmentChat;
