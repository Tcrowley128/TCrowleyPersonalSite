'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Loader2, Play, Plus, Sparkles, RefreshCw, List, GitBranch, Search, Filter } from 'lucide-react';
import { SortablePBICard } from './SortablePBICard';
import { HierarchicalPBICard } from './HierarchicalPBICard';
import { AddPBIModal } from './AddPBIModal';
import { EditPBIModal } from './EditPBIModal';
import { GenerateBacklogModal } from './GenerateBacklogModal';

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
  parent_id: string | null;
}

interface BacklogViewProps {
  projectId: string;
  activeSprint: any;
  onStartSprint: (selectedPbiIds: string[], totalStoryPoints: number) => void;
  onRefresh: () => void;
}

export function BacklogView({ projectId, activeSprint, onStartSprint, onRefresh }: BacklogViewProps) {
  const [pbis, setPbis] = useState<PBI[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPbis, setSelectedPbis] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [addChildParentId, setAddChildParentId] = useState<string | null>(null);
  const [editingPbiId, setEditingPbiId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'flat' | 'hierarchy'>('hierarchy');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    itemType: '',
    sprint: '',
    assignedTo: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchBacklog();
    fetchSprints();
  }, [projectId]);

  const fetchBacklog = async () => {
    try {
      setLoading(true);
      // Add limit to prevent excessive data loading
      const response = await fetch(`/api/projects/${projectId}/pbis?limit=200`);
      if (response.ok) {
        const data = await response.json();
        // Show all items in the backlog, including those assigned to sprints
        setPbis(data.pbis.sort((a: PBI, b: PBI) => a.backlog_order - b.backlog_order));
      }
    } catch (error) {
      console.error('Error fetching backlog:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSprints = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/sprints`);
      if (response.ok) {
        const data = await response.json();
        setSprints(data.sprints || []);
      }
    } catch (error) {
      console.error('Error fetching sprints:', error);
    }
  };

  const handleGenerateSuccess = () => {
    fetchBacklog();
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = pbis.findIndex(pbi => pbi.id === active.id);
    const newIndex = pbis.findIndex(pbi => pbi.id === over.id);

    const newPbis = arrayMove(pbis, oldIndex, newIndex);
    setPbis(newPbis);

    // Update backlog_order for all items
    try {
      await Promise.all(
        newPbis.map((pbi, index) =>
          fetch(`/api/pbis/${pbi.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ backlog_order: index })
          })
        )
      );
    } catch (error) {
      console.error('Error updating backlog order:', error);
      fetchBacklog(); // Revert on error
    }
  };

  const togglePbiSelection = (pbiId: string) => {
    const newSelected = new Set(selectedPbis);
    const isSelecting = !newSelected.has(pbiId);

    // Helper to get all descendants of a PBI
    const getAllDescendants = (parentId: string): string[] => {
      const children = pbis.filter(pbi => pbi.parent_id === parentId);
      const descendants: string[] = [];

      children.forEach(child => {
        descendants.push(child.id);
        // Recursively get children's children
        descendants.push(...getAllDescendants(child.id));
      });

      return descendants;
    };

    if (isSelecting) {
      // Add the item
      newSelected.add(pbiId);
      // Add all its children
      const descendants = getAllDescendants(pbiId);
      descendants.forEach(id => newSelected.add(id));
    } else {
      // Remove the item
      newSelected.delete(pbiId);
      // Remove all its children
      const descendants = getAllDescendants(pbiId);
      descendants.forEach(id => newSelected.delete(id));
    }

    setSelectedPbis(newSelected);
  };

  // Only count story points from User Stories (not tasks, bugs, etc.)
  const selectedStoryPoints = pbis
    .filter(pbi => selectedPbis.has(pbi.id) && pbi.item_type === 'user_story')
    .reduce((sum, pbi) => sum + (Number(pbi.story_points) || 0), 0);

  // Filter PBIs based on search and filters
  const filteredPbis = (() => {
    // First, apply filters to all PBIs
    const matchingPbis = pbis.filter(pbi => {
      // Search query
      if (searchQuery && !pbi.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !pbi.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (filters.status && pbi.status !== filters.status) return false;

      // Item type filter
      if (filters.itemType && pbi.item_type !== filters.itemType) return false;

      // Sprint filter
      if (filters.sprint) {
        if (filters.sprint === 'unassigned' && pbi.sprint_id) return false;
        if (filters.sprint !== 'unassigned' && pbi.sprint_id !== filters.sprint) return false;
      }

      // Assigned to filter
      if (filters.assignedTo && !pbi.assigned_to?.toLowerCase().includes(filters.assignedTo.toLowerCase())) return false;

      return true;
    });

    // In hierarchical view, ensure parent items are included if any of their children match
    if (viewMode === 'hierarchy') {
      const matchingIds = new Set(matchingPbis.map(pbi => pbi.id));
      const result = new Set(matchingPbis);

      // For each matching PBI, add all its ancestors
      matchingPbis.forEach(pbi => {
        let currentParentId = pbi.parent_id;
        while (currentParentId) {
          const parent = pbis.find(p => p.id === currentParentId);
          if (parent) {
            result.add(parent);
            currentParentId = parent.parent_id;
          } else {
            break;
          }
        }
      });

      return Array.from(result);
    }

    return matchingPbis;
  })();

  // Build hierarchy: organize PBIs by parent-child relationships
  const buildHierarchy = () => {
    const rootItems: PBI[] = [];
    const childrenMap = new Map<string, PBI[]>();

    // Separate root items and children
    filteredPbis.forEach(pbi => {
      if (!pbi.parent_id) {
        rootItems.push(pbi);
      } else {
        if (!childrenMap.has(pbi.parent_id)) {
          childrenMap.set(pbi.parent_id, []);
        }
        childrenMap.get(pbi.parent_id)!.push(pbi);
      }
    });

    // Sort root items: done epics to bottom, others by backlog_order
    rootItems.sort((a, b) => {
      // If both are done or both are not done, sort by backlog_order
      if ((a.status === 'done') === (b.status === 'done')) {
        return a.backlog_order - b.backlog_order;
      }
      // Done items go to bottom (return 1 means a comes after b)
      return a.status === 'done' ? 1 : -1;
    });

    // Sort children within each parent by backlog_order (children don't move to bottom based on status)
    childrenMap.forEach((children) => {
      children.sort((a, b) => a.backlog_order - b.backlog_order);
    });

    return { rootItems, childrenMap };
  };

  const { rootItems, childrenMap } = buildHierarchy();

  // For flat view, sort pbis with done items at bottom
  const sortedPbis = [...filteredPbis].sort((a, b) => {
    // If both are done or both are not done, sort by backlog_order
    if ((a.status === 'done') === (b.status === 'done')) {
      return a.backlog_order - b.backlog_order;
    }
    // Done items go to bottom
    return a.status === 'done' ? 1 : -1;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Empty State */}
      {pbis.length === 0 && !generating && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-12 text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Backlog Items Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Let AI analyze your project and generate user stories, tasks, and bugs to get started
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus size={18} />
              Add Item
            </button>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              <Sparkles size={18} />
              Generate with AI
            </button>
          </div>
        </div>
      )}

      {/* Unified Backlog Container */}
      {pbis.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Header Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Title and Stats */}
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Product Backlog
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {pbis.length} items · {pbis.filter(pbi => pbi.item_type === 'user_story').reduce((sum, pbi) => sum + (Number(pbi.story_points) || 0), 0)} story points
                  </p>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode('hierarchy')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-sm font-medium ${
                      viewMode === 'hierarchy'
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    title="Hierarchical view"
                  >
                    <GitBranch size={15} />
                    <span className="hidden sm:inline">Tree</span>
                  </button>
                  <button
                    onClick={() => setViewMode('flat')}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md transition-colors text-sm font-medium ${
                      viewMode === 'flat'
                        ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    title="Flat list view"
                  >
                    <List size={15} />
                    <span className="hidden sm:inline">List</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Add Item</span>
                </button>
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors text-sm"
                >
                  <Sparkles size={16} />
                  <span className="hidden sm:inline">Generate</span>
                </button>
                <button
                  onClick={fetchBacklog}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm"
                >
                  <RefreshCw size={16} />
                </button>
                <button
                  onClick={() => onStartSprint(Array.from(selectedPbis), selectedStoryPoints)}
                  disabled={selectedPbis.size === 0}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Play size={16} />
                  <span className="hidden lg:inline">Start Sprint</span>
                  <span className="inline lg:hidden">Sprint</span>
                  {selectedPbis.size > 0 && (
                    <span className="hidden sm:inline">({selectedPbis.size} · {selectedStoryPoints}pts)</span>
                  )}
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Bar */}
              <div className="sm:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search backlog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="approved">Approved</option>
                  <option value="committed">Committed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              {/* Item Type Filter */}
              <div>
                <select
                  value={filters.itemType}
                  onChange={(e) => setFilters({ ...filters, itemType: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">All Types</option>
                  <option value="epic">Epic</option>
                  <option value="user_story">User Story</option>
                  <option value="task">Task</option>
                  <option value="bug">Bug</option>
                  <option value="spike">Spike</option>
                </select>
              </div>

              {/* Sprint Filter */}
              <div>
                <select
                  value={filters.sprint}
                  onChange={(e) => setFilters({ ...filters, sprint: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
                >
                  <option value="">All Sprints</option>
                  <option value="unassigned">Unassigned</option>
                  {sprints.map(sprint => (
                    <option key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Filters Info */}
            {(searchQuery || filters.status || filters.itemType || filters.sprint) && (
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredPbis.length} of {pbis.length} items
                </span>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({ status: '', itemType: '', sprint: '', assignedTo: '' });
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Backlog Items Content */}
          <div className="p-4">
            <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
              <strong>Tip:</strong> {viewMode === 'flat' ? 'Drag and drop items to prioritize. ' : ''}Click checkboxes to select items for the next sprint.
            </div>

          {viewMode === 'flat' ? (
            // Flat view with drag-and-drop - add padding to prevent border cutoff
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortedPbis.map(p => p.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2 px-1">
                  {sortedPbis.map((pbi, index) => (
                    <SortablePBICard
                      key={pbi.id}
                      pbi={pbi}
                      index={index}
                      isSelected={selectedPbis.has(pbi.id)}
                      onToggleSelect={togglePbiSelection}
                      onEdit={setEditingPbiId}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            // Hierarchical view - add padding to prevent border cutoff
            <div className="space-y-2 px-1">
              {rootItems.map((pbi) => (
                <HierarchicalPBICard
                  key={pbi.id}
                  pbi={pbi}
                  childPbis={childrenMap.get(pbi.id) || []}
                  childrenMap={childrenMap}
                  selectedPbis={selectedPbis}
                  level={0}
                  isSelected={selectedPbis.has(pbi.id)}
                  onToggleSelect={togglePbiSelection}
                  onEdit={setEditingPbiId}
                />
              ))}
            </div>
          )}
          </div>
        </div>
      )}

      {/* Add PBI Modal */}
      {showAddModal && (
        <AddPBIModal
          projectId={projectId}
          parentPbiId={addChildParentId}
          onClose={() => {
            setShowAddModal(false);
            setAddChildParentId(null);
          }}
          onPBIAdded={() => {
            setShowAddModal(false);
            setAddChildParentId(null);
            fetchBacklog();
          }}
        />
      )}

      {/* Edit PBI Modal */}
      {editingPbiId && (
        <EditPBIModal
          pbiId={editingPbiId}
          projectId={projectId}
          onClose={() => setEditingPbiId(null)}
          onPBIUpdated={() => {
            setEditingPbiId(null);
            fetchBacklog();
          }}
          onPBIDeleted={() => {
            setEditingPbiId(null);
            fetchBacklog();
          }}
          onAddChild={(parentId) => {
            setAddChildParentId(parentId);
            setShowAddModal(true);
          }}
        />
      )}

      {/* Generate Backlog Modal */}
      {showGenerateModal && (
        <GenerateBacklogModal
          projectId={projectId}
          pbis={pbis}
          onClose={() => setShowGenerateModal(false)}
          onGenerated={handleGenerateSuccess}
        />
      )}
    </div>
  );
}
