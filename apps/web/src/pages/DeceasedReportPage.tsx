import React, { useState } from 'react';
import { Card, Button, Input, Alert } from '@voterrule/ui';
import { DeceasedBasis } from '@voterrule/shared';
import { useApp } from '../context/AppContext.js';

export interface DeceasedReportPageProps {
  onNavigate: (path: string) => void;
}

export const DeceasedReportPage: React.FC<DeceasedReportPageProps> = ({ onNavigate }) => {
  const { user, locale } = useApp();
  const [reportedName, setReportedName] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [approxAge, setApproxAge] = useState('');
  const [state, setState] = useState('Delhi');
  const [locality, setLocality] = useState('');
  const [basis, setBasis] = useState<DeceasedBasis>(DeceasedBasis.IMMEDIATE_FAMILY);
  const [basisExplanation, setBasisExplanation] = useState('');
  const [optionalEpic, setOptionalEpic] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/deceased-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        body: JSON.stringify({
          reportedPersonName: reportedName,
          relativeName: relativeName || undefined,
          approxAge: parseInt(approxAge, 10) || undefined,
          state,
          locality,
          basis,
          basisExplanation,
          optionalEpicMasked: optionalEpic || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to submit report');
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          {locale === 'hi' ? 'मृत व्यक्ति की रिपोर्ट (नागरिक सहायता)' : 'Report a Deceased Elector'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)]">
          Safeguarded reporting to assist families in official electoral roll maintenance.
        </p>
      </div>

      <div id="deceased-safeguards" className="bg-[var(--saffron-wash)] p-4 rounded-[var(--r-md)] border border-[var(--saffron)]/30 text-xs text-[var(--ink)] space-y-2">
        <span className="font-bold text-[var(--saffron-deep)]">Legal & Civic Safeguard Notice:</span>
        <p className="text-[var(--ink-2)]">
          Reports never trigger automated deletions or modifications to official rolls. Statutory deletion requires official Form 7 submission to the competent Electoral Registration Officer (ERO) accompanied by a verified Death Certificate. Filing false statutory claims carries penalties under election law.
        </p>
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {result ? (
        <Card title="Report Received for Review">
          <div id="deceased-confirmation" className="space-y-4 pt-2">
            <Alert type="success" title="Report Reference">
              {result.publicRef}
            </Alert>
            <p className="text-xs text-[var(--ink-2)] leading-relaxed">
              {result.message}
            </p>
            <div className="p-4 bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line)] text-xs space-y-2">
              <span className="font-bold text-[var(--link)]">Next Statutory Steps for the Family:</span>
              <p className="text-[var(--ink-2)]">
                To formally remove the name from the official electoral roll, an immediate family member should submit statutory <strong>Form 7</strong> directly to the local Booth Level Officer (BLO) or ERO office with a copy of the official Death Certificate.
              </p>
            </div>
            <Button variant="outline" size="md" onClick={() => onNavigate('/app')}>
              Return to Citizen Dashboard
            </Button>
          </div>
        </Card>
      ) : (
        <Card title="Report Details">
          <form id="deceased-form" onSubmit={handleSubmit} className="space-y-5 pt-2">
            <Input
              id="dec-name"
              label="Name of Deceased Person"
              value={reportedName}
              onChange={(e) => setReportedName(e.target.value)}
              data-ai-target="deceased-name-input"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="dec-rel"
                label="Father's / Mother's / Spouse's Name"
                value={relativeName}
                onChange={(e) => setRelativeName(e.target.value)}
              />
              <Input
                id="dec-age"
                type="number"
                label="Approximate Age at Death"
                value={approxAge}
                onChange={(e) => setApproxAge(e.target.value)}
                min="18"
                max="130"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="dec-state"
                label="State / UT"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input
                id="dec-loc"
                label="Locality / Polling Station Area"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Ward 4, Civil Lines"
                required
              />
            </div>

            <Input
              id="dec-epic"
              label="Deceased Person's EPIC Number (If known)"
              value={optionalEpic}
              onChange={(e) => setOptionalEpic(e.target.value)}
              placeholder="e.g. ABC1234567"
            />

            <div id="deceased-consent" className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[var(--ink)] block">
                  Reporter’s Basis of Knowledge *
                </label>
                <select
                  value={basis}
                  onChange={(e) => setBasis(e.target.value as any)}
                  data-ai-target="deceased-basis-select"
                  className="w-full min-h-[44px] px-3 py-2 rounded-[var(--r-md)] border border-[var(--line-strong)] text-sm bg-[var(--surface)] text-[var(--ink)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                >
                  <option value={DeceasedBasis.IMMEDIATE_FAMILY}>Immediate Family Member</option>
                  <option value={DeceasedBasis.OTHER_RELATIVE}>Other Relative</option>
                  <option value={DeceasedBasis.NEIGHBOUR}>Neighbour / Community Member</option>
                  <option value={DeceasedBasis.LOCAL_OFFICIAL}>Local Official / Representative</option>
                  <option value={DeceasedBasis.OTHER}>Other Basis</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[var(--ink-2)]">
                  Detailed Basis Explanation (Minimum 10 characters): *
                </label>
                <textarea
                  rows={3}
                  value={basisExplanation}
                  onChange={(e) => setBasisExplanation(e.target.value)}
                  className="w-full p-2.5 rounded-[var(--r-md)] border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
                  placeholder="State your relationship, date or circumstances of passing, and any official certificate details."
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={submitting} data-ai-target="deceased-submit-btn">
              Submit Deceased Person Report
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
