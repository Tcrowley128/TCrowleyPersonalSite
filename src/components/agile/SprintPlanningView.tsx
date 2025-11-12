'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverlay, closestCorners, pointerWithin, PointerSensor, useSensor, useSensors, DragStartEvent, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Loader2, Plus, Calendar, Play, Trash2, Edit2, CalendarPlus, AlertTriangle } from 'lucide-react';
import { SortablePBICard } from './SortablePBICard';
import { ActivateSprintModal } from './ActivateSprintModal';

interface PBI {
  id: string;
  title: string;
  description: string;
  item_type: string;
  priority: number;
  story_points: number;
  status: string;
  assigned_to: string;
  backlog_order: number;
  sprint_id: string | null;
}

interface Sprint {
  id: string;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: string;
  planned_velocity: number | null;
}

interface SprintPlanningViewProps {
  projectId: string;
  activeSprint?: any;
  onStartSprint: (selectedPbiIds: string[], totalStoryPoints: number) => void;
  onRefresh: () => void;
}

export function SprintPlanningView({ projectId, activeSprint, onStartSprint, onRefresh }: SprintPlanningViewProps) {
  const [pbis, setPbis] = useState<PBI[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePBI, setActivePBI] = useState<PBI | null>(null);
  const [showCreateSprint, setShowCreateSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [activatingSprintId, setActivatingSprintId] = useState<string | null>(null);
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch all PBIs
      const pbisResponse = await fetch(`/api/projects/${projectId}/pbis`);
      if (pbisResponse.ok) {
        const pbisData = await pbisResponse.json();
        setPbis(pbisData.pbis || []);
      }

      // Fetch all sprints (including planned ones)
      const sprintsResponse = await fetch(`/api/projects/${projectId}/sprints`);
      if (sprintsResponse.ok) {
        const sprintsData = await sprintsResponse.json();
        setSprints(sprintsData.sprints || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async () => {
    if (!newSprintName.trim()) return;

    try {
      const sprintNumber = sprints.length + 1;
      const response = await fetch(`/api/projects/${projectId}/sprints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSprintName,
          sprint_number: sprintNumber,
          status: 'planned',
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        setNewSprintName('');
        setShowCreateSprint(false);
        fetchData();
      }
    } catch (error) {
      console.error('Error creating sprint:', error);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sprints/${sprintId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setDeletingSprintId(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting sprint:', error);
    }
  };

  const handleSprintActivated = () => {
    setActivatingSprintId(null);
    fetchData();
    onRefresh();
  };

  const handleDragStart = (event: DragStartEvent) => {
    const pbi = pbis.find(p => p.id === event.active.id);
    setActivePBI(pbi || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActivePBI(null);

    if (!over) return;

    const pbiId = active.id as string;
    const overId = over.id as string;

    console.log('Drag ended:', {
      pbiId,
      overId,
      activeId: active.id,
      overIdDuplicate: over.id,
      overData: over.data
    });

    // Find the PBI being dragged
    const draggedPBI = pbis.find(p => p.id === pbiId);
    if (!draggedPBI) {
      console.log('ERROR: Could not find dragged PBI:', pbiId);
      return;
    }

    console.log('Dragged PBI current sprint:', draggedPBI.sprint_id);

    // Determine target sprint ID based on what was dropped on
    let targetSprintId: string | null = null;

    // Check if dropped directly on a droppable container
    if (overId === 'backlog') {
      console.log('Dropped on backlog droppable container');
      targetSprintId = null;
    } else if (overId.startsWith('sprint-')) {
      console.log('Dropped on sprint droppable container:', overId);
      targetSprintId = overId.replace('sprint-', '');
    } else {
      // Dropped on a PBI - need to find which sprint container this PBI belongs to
      console.log('Dropped on a PBI card:', overId);
      const targetPBI = pbis.find(p => p.id === overId);

      if (targetPBI) {
        targetSprintId = targetPBI.sprint_id || null;
        console.log('Target PBI belongs to sprint:', targetSprintId);
      } else {
        // Check if the overId might be a sprint container we missed
        if (overId.includes('sprint')) {
          console.log('Assuming this is a sprint container');
          const match = overId.match(/sprint-(.+)/);
          if (match) {
            targetSprintId = match[1];
          }
        } else {
          console.log('ERROR: Could not determine target - invalid drop');
          return;
        }
      }
    }

    console.log('Target sprint ID determined:', targetSprintId);
    console.log('Current sprint vs Target:', {
      current: draggedPBI.sprint_id,
      target: targetSprintId,
      areEqual: draggedPBI.sprint_id === targetSprintId
    });

    // Only update if the sprint assignment changed
    if (draggedPBI.sprint_id === targetSprintId) {
      console.log('No sprint change needed - already in target location', {
        currentSprint: draggedPBI.sprint_id,
        targetSprint: targetSprintId
      });
      return;
    }

    console.log('✅ Updating PBI sprint assignment:', {
      pbiId,
      pbiTitle: draggedPBI.title,
      from: draggedPBI.sprint_id || 'backlog',
      to: targetSprintId || 'backlog'
    });

    // Update PBI sprint assignment
    try {
      const response = await fetch(`/api/pbis/${pbiId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sprint_id: targetSprintId })
      });

      if (response.ok) {
        console.log('Successfully updated PBI sprint');
        fetchData();
      } else {
        console.error('Failed to update PBI:', response.status);
      }
    } catch (error) {
      console.error('Error updating PBI:', error);
    }
  };

  const getSprintPBIs = (sprintId: string) => {
    return pbis.filter(pbi => pbi.sprint_id === sprintId && pbi.item_type === 'user_story')
      .sort((a, b) => a.backlog_order - b.backlog_order);
  };

  const getBacklogPBIs = () => {
    return pbis.filter(pbi => !pbi.sprint_id && pbi.item_type === 'user_story')
      .sort((a, b) => a.backlog_order - b.backlog_order);
  };

  const getTotalStoryPoints = (pbiList: PBI[]) => {
    return pbiList.reduce((sum, pbi) => sum + (pbi.story_points || 0), 0);
  };

  // Droppable wrapper component
  function DroppableContainer({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
      <div
        ref={setNodeRef}
        className={`h-full ${isOver ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      >
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const backlogPBIs = getBacklogPBIs();
  // Filter out active sprints from planning view - only show planned sprints
  const plannedSprints = sprints.filter(sprint =>
    sprint.status !== 'active' && sprint.status !== 'completed'
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={(event) => {
        console.log('Drag over:', { activeId: event.active.id, overId: event.over?.id });
      }}
    >
      <div className="space-y-6">
        {/* Header with Create Sprint Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeSprint ? 'Plan Future Sprint' : 'Sprint Planning'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {activeSprint
                ? `Plan ahead for your next sprint while "${activeSprint.name}" is running. Drag and drop PBIs to organize future work.`
                : 'Drag and drop PBIs between backlog and sprints to plan ahead'
              }
            </p>
          </div>
          {!showCreateSprint ? (
            <button
              onClick={() => setShowCreateSprint(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={20} />
              Create Sprint
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                placeholder="Sprint name..."
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleCreateSprint}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowCreateSprint(false);
                  setNewSprintName('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Product Backlog */}
          <DroppableContainer id="backlog">
            <SortableContext items={backlogPBIs.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4 min-h-[400px] h-full">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Backlog</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {backlogPBIs.length} items • {getTotalStoryPoints(backlogPBIs)} points
                  </p>
                </div>
                <div className="space-y-2">
                  {backlogPBIs.map((pbi, index) => (
                    <SortablePBICard
                      key={pbi.id}
                      pbi={pbi}
                      index={index}
                      isSelected={false}
                      onToggleSelect={() => {}}
                    />
                  ))}
                  {backlogPBIs.length === 0 && (
                    <div className="text-center text-gray-400 dark:text-gray-600 py-8">
                      No items in backlog
                    </div>
                  )}
                </div>
              </div>
            </SortableContext>
          </DroppableContainer>

          {/* Sprint Columns - Only show planned sprints */}
          {plannedSprints.length === 0 && (
            <div className="lg:col-span-2 xl:col-span-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 p-8 text-center">
              <CalendarPlus className="w-12 h-12 mx-auto mb-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Future Sprints Planned
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Create a new sprint to start planning future work
              </p>
            </div>
          )}
          {plannedSprints.map((sprint) => {
            const sprintPBIs = getSprintPBIs(sprint.id);
            const droppableId = `sprint-${sprint.id}`;

            return (
              <div key={sprint.id} className="h-full">
                <DroppableContainer id={droppableId}>
                  <SortableContext
                    items={sprintPBIs.map(p => p.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-300 dark:border-blue-700 p-4 min-h-[400px] h-full">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar size={18} className="text-blue-600" />
                        {sprint.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        {sprint.status === 'planned' && (
                          <button
                            onClick={() => setActivatingSprintId(sprint.id)}
                            className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                            title="Start Sprint"
                          >
                            <Play size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeletingSprintId(sprint.id)}
                          className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Delete Sprint"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        sprint.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        sprint.status === 'completed' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {sprint.status}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {sprintPBIs.length} items • {getTotalStoryPoints(sprintPBIs)} points
                      </span>
                    </div>
                    {sprint.goal && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                        {sprint.goal}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 min-h-[200px] relative">
                    {sprintPBIs.map((pbi, index) => (
                      <SortablePBICard
                        key={pbi.id}
                        pbi={pbi}
                        index={index}
                        isSelected={false}
                        onToggleSelect={() => {}}
                      />
                    ))}
                    {/* Always render a drop zone at the end for empty space */}
                    <div className={`${sprintPBIs.length === 0 ? 'min-h-[200px]' : 'min-h-[50px]'} text-center text-gray-400 dark:text-gray-600 py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg ${sprintPBIs.length > 0 ? 'mt-2' : ''}`}>
                      {sprintPBIs.length === 0 ? 'Drop PBIs here' : 'Drop more items here'}
                    </div>
                  </div>
                </div>
                  </SortableContext>
                </DroppableContainer>
              </div>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activePBI && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-500 p-4 shadow-2xl opacity-90">
            <div className="font-medium text-gray-900 dark:text-white">{activePBI.title}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{activePBI.story_points} points</div>
          </div>
        )}
      </DragOverlay>

      {/* Activate Sprint Modal */}
      {activatingSprintId && (() => {
        const sprint = sprints.find(s => s.id === activatingSprintId);
        if (!sprint) return null;
        const sprintPBIs = getSprintPBIs(sprint.id);
        const totalPoints = getTotalStoryPoints(sprintPBIs);
        return (
          <ActivateSprintModal
            projectId={projectId}
            sprint={sprint}
            sprintPBIs={sprintPBIs}
            totalStoryPoints={totalPoints}
            onClose={() => setActivatingSprintId(null)}
            onSprintActivated={handleSprintActivated}
          />
        );
      })()}

      {/* Delete Sprint Confirmation Modal */}
      {deletingSprintId && (() => {
        const sprint = sprints.find(s => s.id === deletingSprintId);
        if (!sprint) return null;
        const sprintPBIs = getSprintPBIs(sprint.id);
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Sprint</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                </div>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-3">
                  Are you sure you want to delete <strong>{sprint.name}</strong>?
                </p>
                {sprintPBIs.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>{sprintPBIs.length} user {sprintPBIs.length === 1 ? 'story' : 'stories'}</strong> will be moved back to the backlog.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeletingSprintId(null)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteSprint(deletingSprintId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Sprint
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </DndContext>
  );
}
