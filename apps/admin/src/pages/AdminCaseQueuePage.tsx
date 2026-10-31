import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Modal, Input, Alert } from '@matdata-setu/ui';
import {
  OfficialProcessStage,
  PortalCaseStatus,
} from '@matdata-setu/shared';
import { useAdmin } from '../context/AdminContext.js';

export const AdminCaseQueuePage: React.FC = () => {
  const { staff } = useAdmin();
  const [cases, setCases] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [transitionModalOpen, setTransitionModalOpen] = useState(false);
  const [targetWorkflow, setTargetWorkflow] = useState<string>('');
  const [targetOfficial, setTargetOfficial] = useState<string>('');
  const [evidenceDocId, setEvidenceDocId] = useState('');
  const [transitionReason, setTransitionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [_loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/v1/cases', {
        headers: {
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'CASE_REVIEWER',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCases(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [staff]);

  const handleOpenTransition = (c: any) => {
    setSelectedCase(c);
    setTargetWorkflow(c.workflowStatus);
    setTargetOfficial(c.officialStage);
    setEvidenceDocId('');
    setTransitionReason('');
    setActionError(null);
    setActionSuccess(null);
    setTransitionModalOpen(true);
  };

  const handleExecuteTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!selectedCase) return;

    try {
      const res = await fetch(`/api/v1/cases/${selectedCase.publicRef}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'CASE_REVIEWER',
        },
        body: JSON.stringify({
          targetWorkflowStatus: targetWorkflow || undefined,
          targetOfficialStage: targetOfficial || undefined,
          evidenceDocumentId: evidenceDocId || undefined,
          reason: transitionReason || 'Reviewer updated case state',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Transition rejected by state machine guard');
      }

      setActionSuccess('Case status successfully transitioned.');
      fetchCases();
      setTimeout(() => setTransitionModalOpen(false), 1200);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.publicRef.toLowerCase().includes(search.toLowerCase()) ||
      c.nameAsReported.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !filterCategory || c.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#0B1030]">Case Review Queue</h1>
          <p className="text-xs text-gray-500">
            Authorized reviewer queue. Status updates enforce dual-system state machines.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-gray-200">
        <input
          type="text"
          placeholder="Search by case reference or applicant name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:flex-1 p-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#000080]"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-2 text-xs border border-gray-300 rounded-lg bg-white"
        >
          <option value="">All Categories</option>
          <option value="MISSING_NAME">Missing Name</option>
          <option value="CORRECTION_PARTICULARS">Correction Particulars</option>
          <option value="SHIFTING_RESIDENCE">Shifting Residence</option>
          <option value="OWN_DUPLICATE_CHECK">Duplicate Self-Check</option>
        </select>
      </div>

      {/* Case Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider border-b border-gray-200">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Applicant Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Portal Status</th>
                <th className="p-3">Official Stage</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/80">
                  <td className="p-3 font-bold text-[#000080]">{c.publicRef}</td>
                  <td className="p-3 font-medium text-gray-900">{c.nameAsReported}</td>
                  <td className="p-3">{c.category.replace(/_/g, ' ')}</td>
                  <td className="p-3">
                    <Badge label={c.workflowStatus.replace(/_/g, ' ')} variant="info" />
                  </td>
                  <td className="p-3">
                    <span className="font-semibold text-gray-900">
                      {c.officialStage.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenTransition(c)}
                    >
                      Update State →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* State Machine Transition Modal */}
      <Modal
        isOpen={transitionModalOpen}
        onClose={() => setTransitionModalOpen(false)}
        title={`Transition Case: ${selectedCase?.publicRef}`}
      >
        <form onSubmit={handleExecuteTransition} className="space-y-4 pt-1 text-xs">
          {actionError && <Alert type="error">{actionError}</Alert>}
          {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}

          <div className="space-y-1">
            <label className="font-bold text-gray-800 block">System 1: Portal Workflow Status</label>
            <select
              value={targetWorkflow}
              onChange={(e) => setTargetWorkflow(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value={PortalCaseStatus.UNDER_REVIEW}>UNDER_REVIEW</option>
              <option value={PortalCaseStatus.ADDITIONAL_INFO_REQUIRED}>ADDITIONAL_INFO_REQUIRED</option>
              <option value={PortalCaseStatus.OFFICIAL_PROCESS_RECOMMENDED}>OFFICIAL_PROCESS_RECOMMENDED</option>
              <option value={PortalCaseStatus.REFERRED_TO_AUTHORIZED_CHANNEL}>REFERRED_TO_AUTHORIZED_CHANNEL</option>
              <option value={PortalCaseStatus.CLOSED}>CLOSED</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-800 block">
              System 2: Official Statutory Stage (Guarded)
            </label>
            <select
              value={targetOfficial}
              onChange={(e) => setTargetOfficial(e.target.value)}
              className="w-full p-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value={OfficialProcessStage.STAGE_4_APPLICATION_PREPARED}>STAGE_4_APPLICATION_PREPARED</option>
              <option value={OfficialProcessStage.STAGE_5_SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED}>
                STAGE_5_SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED
              </option>
              <option value={OfficialProcessStage.STAGE_6_OFFICIAL_SUBMISSION_CONFIRMED}>
                STAGE_6_OFFICIAL_SUBMISSION_CONFIRMED (Evidence Required)
              </option>
              <option value={OfficialProcessStage.STAGE_7_OFFICIAL_DECISION_RECEIVED}>
                STAGE_7_OFFICIAL_DECISION_RECEIVED (Evidence Required)
              </option>
              <option value={OfficialProcessStage.STAGE_8_ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED}>
                STAGE_8_ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED (Evidence Required)
              </option>
            </select>
            <span className="text-[11px] text-gray-500 block">
              Note: Advancing to Stages 6–8 strictly requires attaching documentary evidence ID.
            </span>
          </div>

          {targetOfficial &&
            [
              OfficialProcessStage.STAGE_6_OFFICIAL_SUBMISSION_CONFIRMED,
              OfficialProcessStage.STAGE_7_OFFICIAL_DECISION_RECEIVED,
              OfficialProcessStage.STAGE_8_ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED,
            ].includes(targetOfficial as any) && (
              <Input
                id="ev-doc-id"
                label="Verifiable Documentary Evidence ID *"
                description="Attach document UUID or official receipt proof confirming authority decision."
                value={evidenceDocId}
                onChange={(e) => setEvidenceDocId(e.target.value)}
                placeholder="e.g. doc-uuid-receipt-123"
                required
              />
            )}

          <div className="space-y-1">
            <label className="font-bold text-gray-800 block">Audit Reason for State Change *</label>
            <textarea
              rows={2}
              value={transitionReason}
              onChange={(e) => setTransitionReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="State the factual basis for this review update."
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTransitionModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Transition
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
