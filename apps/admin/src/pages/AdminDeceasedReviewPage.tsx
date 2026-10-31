import React, { useEffect, useState } from 'react';
import { Card, Button, Badge, Alert, Modal } from '@voterrule/ui';
import { DeceasedReviewState } from '@voterrule/shared';
import { useAdmin } from '../context/AdminContext.js';

export const AdminDeceasedReviewPage: React.FC = () => {
  const { staff } = useAdmin();
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [decision, setDecision] = useState<DeceasedReviewState>(DeceasedReviewState.RESOLVED_WITHIN_PORTAL);
  const [notes, setNotes] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/v1/deceased-reports', {
        headers: {
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'CASE_REVIEWER',
        },
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [staff]);

  const handleExecuteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    try {
      const res = await fetch(`/api/v1/deceased-reports/${selectedReport.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': staff.userId,
          'x-actor-role': staff.roles[0] || 'CASE_REVIEWER',
        },
        body: JSON.stringify({ decision, notes }),
      });

      if (res.ok) {
        setActionSuccess('Review recorded successfully.');
        fetchReports();
        setTimeout(() => setReviewModalOpen(false), 1200);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-[#0B1030]">Deceased Person Reports (Internal Review)</h1>
        <p className="text-xs text-gray-500">
          Reports are strictly internal and never public. Review documentary evidence and assist families with Form 7 guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reports.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <span className="font-bold text-sm text-[#0B1030]">{r.publicRef}</span>
                <span className="text-xs text-gray-500 block">
                  Reported Elector: {r.reportedPersonName} • Locality: {r.locality}, {r.state}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge label={r.stateStatus.replace(/_/g, ' ')} variant="neutral" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedReport(r);
                    setNotes('');
                    setActionSuccess(null);
                    setReviewModalOpen(true);
                  }}
                >
                  Review Report →
                </Button>
              </div>
            </div>

            <div className="pt-3 text-xs text-gray-700 space-y-1">
              <p><strong>Reporter Basis:</strong> {r.basis.replace(/_/g, ' ')}</p>
              <p><strong>Explanation:</strong> {r.basisExplanation}</p>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Review Deceased Report: ${selectedReport?.publicRef}`}
      >
        <form onSubmit={handleExecuteReview} className="space-y-4 pt-1 text-xs">
          {actionSuccess && <Alert type="success">{actionSuccess}</Alert>}

          <div className="space-y-1.5">
            <label className="font-bold text-gray-800 block">Review Decision *</label>
            <select
              value={decision}
              onChange={(e) => setDecision(e.target.value as any)}
              className="w-full p-2 rounded-lg border border-gray-300 bg-white"
            >
              <option value={DeceasedReviewState.RESOLVED_WITHIN_PORTAL}>RESOLVED_WITHIN_PORTAL</option>
              <option value={DeceasedReviewState.UNVERIFIED}>UNVERIFIED (Insufficient evidence)</option>
              <option value={DeceasedReviewState.REFERRED_VIA_OFFICIAL_CHANNEL}>
                REFERRED_VIA_OFFICIAL_CHANNEL (Advise family Form 7)
              </option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-gray-800 block">Reviewer Notes *</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="State documentary review observations."
              required
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setReviewModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm Review
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
