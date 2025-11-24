"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Users,
  Timer,
  MessageSquare,
  ListChecks,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Calendar,
  UserCircle,
  ArrowRight,
  Check,
  X as XIcon,
} from "lucide-react";
import { getTemplateById } from "@/lib/retro-templates";
import RetroColumn from "./RetroColumn";
import { RetroCardData } from "./RetroCard";
import { createClient } from "@/lib/supabase/client";

interface RetroData {
  id: string;
  project_id: string;
  sprint_id?: string;
  template_id: string;
  title: string;
  status: string;
  facilitator_id?: string;
  facilitator_name?: string;
  created_at: string;
  completed_at?: string;
  metadata: any;
}

interface RetroBoardProps {
  retroId: string;
  projectId: string;
  currentUserId: string;
  currentUserName: string;
  onBack?: () => void;
}

export default function RetroBoard({
  retroId,
  projectId,
  currentUserId,
  currentUserName,
  onBack,
}: RetroBoardProps) {
  const [retro, setRetro] = useState<RetroData | null>(null);
  const [cards, setCards] = useState<RetroCardData[]>([]);
  const [votes, setVotes] = useState<any[]>([]);
  const [actions, setActions] = useState<any[]>([]);
  const [previousOpenActions, setPreviousOpenActions] = useState<any[]>([]);
  const [shoutouts, setShoutouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"board" | "actions">(
    "board"
  );
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showTimerComplete, setShowTimerComplete] = useState(false);
  const [showAppreciationForm, setShowAppreciationForm] = useState(false);
  const [showRecommendationForm, setShowRecommendationForm] = useState(false);
  const [appreciationData, setAppreciationData] = useState({ toUserName: "", message: "" });
  const [recommendationData, setRecommendationData] = useState({ type: "book", title: "", description: "" });
  const [editingShoutoutId, setEditingShoutoutId] = useState<string | null>(null);
  const [editingRecommendationIndex, setEditingRecommendationIndex] = useState<number | null>(null);
  const [deletingShoutoutId, setDeletingShoutoutId] = useState<string | null>(null);
  const [deletingRecommendationIndex, setDeletingRecommendationIndex] = useState<number | null>(null);
  const [showActionForm, setShowActionForm] = useState(false);
  const [selectedCard, setSelectedCard] = useState<RetroCardData | null>(null);
  const [actionFormData, setActionFormData] = useState({ action_text: "", assigned_to_name: "", due_date: "" });
  const [showConvertToPBIModal, setShowConvertToPBIModal] = useState(false);
  const [selectedActionForPBI, setSelectedActionForPBI] = useState<any | null>(null);
  const [pbiFormData, setPBIFormData] = useState({ title: "", description: "", priority: 3, story_points: 0 });
  const [showCompleteRetroModal, setShowCompleteRetroModal] = useState(false);

  const template = retro ? getTemplateById(retro.template_id) : null;
  const supabase = createClient();

  // Calculate user votes
  const userVotedCardIds = new Set(
    votes.filter((v) => v.user_id === currentUserId).map((v) => v.card_id)
  );
  const userVotes = userVotedCardIds.size;
  const maxVotes = template?.maxVotesPerPerson || 5;

  useEffect(() => {
    fetchRetroData();
  }, [retroId]);

  // Timer countdown effect
  useEffect(() => {
    if (!isTimerRunning) return;

    if (timerMinutes === 0 && timerSeconds === 0) {
      // Timer just finished!
      console.log('[RetroBoard] Timer reached 0:00, triggering celebration');
      setIsTimerRunning(false);
      setShowTimerComplete(true);

      // Play alarm sound
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
      audio.play().catch(e => console.log('Audio play failed:', e));

      // Hide after 1 minute
      setTimeout(() => {
        console.log('[RetroBoard] Hiding timer celebration after 1 minute');
        setShowTimerComplete(false);
      }, 60000);

      // Update database
      updateTimerInDatabase(0, 0, false);
      return;
    }

    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else if (timerMinutes > 0) {
          setTimerMinutes((m) => m - 1);
          return 59;
        }
        return 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, timerMinutes, timerSeconds]);

  const playTimerSound = () => {
    // Play alarm sound
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const showTimerAlert = () => {
    console.log('[RetroBoard] Timer complete! Showing celebration...');
    // Visual alert with animation
    setShowTimerComplete(true);

    // Hide after 1 minute
    setTimeout(() => {
      console.log('[RetroBoard] Hiding timer celebration after 1 minute');
      setShowTimerComplete(false);
    }, 60000);

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Retrospective Timer', {
        body: 'Time is up!',
        icon: '⏰',
      });
    }
  };

  // Set up realtime subscriptions
  useEffect(() => {
    if (!retroId) return;

    console.log('[RetroBoard] Setting up realtime subscriptions...');

    // Subscribe to cards changes
    const cardsChannel = supabase
      .channel(`retro-cards-${retroId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'retro_cards',
          filter: `retro_id=eq.${retroId}`,
        },
        (payload) => {
          console.log('[RetroBoard] Cards change:', payload);

          if (payload.eventType === 'INSERT') {
            setCards((prev) => [...prev, payload.new as RetroCardData]);
          } else if (payload.eventType === 'UPDATE') {
            setCards((prev) =>
              prev.map((card) =>
                card.id === payload.new.id ? (payload.new as RetroCardData) : card
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCards((prev) => prev.filter((card) => card.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('[RetroBoard] Cards subscription status:', status);
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    // Subscribe to votes changes
    const votesChannel = supabase
      .channel(`retro-votes-${retroId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'retro_votes',
        },
        async (payload) => {
          console.log('[RetroBoard] Votes change:', payload);

          if (payload.eventType === 'INSERT') {
            setVotes((prev) => [...prev, payload.new]);
            // Update card vote count
            setCards((prev) =>
              prev.map((card) =>
                card.id === payload.new.card_id
                  ? { ...card, votes: card.votes + 1 }
                  : card
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setVotes((prev) => prev.filter((v) => v.id !== payload.old.id));
            // Update card vote count
            setCards((prev) =>
              prev.map((card) =>
                card.id === payload.old.card_id
                  ? { ...card, votes: Math.max(0, card.votes - 1) }
                  : card
              )
            );
          }
        }
      )
      .subscribe();

    // Subscribe to retro status changes
    const retroChannel = supabase
      .channel(`retro-${retroId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'retrospectives',
          filter: `id=eq.${retroId}`,
        },
        (payload) => {
          console.log('[RetroBoard] Retro change:', payload);
          const newRetro = payload.new as RetroData;
          setRetro(newRetro);

          // Sync timer from metadata
          if (newRetro.metadata?.timer) {
            const { minutes, seconds, isRunning, startTime } = newRetro.metadata.timer;

            if (isRunning && startTime) {
              // Calculate elapsed time
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              const totalSeconds = minutes * 60 + seconds;
              const remaining = Math.max(0, totalSeconds - elapsed);

              const newMinutes = Math.floor(remaining / 60);
              const newSeconds = remaining % 60;

              // Check if timer just completed
              if (remaining === 0 && (timerMinutes > 0 || timerSeconds > 0)) {
                console.log('[RetroBoard] Timer completed via realtime sync, showing celebration');
                setShowTimerComplete(true);

                // Play alarm sound
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');
                audio.play().catch(e => console.log('Audio play failed:', e));

                // Hide after 1 minute
                setTimeout(() => {
                  console.log('[RetroBoard] Hiding timer celebration after 1 minute');
                  setShowTimerComplete(false);
                }, 60000);
              }

              setTimerMinutes(newMinutes);
              setTimerSeconds(newSeconds);
              setIsTimerRunning(remaining > 0);
            } else {
              setTimerMinutes(minutes || 0);
              setTimerSeconds(seconds || 0);
              setIsTimerRunning(false);
            }
          }
        }
      )
      .subscribe();

    // Subscribe to shoutouts changes
    const shoutoutsChannel = supabase
      .channel(`retro-shoutouts-${retroId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'retro_shoutouts',
          filter: `retro_id=eq.${retroId}`,
        },
        (payload) => {
          console.log('[RetroBoard] Shoutouts change:', payload);

          if (payload.eventType === 'INSERT') {
            setShoutouts((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setShoutouts((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      console.log('[RetroBoard] Cleaning up realtime subscriptions...');
      supabase.removeChannel(cardsChannel);
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(retroChannel);
      supabase.removeChannel(shoutoutsChannel);
    };
  }, [retroId, supabase]);

  const fetchRetroData = async () => {
    try {
      const response = await fetch(`/api/retro/${retroId}`);
      if (!response.ok) throw new Error("Failed to fetch retro");

      const data = await response.json();
      setRetro(data.retrospective);
      setCards(data.cards || []);
      setActions(data.actions || []);
      setPreviousOpenActions(data.previousOpenActions || []);
      setShoutouts(data.shoutouts || []);

      // Fetch votes separately
      const votesResponse = await fetch(`/api/retro/${retroId}/votes`);
      if (votesResponse.ok) {
        const votesData = await votesResponse.json();
        setVotes(votesData || []);
      }
    } catch (error) {
      console.error("[RetroBoard] Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (columnId: string, content: string) => {
    try {
      // Find the column to get its color
      const column = template?.columns.find(col => col.id === columnId);

      // Extract base color from column color classes
      // e.g., "bg-green-100 dark:bg-green-900/20" -> "green"
      let cardColor = "yellow";
      if (column?.color) {
        if (column.color.includes("green")) cardColor = "green";
        else if (column.color.includes("blue")) cardColor = "blue";
        else if (column.color.includes("red")) cardColor = "red";
        else if (column.color.includes("pink")) cardColor = "pink";
        else if (column.color.includes("purple")) cardColor = "purple";
        else if (column.color.includes("orange")) cardColor = "orange";
        else if (column.color.includes("yellow")) cardColor = "yellow";
      }

      const response = await fetch(`/api/retro/${retroId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          column_id: columnId,
          content,
          author_id: currentUserId,
          author_name: currentUserName,
          color: cardColor,
          position_x: 0,
          position_y: 0,
        }),
      });

      if (!response.ok) throw new Error("Failed to add card");

      const newCard = await response.json();
      setCards((prev) => [...prev, newCard]);
    } catch (error) {
      console.error("[RetroBoard] Error adding card:", error);
    }
  };

  const handleVote = async (cardId: string) => {
    if (userVotes >= maxVotes) return;

    try {
      const response = await fetch(`/api/retro/${retroId}/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId,
          userId: currentUserId,
          userName: currentUserName,
        }),
      });

      if (!response.ok) throw new Error("Failed to vote");

      const newVote = await response.json();
      setVotes((prev) => [...prev, newVote]);

      // Update card votes count optimistically
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, votes: card.votes + 1 } : card
        )
      );
    } catch (error) {
      console.error("[RetroBoard] Error voting:", error);
    }
  };

  const handleUnvote = async (cardId: string) => {
    try {
      const response = await fetch(
        `/api/retro/${retroId}/votes?cardId=${cardId}&userId=${currentUserId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to unvote");

      setVotes((prev) =>
        prev.filter((v) => !(v.card_id === cardId && v.user_id === currentUserId))
      );

      // Update card votes count optimistically
      setCards((prev) =>
        prev.map((card) =>
          card.id === cardId ? { ...card, votes: card.votes - 1 } : card
        )
      );
    } catch (error) {
      console.error("[RetroBoard] Error unvoting:", error);
    }
  };

  const handleEditCard = async (cardId: string, content: string) => {
    try {
      const response = await fetch(`/api/retro/${retroId}/cards`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, content }),
      });

      if (!response.ok) throw new Error("Failed to edit card");

      const updatedCard = await response.json();
      setCards((prev) =>
        prev.map((card) => (card.id === cardId ? updatedCard : card))
      );
    } catch (error) {
      console.error("[RetroBoard] Error editing card:", error);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      const response = await fetch(
        `/api/retro/${retroId}/cards?cardId=${cardId}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete card");

      setCards((prev) => prev.filter((card) => card.id !== cardId));
    } catch (error) {
      console.error("[RetroBoard] Error deleting card:", error);
    }
  };

  const handleCompleteRetro = async () => {
    try {
      const response = await fetch(`/api/retro/${retroId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          completed_at: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("Failed to complete retro");

      const updated = await response.json();
      setRetro(updated);
      setShowCompleteRetroModal(false);

      // Navigate back to project page after completing retro
      if (onBack) {
        onBack();
      }
    } catch (error) {
      console.error("[RetroBoard] Error completing retro:", error);
      alert("Failed to complete retrospective. Please try again.");
    }
  };

  const updateTimerInDatabase = async (minutes: number, seconds: number, running: boolean) => {
    try {
      const metadata = {
        ...(retro?.metadata || {}),
        timer: {
          minutes,
          seconds,
          isRunning: running,
          startTime: running ? Date.now() : null,
        },
      };

      await fetch(`/api/retro/${retroId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata }),
      });
    } catch (error) {
      console.error("[RetroBoard] Error updating timer:", error);
    }
  };

  const handleStartTimer = (minutes: number) => {
    setTimerMinutes(minutes - 1);
    setTimerSeconds(59);
    setIsTimerRunning(true);
    setShowTimerModal(false);
    updateTimerInDatabase(minutes - 1, 59, true);
  };

  const handleAdjustTimer = (adjustment: number) => {
    const newMinutes = Math.max(0, timerMinutes + adjustment);
    setTimerMinutes(newMinutes);
    updateTimerInDatabase(newMinutes, timerSeconds, isTimerRunning);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
    updateTimerInDatabase(timerMinutes, timerSeconds, false);
  };

  const handleResumeTimer = () => {
    setIsTimerRunning(true);
    updateTimerInDatabase(timerMinutes, timerSeconds, true);
  };

  const handleResetTimer = () => {
    setTimerMinutes(0);
    setTimerSeconds(0);
    setIsTimerRunning(false);
    updateTimerInDatabase(0, 0, false);
  };

  const handleAddAppreciation = async () => {
    if (!appreciationData.toUserName.trim() || !appreciationData.message.trim()) return;

    try {
      const response = await fetch(`/api/retro/${retroId}/shoutouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_user_name: currentUserName,
          to_user_name: appreciationData.toUserName.trim(),
          message: appreciationData.message.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to add appreciation");

      const newShoutout = await response.json();
      // Optimistically add to UI (realtime will also update)
      setShoutouts((prev) => [newShoutout, ...prev]);

      // Reset form
      setAppreciationData({ toUserName: "", message: "" });
      setShowAppreciationForm(false);
    } catch (error) {
      console.error("[RetroBoard] Error adding appreciation:", error);
    }
  };

  const handleAddRecommendation = async () => {
    if (!recommendationData.title.trim()) return;

    try {
      const newRecommendation = {
        type: recommendationData.type,
        title: recommendationData.title.trim(),
        description: recommendationData.description.trim(),
        recommended_by: currentUserName,
      };

      const recommendations = [
        ...(retro?.metadata?.recommendations || []),
        newRecommendation,
      ];

      const response = await fetch(`/api/retro/${retroId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...retro?.metadata,
            recommendations,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to add recommendation");

      const updatedRetro = await response.json();
      // Immediately update local state
      setRetro(updatedRetro);

      // Reset form
      setRecommendationData({ type: "book", title: "", description: "" });
      setShowRecommendationForm(false);
    } catch (error) {
      console.error("[RetroBoard] Error adding recommendation:", error);
    }
  };

  const handleDeleteShoutout = async () => {
    if (!deletingShoutoutId) return;

    try {
      const response = await fetch(`/api/retro/${retroId}/shoutouts?shoutoutId=${deletingShoutoutId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete appreciation");

      setShoutouts((prev) => prev.filter((s) => s.id !== deletingShoutoutId));
      setDeletingShoutoutId(null);
    } catch (error) {
      console.error("[RetroBoard] Error deleting appreciation:", error);
      setDeletingShoutoutId(null);
    }
  };

  const handleDeleteRecommendation = async () => {
    if (deletingRecommendationIndex === null) return;

    try {
      const recommendations = [...(retro?.metadata?.recommendations || [])];
      recommendations.splice(deletingRecommendationIndex, 1);

      const response = await fetch(`/api/retro/${retroId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...retro?.metadata,
            recommendations,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to delete recommendation");

      const updatedRetro = await response.json();
      setRetro(updatedRetro);
      setDeletingRecommendationIndex(null);
    } catch (error) {
      console.error("[RetroBoard] Error deleting recommendation:", error);
      setDeletingRecommendationIndex(null);
    }
  };

  // Action handlers
  const handleCreateActionFromCard = (card: RetroCardData) => {
    setSelectedCard(card);
    setActionFormData({ action_text: card.content, assigned_to_name: "", due_date: "" });
    setShowActionForm(true);
  };

  const handleAddAction = async () => {
    if (!actionFormData.action_text.trim()) return;

    try {
      const response = await fetch(`/api/retro/${retroId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_id: selectedCard?.id || null,
          action_text: actionFormData.action_text,
          assigned_to_name: actionFormData.assigned_to_name || null,
          due_date: actionFormData.due_date || null,
        }),
      });

      if (!response.ok) throw new Error("Failed to create action");

      const newAction = await response.json();
      setActions((prev) => [newAction, ...prev]);
      setShowActionForm(false);
      setSelectedCard(null);
      setActionFormData({ action_text: "", assigned_to_name: "", due_date: "" });
    } catch (error) {
      console.error("[RetroBoard] Error creating action:", error);
    }
  };

  const handleToggleActionStatus = async (actionId: string, currentStatus: string) => {
    const newStatus = currentStatus === "open" ? "completed" : "open";

    try {
      const response = await fetch(`/api/retro/${retroId}/actions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId, status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update action");

      const updatedAction = await response.json();
      setActions((prev) => prev.map((a) => (a.id === actionId ? updatedAction : a)));
    } catch (error) {
      console.error("[RetroBoard] Error updating action:", error);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    try {
      const response = await fetch(`/api/retro/${retroId}/actions?actionId=${actionId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete action");

      setActions((prev) => prev.filter((a) => a.id !== actionId));
    } catch (error) {
      console.error("[RetroBoard] Error deleting action:", error);
    }
  };

  const handleConvertActionToPBI = (action: any) => {
    setSelectedActionForPBI(action);
    setPBIFormData({
      title: action.action_text,
      description: `Action from retrospective: ${retro?.title}\n\n${action.action_text}`,
      priority: 3,
      story_points: 0,
    });
    setShowConvertToPBIModal(true);
  };

  const handleCreatePBI = async () => {
    if (!selectedActionForPBI || !pbiFormData.title.trim()) return;

    try {
      // Create PBI in the project backlog
      const response = await fetch(`/api/projects/${projectId}/pbis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pbiFormData.title,
          description: pbiFormData.description,
          item_type: "user_story",
          priority: pbiFormData.priority,
          story_points: pbiFormData.story_points || null,
          status: "new",
        }),
      });

      if (!response.ok) throw new Error("Failed to create PBI");

      // Optionally mark the action as completed
      await handleToggleActionStatus(selectedActionForPBI.id, selectedActionForPBI.status);

      setShowConvertToPBIModal(false);
      setSelectedActionForPBI(null);
      setPBIFormData({ title: "", description: "", priority: 3, story_points: 0 });

      // Show success message
      alert("PBI created successfully in your product backlog!");
    } catch (error) {
      console.error("[RetroBoard] Error creating PBI:", error);
      alert("Failed to create PBI. Please try again.");
    }
  };

  const handleEditShoutout = (shoutoutId: string) => {
    const shoutout = shoutouts.find((s) => s.id === shoutoutId);
    if (shoutout) {
      setAppreciationData({
        toUserName: shoutout.to_user_name,
        message: shoutout.message,
      });
      setEditingShoutoutId(shoutoutId);
      setShowAppreciationForm(true);
    }
  };

  const handleUpdateShoutout = async () => {
    if (!editingShoutoutId || !appreciationData.toUserName.trim() || !appreciationData.message.trim()) return;

    try {
      // Delete old and create new (since we don't have an update endpoint)
      await fetch(`/api/retro/${retroId}/shoutouts?shoutoutId=${editingShoutoutId}`, {
        method: "DELETE",
      });

      const response = await fetch(`/api/retro/${retroId}/shoutouts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_user_name: currentUserName,
          to_user_name: appreciationData.toUserName.trim(),
          message: appreciationData.message.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to update appreciation");

      const newShoutout = await response.json();
      setShoutouts((prev) => prev.map((s) => (s.id === editingShoutoutId ? newShoutout : s)));

      // Reset form
      setAppreciationData({ toUserName: "", message: "" });
      setShowAppreciationForm(false);
      setEditingShoutoutId(null);
    } catch (error) {
      console.error("[RetroBoard] Error updating appreciation:", error);
    }
  };

  const handleEditRecommendation = (index: number) => {
    const rec = retro?.metadata?.recommendations?.[index];
    if (rec) {
      setRecommendationData({
        type: rec.type,
        title: rec.title,
        description: rec.description || "",
      });
      setEditingRecommendationIndex(index);
      setShowRecommendationForm(true);
    }
  };

  const handleUpdateRecommendation = async () => {
    if (editingRecommendationIndex === null || !recommendationData.title.trim()) return;

    try {
      const recommendations = [...(retro?.metadata?.recommendations || [])];
      recommendations[editingRecommendationIndex] = {
        type: recommendationData.type,
        title: recommendationData.title.trim(),
        description: recommendationData.description.trim(),
        recommended_by: recommendations[editingRecommendationIndex].recommended_by,
      };

      const response = await fetch(`/api/retro/${retroId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...retro?.metadata,
            recommendations,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to update recommendation");

      const updatedRetro = await response.json();
      setRetro(updatedRetro);

      // Reset form
      setRecommendationData({ type: "book", title: "", description: "" });
      setShowRecommendationForm(false);
      setEditingRecommendationIndex(null);
    } catch (error) {
      console.error("[RetroBoard] Error updating recommendation:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!retro || !template) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 dark:text-gray-400">
        Retrospective not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-6">
          {/* Mobile Header Layout */}
          <div className="md:hidden space-y-3">
            {/* Title row with back button */}
            <div className="flex items-start gap-2">
              {onBack && (
                <button
                  onClick={onBack}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                  {retro.title}
                </h1>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {template.icon} {template.name}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      retro.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    }`}
                  >
                    {retro.status === "completed" ? "Completed" : "In Progress"}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Realtime Status */}
              <div
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg flex-shrink-0 ${
                  isRealtimeConnected
                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {isRealtimeConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              </div>

              {/* Timer */}
              {(timerMinutes > 0 || timerSeconds > 0 || isTimerRunning) && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg font-mono text-sm font-bold flex-shrink-0 ${
                    timerMinutes === 0 && timerSeconds <= 10 && isTimerRunning
                      ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 animate-pulse"
                      : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">
                    {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                  </span>
                  <div className="flex gap-0.5">
                    {isTimerRunning ? (
                      <button onClick={handlePauseTimer} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded" title="Pause">
                        <Pause className="w-3 h-3" />
                      </button>
                    ) : (
                      <button onClick={handleResumeTimer} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded" title="Resume">
                        <Play className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={handleResetTimer} className="p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded" title="Reset">
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Votes */}
              {template.votingEnabled && (
                <div className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-lg flex-shrink-0">
                  Votes: {userVotes}/{maxVotes}
                </div>
              )}

              {/* Complete Button */}
              {retro.status !== "completed" && (
                <button
                  onClick={() => setShowCompleteRetroModal(true)}
                  className="ml-auto flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                >
                  <CheckCircle className="w-3 h-3" />
                  Complete
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("board")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === "board"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <Timer className="w-4 h-4" />
                Board
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === "actions"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                <ListChecks className="w-4 h-4" />
                Actions ({actions.length})
              </button>
            </div>
          </div>

          {/* Desktop Header Layout */}
          <div className="hidden md:block">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                {onBack && (
                  <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors mt-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {retro.title}
                  </h1>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {template.icon} {template.name}
                    </span>
                    {retro.facilitator_name && (
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {retro.facilitator_name}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        retro.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {retro.status === "completed" ? "Completed" : "In Progress"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 flex-wrap justify-end">
              {/* Realtime Status Indicator */}
              <div
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                  isRealtimeConnected
                    ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                }`}
                title={isRealtimeConnected ? "Live updates enabled" : "Connecting..."}
              >
                {isRealtimeConnected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Connecting...</span>
                  </>
                )}
              </div>

              {/* Timer Display */}
              {(timerMinutes > 0 || timerSeconds > 0 || isTimerRunning) && (
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-mono text-lg font-bold ${
                    timerMinutes === 0 && timerSeconds <= 10 && isTimerRunning
                      ? "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 animate-pulse"
                      : "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <button
                    onClick={() => handleAdjustTimer(-1)}
                    className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                    title="Decrease 1 minute"
                    disabled={timerMinutes === 0}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span>
                    {String(timerMinutes).padStart(2, "0")}:{String(timerSeconds).padStart(2, "0")}
                  </span>
                  <button
                    onClick={() => handleAdjustTimer(1)}
                    className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                    title="Increase 1 minute"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  {isTimerRunning ? (
                    <button
                      onClick={handlePauseTimer}
                      className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                      title="Pause"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeTimer}
                      className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                      title="Resume"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleResetTimer}
                    className="p-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded transition-colors"
                    title="Reset"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {template.votingEnabled && (
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-3 py-2 rounded-lg">
                  Votes: {userVotes} / {maxVotes}
                </div>
              )}

              {retro.status !== "completed" && (
                <button
                  onClick={() => setShowCompleteRetroModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  Complete Retro
                </button>
              )}
            </div>
          </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveTab("board")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "board"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                <Timer className="w-4 h-4" />
                Board
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "actions"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                <ListChecks className="w-4 h-4" />
                Actions ({actions.length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <AnimatePresence mode="wait">
          {activeTab === "board" && (
            <motion.div
              key="board"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Mobile: Single column stacked */}
              <div className="md:hidden space-y-4">
                {template.columns.map((column) => (
                  <RetroColumn
                    key={column.id}
                    column={column}
                    cards={cards.filter((card) => card.column_id === column.id)}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    userVotes={userVotes}
                    maxVotes={maxVotes}
                    userVotedCardIds={userVotedCardIds}
                    onAddCard={handleAddCard}
                    onVote={handleVote}
                    onUnvote={handleUnvote}
                    onEditCard={handleEditCard}
                    onDeleteCard={handleDeleteCard}
                    onConvertToAction={handleCreateActionFromCard}
                  />
                ))}
              </div>

              {/* Desktop: Multi-column grid */}
              <div
                className="hidden md:grid gap-6"
                style={{
                  gridTemplateColumns: `repeat(${template.columns.length}, minmax(300px, 1fr))`,
                }}
              >
                {template.columns.map((column) => (
                  <RetroColumn
                    key={column.id}
                    column={column}
                    cards={cards.filter((card) => card.column_id === column.id)}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    userVotes={userVotes}
                    maxVotes={maxVotes}
                    userVotedCardIds={userVotedCardIds}
                    onAddCard={handleAddCard}
                    onVote={handleVote}
                    onUnvote={handleUnvote}
                    onEditCard={handleEditCard}
                    onDeleteCard={handleDeleteCard}
                    onConvertToAction={handleCreateActionFromCard}
                  />
                ))}
              </div>

              {/* Appreciations & Recommendations Section */}
              {(template.hasAppreciations || template.hasRecommendations) && (
                <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Appreciations */}
                  {template.hasAppreciations && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">💖</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Team Appreciations
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Shout out to teammates who made a difference
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {shoutouts.map((shoutout) => (
                          <div
                            key={shoutout.id}
                            className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">👏</span>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                                  {shoutout.from_user_name} → {shoutout.to_user_name}
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {shoutout.message}
                                </p>
                              </div>
                              {shoutout.from_user_name === currentUserName && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditShoutout(shoutout.id)}
                                    className="p-1 hover:bg-pink-100 dark:hover:bg-pink-900/30 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingShoutoutId(shoutout.id)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add Appreciation Form */}
                        {showAppreciationForm ? (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-pink-300 dark:border-pink-700 space-y-3"
                          >
                            <input
                              type="text"
                              value={appreciationData.toUserName}
                              onChange={(e) => setAppreciationData(prev => ({ ...prev, toUserName: e.target.value }))}
                              placeholder="Who do you want to appreciate?"
                              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              autoFocus
                            />
                            <textarea
                              value={appreciationData.message}
                              onChange={(e) => setAppreciationData(prev => ({ ...prev, message: e.target.value }))}
                              placeholder="What do you want to say?"
                              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={editingShoutoutId ? handleUpdateShoutout : handleAddAppreciation}
                                disabled={!appreciationData.toUserName.trim() || !appreciationData.message.trim()}
                                className="flex-1 px-3 py-2 bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded text-sm font-medium disabled:cursor-not-allowed"
                              >
                                {editingShoutoutId ? "Update Appreciation" : "Add Appreciation"}
                              </button>
                              <button
                                onClick={() => {
                                  setShowAppreciationForm(false);
                                  setAppreciationData({ toUserName: "", message: "" });
                                  setEditingShoutoutId(null);
                                }}
                                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => setShowAppreciationForm(true)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Appreciation</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {template.hasRecommendations && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🎬</span>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Recommendations
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Share books, shows, podcasts, or music
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(retro?.metadata?.recommendations || []).map((rec: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl">
                                {rec.type === "book"
                                  ? "📚"
                                  : rec.type === "show"
                                  ? "📺"
                                  : rec.type === "podcast"
                                  ? "🎙️"
                                  : rec.type === "music"
                                  ? "🎵"
                                  : "⭐"}
                              </span>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white font-semibold mb-1">
                                  {rec.title}
                                </p>
                                {rec.description && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {rec.description}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  Recommended by {rec.recommended_by}
                                </p>
                              </div>
                              {rec.recommended_by === currentUserName && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditRecommendation(idx)}
                                    className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                                  </button>
                                  <button
                                    onClick={() => setDeletingRecommendationIndex(idx)}
                                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Add Recommendation Form */}
                        {showRecommendationForm ? (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-yellow-300 dark:border-yellow-700 space-y-3"
                          >
                            <select
                              value={recommendationData.type}
                              onChange={(e) => setRecommendationData(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                            >
                              <option value="book">📚 Book</option>
                              <option value="show">📺 Show/Movie</option>
                              <option value="podcast">🎙️ Podcast</option>
                              <option value="music">🎵 Music</option>
                              <option value="other">⭐ Other</option>
                            </select>
                            <input
                              type="text"
                              value={recommendationData.title}
                              onChange={(e) => setRecommendationData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Title"
                              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                              autoFocus
                            />
                            <textarea
                              value={recommendationData.description}
                              onChange={(e) => setRecommendationData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Why do you recommend it? (optional)"
                              className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={editingRecommendationIndex !== null ? handleUpdateRecommendation : handleAddRecommendation}
                                disabled={!recommendationData.title.trim()}
                                className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded text-sm font-medium disabled:cursor-not-allowed"
                              >
                                {editingRecommendationIndex !== null ? "Update Recommendation" : "Add Recommendation"}
                              </button>
                              <button
                                onClick={() => {
                                  setShowRecommendationForm(false);
                                  setRecommendationData({ type: "book", title: "", description: "" });
                                  setEditingRecommendationIndex(null);
                                }}
                                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                              >
                                Cancel
                              </button>
                            </div>
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => setShowRecommendationForm(true)}
                            className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add Recommendation</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "actions" && (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Action Items
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Convert retro insights into actionable tasks
                    </p>
                  </div>
                  <button
                    onClick={() => setShowActionForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    New Action
                  </button>
                </div>

                {/* Action Items List */}
                <div className="space-y-3">
                  {actions.length === 0 ? (
                    <div className="text-center py-12">
                      <ListChecks className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" />
                      <p className="text-gray-600 dark:text-gray-400">No action items yet</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                        Create actions from retro cards or add new ones
                      </p>
                    </div>
                  ) : (
                    actions.map((action) => (
                      <motion.div
                        key={action.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleActionStatus(action.id, action.status)}
                            className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              action.status === "completed"
                                ? "bg-green-600 border-green-600"
                                : "border-gray-300 dark:border-gray-500 hover:border-green-600 dark:hover:border-green-500"
                            }`}
                          >
                            {action.status === "completed" && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </button>

                          <div className="flex-1">
                            <p
                              className={`text-sm font-medium ${
                                action.status === "completed"
                                  ? "line-through text-gray-500 dark:text-gray-400"
                                  : "text-gray-900 dark:text-white"
                              }`}
                            >
                              {action.action_text}
                            </p>

                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                              {action.assigned_to_name && (
                                <div className="flex items-center gap-1">
                                  <UserCircle className="w-3 h-3" />
                                  <span>{action.assigned_to_name}</span>
                                </div>
                              )}
                              {action.due_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(action.due_date).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleConvertActionToPBI(action)}
                              className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                              title="Convert to PBI"
                            >
                              <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteAction(action.id)}
                              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Previous Open Actions */}
                {previousOpenActions.length > 0 && (
                  <div className="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        Open Actions from Previous Retros
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Close the loop on these action items from past retrospectives
                      </p>
                    </div>

                    <div className="space-y-3">
                      {previousOpenActions.map((action) => (
                        <motion.div
                          key={action.id}
                          layout
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-orange-50 dark:bg-orange-900/10 rounded-lg p-4 border-2 border-orange-200 dark:border-orange-800"
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => handleToggleActionStatus(action.id, action.status)}
                              className="mt-1 flex-shrink-0 w-5 h-5 rounded border-2 border-orange-400 dark:border-orange-500 hover:border-green-600 dark:hover:border-green-500 flex items-center justify-center transition-colors"
                            >
                              {action.status === "completed" && (
                                <Check className="w-3 h-3 text-green-600" />
                              )}
                            </button>

                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {action.action_text}
                              </p>

                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                                {action.retrospective?.title && (
                                  <div className="flex items-center gap-1">
                                    <MessageSquare className="w-3 h-3" />
                                    <span className="italic">{action.retrospective.title}</span>
                                  </div>
                                )}
                                {action.assigned_to_name && (
                                  <div className="flex items-center gap-1">
                                    <UserCircle className="w-3 h-3" />
                                    <span>{action.assigned_to_name}</span>
                                  </div>
                                )}
                                {action.due_date && (
                                  <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(action.due_date).toLocaleDateString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleConvertActionToPBI(action)}
                                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                title="Convert to PBI"
                              >
                                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Timer Setup Modal */}
      {showTimerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Set Timer
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Choose a time limit for this activity. Everyone will see the timer and hear
              an alert when time runs out.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {[5, 10, 15, 20, 30].map((minutes) => (
                <button
                  key={minutes}
                  onClick={() => handleStartTimer(minutes)}
                  className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {minutes} min
                </button>
              ))}
              <button
                onClick={() => handleStartTimer(60)}
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors col-span-2"
              >
                1 hour
              </button>
            </div>

            <button
              onClick={() => setShowTimerModal(false)}
              className="w-full py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* Delete Appreciation Confirmation */}
      {deletingShoutoutId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Appreciation?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this appreciation? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteShoutout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingShoutoutId(null)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Recommendation Confirmation */}
      {deletingRecommendationIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-sm w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Recommendation?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this recommendation? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteRecommendation}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingRecommendationIndex(null)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Create Action Modal */}
      {showActionForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-lg w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {selectedCard ? "Create Action from Card" : "Create New Action"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Action Description *
                </label>
                <textarea
                  value={actionFormData.action_text}
                  onChange={(e) => setActionFormData(prev => ({ ...prev, action_text: e.target.value }))}
                  placeholder="Describe the action to be taken..."
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={actionFormData.assigned_to_name}
                  onChange={(e) => setActionFormData(prev => ({ ...prev, assigned_to_name: e.target.value }))}
                  placeholder="Team member name (optional)"
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={actionFormData.due_date}
                  onChange={(e) => setActionFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddAction}
                disabled={!actionFormData.action_text.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Create Action
              </button>
              <button
                onClick={() => {
                  setShowActionForm(false);
                  setSelectedCard(null);
                  setActionFormData({ action_text: "", assigned_to_name: "", due_date: "" });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Convert to PBI Modal */}
      {showConvertToPBIModal && selectedActionForPBI && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Convert Action to Product Backlog Item
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create a new PBI from this action item
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={pbiFormData.title}
                  onChange={(e) => setPBIFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="PBI title..."
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={pbiFormData.description}
                  onChange={(e) => setPBIFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description..."
                  className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={pbiFormData.priority}
                    onChange={(e) => setPBIFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                    className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>1 - Critical</option>
                    <option value={2}>2 - High</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Story Points
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={pbiFormData.story_points}
                    onChange={(e) => setPBIFormData(prev => ({ ...prev, story_points: Number(e.target.value) }))}
                    placeholder="Optional"
                    className="w-full p-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePBI}
                disabled={!pbiFormData.title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Create PBI
              </button>
              <button
                onClick={() => {
                  setShowConvertToPBIModal(false);
                  setSelectedActionForPBI(null);
                  setPBIFormData({ title: "", description: "", priority: 3, story_points: 0 });
                }}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Complete Retro Confirmation Modal */}
      {showCompleteRetroModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Complete Retrospective?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to mark this retrospective as completed? This will:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 mb-6 space-y-2 list-disc list-inside">
              <li>Mark the retro as completed</li>
              <li>Lock the board from further edits</li>
              <li>Make it available in the "Past Retros" view</li>
              <li>Carry open actions to the next retrospective</li>
            </ul>

            <div className="flex gap-3">
              <button
                onClick={handleCompleteRetro}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Complete Retro
              </button>
              <button
                onClick={() => setShowCompleteRetroModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Timer Complete Celebration */}
      <AnimatePresence>
        {showTimerComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            {/* Confetti/celebration overlay */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{
                scale: [0, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.6, times: [0, 0.4, 0.7, 1] }}
              className="bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white rounded-3xl shadow-2xl p-12 max-w-lg text-center"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 1.5,
                }}
                className="text-8xl mb-6"
              >
                ⏰
              </motion.div>
              <h2 className="text-4xl font-bold mb-4">Time's Up!</h2>
              <p className="text-xl mb-6">Great work, team! Time to wrap up this activity.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowTimerComplete(false)}
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-lg hover:bg-gray-100 transition-colors"
              >
                Got it!
              </motion.button>
            </motion.div>

            {/* Animated particles/confetti */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  x: 0,
                  y: 0,
                  scale: 0
                }}
                animate={{
                  opacity: [1, 1, 0],
                  x: Math.random() * 400 - 200,
                  y: Math.random() * -400 - 100,
                  scale: [0, 1, 0.5],
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
              >
                <span className="text-4xl">
                  {['🎉', '✨', '🎊', '⭐', '💫'][i % 5]}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
