import React, { useState } from 'react';
import { Card, Button, Input, Alert } from '@voterrule/ui';
import { useApp } from '../context/AppContext.js';

export interface AssistedSupportPageProps {
  onNavigate: (path: string) => void;
}

export const AssistedSupportPage: React.FC<AssistedSupportPageProps> = ({ onNavigate }) => {
  const { locale } = useApp();
  const [repName, setRepName] = useState('');
  const [repRelation, setRepRelation] = useState('');
  const [repPhone, setRepPhone] = useState('');
  const [authGranted, setAuthGranted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authGranted) return;
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[var(--ink)] tracking-tight">
          {locale === 'hi' ? 'सहायता प्राप्त समर्थन एवं प्रतिनिधि प्राधिकरण' : 'Assisted Support & Representative Authorization'}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--ink-2)]">
          Support for senior citizens, low-literacy electors, and persons requiring authorized assisted submission.
        </p>
      </div>

      {/* Helplines Box */}
      <div className="bg-[var(--surface-2)] p-5 rounded-[var(--r-lg)] border border-[var(--line-strong)] space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-base text-[var(--link)]">
            National Voter Helpline 1950 (Toll Free)
          </span>
          <span className="text-xs px-2.5 py-1 bg-[var(--surface)] border border-[var(--line-strong)] rounded-full font-bold text-[var(--link)]">
            Dial 1950
          </span>
        </div>
        <p className="text-xs text-[var(--ink-2)] leading-relaxed">
          Available 10:00 AM to 5:00 PM on all working days. Prefix your telephone STD code when calling from a mobile device to directly connect with your local District Contact Centre.
        </p>
      </div>

      {/* Representative Authorization Card */}
      <Card
        title="Authorize a Trusted Representative (Volunteer or Family Member)"
        subtitle="Under DPDP framework, you may designate an authorized representative to create and manage cases on your behalf."
      >
        {submitted ? (
          <div className="space-y-4 pt-2">
            <Alert type="success" title="Representative Authorized">
              Representative record recorded for {repName} ({repRelation}). An authorization receipt has been issued with a 1-year expiry.
            </Alert>
            <Button variant="outline" size="sm" onClick={() => onNavigate('/app')}>
              Return to Dashboard
            </Button>
          </div>
        ) : (
          <form onSubmit={handleAuthorize} className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="rep-name"
                label="Representative’s Full Name"
                value={repName}
                onChange={(e) => setRepName(e.target.value)}
                placeholder="e.g. Sunita Devi"
                required
              />
              <Input
                id="rep-rel"
                label="Relationship to Principal"
                value={repRelation}
                onChange={(e) => setRepRelation(e.target.value)}
                placeholder="e.g. Daughter / Volunteer"
                required
              />
            </div>

            <Input
              id="rep-phone"
              label="Representative Contact Number"
              value={repPhone}
              onChange={(e) => setRepPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              required
            />

            <div className="pt-2 border-t border-[var(--line)]">
              <label className="flex items-start gap-2.5 text-xs text-[var(--ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={authGranted}
                  onChange={(e) => setAuthGranted(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--line-strong)] text-[var(--link)] accent-[var(--link)] focus:ring-[var(--focus)]"
                  required
                />
                <span>
                  I expressly authorize this named individual to assist in submitting my electoral verification information. I retain the right to revoke this representative authorization at any time.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!authGranted}
            >
              Record Representative Authorization
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
