import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Alert } from '@voterrule/ui';
import { useApp } from '../context/AppContext.js';

export interface AuthPageProps {
  currentPath?: string;
  onNavigate: (path: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ currentPath, onNavigate }) => {
  const { locale, t, setUser } = useApp();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    if (currentPath === '/auth/register') {
      setIsRegister(true);
    } else if (currentPath === '/auth/login') {
      setIsRegister(false);
    }
  }, [currentPath]);

  // Email credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone credentials & OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Optional Voter ID (EPIC) - statutory electoral roll identifier
  const [epicNumber, setEpicNumber] = useState('');

  // Mandatory DPDP compliance
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aadhaarDetectedWarning, setAadhaarDetectedWarning] = useState<string | null>(null);

  // Live Aadhaar pattern checker to guide citizens
  const checkAadhaarPattern = (val: string) => {
    const clean = val.replace(/\s+/g, '');
    if (/^\d{12}$/.test(clean)) {
      setAadhaarDetectedWarning(
        'Notice: You entered a 12-digit number. VoterRule never asks for or accepts Aadhaar numbers under Indian privacy laws and UIDAI regulations. For voter verification, please use your 10-character Voter ID (EPIC, e.g. ABC1234567) or your 10-digit mobile number.'
      );
    } else {
      setAadhaarDetectedWarning(null);
    }
  };

  const handleSendOtp = async () => {
    if (!phone) {
      setError('Please enter a valid mobile number');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to dispatch OTP');
      }

      setOtpSent(true);
      setOtpNotice(data.data.demoNotice || 'OTP sent! Valid for 5 minutes.');
      setSuccess('Verification OTP dispatched to your mobile number.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (authMethod === 'phone') {
        // Mobile OTP Authentication Flow
        if (!otpSent) {
          await handleSendOtp();
          setLoading(false);
          return;
        }

        if (isRegister) {
          if (!ageConfirmed) {
            setError('You must confirm you are at least 18 years old to create an account.');
            setLoading(false);
            return;
          }
          if (!consentConfirmed) {
            setError('Consent to the Privacy Notice is required to process your civic case.');
            setLoading(false);
            return;
          }
        }

        const res = await fetch('/api/v1/auth/otp/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            otp,
            ageConfirmed18Plus: isRegister ? true : undefined,
            epicNumber: epicNumber ? epicNumber.trim().toUpperCase() : undefined,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || 'Authentication failed');
        }

        setUser({
          id: data.data.userId,
          displayName: `Citizen-${phone.slice(-4)}`,
          email: '',
          locale: data.data.locale || 'en',
          isStaff: data.data.isStaff || false,
          token: data.data.token,
        });

        onNavigate('/app');
      } else {
        // Email + Password Flow
        if (isRegister) {
          if (!ageConfirmed) {
            setError('You must confirm you are at least 18 years old to create an account.');
            setLoading(false);
            return;
          }
          if (!consentConfirmed) {
            setError('Consent to the Privacy Notice is required to process your civic case.');
            setLoading(false);
            return;
          }

          const res = await fetch('/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              epicNumber: epicNumber ? epicNumber.trim().toUpperCase() : undefined,
              ageConfirmed18Plus: true,
              locale,
              consentNoticeVersion: '2026.1',
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error?.message || 'Registration failed');
          }

          setSuccess('Account created successfully! Please sign in with your credentials.');
          setIsRegister(false);
        } else {
          const res = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error?.message || 'Sign in failed');
          }

          setUser({
            id: data.data.userId,
            displayName: email.split('@')[0] || 'Citizen',
            email,
            locale: data.data.locale || 'en',
            isStaff: data.data.isStaff || false,
            token: data.data.token,
          });

          onNavigate('/app');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8 pb-16 px-4">
      <Card
        title={isRegister ? t('auth.registerTitle') : t('auth.loginTitle')}
        subtitle={
          isRegister
            ? 'Accounts are restricted to adults (18+). Minors may access stateless guidance at /eligibility-check.'
            : 'Enter your credentials to access your electoral assistance cases.'
        }
      >
        {/* Authentication Method Tabs */}
        <div className="flex border-b border-[var(--line)] mb-4">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('email');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
              authMethod === 'email'
                ? 'border-[var(--link)] text-[var(--link)] font-bold'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMethod('phone');
              setError(null);
              setSuccess(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition-colors ${
              authMethod === 'phone'
                ? 'border-[var(--link)] text-[var(--link)] font-bold'
                : 'border-transparent text-[var(--ink-3)] hover:text-[var(--ink)]'
            }`}
          >
            Mobile OTP (+91)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}
          {aadhaarDetectedWarning && <Alert type="warning">{aadhaarDetectedWarning}</Alert>}

          {authMethod === 'email' ? (
            <>
              <Input
                id="auth-email"
                type="email"
                label={t('auth.emailLabel')}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  checkAadhaarPattern(e.target.value);
                }}
                required
                autoComplete="username"
                placeholder="citizen@example.org"
              />

              <Input
                id="auth-password"
                type="password"
                label={t('auth.passwordLabel')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder="Minimum 10 characters"
              />

              <div className="space-y-1">
                <Input
                  id="auth-epic"
                  type="text"
                  label="Voter ID (EPIC) / Masked Aadhaar Ref (Optional)"
                  value={epicNumber}
                  onChange={(e) => {
                    setEpicNumber(e.target.value);
                    checkAadhaarPattern(e.target.value);
                  }}
                  placeholder="e.g. ABC1234567 or last 4 digits"
                  maxLength={16}
                />
                <p className="text-[11px] text-[var(--ink-3)]">
                  Optional statutory voter identifier helps link your electoral roll records.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Input
                  id="auth-phone"
                  type="tel"
                  label="Registered Mobile Number (+91)"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    checkAadhaarPattern(e.target.value);
                  }}
                  required
                  placeholder="+919876543210 or 10-digit number"
                />
                {!otpSent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleSendOtp}
                    isLoading={loading}
                  >
                    Send Verification Code (OTP)
                  </Button>
                )}
              </div>

              {otpSent && (
                <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                  {otpNotice && (
                    <div className="p-2 bg-[var(--surface-2)] text-[var(--link)] text-xs rounded-[var(--r-md)] border border-[var(--line-strong)]">
                      ℹ️ {otpNotice}
                    </div>
                  )}
                  <Input
                    id="auth-otp"
                    type="text"
                    label="Enter 6-Digit Verification Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="123456"
                  />
                  <Input
                    id="auth-phone-epic"
                    type="text"
                    label="Voter ID (EPIC) / Masked Aadhaar Ref (Optional)"
                    value={epicNumber}
                    onChange={(e) => {
                      setEpicNumber(e.target.value);
                      checkAadhaarPattern(e.target.value);
                    }}
                    placeholder="e.g. ABC1234567 or last 4 digits"
                  />
                </div>
              )}
            </>
          )}

          {isRegister && (
            <div className="space-y-3 pt-2 border-t border-[var(--line)]">
              <label className="flex items-start gap-2.5 text-xs text-[var(--ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--line-strong)] text-[var(--link)] accent-[var(--link)] focus:ring-[var(--focus)]"
                  required
                />
                <span>{t('auth.confirmAgeLabel')}</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-[var(--ink)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentConfirmed}
                  onChange={(e) => setConsentConfirmed(e.target.checked)}
                  className="mt-0.5 rounded border-[var(--line-strong)] text-[var(--link)] accent-[var(--link)] focus:ring-[var(--focus)]"
                  required
                />
                <span>{t('auth.consentNoticeLabel')}</span>
              </label>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="md"
            className="w-full mt-2"
            isLoading={loading}
          >
            {authMethod === 'phone' && !otpSent
              ? 'Send OTP & Proceed'
              : isRegister
              ? t('auth.registerBtn')
              : t('auth.signInBtn')}
          </Button>

          <div className="text-center pt-3 border-t border-[var(--line)]">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setSuccess(null);
                setOtpSent(false);
              }}
              className="text-xs text-[var(--link)] font-bold hover:underline"
            >
              {isRegister ? t('auth.haveAccount') : t('auth.noAccount')}
            </button>
          </div>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-4 pt-3 border-t border-dashed border-[var(--line-strong)] text-center">
          <button
            type="button"
            onClick={() => {
              setUser({
                id: 'synth-citizen-aarav-01',
                displayName: 'Aarav Sharma (Demo Citizen)',
                email: 'aarav.synthetic@demo.voterrule',
                locale: 'en',
                isStaff: false,
              });
              onNavigate('/app');
            }}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--saffron-deep)] bg-[var(--saffron-wash)] hover:bg-[var(--saffron-wash)]/80 px-3.5 py-2 rounded-[var(--r-md)] font-medium border border-[var(--saffron)]/30 transition-colors"
          >
            <span>⚡ Quick Demo:</span>
            <span>Sign in instantly as Aarav Sharma (Synthetic Elector)</span>
          </button>
        </div>

        {/* Civic Privacy Notice regarding Aadhaar */}
        <div className="mt-6 p-3 bg-[var(--saffron-wash)] border border-[var(--saffron)]/30 rounded-[var(--r-md)] text-xs text-[var(--ink)] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--saffron-deep)]">
            <span>🛡️</span>
            <span>Why VoterRule never asks for Aadhaar:</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--ink-2)]">
            VoterRule is an independent civic portal. Under the Supreme Court's <em>Puttaswamy</em> ruling and the Aadhaar Act, private entities are barred from using Aadhaar authentication. In elections, your statutory identity is your <strong>Voter ID (EPIC)</strong>. Aadhaar is completely voluntary and never collected by this portal.
          </p>
        </div>
      </Card>
    </div>
  );
};
