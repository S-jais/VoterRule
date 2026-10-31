import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Badge,
  Input,
  Alert,
} from '@voterrule/ui';
import { OfficialProcessStage } from '@voterrule/shared';
import { useApp } from '../context/AppContext.js';

export interface CaseDetailPageProps {
  caseRef: string;
  onNavigate: (path: string) => void;
}

export const CaseDetailPage: React.FC<CaseDetailPageProps> = ({ caseRef, onNavigate }) => {
  const { user } = useApp();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reportingSubmission, setReportingSubmission] = useState(false);
  const [ackRef, setAckRef] = useState('');
  const [channel, setChannel] = useState('ECI_VOTERS_PORTAL');
  const [notes, setNotes] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    async function loadCase() {
      try {
        const res = await fetch(`/api/v1/cases/${caseRef}`);
        if (res.ok) {
          const data = await res.json();
          setCaseData(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadCase();
  }, [caseRef]);

  const handleReportOfficialSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/v1/cases/${caseRef}/report-submission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        body: JSON.stringify({
          channel,
          acknowledgementRef: ackRef,
          notes,
        }),
      });

      if (res.ok) {
        setReportSuccess(true);
        setReportingSubmission(false);
        // Refresh case
        const refresh = await fetch(`/api/v1/cases/${caseRef}`);
        const data = await refresh.json();
        setCaseData(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-sm text-gray-500">Loading case details...</div>;
  }

  if (!caseData || !caseData.case) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Case Reference Not Found</h2>
        <Button variant="primary" size="md" onClick={() => onNavigate('/app')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const c = caseData.case;
  const events = caseData.events || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Case Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <span className="text-xs font-bold text-[var(--link)] uppercase tracking-wider block">
            Portal Assistance Case (Not an Official ECI Number)
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight mt-0.5">
            {c.publicRef}
          </h1>
          <span className="text-xs text-[var(--ink-3)]">
            Opened on {c.openedAt.split('T')[0]} • Category: {c.category.replace(/_/g, ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge label={`Portal: ${c.workflowStatus.replace(/_/g, ' ')}`} variant="info" />
          <Button variant="outline" size="sm" onClick={() => onNavigate('/app')}>
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Two-System Distinction Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--surface-2)] p-4 rounded-[var(--r-md)] border border-[var(--line-strong)] space-y-1">
          <span className="text-xs font-bold uppercase text-[var(--link)]">
            System 1: Portal Assistance Workflow
          </span>
          <div className="text-base font-bold text-[var(--ink)]">
            {c.workflowStatus.replace(/_/g, ' ')}
          </div>
          <p className="text-[11px] text-[var(--ink-2)]">
            What this civic portal’s volunteer & review team is currently assisting you with.
          </p>
        </div>

        <div className="bg-[var(--saffron-wash)] p-4 rounded-[var(--r-md)] border border-[var(--saffron)]/30 space-y-1">
          <span className="text-xs font-bold uppercase text-[var(--saffron-deep)]">
            System 2: Official Statutory Stage
          </span>
          <div className="text-base font-bold text-[var(--ink)]">
            {c.officialStage.replace(/_/g, ' ')}
          </div>
          <p className="text-[11px] text-[var(--ink-2)]">
            What has actually transpired with the official election registration authority.
          </p>
        </div>
      </div>

      {reportSuccess && (
        <Alert type="success" title="Official Submission Recorded">
          Your report of official submission has been stored. The case is now marked at Stage 5 (User-Reported Official Submission).
        </Alert>
      )}

      {/* Next Actions & Official Submission Button */}
      <Card title="Required Next Actions">
        <div className="space-y-4 pt-1">
          <div className="text-xs text-[var(--ink-2)] leading-relaxed bg-[var(--surface-2)] p-4 rounded-[var(--r-md)] border border-[var(--line)]">
            <h4 className="font-bold text-[var(--link)] mb-1">Recommended Statutory Form: {c.recommendedFormCode}</h4>
            <p>
              Please take the generated Application Preparation Sheet and submit the official form through voters.eci.gov.in or directly at your local Electoral Registration Office.
            </p>
          </div>

          {c.officialStage === OfficialProcessStage.STAGE_4_APPLICATION_PREPARED && !reportingSubmission && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => setReportingSubmission(true)}
              >
                Report Official Submission (I have submitted to ECI) →
              </Button>
            </div>
          )}

          {reportingSubmission && (
            <form onSubmit={handleReportOfficialSubmission} className="space-y-4 p-4 bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line-strong)]">
              <h4 className="text-sm font-bold text-[var(--link)]">Report Official Statutory Submission</h4>
              <p className="text-xs text-[var(--ink-2)]">
                Reporting submission here records that you have submitted your application. It is marked as self-reported and does not constitute an official ECI receipt.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--ink)]">Submission Channel *</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value)}
                    className="w-full min-h-[44px] px-3 py-2 rounded-[var(--r-md)] border border-[var(--line-strong)] text-sm bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                  >
                    <option value="ECI_VOTERS_PORTAL">Official ECI Voters’ Service Portal</option>
                    <option value="VOTER_HELPLINE_APP">Voter Helpline Mobile App</option>
                    <option value="BLO_DIRECT">Booth Level Officer (In Person)</option>
                    <option value="ERO_OFFICE">Electoral Registration Office (Physical Form)</option>
                  </select>
                </div>

                <Input
                  id="ack-ref"
                  label="Official Acknowledgement Ref / Receipt Number"
                  description="e.g. Form 6 Reference Number provided by ECI."
                  value={ackRef}
                  onChange={(e) => setAckRef(e.target.value)}
                  placeholder="e.g. DL2026-F6-XXXX"
                />

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[var(--ink)] block mb-1">Optional Notes</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Received SMS confirmation from ECI"
                    className="w-full min-h-[44px] px-3 py-2 rounded-[var(--r-md)] border border-[var(--line-strong)] text-sm bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" variant="primary" size="sm">
                  Confirm Official Submission Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setReportingSubmission(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      {/* Case Activity Timeline */}
      <Card title="Activity Timeline & Audit Provenance">
        <div className="space-y-4 pt-2">
          {events.length > 0 ? (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-[var(--line)]">
              {events.map((ev: any, idx: number) => (
                <div key={idx} className="relative flex items-start gap-4 text-xs">
                  <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] border-2 border-[var(--link)] text-[var(--link)] flex items-center justify-center font-bold z-10 shrink-0">
                    •
                  </div>
                  <div className="bg-[var(--surface)] p-3.5 rounded-[var(--r-md)] border border-[var(--line)] w-full space-y-1 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--ink)] text-sm">{ev.title}</span>
                      <span className="text-[11px] text-[var(--ink-3)]">{ev.timestamp.split('T')[0]}</span>
                    </div>
                    <p className="text-[var(--ink-2)] leading-relaxed">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--ink-3)] py-4">No timeline events recorded yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
