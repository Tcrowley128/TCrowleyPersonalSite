"use client";

import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  Maximize2,
  Minimize2,
  AlertCircle,
  Plus,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface Message {
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

interface AssessmentChatProps {
  assessmentId: string;
}

export interface AssessmentChatHandle {
  openWithMessage: (message: string) => void;
}

const AssessmentChat = forwardRef<AssessmentChatHandle, AssessmentChatProps>(
  ({ assessmentId }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [error, setError] = useState("");
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
      if (isOpen && conversations.length === 0) {
        loadConversationHistory();
      }
    }, [isOpen]);

    const loadConversationHistory = async () => {
      try {
        const response = await fetch(
          `/api/assessment/${assessmentId}/chat`,
        );
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };

    const startNewConversation = () => {
      setConversationId(null);
      setMessages([]);
      setError("");
      setInputMessage("");
    };

    const loadConversation = (conversation: Conversation) => {
      setConversationId(conversation.id);
      setMessages(conversation.messages);
      setError("");
    };

    const sendMessage = async () => {
      await sendMessageWithContent(inputMessage);
    };

    const sendMessageWithContent = async (content: string) => {
      if (!content.trim()) return;

      const userMessage: Message = {
        role: "user",
        content: content.trim(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputMessage("");
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/assessment/${assessmentId}/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: content.trim(),
              conversation_id: conversationId,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        const data = await response.json();

        if (data.success) {
          const assistantMessage: Message = {
            role: "assistant",
            content: data.message,
          };
          setMessages((prev) => [...prev, assistantMessage]);

          if (data.conversation_id && !conversationId) {
            setConversationId(data.conversation_id);
            await loadConversationHistory();
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setError(
          error instanceof Error ? error.message : "Failed to send message. Please try again.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    };

    const suggestedQuestions = [
      "Why was this tool recommended for my company?",
      "What's the best place to start?",
      "How long will implementation take?",
      "What resources do I need?",
      "Can you explain this recommendation in more detail?",
    ];

    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {/* Floating Chat Button */}
        <DialogTrigger asChild>
          <button
            onClick={() => {
              setIsOpen(true);
              setIsExpanded(true);
            }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center gap-2 group"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="max-w-0 overflow-hidden sm:group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-semibold text-sm sm:text-base">
              Ask Tyler's AI
            </span>
          </button>
        </DialogTrigger>

        {/* Chat Dialog Content */}
        <DialogContent
          className={
            isExpanded
              ? "max-w-6xl w-[95vw] h-[95vh] sm:h-[90vh] p-0 gap-0"
              : "max-w-[450px] w-[calc(100vw-2rem)] h-[70vh] sm:h-[600px] p-0 gap-0"
          }
          onPointerDownOutside={(e) => e.preventDefault()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 sm:p-4 flex items-center justify-between flex-shrink-0 rounded-t-lg">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="font-bold text-base sm:text-lg truncate">
                    Tyler's AI Assistant
                  </h3>
                  <p className="text-xs text-blue-100 hidden sm:block">
                    Ask me anything about your assessment
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
                {/* New Conversation Button */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={startNewConversation}
                    className="w-full flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Conversation
                  </button>
                </div>

                {/* Conversations List */}
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
                      <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400 mb-4" />
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Welcome! I'm here to help.
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        I have full context of your assessment results. Ask
                        me anything!
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
                              <div className="text-sm prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-p:break-words prose-li:break-words prose-code:break-words">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
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
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  },
);

AssessmentChat.displayName = "AssessmentChat";

export default AssessmentChat;
