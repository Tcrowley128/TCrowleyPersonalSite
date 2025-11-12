'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, X, CheckCircle, Plus } from 'lucide-react';
import { EditRiskModal } from '@/components/journey/EditRiskModal';
import { AddRiskModal } from '@/components/journey/AddRiskModal';

interface Risk {
  id: string;
  project_id: string;
  project_title?: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: string;
  mitigation: string;
  sprint_id?: string;
  identified_date: string;
  impact?: string;
  category?: string;
  response_plan?: string;
  mitigation_plan?: string;
}

interface RisksViewProps {
  projectId: string;
}

export function RisksView({ projectId }: RisksViewProps) {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [editingRisk, setEditingRisk] = useState<{ id: string; projectId: string; projectTitle: string } | null>(null);
  const [showAddRiskModal, setShowAddRiskModal] = useState(false);
  const [projectTitle, setProjectTitle] = useState<string>('Unknown Project');

  useEffect(() => {
    fetchRisks();
  }, [projectId]);

  const fetchRisks = async () => {
    try {
      setLoading(true);

      // Fetch project info first
      const projectResponse = await fetch(`/api/projects/${projectId}`);
      let fetchedProjectTitle = 'Unknown Project';
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        fetchedProjectTitle = projectData.project?.title || 'Unknown Project';
        setProjectTitle(fetchedProjectTitle);
      }

      const response = await fetch(`/api/projects/${projectId}/risks`);
      if (response.ok) {
        const data = await response.json();
        // Map database values to component format
        const mappedRisks = (data.risks || []).map((risk: any) => {
          // Map impact to severity
          const impactToSeverity: Record<string, string> = {
            very_high: 'critical',
            high: 'high',
            medium: 'medium',
            low: 'low',
            very_low: 'low'
          };

          return {
            ...risk,
            project_title: fetchedProjectTitle,
            severity: impactToSeverity[risk.impact] || 'medium',
            mitigation: risk.mitigation_plan || risk.response_plan || ''
          };
        });
        setRisks(mappedRisks);
      }
    } catch (error) {
      console.error('Error fetching risks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (riskId: string, newStatus: string, e: React.MouseEvent) => {
    // Prevent the card click event from firing
    e.stopPropagation();

    try {
      const response = await fetch(`/api/risks/${riskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setRisks(prev => prev.map(risk =>
          risk.id === riskId ? { ...risk, status: newStatus } : risk
        ));
      }
    } catch (error) {
      console.error('Error updating risk status:', error);
    }
  };

  const handleEditRisk = (risk: Risk) => {
    setEditingRisk({
      id: risk.id,
      projectId: risk.project_id,
      projectTitle: risk.project_title || 'Unknown Project'
    });
  };

  const handleRiskUpdated = () => {
    fetchRisks();
  };

  const handleRiskDeleted = () => {
    fetchRisks();
  };

  const severityConfig = {
    low: { color: 'gray', label: 'Low' },
    medium: { color: 'yellow', label: 'Medium' },
    high: { color: 'orange', label: 'High' },
    critical: { color: 'red', label: 'Critical' }
  };

  const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
    // Database values
    identified: { color: 'red', label: 'Identified', icon: AlertTriangle },
    analyzed: { color: 'orange', label: 'Analyzed', icon: AlertTriangle },
    planned: { color: 'yellow', label: 'Planned', icon: CheckCircle },
    monitored: { color: 'blue', label: 'Monitored', icon: CheckCircle },
    closed: { color: 'green', label: 'Closed', icon: CheckCircle },
    // Legacy values
    open: { color: 'red', label: 'Open', icon: AlertTriangle },
    mitigated: { color: 'yellow', label: 'Mitigated', icon: CheckCircle }
  };

  const filteredRisks = filter === 'all'
    ? risks
    : risks.filter(risk => risk.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="text-orange-600" />
              Project Risks
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track and manage risks that could impact the project
            </p>
          </div>

          {/* Add Risk Button */}
          <button
            onClick={() => setShowAddRiskModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
          >
            <Plus size={18} />
            Add Risk
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {['all', 'identified', 'analyzed', 'planned', 'monitored', 'closed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900'
              }`}
            >
              {status === 'all' ? 'All' : statusConfig[status]?.label || status}
            </button>
          ))}
        </div>
      </div>

      {/* Risks List */}
      {filteredRisks.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-12 text-center">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Risks Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all'
              ? 'Add risks using the sprint menu when issues arise.'
              : `No ${filter} risks at this time.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRisks.map(risk => {
            const severityConf = severityConfig[risk.severity] || severityConfig.medium;
            const statusConf = statusConfig[risk.status] || statusConfig.identified;
            const StatusIcon = statusConf?.icon || AlertTriangle;

            return (
              <div
                key={risk.id}
                onClick={() => handleEditRisk(risk)}
                className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {risk.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${severityConf.color}-100 dark:bg-${severityConf.color}-900/30 text-${severityConf.color}-800 dark:text-${severityConf.color}-300`}>
                        {severityConf.label}
                      </span>
                    </div>
                    {risk.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {risk.description}
                      </p>
                    )}
                    {risk.mitigation && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-3">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-1">
                          Mitigation Strategy
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {risk.mitigation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={risk.status}
                    onChange={(e) => handleStatusChange(risk.id, e.target.value, e as any)}
                    onClick={(e) => e.stopPropagation()}
                    className="px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600"
                  >
                    <option value="identified">Identified</option>
                    <option value="analyzed">Analyzed</option>
                    <option value="planned">Planned</option>
                    <option value="monitored">Monitored</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <StatusIcon size={14} />
                    <span>{statusConf.label}</span>
                  </div>
                  <div>
                    Identified: {new Date(risk.identified_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Risk Modal */}
      {showAddRiskModal && (
        <AddRiskModal
          projectId={projectId}
          projectTitle={projectTitle}
          onClose={() => setShowAddRiskModal(false)}
          onRiskAdded={() => {
            setShowAddRiskModal(false);
            fetchRisks();
          }}
        />
      )}

      {/* Edit Risk Modal */}
      {editingRisk && (
        <EditRiskModal
          riskId={editingRisk.id}
          projectId={editingRisk.projectId}
          projectTitle={editingRisk.projectTitle}
          onClose={() => setEditingRisk(null)}
          onRiskUpdated={handleRiskUpdated}
          onRiskDeleted={handleRiskDeleted}
        />
      )}
    </div>
  );
}
