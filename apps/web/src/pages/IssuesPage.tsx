import React, { useState } from 'react';
import { Card, Button, Input, Alert } from '@voterrule/ui';
import { useApp } from '../context/AppContext.js';

export interface IssuesPageProps {
  onNavigate: (path: string) => void;
}

export const IssuesPage: React.FC<IssuesPageProps> = ({ onNavigate }) => {
  const { user, locale } = useApp();
  const [issueType, setIssueType] = useState<'SHIFTING' | 'CORRECTION' | 'REPLACEMENT' | 'PWD'>('CORRECTION');
  const [fullName, setFullName] = useState('');
  const [epicNumber, setEpicNumber] = useState('');
  const [correctionDetails, setCorrectionDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdCase, setCreatedCase] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
          'idempotency-key': `corr-${Date.now()}`,
        },
        body: JSON.stringify({
          category: issueType === 'SHIFTING' ? 'SHIFTING_RESIDENCE' : 'CORRECTION_PARTICULARS',
          recommendedFormCode: 'FORM_8',
          guidanceVersionIds: ['guidance-form-8-v2026'],
          answers: [
            { questionId: 'issue_type', answer: issueType, guidanceVersion: '2026.2' },
            { questionId: 'correction_notes', answer: correctionDetails, guidanceVersion: '2026.2' },
          ],
          epicNumberProvided: epicNumber,
          state: 'Delhi',
          nameAsReported: fullName,
          addressSummary: correctionDetails,
        }),
      });

      const data = await res.json();
      setCreatedCase(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          {locale === 'hi' ? 'विवरण सुधार एवं निवास परिवर्तन (प्रारूप 8)' : 'Corrections, Shifting & Form 8 Services'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)]">
          Prepare Form 8 application for name correction, shifting residence, replacement EPIC, or PwD marking.
        </p>
      </div>

      {createdCase ? (
        <Card title="Form 8 Assistance Case Created">
          <div className="space-y-4 pt-2">
            <Alert type="success" title="Case Reference Generated">
              Your assistance case {createdCase.publicRef} has been recorded.
            </Alert>
            <div className="p-4 bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line)] text-xs space-y-2">
              <span className="font-bold text-[var(--link)]">Statutory Procedure:</span>
              <p className="text-[var(--ink-2)]">
                Form 8 is processed by your local Electoral Registration Officer. Submit online at voters.eci.gov.in or offline at your ERO office.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => onNavigate(`/app/cases/${createdCase.publicRef}`)}>
              View Case Details & Prep Sheet →
            </Button>
          </div>
        </Card>
      ) : (
        <Card title="Form 8 Guided Intake">
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[var(--ink)] block">
                Select the service you require under Form 8:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { id: 'CORRECTION', title: 'Correction of Particulars', desc: 'Name, DOB, gender, relative name, address' },
                  { id: 'SHIFTING', title: 'Shifting of Residence', desc: 'Within or across assembly constituency' },
                  { id: 'REPLACEMENT', title: 'Replacement EPIC Card', desc: 'Lost, destroyed, or mutilated voter ID' },
                  { id: 'PWD', title: 'Marking of PwD', desc: 'Person with Disability voting facilitation' },
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`p-3.5 rounded-[var(--r-md)] border cursor-pointer transition-colors ${
                      issueType === s.id
                        ? 'border-[var(--link)] bg-[var(--surface-2)] ring-1 ring-[var(--link)] font-bold'
                        : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="issueType"
                      value={s.id}
                      checked={issueType === s.id}
                      onChange={() => setIssueType(s.id as any)}
                      className="sr-only"
                    />
                    <span className="block text-[var(--ink)] font-semibold">{s.title}</span>
                    <span className="text-[11px] font-normal text-[var(--ink-2)] block mt-0.5">{s.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="corr-name"
                label="Full Name (as on existing record)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                id="corr-epic"
                label="EPIC Card Number"
                value={epicNumber}
                onChange={(e) => setEpicNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[var(--ink-2)]">
                Details to be updated or new address:
              </label>
              <textarea
                rows={3}
                value={correctionDetails}
                onChange={(e) => setCorrectionDetails(e.target.value)}
                className="w-full p-2.5 rounded-[var(--r-md)] border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                placeholder="Describe the exact correction needed or new address."
                required
              />
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={submitting}>
              Generate Form 8 Preparation Sheet
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
