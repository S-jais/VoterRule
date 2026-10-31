import React, { useState } from 'react';
import { Card, Button, Alert } from '@voterrule/ui';
import { useApp } from '../context/AppContext.js';

export interface CheckInPageProps {
  onNavigate: (path: string) => void;
}

export const CheckInPage: React.FC<CheckInPageProps> = ({ onNavigate }) => {
  const { user, locale } = useApp();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/checkin/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        body: JSON.stringify({ cycleId: 'cycle-2026-annual' }),
      });
      if (res.ok) {
        setConfirmed(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          {locale === 'hi' ? 'आवधिक संपर्क जांच (स्वैच्छिक)' : 'Periodic Contact Check-in (Voluntary)'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)]">
          Keep your notification channels active and receive verified election timeline reminders.
        </p>
      </div>

      <div className="bg-[var(--green-wash)] p-4 rounded-[var(--r-md)] border border-[var(--green)]/30 text-xs text-[var(--ink)] space-y-2">
        <span className="font-bold text-[var(--green-deep)]">Safeguard Guarantee:</span>
        <p className="text-[var(--ink-2)]">
          Contact check-ins exist solely to keep communication details current. Non-response has NO adverse effect on your cases, your assistance, or your account. Inactivity is NEVER treated as evidence of death or ineligibility.
        </p>
      </div>

      <Card title="Current Contact Confirmation">
        {confirmed ? (
          <div className="space-y-4 pt-2">
            <Alert type="success" title="Contact Details Confirmed">
              Thank you for confirming your contact preferences. You will receive statutory revision schedule updates for your registered constituency.
            </Alert>
            <Button variant="primary" size="md" onClick={() => onNavigate('/app')}>
              Return to Citizen Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-2 text-sm text-[var(--ink)]">
            <p className="text-[var(--ink-2)]">Please review and confirm your communication preferences:</p>

            <div className="p-4 bg-[var(--surface-2)] rounded-[var(--r-md)] border border-[var(--line)] space-y-2 text-xs">
              <div>
                <span className="text-[var(--ink-3)] block">Registered Email:</span>
                <span className="font-bold text-[var(--ink)]">{user?.email || 'citizen@demo.voterrule'}</span>
              </div>
              <div>
                <span className="text-[var(--ink-3)] block">Reminder Frequency:</span>
                <span className="font-semibold text-[var(--ink)]">Annual SSR Schedule Reminders Only</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={handleConfirm}
                isLoading={loading}
              >
                Confirm Details are Current
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
