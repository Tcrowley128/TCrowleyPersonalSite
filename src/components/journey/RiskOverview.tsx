'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, TrendingUp, Filter, X, Plus } from 'lucide-react';
import { AddRiskModal } from './AddRiskModal';
import { EditRiskModal } from './EditRiskModal';
import { AskAIButton } from './AskAIButton';

interface Risk {
  id: string;
  project_id: string;
  project_title?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'identified' | 'analyzed' | 'planned' | 'monitored' | 'closed' | 'assessing' | 'mitigating' | 'resolved';
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'very_high';
  mitigation_plan: string;
  owner: string;
  created_at: string;
}

interface RiskOverviewProps {
  assessmentId: string;
  projects: Array<{ id: string; title: string }>;
  selectedRiskId?: string | null;
  onAskAI?: (message: string) => void;
}

export function RiskOverview({ assessmentId, projects, selectedRiskId, onAskAI }: RiskOverviewProps) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [selectedProjectForAdd, setSelectedProjectForAdd] = useState<{ id: string; title: string } | null>(null);
  const [selectedRiskForEdit, setSelectedRiskForEdit] = useState<{ id: string; projectId: string; projectTitle: string } | null>(null);
  const [filters, setFilters] = useState({
    severity: '',
    status: '',
    project: '',
    search: ''
  });

  useEffect(() => {
    fetchAllRisks();
  }, [assessmentId]);

  // Handle deep-linking to a specific risk
  useEffect(() => {
    if (selectedRiskId && risks.length > 0) {
      const targetRisk = risks.find(r => r.id === selectedRiskId);
      if (targetRisk) {
        // Auto-open the risk edit modal
        handleEditRisk(targetRisk);

        // Scroll to the risk card after a short delay
        setTimeout(() => {
          const riskElement = document.getElementById(`risk-${selectedRiskId}`);
          if (riskElement) {
            riskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }
    }
  }, [selectedRiskId, risks]);

  const fetchAllRisks = async () => {
    try {
      setLoading(true);
      // Add limit parameter to prevent loading too much data at once
      const response = await fetch(`/api/assessment/${assessmentId}/risks?limit=100`);

      if (response.ok) {
        const data = await response.json();
        const allRisks = (data.risks || []).map((risk: any) => {
          const impactToSeverity: Record<string, string> = {
            very_high: 'critical',
            high: 'high',
            medium: 'medium',
            low: 'low',
            very_low: 'low'
          };
          return {
            ...risk,
            severity: impactToSeverity[risk.impact] || 'medium'
          };
        });
        setRisks(allRisks);
      } else {
        console.error('Failed to fetch risks:', response.statusText);
        setRisks([]);
      }
    } catch (error) {
      console.error('Error fetching risks:', error);
      setRisks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRisk = (project: { id: string; title: string }) => {
    setSelectedProjectForAdd(project);
    setShowAddModal(true);
  };

  const handleEditRisk = (risk: Risk) => {
    setSelectedRiskForEdit({
      id: risk.id,
      projectId: risk.project_id,
      projectTitle: risk.project_title || 'Unknown Project'
    });
    setShowEditModal(true);
  };

  // Filter risks
  const filteredRisks = risks.filter(risk => {
    if (filters.severity && risk.severity !== filters.severity) return false;
    if (filters.status && risk.status !== filters.status) return false;
    if (filters.project && risk.project_id !== filters.project) return false;
    if (filters.search && !risk.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !risk.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Calculate metrics
  const criticalRisks = risks.filter(r => r.severity === 'critical').length;
  const highRisks = risks.filter(r => r.severity === 'high').length;
  const activeRisks = risks.filter(r => r.status !== 'resolved' && r.status !== 'closed').length;
  const resolvedRisks = risks.filter(r => r.status === 'resolved' || r.status === 'closed').length;

  const severityConfig = {
    critical: { color: 'red', label: 'Critical', bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-800 dark:text-red-200', border: 'border-red-200 dark:border-red-800' },
    high: { color: 'orange', label: 'High', bg: 'bg-orange-100 dark:bg-orange-900/20', text: 'text-orange-800 dark:text-orange-200', border: 'border-orange-200 dark:border-orange-800' },
    medium: { color: 'yellow', label: 'Medium', bg: 'bg-yellow-100 dark:bg-yellow-900/20', text: 'text-yellow-800 dark:text-yellow-200', border: 'border-yellow-200 dark:border-yellow-800' },
    low: { color: 'green', label: 'Low', bg: 'bg-green-100 dark:bg-green-900/20', text: 'text-green-800 dark:text-green-200', border: 'border-green-200 dark:border-green-800' }
  };

  const statusConfig = {
    identified: { label: 'Identified', color: 'gray' },
    analyzed: { label: 'Analyzed', color: 'blue' },
    planned: { label: 'Planned', color: 'purple' },
    monitored: { label: 'Monitored', color: 'yellow' },
    closed: { label: 'Closed', color: 'green' },
    assessing: { label: 'Assessing', color: 'blue' },
    mitigating: { label: 'Mitigating', color: 'purple' },
    resolved: { label: 'Resolved', color: 'green' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const hasActiveFilters = filters.severity || filters.status || filters.project || filters.search;

  return (
    <div className="space-y-6">
      {/* Header with AI Button */}
      {onAskAI && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Risk Management</h2>
          <AskAIButton
            onClick={() => onAskAI(`Analyze my project risks: ${criticalRisks} critical, ${highRisks} high severity, ${activeRisks} active, ${resolvedRisks} resolved. What risk mitigation strategies should I prioritize? Are there patterns or trends I should be aware of?`)}
            label="Analyze Risks"
            size="sm"
          />
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-900 dark:text-red-100">Critical Risks</span>
          </div>
          <div className="text-3xl font-bold text-red-900 dark:text-red-100">{criticalRisks}</div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">High Risks</span>
          </div>
          <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">{highRisks}</div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Active Risks</span>
          </div>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{activeRisks}</div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Resolved</span>
          </div>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100">{resolvedRisks}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
          </div>

          {/* Add Risk Button */}
          {projects.length > 0 && (
            <div className="relative">
              <button
                onClick={() => {
                  if (projects.length === 1) {
                    handleAddRisk(projects[0]);
                  } else {
                    setShowProjectDropdown(!showProjectDropdown);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Plus size={16} />
                Add Risk
              </button>

              {projects.length > 1 && showProjectDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10">
                  <div className="p-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 px-2 py-1 font-medium">Select Project:</p>
                    {projects.map(project => (
                      <button
                        key={project.id}
                        onClick={() => {
                          handleAddRisk(project);
                          setShowProjectDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {project.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search risks..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.severity}
            onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="identified">Identified</option>
            <option value="analyzed">Analyzed</option>
            <option value="planned">Planned</option>
            <option value="monitored">Monitored</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={filters.project}
            onChange={(e) => setFilters({ ...filters, project: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => setFilters({ severity: '', status: '', project: '', search: '' })}
            className="mt-3 flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
          >
            <X size={16} />
            Clear filters
          </button>
        )}
      </div>

      {/* Risks List */}
      <div className="space-y-3">
        {filteredRisks.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg border-2 border-gray-200 dark:border-gray-700">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {risks.length === 0 ? 'No risks identified across all projects' : 'No risks match the current filters'}
            </p>
          </div>
        ) : (
          filteredRisks.map(risk => {
            const severityStyle = severityConfig[risk.severity] || severityConfig.medium;
            const statusStyle = statusConfig[risk.status] || statusConfig.identified;

            const isSelected = selectedRiskId === risk.id;

            return (
              <div
                key={risk.id}
                id={`risk-${risk.id}`}
                onClick={() => handleEditRisk(risk)}
                className={`bg-white dark:bg-slate-800 border-2 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 dark:border-blue-400 shadow-lg ring-2 ring-blue-200 dark:ring-blue-800'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{risk.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{risk.project_title}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityStyle.bg} ${severityStyle.text}`}>
                      {severityStyle.label}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {statusStyle.label}
                    </span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-3">{risk.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Likelihood:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{risk.likelihood}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">Impact:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400 capitalize">{risk.impact}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-900 dark:text-white">Owner:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">{risk.owner}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      {showAddModal && selectedProjectForAdd && (
        <AddRiskModal
          projectId={selectedProjectForAdd.id}
          projectTitle={selectedProjectForAdd.title}
          onClose={() => {
            setShowAddModal(false);
            setSelectedProjectForAdd(null);
          }}
          onRiskAdded={() => {
            fetchAllRisks();
            setShowAddModal(false);
            setSelectedProjectForAdd(null);
          }}
        />
      )}

      {showEditModal && selectedRiskForEdit && (
        <EditRiskModal
          riskId={selectedRiskForEdit.id}
          projectId={selectedRiskForEdit.projectId}
          projectTitle={selectedRiskForEdit.projectTitle}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRiskForEdit(null);
          }}
          onRiskUpdated={() => {
            fetchAllRisks();
            setShowEditModal(false);
            setSelectedRiskForEdit(null);
          }}
          onRiskDeleted={() => {
            fetchAllRisks();
            setShowEditModal(false);
            setSelectedRiskForEdit(null);
          }}
        />
      )}
    </div>
  );
}
