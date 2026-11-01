import React, { useState } from 'react';
import { Card, Button, Alert } from '@voterrule/ui';
import { ELIGIBILITY_QUESTIONS } from '@voterrule/guidance';
import { useApp } from '../context/AppContext.js';

export interface EligibilityCheckPageProps {
  onNavigate: (path: string) => void;
}

export const EligibilityCheckPage: React.FC<EligibilityCheckPageProps> = ({ onNavigate }) => {
  const { locale } = useApp();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [evaluated, setEvaluated] = useState(false);

  const handleSelectOption = (questionId: string, val: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: val }));
    setEvaluated(false);
  };

  const allAnswered = ELIGIBILITY_QUESTIONS.every((q) => !!answers[q.id]);

  const handleEvaluate = () => {
    setEvaluated(true);
  };

  // Check results
  const isCitizen = answers['citizenship'] === 'YES_RESIDENT' || answers['citizenship'] === 'YES_OVERSEAS';
  const isDisqualified = answers['disqualifications'] === 'SUBJECT_TO_ORDER';
  const ageStatus = answers['age_qualifying'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div id="eligibility-intro" className="space-y-1">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          {locale === 'hi'
            ? 'वैधानिक मतदाता पात्रता मार्गदर्शक (अनाम व डेटा-मुक्त)'
            : 'Stateless Electoral Eligibility Guidance'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)]">
          Understand voter eligibility under Article 326 of the Constitution of India and the Representation of the People Act 1950.
        </p>
      </div>

      <div className="bg-[var(--surface-2)] p-4 rounded-[var(--r-md)] border border-[var(--line-strong)] text-xs text-[var(--ink)] space-y-1.5">
        <span className="font-bold text-[var(--link)]">Stateless & Safe for Minors (Under 18):</span>
        <p className="text-[var(--ink-2)]">
          This checker is completely educational and anonymous. No account is required, no personal details are entered, and zero data is stored or logged. Prospective electors turning 18 may check advance registration rules here.
        </p>
      </div>

      <div id="questions-form" className="space-y-6">
        {ELIGIBILITY_QUESTIONS.map((q) => (
          <div
            key={q.id}
            data-ai-target={
              q.id === 'citizenship'
                ? 'eligibility-question-citizenship'
                : q.id === 'age_qualifying'
                ? 'eligibility-question-age'
                : undefined
            }
          >
            <Card title={`${q.order}. ${locale === 'hi' ? q.questionHi : q.questionEn}`}>
              <p className="text-xs text-[var(--ink-2)] mb-3">
                {locale === 'hi' ? q.helpTextHi : q.helpTextEn}
              </p>

              <div className="space-y-2">
                {q.options.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3 rounded-[var(--r-md)] border cursor-pointer text-xs transition-colors ${
                      answers[q.id] === opt.value
                        ? 'border-[var(--link)] bg-[var(--surface-2)] ring-1 ring-[var(--link)] font-bold text-[var(--ink)]'
                        : 'border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface-2)]/60 text-[var(--ink)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      value={opt.value}
                      checked={answers[q.id] === opt.value}
                      onChange={() => handleSelectOption(q.id, opt.value)}
                      className="mt-0.5 accent-[var(--link)] text-[var(--link)] focus:ring-[var(--focus)]"
                    />
                    <span>{locale === 'hi' ? opt.labelHi : opt.labelEn}</span>
                  </label>
                ))}
              </div>
            </Card>
          </div>
        ))}

        <div className="pt-2 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            disabled={!allAnswered}
            onClick={handleEvaluate}
            data-ai-target="eligibility-eval-btn"
          >
            Evaluate Eligibility Guidance →
          </Button>
        </div>

        {evaluated && (
          <div id="evaluation-result" className="pt-4 space-y-4">
            {!isCitizen ? (
              <Alert type="error" title="Citizenship Requirement">
                Under Article 326 of the Constitution of India and Section 16 of RPA 1950, only Indian citizens are eligible for enrollment on the electoral roll.
              </Alert>
            ) : isDisqualified ? (
              <Alert type="error" title="Statutory Disqualification">
                Section 16(1) of RPA 1950 disqualifies persons declared of unsound mind by a competent court or disqualified for the time being under election offence laws.
              </Alert>
            ) : ageStatus === 'TURNING_18_THIS_YEAR' ? (
              <Alert type="info" title="Eligible for Advance Application (Form 6)">
                Under the amended Section 14(b) of RPA 1950, young citizens who have turned 17 may submit advance applications in Form 6 during revision cycles. The application is officially processed upon reaching 18 years of age on the next applicable qualifying date (1 Jan, 1 Apr, 1 Jul, 1 Oct).
              </Alert>
            ) : (
              <Alert type="success" title="Prima Facie Eligible to Enroll">
                Based on your selected statutory criteria, you appear eligible for registration. If you are not currently enrolled on the electoral roll, you may proceed with Form 6.
              </Alert>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line)] text-xs text-[var(--ink-2)]">
              <span>Official determinations are made solely by competent ERO election authorities.</span>
              <Button variant="secondary" size="sm" onClick={() => onNavigate('/app/missing-name')}>
                Proceed to Missing-Name Wizard →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
