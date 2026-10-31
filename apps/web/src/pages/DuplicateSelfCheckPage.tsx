import React, { useState } from 'react';
import { Card, Button, Input, Alert } from '@voterrule/ui';
import { useApp } from '../context/AppContext.js';

export interface DuplicateSelfCheckPageProps {
  onNavigate: (path: string) => void;
}

export const DuplicateSelfCheckPage: React.FC<DuplicateSelfCheckPageProps> = ({ onNavigate }) => {
  const { user, locale } = useApp();
  const [fullName, setFullName] = useState('');
  const [currentState, setCurrentState] = useState('Delhi');
  const [currentAddress, setCurrentAddress] = useState('');
  const [previousState, setPreviousState] = useState('');
  const [previousAddress, setPreviousAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/duplicate/self-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        body: JSON.stringify({
          fullName,
          currentState,
          currentAddress,
          previousState,
          previousAddress,
        }),
      });

      const data = await res.json();
      setResult(data.data);
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
          {locale === 'hi'
            ? 'संभावित दोहरे पंजीकरण की स्व-जांच'
            : 'Self-Check for Possible Duplicate Registration'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)]">
          Identify and resolve redundant entries from prior residences under Section 17 & 18 of the Representation of the People Act 1950.
        </p>
      </div>

      <div className="bg-[var(--surface-2)] p-4 rounded-[var(--r-md)] border border-[var(--line-strong)] text-xs text-[var(--ink)] space-y-2">
        <span className="font-bold text-[var(--link)]">Statutory Principle:</span>
        <p className="text-[var(--ink-2)]">
          Section 17 of RPA 1950 states that no person is entitled to be enrolled on the electoral roll for more than one constituency. If you have shifted, statutory Form 7 is filed to delete the outdated entry from your prior constituency.
        </p>
      </div>

      {result ? (
        <Card title="Self-Check Guidance & Assistance Case Created">
          <div className="space-y-4 pt-2">
            <Alert type="success" title="Case Created">
              Portal Reference: {result.publicRef}
            </Alert>

            <div className="bg-[var(--surface-2)] p-4 rounded-[var(--r-md)] border border-[var(--line)] text-xs space-y-2">
              <span className="font-bold text-[var(--link)]">{result.recommendedForm}</span>
              <ul className="list-disc list-inside space-y-1 text-[var(--ink-2)]">
                {result.instructions?.map((ins: string, i: number) => (
                  <li key={i}>{ins}</li>
                ))}
              </ul>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate(`/app/cases/${result.publicRef}`)}
            >
              Track Case in Dashboard →
            </Button>
          </div>
        </Card>
      ) : (
        <Card title="Enter Your Current and Prior Locality Details">
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <Input
              id="dup-name"
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3 p-3.5 bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line)]">
                <span className="text-xs font-bold text-[var(--ink)] block">Current Residence:</span>
                <Input
                  id="cur-state"
                  label="Current State"
                  value={currentState}
                  onChange={(e) => setCurrentState(e.target.value)}
                  required
                />
                <Input
                  id="cur-addr"
                  label="Current Address"
                  value={currentAddress}
                  onChange={(e) => setCurrentAddress(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3 p-3.5 bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line)]">
                <span className="text-xs font-bold text-[var(--ink)] block">Prior Residence:</span>
                <Input
                  id="prev-state"
                  label="Prior State"
                  value={previousState}
                  onChange={(e) => setPreviousState(e.target.value)}
                  placeholder="e.g. Uttar Pradesh"
                  required
                />
                <Input
                  id="prev-addr"
                  label="Prior Address / Constituency"
                  value={previousAddress}
                  onChange={(e) => setPreviousAddress(e.target.value)}
                  placeholder="e.g. Gomti Nagar, Lucknow"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" size="md" isLoading={submitting}>
              Run Self-Check & Get Form 7 Guidance
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
};
