"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle,
  Plus,
  Rocket,
  Wand2,
  Info,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { createClient } from '@/lib/supabase/client';
import JourneyUpdateModal from "./JourneyUpdateModal";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
  id?: string;
  metadata?: {
    hasActionableInsights?: boolean;
    insights?: any[];
  };
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

interface JourneyChatProps {
  assessmentId: string;
}

export interface JourneyChatHandle {
  openWithMessage: (message: string) => void;
}

const JourneyChat = forwardRef<JourneyChatHandle, JourneyChatProps>(
  ({ assessmentId }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [error, setError] = useState("");
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedMessageForUpdate, setSelectedMessageForUpdate] = useState<Message | null>(null);
    const [skipLoadingHistory, setSkipLoadingHistory] = useState(false);
    const supabase = createClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        setIsExpanded(true);
        setConversationId(null);
        setMessages([]);
        setError("");
        setSkipLoadingHistory(true);
        setInputMessage(message);
        setTimeout(() => {
          setInputMessage(message);
          setTimeout(() => {
            sendMessageWithContent(message);
          }, 100);
        }, 300);
      },
    }));

    // Load conversation history when chat opens
    useEffect(() => {
      if (isOpen && conversations.length === 0 && !skipLoadingHistory) {
        loadConversationHistory();
      }
    }, [isOpen]);

    const loadConversationHistory = async () => {
      try {
        const response = await fetch(`/api/assessment/${assessmentId}/journey-chat`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.conversations && data.conversations.length > 0) {
          setConversations(data.conversations);
          const latestConv = data.conversations[0];
          setConversationId(latestConv.id);
          setMessages(latestConv.messages || []);
        }
      } catch (err) {
        console.error("Error loading conversation:", err);
      }
    };

    const startNewConversation = () => {
      setConversationId(null);
      setMessages([]);
      setError("");
      setSkipLoadingHistory(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    };

    const loadConversation = (conv: Conversation) => {
      setConversationId(conv.id);
      setMessages(conv.messages || []);
      setError("");
    };

    const sendMessageWithContent = async (messageContent: string) => {
      if (!messageContent.trim() || isLoading) return;

      const userMessage = messageContent.trim();
      setInputMessage("");
      setError("");

      const newUserMessage: Message = {
        role: "user",
        content: userMessage,
      };
      setMessages((prev) => [...prev, newUserMessage]);
      setIsLoading(true);

      const assistantMessageIndex = messages.length + 1;
      const streamingMessage: Message = {
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, streamingMessage]);

      try {
        const response = await fetch(`/api/assessment/${assessmentId}/journey-chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            conversation_id: conversationId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let streamedContent = '';
        let messageId = '';
        let newConversationId = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));

                  if (data.type === 'conversation_id') {
                    newConversationId = data.conversation_id;
                    if (!conversationId) {
                      setConversationId(newConversationId);
                    }
                  } else if (data.type === 'text') {
                    streamedContent += data.text;
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[assistantMessageIndex] = {
                        role: "assistant",
                        content: streamedContent,
                      };
                      return updated;
                    });
                  } else if (data.type === 'done') {
                    messageId = data.message_id;
                    setMessages((prev) => {
                      const updated = [...prev];
                      updated[assistantMessageIndex] = {
                        role: "assistant",
                        content: streamedContent,
                        id: messageId,
                      };
                      return updated;
                    });

                    // Detect actionable insights after message is complete
                    if (messageId && streamedContent) {
                      detectInsights(messageId, streamedContent, newConversationId || conversationId || '');
                    }
                  } else if (data.type === 'error') {
                    throw new Error(data.error || 'Streaming error');
                  }
                } catch (parseError) {
                  // Ignore JSON parse errors for incomplete chunks
                }
              }
            }
          }
        }

        loadConversationHistory();
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err instanceof Error ? err.message : "Failed to send message");
        setMessages((prev) => prev.slice(0, -2));
      } finally {
        setIsLoading(false);
      }
    };

    const sendMessage = () => {
      sendMessageWithContent(inputMessage);
    };

    // Detect actionable insights in assistant message
    const detectInsights = async (messageId: string, messageContent: string, convId: string) => {
      try {
        const response = await fetch(
          `/api/assessment/${assessmentId}/journey-chat/detect-insights`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messageId,
              messageContent,
              conversationId: convId,
            }),
          }
        );

        if (response.ok) {
          const insights = await response.json();

          if (insights.hasActionableInsights && insights.insights.length > 0) {
            // Update the message with insights metadata
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === messageId
                  ? {
                      ...msg,
                      metadata: {
                        hasActionableInsights: true,
                        insights: insights.insights,
                      },
                    }
                  : msg
              )
            );
          }
        }
      } catch (error) {
        console.error('[JourneyChat] Error detecting insights:', error);
      }
    };

    // Handle applying insights to journey
    const handleApplyToJourney = (message: Message) => {
      setSelectedMessageForUpdate(message);
      setShowUpdateModal(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    const suggestedQuestions = [
      "What's the progress on our transformation journey?",
      "Which projects should we prioritize next?",
      "How much savings have we realized so far?",
      "What are the high-priority risks I should address?",
      "Can you help me plan the next sprint?",
      "How is our velocity trending?",
    ];

    const chatPanelStyles = isExpanded
      ? "fixed inset-2 sm:inset-4 md:inset-8 z-50 max-w-6xl max-h-[95vh] sm:max-h-[90vh] mx-auto my-auto bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      : "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[450px] max-w-[450px] h-[70vh] sm:h-[600px] max-h-[600px] bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden";

    return (
      <>
        {/* Floating Chat Button - Hidden, used only as trigger target */}
        <button
          data-journey-chat-trigger
          onClick={() => {
            setIsOpen(true);
            setIsExpanded(true);
          }}
          className="hidden"
          aria-label="Open Journey Chat"
        />

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
                initial={{
                  opacity: 0,
                  x: isExpanded ? 0 : 100,
                  y: isExpanded ? 0 : 100,
                  scale: isExpanded ? 0.9 : 1,
                }}
                animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  x: isExpanded ? 0 : 100,
                  y: isExpanded ? 0 : 100,
                  scale: isExpanded ? 0.9 : 1,
                }}
                onClick={(e) => e.stopPropagation()}
                className={chatPanelStyles}
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Rocket className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg truncate">
                        Tyler's Journey AI
                      </h3>
                      <p className="text-xs text-blue-100 hidden sm:block">
                        Your transformation journey assistant
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
                      title={isExpanded ? "Minimize" : "Expand"}
                    >
                      {isExpanded ? (
                        <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-white/20 p-1.5 sm:p-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* AI Disclaimer */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-200">
                    <strong>AI-Generated Content:</strong> Responses may contain
                    errors. Always verify important information and consult with
                    professionals for critical decisions.
                  </p>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex overflow-hidden">
                  {/* Conversation History Sidebar - Hidden on mobile */}
                  <div className="hidden md:flex w-64 border-r border-gray-200 dark:border-gray-700 flex-col bg-gray-50 dark:bg-slate-900">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={startNewConversation}
                        className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        New Conversation
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2">
                      {conversations.length === 0 ? (
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">
                          No conversations yet
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {conversations.map((conv) => (
                            <button
                              key={conv.id}
                              onClick={() => loadConversation(conv)}
                              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                conv.id === conversationId
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800"
                                  : "hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              <div className="font-medium truncate mb-0.5">
                                {conv.title}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(conv.updated_at).toLocaleDateString()}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center px-4">
                          <Rocket className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            Welcome to Your Journey Assistant!
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            I have full context of your transformation journey including projects, sprints, PBIs, risks, and progress. Ask me anything!
                          </p>
                          <div className="space-y-2 w-full max-w-md">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Try asking:
                            </p>
                            {suggestedQuestions
                              .slice(0, 3)
                              .map((question, i) => (
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
                              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-2xl px-4 py-2 break-words overflow-wrap-anywhere ${
                                  msg.role === "user"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white"
                                }`}
                              >
                                {msg.role === "assistant" && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                      Tyler's AI
                                    </span>
                                  </div>
                                )}
                                {msg.role === "user" ? (
                                  <p className="text-sm whitespace-pre-wrap break-words">
                                    {msg.content}
                                  </p>
                                ) : (
                                  <>
                                    <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-p:break-words prose-li:break-words prose-code:break-words">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.content}
                                      </ReactMarkdown>
                                    </div>
                                    {msg.id && msg.content && msg.metadata?.hasActionableInsights && msg.metadata?.insights && (
                                      <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
                                        <button
                                          onClick={() => handleApplyToJourney(msg)}
                                          className="flex items-center gap-2 text-xs font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                                        >
                                          <Wand2 className="w-3.5 h-3.5" />
                                          Apply {msg.metadata.insights.length} suggestion{msg.metadata.insights.length > 1 ? 's' : ''} to Journey
                                        </button>
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                          Review and apply AI suggestions to update your projects, PBIs, or risks
                                        </p>
                                      </div>
                                    )}
                                  </>
                                )}
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
                      <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 flex-shrink-0">
                        <p className="text-xs text-red-800 dark:text-red-200">
                          {error}
                        </p>
                      </div>
                    )}

                    {/* Input Area */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                      <div className="flex gap-2">
                        <textarea
                          ref={inputRef}
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Ask about your journey progress..."
                          disabled={isLoading}
                          className="flex-1 resize-none bg-gray-100 dark:bg-slate-700 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
                          rows={2}
                        />
                        <button
                          onClick={sendMessage}
                          disabled={!inputMessage.trim() || isLoading}
                          className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-gray-700 dark:text-gray-200 p-3 rounded-xl transition-colors disabled:cursor-not-allowed self-end"
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
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Journey Update Modal */}
        {selectedMessageForUpdate && (
          <JourneyUpdateModal
            isOpen={showUpdateModal}
            onClose={() => {
              setShowUpdateModal(false);
              setSelectedMessageForUpdate(null);
            }}
            message={selectedMessageForUpdate}
            assessmentId={assessmentId}
            conversationId={conversationId || ''}
          />
        )}
      </>
    );
  },
);

JourneyChat.displayName = "JourneyChat";

export default JourneyChat;
