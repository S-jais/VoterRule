import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Alert, Modal, Input } from '@voterrule/ui';
import { DuplicateReviewState, SimilarityCategory } from '@voterrule/shared';
import { useAdmin } from '../context/AdminContext.js';

export const AdminDuplicateReviewPage: React.FC = () => {
  const { staff } = useAdmin();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState<DuplicateReviewState>(DuplicateReviewState.DISMISSED_FALSE_POSITIVE);
  const [reasonText, setReasonText] = useState('');
  const [secondReviewerId, setSecondReviewerId] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchCandidates = async () => {
    try {
      const res = await fetch('/api/v1/duplicate/candidates', {
        headers: {
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'DUPLICATE_MATCH_REVIEWER',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setCandidates(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [staff]);

  const handleOpenReview = (cand: any) => {
    setSelectedCandidate(cand);
    setDecision(DuplicateReviewState.DISMISSED_FALSE_POSITIVE);
    setReasonText('');
    setSecondReviewerId('');
    setActionError(null);
    setActionSuccess(null);
    setReviewModalOpen(true);
  };

  const handleExecuteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    if (!selectedCandidate) return;

    try {
      const res = await fetch(`/api/v1/duplicate/candidates/${selectedCandidate.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'DUPLICATE_MATCH_REVIEWER',
        },
        body: JSON.stringify({
          decision,
          reasonText,
          secondReviewerId: decision === DuplicateReviewState.VERIFIED_DISCREPANCY_RECORDED ? secondReviewerId : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Review action rejected');
      }

      setActionSuccess('Review decision recorded.');
      fetchCandidates();
      setTimeout(() => setReviewModalOpen(false), 1200);
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[#0B1030]">Duplicate Candidate Review Queue</h1>
        <p className="text-xs text-gray-500">
          Transparent, rule-based matching with explainable reasons. Accusatory terms are strictly forbidden.
        </p>
      </div>

      <div className="bg-[#EFF2FE] p-4 rounded-xl border border-[#C5D0FB] text-xs text-gray-800 space-y-1.5">
        <span className="font-bold text-[#000080]">Civic Safeguard Rule:</span>
        <p>
          Candidate scores never alter citizen case status, never flag anyone as fraudulent, and never trigger automated deletions. Recording a verified discrepancy strictly requires concurrence from a second reviewer (four-eyes).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {candidates.map((cand) => (
          <Card key={cand.id}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#0B1030]">Candidate ID: {cand.id}</span>
                  <Badge
                    label={cand.similarityCategory}
                    variant={cand.similarityCategory === SimilarityCategory.STRONG ? 'warning' : 'neutral'}
                  />
                  <Badge label={`Score: ${cand.score}/100`} variant="info" />
                </div>
                <span className="text-xs text-gray-400">
                  Algorithm: {cand.algorithmVersion} • State: {cand.state.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenReview(cand)}>
                  Review Match →
                </Button>
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <span className="font-bold text-gray-900 block">Record A Reference:</span>
                <p className="font-mono text-[#000080]">{cand.subjectARef}</p>
                <span className="text-gray-500 text-[11px] block">(Masked for reviewer privacy)</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg space-y-1">
                <span className="font-bold text-gray-900 block">Record B Reference:</span>
                <p className="font-mono text-[#000080]">{cand.subjectBRef}</p>
                <span className="text-gray-500 text-[11px] block">(Masked for reviewer privacy)</span>
              </div>
            </div>

            {/* Transparent Reason Codes */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-gray-600">Matched Signals:</span>
              {cand.reasonCodes.map((code: string) => (
                <span key={code} className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-mono text-[11px]">
                  {code}
                </span>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Review Duplicate Candidate Decision"
      >
        <form onSubmit={handleExecuteReview} className="space-y-4 pt-1 text-xs">
          {actionError && <Alert type="error">{actionError}</Alert>}
          {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}

          <div className="space-y-1.5">
            <label className="font-bold text-gray-800 block">Review Decision *</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="dupDecision"
                  value={DuplicateReviewState.DISMISSED_FALSE_POSITIVE}
                  checked={decision === DuplicateReviewState.DISMISSED_FALSE_POSITIVE}
                  onChange={() => setDecision(DuplicateReviewState.DISMISSED_FALSE_POSITIVE)}
                  className="text-[#000080]"
                />
                <span className="font-bold text-gray-900">Mark as False Positive</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="dupDecision"
                  value={DuplicateReviewState.NEEDS_MORE_INFORMATION}
                  checked={decision === DuplicateReviewState.NEEDS_MORE_INFORMATION}
                  onChange={() => setDecision(DuplicateReviewState.NEEDS_MORE_INFORMATION)}
                  className="text-[#000080]"
                />
                <span className="font-bold text-gray-900">Request More Information</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="dupDecision"
                  value={DuplicateReviewState.VERIFIED_DISCREPANCY_RECORDED}
                  checked={decision === DuplicateReviewState.VERIFIED_DISCREPANCY_RECORDED}
                  onChange={() => setDecision(DuplicateReviewState.VERIFIED_DISCREPANCY_RECORDED)}
                  className="text-[#000080]"
                />
                <div className="space-y-0.5">
                  <span className="font-bold text-amber-900 block">Verified Discrepancy Recorded for Referral</span>
                  <span className="text-[11px] text-gray-500 block">Requires second independent reviewer concurrence (four-eyes).</span>
                </div>
              </label>
            </div>
          </div>

          {decision === DuplicateReviewState.VERIFIED_DISCREPANCY_RECORDED && (
            <Input
              id="second-reviewer"
              label="Second Reviewer ID (Concurrence) *"
              description="Enter user ID or email of concurring reviewer."
              value={secondReviewerId}
              onChange={(e) => setSecondReviewerId(e.target.value)}
              placeholder="e.g. reviewer-02"
              required
            />
          )}

          <div className="space-y-1">
            <label className="font-bold text-gray-800 block">Factual Reason (No accusatory language) *</label>
            <textarea
              rows={3}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Document the exact criteria and why false-positive or discrepancy applies."
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Decision
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
