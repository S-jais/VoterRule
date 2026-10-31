import React, { useState } from 'react';
import { Card, Button, Input, Alert } from '@matdata-setu/ui';
import { StatusCheckOutcome } from '@matdata-setu/shared';
import { useApp } from '../context/AppContext.js';

export interface CheckPageProps {
  onNavigate: (path: string) => void;
}

export const CheckPage: React.FC<CheckPageProps> = ({ onNavigate }) => {
  const { user, locale } = useApp();
  const [epicNumber, setEpicNumber] = useState('');
  const [state, setState] = useState('Delhi');
  const [selectedOutcome, setSelectedOutcome] = useState<StatusCheckOutcome | ''>('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState<any>(null);

  const outcomes = [
    {
      val: StatusCheckOutcome.CONFIRMED_PRESENT_IN_OFFICIAL_RESULT,
      labelEn: 'Confirmed Present in Official Result',
      labelHi: 'आधिकारिक खोज परिणाम में उपस्थित पाया गया',
      descEn: 'Your name, EPIC, and polling station were successfully located on the official roll.',
      descHi: 'आपका नाम, ईपीआईसी और मतदान केंद्र आधिकारिक सूची में मिल गया है।',
    },
    {
      val: StatusCheckOutcome.NOT_FOUND_IN_CHECKED_SEARCH,
      labelEn: 'Not Found in Checked Search',
      labelHi: 'जांची गई खोज में रिकॉर्ड नहीं मिला',
      descEn: 'The official search returned zero matching records for the details entered.',
      descHi: 'दर्ज किए गए विवरणों के लिए आधिकारिक खोज में कोई रिकॉर्ड नहीं मिला।',
    },
    {
      val: StatusCheckOutcome.DETAILS_APPEAR_INCONSISTENT,
      labelEn: 'Details Appear Inconsistent',
      labelHi: 'विवरण असंगत प्रतीत होते हैं',
      descEn: 'Record located, but spelling, age, relative name, or address differs from your current situation.',
      descHi: 'रिकॉर्ड मिला, लेकिन नाम, आयु, संबंध या पते में भिन्नता है।',
    },
    {
      val: StatusCheckOutcome.SEARCH_COULD_NOT_BE_COMPLETED,
      labelEn: 'Search Could Not Be Completed',
      labelHi: 'खोज पूरी नहीं की जा सकी',
      descEn: 'Technical timeout, official server downtime, or OTP not received on official portal.',
      descHi: 'तकनीकी खराबी या आधिकारिक पोर्टल पर ओटीपी प्राप्त न होना।',
    },
    {
      val: StatusCheckOutcome.NEEDS_FURTHER_VERIFICATION,
      labelEn: 'Needs Further Verification',
      labelHi: 'अग्रिम सत्यापन की आवश्यकता है',
      descEn: 'Multiple similar records found or ambiguous assembly constituency boundaries.',
      descHi: 'एक से अधिक समान रिकॉर्ड मिले या क्षेत्र सीमा अस्पष्ट है।',
    },
  ];

  const handleSimulateLookup = async () => {
    setLoading(true);
    setSimulatedResult(null);

    try {
      const res = await fetch('/api/v1/status-checks/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epicNumber, state }),
      });
      const data = await res.json();
      setSimulatedResult(data.data);
      if (data.data?.outcome) {
        setSelectedOutcome(data.data.outcome);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutcome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutcome) return;

    setLoading(true);
    try {
      const res = await fetch('/api/v1/status-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        body: JSON.stringify({
          officialSourceId: 'link-eci-voter-search',
          checkedAt: new Date().toISOString(),
          outcome: selectedOutcome,
          notes: notes || undefined,
          epicNumberMasked: epicNumber || undefined,
          state,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          {locale === 'hi' ? 'आधिकारिक मतदाता सूची जांच' : 'Check Your Voter Details'}
        </h1>
        <p className="text-sm text-[var(--ink-2)]">
          {locale === 'hi'
            ? 'आधिकारिक चुनाव आयोग पोर्टल पर सीधे जांच करें और अपने द्वारा देखे गए परिणाम को यहाँ सुरक्षित रूप से दर्ज करें।'
            : 'Perform your search directly on the official Election Commission portal and record your observed outcome.'}
        </p>
      </div>

      {/* Guided Official Lookup Box */}
      <Card title="Step 1: Perform the Search on the Official ECI Portal">
        <div className="space-y-4 pt-1 text-sm text-[var(--ink)]">
          <p className="text-[var(--ink-2)]">
            VoterRule never scrapes or bypasses official CAPTCHAs. Please open the official Electoral Search tool:
          </p>

          <div className="bg-[var(--surface-2)] p-4 rounded-[var(--r-md)] border border-[var(--line-strong)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-bold text-[var(--link)] text-base">
                Official Electoral Search (ECI)
              </span>
              <p className="text-xs text-[var(--ink-2)]">
                Search by EPIC, by Details (Name, Age, State), or by Mobile OTP.
              </p>
            </div>
            <a
              href="https://electoralsearch.eci.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm inline-flex items-center gap-1.5 shrink-0"
            >
              <span>Open electoralsearch.eci.gov.in</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--ink-3)] mb-2">
              What to Have Ready:
            </h4>
            <ul className="text-xs text-[var(--ink-2)] space-y-1 list-disc list-inside">
              <li>Your EPIC voter ID card number (if you previously received one)</li>
              <li>Your exact name spelling as used in previous applications</li>
              <li>Your state, district, and assembly constituency</li>
              <li>Your mobile number registered with the Election Commission</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Step 2: Record User-Observed Outcome */}
      <Card title="Step 2: Record Your Observed Search Result">
        <form onSubmit={handleSaveOutcome} className="space-y-6 pt-2">
          {savedSuccess && (
            <Alert type="success" title="Result Recorded Successfully">
              Your status check outcome has been added to your dashboard with a verified provenance record.
              {selectedOutcome === StatusCheckOutcome.NOT_FOUND_IN_CHECKED_SEARCH && (
                <div className="mt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate('/app/missing-name')}
                  >
                    Proceed to Missing-Name Assistance Wizard →
                  </Button>
                </div>
              )}
            </Alert>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="search-epic"
              label="EPIC Card Number (Optional)"
              description="Leave blank if registering for the first time or if unknown."
              placeholder="e.g. ABC1234567"
              value={epicNumber}
              onChange={(e) => setEpicNumber(e.target.value)}
            />
            <Input
              id="search-state"
              label="State / Union Territory"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </div>

          {/* Demo Simulation Helper Button */}
          <div className="p-3 bg-[var(--saffron-wash)] rounded-[var(--r-md)] border border-[var(--saffron)]/30 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--saffron-deep)]">
            <span>
              <strong>Demo Test Simulator:</strong> Test with synthetic EPICs <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded font-mono">DEMO1234567</code> (Present) or <code className="bg-[var(--surface-2)] px-1 py-0.5 rounded font-mono">INCONSIST99</code> (Inconsistent).
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSimulateLookup}
              isLoading={loading}
            >
              Simulate Lookup
            </Button>
          </div>

          {simulatedResult && (
            <Alert type="info" title="Simulation Outcome">
              {simulatedResult.messageEn}
            </Alert>
          )}

          {/* The 5 Allowed Outcome Radio Choices */}
          <div className="space-y-3 pt-2">
            <label className="block text-sm font-bold text-[var(--ink)]">
              Which outcome did you observe on the official portal? *
            </label>

            <div className="space-y-2">
              {outcomes.map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-start gap-3 p-3.5 rounded-[var(--r-md)] border cursor-pointer transition-colors ${
                    selectedOutcome === opt.val
                      ? 'border-[var(--link)] bg-[var(--surface-2)] ring-1 ring-[var(--link)]'
                      : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="checkOutcome"
                    value={opt.val}
                    checked={selectedOutcome === opt.val}
                    onChange={() => setSelectedOutcome(opt.val)}
                    className="mt-1 accent-[var(--link)] text-[var(--link)] focus:ring-[var(--focus)]"
                    required
                  />
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-[var(--ink)] block">
                      {locale === 'hi' ? opt.labelHi : opt.labelEn}
                    </span>
                    <span className="text-xs text-[var(--ink-2)] block">
                      {locale === 'hi' ? opt.descHi : opt.descEn}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--ink-2)]">
              Optional Notes (e.g. part number, spelling mismatch observed):
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-[var(--r-md)] border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--ink)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--focus)]"
              placeholder="e.g. Name was spelled with 'ee' instead of 'i' in the draft roll."
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!selectedOutcome}
              isLoading={loading}
            >
              Save Search Outcome to My Dashboard
            </Button>

            {selectedOutcome === StatusCheckOutcome.NOT_FOUND_IN_CHECKED_SEARCH && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => onNavigate('/app/missing-name')}
              >
                Missing-Name Wizard →
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
