import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Alert,
  Badge,
  AshokaChakraProgressRing,
  IndependentNotice,
} from '@voterrule/ui';
import { useApp } from '../context/AppContext.js';

export interface MissingNamePageProps {
  onNavigate: (path: string) => void;
}

export const MissingNamePage: React.FC<MissingNamePageProps> = ({ onNavigate }) => {
  const { user, locale, t } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [hadPriorEntry, setHadPriorEntry] = useState<'YES' | 'NO' | 'NOT_SURE'>('YES');
  const [hasEpic, setHasEpic] = useState<'YES' | 'NO'>('NO');
  const [epicNumber, setEpicNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [relativeName, setRelativeName] = useState('');
  const [dobYear, setDobYear] = useState('2002');
  const [state, setState] = useState('Delhi');
  const [district, setDistrict] = useState('Central Delhi');
  const [assemblyConstituency, setAssemblyConstituency] = useState('AC-21 (Matia Mahal)');
  const [address, setAddress] = useState('');
  const [hasShifted, setHasShifted] = useState(false);
  const [previousAddress, setPreviousAddress] = useState('');
  const [officialCheckedDate, setOfficialCheckedDate] = useState(new Date().toISOString().split('T')[0]);
  const [informedConsent, setInformedConsent] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCase, setCreatedCase] = useState<any>(null);

  const handleNext = () => {
    setError(null);
    if (step === 2 && !fullName.trim()) {
      setError('Please provide your full name as reported on your official documents.');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(Math.max(1, step - 1));
  };

  const handleSubmitCase = async () => {
    if (!informedConsent) {
      setError('You must confirm the informed consent checkbox before creating the case.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const idempotencyKey = `case-missing-${user?.id || 'anon'}-${Date.now()}`;
      const res = await fetch('/api/v1/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'idempotency-key': idempotencyKey,
          'x-user-id': user?.id || 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        body: JSON.stringify({
          category: 'MISSING_NAME',
          recommendedFormCode: 'FORM_6',
          guidanceVersionIds: ['guidance-form-6-v2026'],
          answers: [
            { questionId: 'prior_registration', answer: hadPriorEntry, guidanceVersion: '2026.2' },
            { questionId: 'has_epic', answer: hasEpic, guidanceVersion: '2026.2' },
            { questionId: 'official_check_date', answer: officialCheckedDate, guidanceVersion: '2026.2' },
          ],
          epicNumberProvided: epicNumber || undefined,
          state,
          district,
          assemblyConstituency,
          nameAsReported: fullName,
          relativeName,
          dobYear: parseInt(dobYear, 10) || 2000,
          addressSummary: address,
          previousAddressSummary: hasShifted ? previousAddress : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to submit assistance case');
      }

      setCreatedCase(data.data);
      setStep(totalSteps); // Success screen
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header and Step Progress Ring */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--saffron-deep)]">
            Civic Inclusion Assistance
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
            {locale === 'hi' ? 'छूटा हुआ नाम सहायता विज़ार्ड' : 'Missing-Name Assistance Wizard'}
          </h1>
          <p className="text-xs text-[var(--ink-2)] mt-0.5">
            Diagnose omitted voter entries and prepare statutory Form 6 application sheets.
          </p>
        </div>

        <AshokaChakraProgressRing
          completed={step}
          total={totalSteps}
          size={56}
          showLabel={false}
        />
      </div>

      <IndependentNotice locale={locale} />

      {error && <Alert type="error">{error}</Alert>}

      {/* Wizard Steps */}
      {step === 1 && (
        <Card title="Step 1 of 6: Prior Electoral Registration Status">
          <div className="space-y-4 pt-2">
            <p className="text-sm text-[var(--ink)]">
              Did you previously have a registered entry in any electoral roll in India?
            </p>

            <div className="space-y-2">
              {[
                { val: 'NO', label: 'No, I have never been registered as a voter (First-time applicant)' },
                { val: 'YES', label: 'Yes, I was previously registered but my name is now missing' },
                { val: 'NOT_SURE', label: 'Not sure / Unknown prior status' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-3.5 rounded-[var(--r-md)] border cursor-pointer transition-colors ${
                    hadPriorEntry === opt.val
                      ? 'border-[var(--link)] bg-[var(--surface-2)] ring-1 ring-[var(--link)] font-semibold'
                      : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/60'
                  }`}
                >
                  <input
                    type="radio"
                    name="priorStatus"
                    value={opt.val}
                    checked={hadPriorEntry === opt.val}
                    onChange={() => setHadPriorEntry(opt.val as any)}
                    className="accent-[var(--link)] text-[var(--link)] focus:ring-[var(--focus)]"
                  />
                  <span className="text-sm text-[var(--ink)]">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <Button variant="primary" size="md" onClick={handleNext}>
                Continue to Step 2 →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card title="Step 2 of 6: Identifying Details & EPIC Number">
          <div className="space-y-4 pt-2">
            <Input
              id="full-name"
              label="Full Name (as on your identity/age proof)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Aarav Sharma"
              required
            />

            <Input
              id="relative-name"
              label="Father’s / Mother’s / Spouse’s Name"
              value={relativeName}
              onChange={(e) => setRelativeName(e.target.value)}
              placeholder="e.g. Ramesh Sharma"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="dob-year"
                type="number"
                label="Year of Birth"
                value={dobYear}
                onChange={(e) => setDobYear(e.target.value)}
                min="1900"
                max="2008"
                required
              />
              <Input
                id="epic-num"
                label="Prior EPIC Card Number (Optional)"
                description="Format is typically 3 letters followed by 7 digits (e.g. ABC1234567)."
                value={epicNumber}
                onChange={(e) => {
                  setEpicNumber(e.target.value);
                  setHasEpic(e.target.value ? 'YES' : 'NO');
                }}
                placeholder="Leave blank if unknown"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="outline" size="md" onClick={handleBack}>
                ← Back
              </Button>
              <Button variant="primary" size="md" onClick={handleNext}>
                Continue to Step 3 →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card title="Step 3 of 6: Official Search Verification & Residence History">
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                id="res-state"
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
              <Input
                id="res-district"
                label="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                required
              />
              <Input
                id="res-ac"
                label="Assembly Constituency"
                value={assemblyConstituency}
                onChange={(e) => setAssemblyConstituency(e.target.value)}
                required
              />
            </div>

            <Input
              id="res-address"
              label="Current Ordinary Residence Address"
              description="Enter your full postal address where you ordinarily reside."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 15 Barakhamba Road, New Delhi"
              required
            />

            <Input
              id="check-date"
              type="date"
              label="Date You Checked Official Electoral Roll"
              value={officialCheckedDate}
              onChange={(e) => setOfficialCheckedDate(e.target.value)}
              required
            />

            <div className="p-3.5 bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line-strong)] space-y-2">
              <label className="flex items-center gap-2.5 text-sm text-[var(--ink)] font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasShifted}
                  onChange={(e) => setHasShifted(e.target.checked)}
                  className="rounded border-[var(--line-strong)] text-[var(--link)] accent-[var(--link)] focus:ring-[var(--focus)]"
                />
                <span>I recently shifted from another residence or constituency</span>
              </label>

              {hasShifted && (
                <div className="pt-2">
                  <Input
                    id="prev-address"
                    label="Previous Address / Constituency"
                    value={previousAddress}
                    onChange={(e) => setPreviousAddress(e.target.value)}
                    placeholder="e.g. Indiranagar, Bengaluru, Karnataka"
                  />
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="outline" size="md" onClick={handleBack}>
                ← Back
              </Button>
              <Button variant="primary" size="md" onClick={handleNext}>
                Continue to Recommendation →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card title="Step 4 of 6: Statutory Guidance Recommendation">
          <div className="space-y-4 pt-2">
            <div className="bg-[var(--green-wash)] rounded-[var(--r-md)] p-4 border border-[var(--green)]/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--green-deep)] uppercase tracking-wider">
                  Statutory Form Recommendation
                </span>
                <Badge label="Verified Rule Engine" variant="success" />
              </div>
              <h3 className="font-display font-bold text-lg text-[var(--ink)]">
                {hasShifted
                  ? 'Form 8 (Section 1: Shifting of Residence)'
                  : 'Form 6 (Application for Inclusion of Name in Electoral Roll)'}
              </h3>
              <p className="text-xs text-[var(--ink-2)] leading-relaxed">
                {hasShifted
                  ? 'Because you indicated moving from a previous constituency, statutory rules dictate submitting Form 8 for shifting of residence to transfer your registration rather than creating a duplicate Form 6.'
                  : 'Under Rule 13(1) and 26 of the Registration of Electors Rules 1960, Form 6 is the statutory form to be submitted during the Special Summary Revision (SSR) claims and objections window for omission re-inclusion.'}
              </p>
            </div>

            <div className="bg-[var(--surface-2)] p-4 rounded-[var(--r-md)] border border-[var(--line)] text-xs text-[var(--ink-2)] space-y-1.5">
              <span className="font-bold text-[var(--ink)] block">Official Statutory Caveat:</span>
              <p>
                This platform recommendation does not constitute an official determination. Final acceptance or rejection of inclusion rests solely with your Electoral Registration Officer (ERO).
              </p>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="outline" size="md" onClick={handleBack}>
                ← Back
              </Button>
              <Button variant="primary" size="md" onClick={handleNext}>
                View Document Checklist →
              </Button>
            </div>
          </div>
        </Card>
      )}

      {step === 5 && (
        <Card title="Step 5 of 6: Document Checklist & Aadhaar Masking Rule">
          <div className="space-y-4 pt-2">
            {/* Aadhaar Never Collected Strict Warning */}
            <div className="bg-[var(--saffron-wash)] p-4 rounded-[var(--r-md)] border border-[var(--saffron)]/30 space-y-2">
              <div className="flex items-center gap-2 text-[var(--saffron-deep)] font-bold text-sm">
                <span>🛡️</span>
                <span>Mandatory Privacy Rule: Mask Aadhaar Numbers</span>
              </div>
              <p className="text-xs text-[var(--ink)] leading-relaxed">
                VoterRule never collects or stores Aadhaar numbers. If you upload a document (such as an Aadhaar letter or card) as age or address proof, you MUST mask the first 8 digits so that only the last 4 digits are visible.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--ink-3)]">
                Required Documents for Your Application:
              </h4>

              <div className="p-3.5 bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] text-xs space-y-1">
                <span className="font-bold text-[var(--link)]">1. Proof of Age / Date of Birth:</span>
                <p className="text-[var(--ink-2)]">
                  Birth Certificate, 10th Class Marksheet, Passport, or PAN Card.
                </p>
              </div>

              <div className="p-3.5 bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] text-xs space-y-1">
                <span className="font-bold text-[var(--link)]">2. Proof of Ordinary Residence:</span>
                <p className="text-[var(--ink-2)]">
                  Electricity/Water Bill (recent), Bank Passbook, Passport, or Registered Rent Agreement.
                </p>
              </div>
            </div>

            {/* Informed Consent Checkbox */}
            <div className="pt-3 border-t border-[var(--line)]">
              <label className="flex items-start gap-3 text-xs text-[var(--ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={informedConsent}
                  onChange={(e) => setInformedConsent(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--line-strong)] text-[var(--link)] accent-[var(--link)] focus:ring-[var(--focus)]"
                  required
                />
                <span>
                  {t('wizard.informedConsentNotice')}
                </span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button variant="outline" size="md" onClick={handleBack}>
                ← Back
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!informedConsent}
                isLoading={submitting}
                onClick={handleSubmitCase}
              >
                Create Assistance Case & Generate Prep Sheet
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 6: Case Created & Application Preparation Sheet */}
      {step === 6 && createdCase && (
        <div className="space-y-6">
          <Card>
            <div className="text-center py-4 space-y-3">
              <div className="w-12 h-12 bg-[var(--green-wash)] text-[var(--green-deep)] rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-[var(--ink)]">
                {t('wizard.caseCreatedTitle')}
              </h2>
              <div className="inline-block bg-[var(--surface-2)] px-4 py-2 rounded-[var(--r-md)] border border-[var(--line-strong)]">
                <span className="text-xs text-[var(--ink-3)] block">Portal Reference (Not an official ECI number)</span>
                <span className="text-base font-black text-[var(--link)]">
                  {createdCase.publicRef}
                </span>
              </div>
              <p className="text-xs text-[var(--ink-2)] max-w-md mx-auto">
                {t('wizard.caseCreatedSubtitle')} Your case is now accessible from your citizen dashboard.
              </p>
            </div>
          </Card>

          {/* Printable Application Preparation Sheet */}
          <div className="bg-[var(--surface)] rounded-[var(--r-lg)] border-2 border-[var(--line-strong)] p-6 sm:p-8 space-y-6 print:border-black shadow-[var(--shadow)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--line)]">
              <div>
                <span className="text-xs font-bold text-[var(--saffron-deep)] uppercase tracking-wider block">
                  {createdCase.preparationSheet?.disclaimer}
                </span>
                <h3 className="font-display font-extrabold text-xl text-[var(--ink)] mt-1">
                  {createdCase.preparationSheet?.title}
                </h3>
                <span className="text-xs text-[var(--ink-3)]">
                  Ref: {createdCase.publicRef} • Form: {createdCase.preparationSheet?.recommendedForm}
                </span>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => window.print()}
                className="shrink-0"
              >
                🖨️ Print Preparation Sheet
              </Button>
            </div>

            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-sm text-[var(--ink)] uppercase tracking-wider">
                Applicant Information for Official Form:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[var(--surface-2)] p-4 rounded-[var(--r-md)] border border-[var(--line)]">
                <div>
                  <span className="text-[var(--ink-3)] block">Applicant Name:</span>
                  <span className="font-bold text-sm text-[var(--ink)]">
                    {createdCase.preparationSheet?.applicantFields.name}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--ink-3)] block">Relative Name:</span>
                  <span className="font-bold text-sm text-[var(--ink)]">
                    {createdCase.preparationSheet?.applicantFields.relativeName}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--ink-3)] block">Birth Year:</span>
                  <span className="font-bold text-sm text-[var(--ink)]">
                    {createdCase.preparationSheet?.applicantFields.birthYear}
                  </span>
                </div>
                <div>
                  <span className="text-[var(--ink-3)] block">Jurisdiction:</span>
                  <span className="font-bold text-sm text-[var(--ink)]">
                    {createdCase.preparationSheet?.applicantFields.assemblyConstituency}, {createdCase.preparationSheet?.applicantFields.district}, {createdCase.preparationSheet?.applicantFields.state}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[var(--ink-3)] block">Address:</span>
                  <span className="font-semibold text-[var(--ink)]">
                    {createdCase.preparationSheet?.applicantFields.address}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-bold text-sm text-[var(--ink)] uppercase tracking-wider">
                  Submission Instructions:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[var(--ink)] bg-[var(--saffron-wash)] p-4 rounded-[var(--r-md)] border border-[var(--saffron)]/30">
                  {createdCase.preparationSheet?.instructions.map((ins: string, idx: number) => (
                    <li key={idx}>{ins}</li>
                  ))}
                </ol>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <a
                  href="https://voters.eci.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--link)] underline"
                >
                  <span>Open Official ECI Portal (voters.eci.gov.in)</span>
                  <span>↗</span>
                </a>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onNavigate(`/app/cases/${createdCase.publicRef}`)}
                >
                  Go to Case Tracking Page →
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
