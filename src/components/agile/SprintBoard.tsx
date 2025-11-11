'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { PBICard } from './PBICard';
import { SprintHeader } from './SprintHeader';
import { QuickFilters } from './QuickFilters';
import { BurndownChart } from './BurndownChart';
import { EditPBIModal } from './EditPBIModal';
import { AddItemsToSprintModal } from './AddItemsToSprintModal';
import { Clock, AlertCircle, CheckCircle2, Loader2, Plus, List, Layers } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Sprint {
  id: string;
  name: string;
  goal: string;
  sprint_number: number;
  start_date: string;
  end_date: string;
  status: string;
  committed_story_points: number;
  completed_story_points: number;
  scope_creep_story_points?: number;
}

interface PBI {
  id: string;
  title: string;
  description: string;
  item_type: string;
  priority: number;
  story_points: number;
  status: string;
  assigned_to: string;
  sprint_id: string;
  parent_id: string | null;
  tasks?: Task[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  assigned_to: string;
  original_estimate_hours: number;
  remaining_hours: number;
}

interface SprintBoardProps {
  projectId: string;
  sprintId?: string;
}

export function SprintBoard({ projectId, sprintId }: SprintBoardProps) {
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [pbis, setPbis] = useState<PBI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePBI, setActivePBI] = useState<PBI | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [editingPbiId, setEditingPbiId] = useState<string | null>(null);
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [boardView, setBoardView] = useState<'user_stories' | 'tasks'>('user_stories');
  const [showCompleteSprintModal, setShowCompleteSprintModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    assignedTo: '',
    status: '',
    itemType: '',
    blocked: false,
    myItems: false
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserEmail(user?.email || null);
    };
    getUser();
  }, []);

  // Fetch sprint and PBIs
  useEffect(() => {
    fetchSprintData();
  }, [projectId, sprintId]);

  const fetchSprintData = async () => {
    try {
      setLoading(true);

      // If no specific sprint, get active sprint
      let currentSprintId = sprintId;
      if (!currentSprintId) {
        const sprintsResponse = await fetch(`/api/projects/${projectId}/sprints?status=active`);
        const sprintsData = await sprintsResponse.json();
        if (sprintsData.sprints && sprintsData.sprints.length > 0) {
          currentSprintId = sprintsData.sprints[0].id;
          // Convert numeric fields to ensure they're numbers, not strings
          const sprint = sprintsData.sprints[0];
          setSprint({
            ...sprint,
            committed_story_points: Number(sprint.committed_story_points) || 0,
            completed_story_points: Number(sprint.completed_story_points) || 0,
            scope_creep_story_points: sprint.scope_creep_story_points ? Number(sprint.scope_creep_story_points) : 0
          });
        }
      } else {
        // Fetch specific sprint
        const sprintResponse = await fetch(`/api/projects/${projectId}/sprints`);
        const sprintData = await sprintResponse.json();
        const foundSprint = sprintData.sprints.find((s: Sprint) => s.id === currentSprintId);
        if (foundSprint) {
          // Convert numeric fields to ensure they're numbers, not strings
          setSprint({
            ...foundSprint,
            committed_story_points: Number(foundSprint.committed_story_points) || 0,
            completed_story_points: Number(foundSprint.completed_story_points) || 0,
            scope_creep_story_points: foundSprint.scope_creep_story_points ? Number(foundSprint.scope_creep_story_points) : 0
          });
        } else {
          setSprint(null);
        }
      }

      // Fetch PBIs for this sprint
      if (currentSprintId) {
        const pbisResponse = await fetch(`/api/projects/${projectId}/pbis?sprint_id=${currentSprintId}`);
        const pbisData = await pbisResponse.json();

        // Fetch tasks for each PBI
        if (pbisData.pbis && Array.isArray(pbisData.pbis)) {
          const pbisWithTasks = await Promise.all(
            pbisData.pbis.map(async (pbi: PBI) => {
              try {
                const tasksResponse = await fetch(`/api/pbis/${pbi.id}/tasks`);
                const tasksData = await tasksResponse.json();
                return { ...pbi, tasks: tasksData.tasks || [] };
              } catch (error) {
                console.error(`Error fetching tasks for PBI ${pbi.id}:`, error);
                return { ...pbi, tasks: [] };
              }
            })
          );
          setPbis(pbisWithTasks);
        } else {
          setPbis([]);
        }
      } else {
        setPbis([]);
      }
    } catch (error) {
      console.error('Error fetching sprint data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: any) => {
    const pbi = pbis.find(p => p.id === event.active.id);
    setActivePBI(pbi || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePBI(null);

    if (!over) return;

    const pbiId = active.id as string;
    let newStatus = over.id as string;

    // In task view, the drop zone ID is "{userStoryId}-{status}"
    // Extract just the status part
    if (newStatus.includes('-')) {
      const parts = newStatus.split('-');
      newStatus = parts[parts.length - 1]; // Get the last part (status)
    }

    // Update PBI status
    try {
      const response = await fetch(`/api/pbis/${pbiId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        setPbis(prevPbis =>
          prevPbis.map(pbi =>
            pbi.id === pbiId ? { ...pbi, status: newStatus } : pbi
          )
        );
      }
    } catch (error) {
      console.error('Error updating PBI status:', error);
    }
  };

  const handlePBIUpdate = async (pbiId: string, updates: any) => {
    try {
      const response = await fetch(`/api/pbis/${pbiId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        fetchSprintData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating PBI:', error);
    }
  };

  const handleCompleteSprint = async () => {
    if (!sprint) return;

    try {
      // Update sprint status to completed
      const response = await fetch(`/api/projects/${projectId}/sprints/${sprint.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' })
      });

      if (response.ok) {
        // Move incomplete user stories and tasks back to backlog (exclude epics)
        const incompletePbis = pbis.filter(pbi => pbi.status !== 'done' && pbi.item_type !== 'epic');
        await Promise.all(
          incompletePbis.map(pbi =>
            fetch(`/api/pbis/${pbi.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sprint_id: null, status: 'approved' })
            })
          )
        );

        setShowCompleteSprintModal(false);

        // Ask user if they want to start a retrospective
        const startRetro = confirm(
          `Sprint "${sprint.name}" has been completed!\n\nWould you like to start a retrospective for this sprint?`
        );

        if (startRetro) {
          // Navigate to create retrospective page with sprint ID
          window.location.href = `/projects/${projectId}/retro/new?sprintId=${sprint.id}`;
        } else {
          // Just refresh to show updated state
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error completing sprint:', error);
    }
  };

  const handleDeleteSprint = async () => {
    if (!sprint || !confirm('Delete this sprint? All items will be moved back to the backlog. This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/sprints/${sprint.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error deleting sprint:', error);
    }
  };

  // Filter PBIs
  const filteredPbis = pbis.filter(pbi => {
    if (filters.status && pbi.status !== filters.status) return false;
    if (filters.assignedTo && !pbi.assigned_to?.toLowerCase().includes(filters.assignedTo.toLowerCase())) return false;
    if (filters.itemType && pbi.item_type !== filters.itemType) return false;
    if (filters.myItems && pbi.assigned_to !== currentUserEmail) return false;
    return true;
  });

  // Group PBIs by status
  const columns = {
    new: { title: 'To Do', icon: Clock, color: 'gray' },
    in_progress: { title: 'In Progress', icon: Clock, color: 'blue' },
    done: { title: 'Done', icon: CheckCircle2, color: 'green' }
  };

  const getPbisByStatus = (status: string) => {
    return filteredPbis.filter(pbi => pbi.status === status);
  };

  // Droppable Column Component
  function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
      <div
        ref={setNodeRef}
        className={`flex-1 bg-gray-50 dark:bg-slate-900 border-2 ${
          isOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
        } border-t-0 rounded-b-lg p-4 min-h-[500px] space-y-3 transition-colors`}
      >
        {children}
      </div>
    );
  }

  // Debug logging
  console.log('Sprint Board Debug:', {
    totalPbis: pbis.length,
    filteredPbis: filteredPbis.length,
    pbiStatuses: pbis.map(p => ({ id: p.id, title: p.title, status: p.status })),
    todoCount: getPbisByStatus('new').length,
    inProgressCount: getPbisByStatus('in_progress').length,
    doneCount: getPbisByStatus('done').length
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Active Sprint</h3>
        <p className="text-gray-600 dark:text-gray-400">Create a sprint to start tracking work</p>
      </div>
    );
  }

  // Calculate completed story points (only user stories count for velocity)
  const completedStoryPoints = getPbisByStatus('done')
    .filter(pbi => pbi.item_type === 'user_story')
    .reduce((sum, pbi) => sum + (Number(pbi.story_points) || 0), 0);

  // Calculate actual story points from PBIs (only user stories count)
  const actualCommittedStoryPoints = pbis
    .filter(pbi => pbi.item_type === 'user_story')
    .reduce((sum, pbi) => sum + (Number(pbi.story_points) || 0), 0);

  // Create updated sprint object with calculated values
  // Build a clean object to avoid any string concatenation issues
  const sprintWithCalculatedPoints = sprint ? {
    id: sprint.id,
    name: sprint.name,
    goal: sprint.goal,
    sprint_number: sprint.sprint_number,
    start_date: sprint.start_date,
    end_date: sprint.end_date,
    status: sprint.status,
    // Use ONLY our calculated values, not the database values
    committed_story_points: actualCommittedStoryPoints,
    completed_story_points: completedStoryPoints,
    scope_creep_story_points: 0
  } : null;

  const handleSprintUpdate = (sprintId: string, updates: { name?: string; goal?: string }) => {
    setSprint(prev => prev ? { ...prev, ...updates } : null);
  };

  return (
    <div className="space-y-6">
      {/* Sprint Header with Burndown Chart */}
      {sprintWithCalculatedPoints && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <SprintHeader
            sprint={sprintWithCalculatedPoints}
            onComplete={() => setShowCompleteSprintModal(true)}
            onDelete={handleDeleteSprint}
            onUpdate={handleSprintUpdate}
            projectId={projectId}
          />
          <BurndownChart sprint={sprintWithCalculatedPoints} completedStoryPoints={completedStoryPoints} />
        </div>
      )}

      {/* Kanban Board Container with Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Filters and Controls Bar */}
        <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            {/* View Toggle */}
            <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 p-1">
              <button
                onClick={() => setBoardView('user_stories')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  boardView === 'user_stories'
                    ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Layers size={18} />
                User Stories
              </button>
              <button
                onClick={() => setBoardView('tasks')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  boardView === 'tasks'
                    ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <List size={18} />
                Tasks
              </button>
            </div>

            {/* Add Items Button */}
            <button
              onClick={() => setShowAddItemsModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              Add Items to Sprint
            </button>
          </div>

          {/* Quick Filters */}
          <QuickFilters filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Kanban Board */}
        <div className="p-6">
          <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {boardView === 'user_stories' ? (
          // User Stories View - Traditional Kanban
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(columns).map(([status, config]) => {
              const ColumnIcon = config.icon;
              const columnPbis = getPbisByStatus(status).filter(pbi => pbi.item_type === 'user_story');

              return (
                <div key={status} className="flex flex-col">
                  {/* Column Header */}
                  <div className={`bg-${config.color}-50 dark:bg-${config.color}-900/20 border-2 border-${config.color}-200 dark:border-${config.color}-800 rounded-t-lg p-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ColumnIcon className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`} />
                        <h3 className={`font-semibold text-${config.color}-900 dark:text-${config.color}-100`}>
                          {config.title}
                        </h3>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 dark:bg-${config.color}-800 text-${config.color}-800 dark:text-${config.color}-200`}>
                        {columnPbis.length}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {columnPbis.reduce((sum, pbi) => sum + (Number(pbi.story_points) || 0), 0)} points
                    </div>
                  </div>

                  {/* Column Content - Drop Zone */}
                  <DroppableColumn id={status}>
                    {columnPbis.map(pbi => (
                      <PBICard
                        key={pbi.id}
                        pbi={pbi}
                        onUpdate={handlePBIUpdate}
                        onEdit={setEditingPbiId}
                      />
                    ))}
                  </DroppableColumn>
                </div>
              );
            })}
          </div>
        ) : (
          // Tasks View - Grouped by User Story as Swimlanes
          <div className="space-y-6">
            {/* Get all user stories that have tasks */}
            {(() => {
              const userStories = filteredPbis.filter(pbi => pbi.item_type === 'user_story');
              const tasksInSprint = filteredPbis.filter(pbi => pbi.item_type === 'task');

              return userStories.map(userStory => {
                const storyTasks = tasksInSprint.filter(task => task.parent_id === userStory.id);

                if (storyTasks.length === 0) return null;

                return (
                  <div key={userStory.id} className="border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg overflow-hidden">
                    {/* User Story Header (Swimlane) */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-200 dark:border-blue-800 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100">{userStory.title}</h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{userStory.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                            {storyTasks.length} {storyTasks.length === 1 ? 'task' : 'tasks'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                            {userStory.story_points} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Task Columns for this User Story */}
                    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-900">
                      {Object.entries(columns).map(([status, config]) => {
                        const ColumnIcon = config.icon;
                        const columnTasks = storyTasks.filter(task => task.status === status);

                        return (
                          <div key={status} className="flex flex-col">
                            {/* Column Header */}
                            <div className={`bg-${config.color}-50 dark:bg-${config.color}-900/20 border-2 border-${config.color}-200 dark:border-${config.color}-800 rounded-t-lg p-3`}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <ColumnIcon className={`w-4 h-4 text-${config.color}-600 dark:text-${config.color}-400`} />
                                  <h5 className={`text-sm font-semibold text-${config.color}-900 dark:text-${config.color}-100`}>
                                    {config.title}
                                  </h5>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 dark:bg-${config.color}-800 text-${config.color}-800 dark:text-${config.color}-200`}>
                                  {columnTasks.length}
                                </span>
                              </div>
                            </div>

                            {/* Column Content - Drop Zone */}
                            <DroppableColumn id={`${userStory.id}-${status}`}>
                              {columnTasks.map(task => (
                                <PBICard
                                  key={task.id}
                                  pbi={task}
                                  onUpdate={handlePBIUpdate}
                                  onEdit={setEditingPbiId}
                                />
                              ))}
                            </DroppableColumn>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}

        <DragOverlay>
          {activePBI ? (
            <div className="rotate-3 opacity-80">
              <PBICard pbi={activePBI} onUpdate={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
        </div>
      </div>

      {/* Edit PBI Modal */}
      {editingPbiId && (
        <EditPBIModal
          pbiId={editingPbiId}
          projectId={projectId}
          onClose={() => setEditingPbiId(null)}
          onPBIUpdated={() => {
            setEditingPbiId(null);
            fetchSprintData();
          }}
          onPBIDeleted={() => {
            setEditingPbiId(null);
            fetchSprintData();
          }}
        />
      )}

      {/* Add Items to Sprint Modal */}
      {showAddItemsModal && sprint && (
        <AddItemsToSprintModal
          projectId={projectId}
          sprintId={sprint.id}
          onClose={() => setShowAddItemsModal(false)}
          onItemsAdded={() => {
            setShowAddItemsModal(false);
            fetchSprintData();
          }}
        />
      )}

      {/* Complete Sprint Modal */}
      {showCompleteSprintModal && sprint && (() => {
        // Filter to only user stories and tasks (exclude epics which are parent containers)
        const sprintWorkItems = pbis.filter(pbi => pbi.item_type !== 'epic');
        const completedWorkItems = sprintWorkItems.filter(pbi => pbi.status === 'done');
        const incompleteWorkItems = sprintWorkItems.filter(pbi => pbi.status !== 'done');

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-blue-600 dark:bg-blue-700 text-white p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8" />
                  <div>
                    <h2 className="text-2xl font-bold">Complete Sprint</h2>
                    <p className="text-sm text-blue-100 mt-1">{sprint.name}</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Sprint Summary */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sprint Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Total Items:</span>
                      <span className="font-bold text-gray-900 dark:text-white ml-2">
                        {sprintWorkItems.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Completed:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 ml-2">
                        {completedWorkItems.length}
                      </span>
                    </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Story Points:</span>
                    <span className="font-bold text-gray-900 dark:text-white ml-2">
                      {completedStoryPoints} / {actualCommittedStoryPoints}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Completion Rate:</span>
                    <span className="font-bold text-gray-900 dark:text-white ml-2">
                      {actualCommittedStoryPoints > 0
                        ? Math.round((completedStoryPoints / actualCommittedStoryPoints) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

                {/* Incomplete Items Warning */}
                {incompleteWorkItems.length > 0 && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 dark:border-orange-400 rounded-r-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          Incomplete Items ({incompleteWorkItems.length})
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          The following items will be moved back to the backlog:
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {incompleteWorkItems.map(pbi => (
                            <div key={pbi.id} className="flex items-center gap-2 text-sm bg-white dark:bg-slate-800 rounded-lg p-2">
                              <div className={`w-2 h-2 rounded-full ${
                                pbi.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'
                              }`} />
                              <span className="font-medium text-gray-900 dark:text-white">{pbi.title}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                                {pbi.story_points || 0} pts
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {incompleteWorkItems.length === 0 && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 dark:border-green-400 rounded-r-lg p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      <div>
                        <h3 className="font-semibold text-green-900 dark:text-green-100">
                          Perfect Sprint! 🎉
                        </h3>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          All items completed successfully
                        </p>
                      </div>
                    </div>
                  </div>
                )}

              {/* Confirmation Text */}
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>Completing this sprint will:</p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-2">
                  <li>Mark the sprint as completed</li>
                  <li>Move incomplete items back to the backlog</li>
                  <li>Record sprint metrics and velocity</li>
                  <li>Make the sprint available for retrospectives</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900">
              <button
                onClick={() => setShowCompleteSprintModal(false)}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteSprint}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <CheckCircle2 className="w-5 h-5" />
                Complete Sprint
              </button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
