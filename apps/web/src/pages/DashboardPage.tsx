import React, { useEffect, useState } from 'react';
import {
  Card,
  Button,
  Badge,
  ProvenanceChip,
  AshokaChakraProgressRing,
} from '@voterrule/ui';
import { ProvenanceSourceType } from '@voterrule/shared';
import { useApp } from '../context/AppContext.js';

export interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user, locale, t } = useApp();
  const [cases, setCases] = useState<any[]>([]);
  const [statusChecks, setStatusChecks] = useState<any[]>([]);
  const [deadlines, setDeadlines] = useState<any>(null);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [casesRes, checksRes, deadRes] = await Promise.all([
          fetch('/api/v1/cases', {
            headers: { 'x-user-id': user?.id || 'synth-citizen-aarav-01' },
          }),
          fetch('/api/v1/status-checks', {
            headers: { 'x-user-id': user?.id || 'synth-citizen-aarav-01' },
          }),
          fetch('/api/v1/guidance/deadlines/DL'),
        ]);

        if (casesRes.ok) {
          const cData = await casesRes.json();
          setCases(cData.data || []);
        }
        if (checksRes.ok) {
          const chData = await checksRes.json();
          setStatusChecks(chData.data || []);
        }
        if (deadRes.ok) {
          const dData = await deadRes.json();
          setDeadlines(dData.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user]);

  const latestCheck = statusChecks[0];
  const activeCase = cases[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Two-System Civic Banner */}
      <div id="dashboard-summary" className="space-y-2">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          {t('dashboard.title')}
        </h1>
        <p className="text-sm text-[var(--ink-2)]">
          {locale === 'hi'
            ? 'नागरिक सहायता स्थिति: यह पोर्टल आपके मामले में सहायता कर रहा है; यह आधिकारिक चुनाव आयोग का निर्णय नहीं है।'
            : 'Civic assistance status: This portal is reviewing your case; this is not an official election authority decision.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Electoral Info & Open Cases */}
        <div className="lg:col-span-8 space-y-6">
          {/* Official Roll Status Card */}
          <div id="recent-checks">
            <Card
              title={t('dashboard.statusCheckHeading')}
              subtitle="Record of your user-observed searches on official election portals"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('/app/check')}
                  data-ai-target="dashboard-new-check-btn"
                >
                  + New Search Check
                </Button>
              }
            >
              {latestCheck ? (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-xs text-[var(--ink-3)] font-medium">Observed Search Outcome</span>
                      <div className="text-sm font-bold text-[var(--ink)]">
                        {latestCheck.outcome.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <ProvenanceChip
                      sourceType={ProvenanceSourceType.USER_RECORDED_OFFICIAL_LOOKUP}
                      dateStr={latestCheck.checkedAt.split('T')[0]}
                    />
                  </div>
                  {latestCheck.notes && (
                    <p className="text-xs text-[var(--ink-2)] bg-[var(--surface-2)] p-2.5 rounded-[var(--r-md)] border border-[var(--line)]">
                      "{latestCheck.notes}"
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <p className="text-xs text-[var(--ink-2)]">
                    You have not recorded any official electoral roll searches yet.
                  </p>
                  <Button variant="primary" size="sm" onClick={() => onNavigate('/app/check')} data-ai-target="dashboard-new-check-btn">
                    Perform Guided Voter Search
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Open Assistance Cases Card */}
          <div id="active-cases">
            <Card
              title={t('dashboard.openCases')}
              subtitle="Your active inclusion, correction, and verification cases"
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('/app/missing-name')}
                >
                  {t('dashboard.startNewCase')}
                </Button>
              }
            >
              {cases.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {cases.map((c) => (
                    <div
                      key={c.id}
                      data-ai-target="dashboard-active-case-card"
                      className="p-4 rounded-[var(--r-md)] border border-[var(--line)] hover:border-[var(--link)]/40 bg-[var(--surface)] transition-colors space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold text-[var(--link)]">
                            {c.publicRef}
                          </span>
                          <h4 className="font-display text-sm font-bold text-[var(--ink)]">
                            {c.category.replace(/_/g, ' ')}
                          </h4>
                        </div>
                        <Badge
                          label={`Portal: ${c.workflowStatus.replace(/_/g, ' ')}`}
                          variant="info"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--ink-2)] pt-2 border-t border-[var(--line)]">
                        <div>
                          <span className="text-[var(--ink-3)]">Recommended Form: </span>
                          <span className="font-semibold text-[var(--ink)]">{c.recommendedFormCode}</span>
                        </div>
                        <div>
                          <span className="text-[var(--ink-3)]">Official Statutory Stage: </span>
                          <span className="font-semibold text-[var(--ink)]">
                            {c.officialStage.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-[var(--ink-3)]">
                          Portal reference (not an official ECI number)
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate(`/app/cases/${c.publicRef}`)}
                        >
                          Track Case & View Prep Sheet
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-[var(--ink-2)]">{t('dashboard.noOpenCases')}</p>
                  <Button variant="primary" size="md" onClick={() => onNavigate('/app/missing-name')}>
                    Start Missing-Name Assistance Wizard
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Right Column: Case Progress Ring & Deadlines */}
        <div className="lg:col-span-4 space-y-6">
          {/* Progress Card */}
          <Card title="Assistance Case Progress">
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <AshokaChakraProgressRing
                completed={activeCase ? 3 : 0}
                total={5}
                size={84}
                showLabel={true}
              />
              <p className="text-xs text-center text-[var(--ink-2)] max-w-xs">
                Reflects portal preparation progress. Official statutory decisions are taken only by competent ERO authorities.
              </p>
            </div>
          </Card>

          {/* Verified Revision Schedules Card */}
          <div id="ssr-deadlines">
            <Card title={t('dashboard.deadlinesTitle')}>
              {deadlines?.hasVerifiedSchedule ? (
                <div className="space-y-3 pt-1 text-xs">
                  <div className="flex items-center justify-between font-semibold text-[var(--ink)]">
                    <span>{deadlines.schedule.stateName}</span>
                    <Badge label="Verified Schedule" variant="success" />
                  </div>
                  <div className="space-y-1.5 text-[var(--green-deep)] bg-[var(--green-wash)] p-3 rounded-[var(--r-md)] border border-[var(--green)]/30">
                    <p><strong>Claims & Objections Window:</strong></p>
                    <p>{deadlines.schedule.claimsAndObjectionsStart} to {deadlines.schedule.claimsAndObjectionsEnd}</p>
                    <p><strong>Final Roll Date:</strong> {deadlines.schedule.finalRollPublicationDate}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs text-[var(--ink-2)]">
                  <p>{deadlines?.messageEn || 'Schedule pending verification.'}</p>
                  <a
                    href={deadlines?.fallbackUrl || 'https://voters.eci.gov.in'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--link)] font-semibold underline block"
                  >
                    Check State CEO Website Directly →
                  </a>
                </div>
              )}
            </Card>
          </div>

          {/* Voluntary Contact Checkin Banner */}
          <div id="support-actions">
            <Card title="Contact Check-in">
              <div className="space-y-2 text-xs text-[var(--ink-2)]">
                <p>
                  Ensure your preferred reminder channels are current. Check-in is voluntary and non-response never affects your voter status.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => onNavigate('/app/checkin')}
                >
                  Confirm Contact Details
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
