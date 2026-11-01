import React, { useState } from 'react';
import { useApp } from '../context/AppContext.js';
import { LanguageSelector } from './LanguageSelector.js';
import { t } from '@voterrule/i18n';

export interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onNavigate }) => {
  const { locale, theme, toggleTheme, user, setUser, isAdmin } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAnchor = (anchor: string) => {
    setMobileMenuOpen(false);
    if (currentPath === '/') {
      const el = document.querySelector(anchor);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate('/');
      setTimeout(() => {
        const el = document.querySelector(anchor);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 180);
    }
  };

  const menuLabels: Record<string, string> = {
    en: 'Menu',
    hi: 'मेन्यू',
    bn: 'মেনু',
    mr: 'मेनू',
    ta: 'மெனு',
    te: 'మెనూ',
    gu: 'મેનુ',
    kn: 'ಮೆನು',
    ml: 'മെനു',
    pa: 'ਮੀਨੂ',
    or: 'ମେନୁ',
    as: 'মেনু',
    kok: 'मेनू',
    ur: 'مینو',
  };

  const navLabels: Record<string, { services: string; how: string; privacy: string; method: string; app: string }> = {
    en: { services: 'Services', how: 'Working', privacy: 'Privacy', method: 'Methodology', app: 'Portal' },
    hi: { services: 'सेवाएँ', how: 'कार्यविधि', privacy: 'गोपनीयता', method: 'कार्यप्रणाली', app: 'पोर्टल' },
    bn: { services: 'সেবাসমূহ', how: 'কার্যপদ্ধতি', privacy: 'গোপনীয়তা', method: 'পদ্ধতি', app: 'পোর্টাল' },
    mr: { services: 'सेवा', how: 'कार्यपद्धती', privacy: 'गोपनीयता', method: 'कार्यपद्धती', app: 'पोर्टल' },
    ta: { services: 'சேவைகள்', how: 'செயல்முறை', privacy: 'தனியுரிமை', method: 'நெறிமுறை', app: 'போர்டல்' },
    te: { services: 'సేవలు', how: 'కార్యవిధానం', privacy: 'గోప్యత', method: 'విధానం', app: 'పోర్టల్' },
    gu: { services: 'સેવાઓ', how: 'કાર્યપદ્ધતિ', privacy: 'ગોપનીયતા', method: 'રીત', app: 'પોર્ટલ' },
    kn: { services: 'ಸೇವೆಗಳು', how: 'ಕಾರ್ಯವಿಧಾನ', privacy: 'ಗೌಪ್ಯತೆ', method: 'ವಿಧಾನ', app: 'ಪೋರ್ಟಲ್' },
    ml: { services: 'സേവനങ്ങൾ', how: 'പ്രവർത്തനം', privacy: 'സ്വകാര്യത', method: 'രീതി', app: 'പോർട്ടൽ' },
    pa: { services: 'ਸੇਵਾਵਾਂ', how: 'ਕਾਰਜਪ੍ਰਣਾਲੀ', privacy: 'ਨਿੱਜਤਾ', method: 'ਢੰਗ', app: 'ਪੋਰਟਲ' },
    or: { services: 'ସେବାସମୂହ', how: 'କାର୍ଯ୍ୟପ୍ରଣାଳୀ', privacy: 'ଗୋପନୀୟତା', method: 'ପଦ୍ଧତି', app: 'ପୋର୍ଟାଲ' },
    as: { services: 'সেৱাসমূহ', how: 'কাৰ্যপদ্ধতি', privacy: 'গোপনীয়তা', method: 'পদ্ধতি', app: 'প\'ৰ্টেল' },
    kok: { services: 'सेवा', how: 'कार्यपद्धत', privacy: 'गोपनीयता', method: 'कार्यपद्धत', app: 'पोर्टल' },
    ur: { services: 'خدمات', how: 'طریقۂ کار', privacy: 'رازداری', method: 'طریقہ کار', app: 'پورٹل' },
  };

  const nav = navLabels[locale] || navLabels.en || {
    services: 'Services',
    how: 'Working',
    privacy: 'Privacy',
    method: 'Methodology',
    app: 'Portal',
  };
  const menuBtnText = menuLabels[locale] || 'Menu';
  const brandDevName = (t(locale, 'common.appName').split('(')[0] || '').trim();
  const loginText = locale === 'en' ? 'Log In' : t(locale, 'auth.signInBtn');
  const signupText = locale === 'en' ? 'Sign Up' : t(locale, 'auth.registerBtn');

  return (
    <>
      <a className="skip" href="#main-content">
        {t(locale, 'common.skipToContent')}
      </a>

      {/* Tricolor Accent Stripe */}
      <div className="tri" aria-hidden="true" />

      {/* Site Header */}
      <header className="site-head">
        <div className="wrap head-row">
          <button
            type="button"
            className="brand cursor-pointer bg-transparent border-0 text-left p-0"
            onClick={() => {
              setMobileMenuOpen(false);
              onNavigate('/');
            }}
            aria-label="VoterRule, home"
          >
            <svg aria-hidden="true">
              <use href="#mark" />
            </svg>
            <span>
              <span className="brand-name">VoterRule</span>
              {brandDevName && brandDevName !== 'VoterRule' && (
                <span className="brand-dev" lang={locale}>
                  {brandDevName}
                </span>
              )}
            </span>
          </button>

          {/* Multilingual Selector (all 14 official languages) */}
          <LanguageSelector compact />

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            className="menu-btn"
            id="menu-btn"
            aria-expanded={mobileMenuOpen}
            aria-controls="nav"
            aria-label="Menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="icon" aria-hidden="true">
              <use href="#i-menu" />
            </svg>
            <span>{menuBtnText}</span>
          </button>

          {/* Primary Navigation */}
          <nav
            className={`nav ${mobileMenuOpen ? 'open' : ''}`}
            id="nav"
            aria-label="Primary"
          >
            <a
              className="nl"
              href="#services"
              onClick={(e) => {
                e.preventDefault();
                handleAnchor('#services');
              }}
            >
              {nav.services}
            </a>
            <a
              className="nl"
              href="#how"
              onClick={(e) => {
                e.preventDefault();
                handleAnchor('#how');
              }}
            >
              {nav.how}
            </a>
            <a
              className="nl"
              href="#privacy"
              onClick={(e) => {
                e.preventDefault();
                handleAnchor('#privacy');
              }}
            >
              {nav.privacy}
            </a>
            <a
              className="nl"
              href="#method"
              onClick={(e) => {
                e.preventDefault();
                handleAnchor('#method');
              }}
            >
              {nav.method}
            </a>

            {/* Direct App Link for Quick Access */}
            <button
              type="button"
              className="nl text-left bg-transparent border-0 cursor-pointer"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/app');
              }}
            >
              {nav.app}
            </button>

            <div className="nav-actions">
              {/* Dark / Light Mode Switch */}
              <button
                type="button"
                className="lite"
                id="theme-toggle"
                aria-pressed={theme === 'dark'}
                aria-label={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to Light mode' : 'Switch to Dark mode'}
              >
                <span className="track" aria-hidden="true" />
                <span className="text-base select-none leading-none" aria-hidden="true">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </span>
                <span className={`pulse ${theme === 'dark' ? 'go' : ''}`} id="pulse" aria-hidden="true" />
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onNavigate('/admin');
                      }}
                      className="btn btn-sm flex items-center gap-1.5 bg-indigo-900/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-700/60 font-semibold"
                      title="Open Authorized Admin & Reviewer Portal"
                    >
                      <span aria-hidden="true">🛡️</span>
                      <span>Admin</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/app');
                    }}
                    className="btn btn-secondary btn-sm flex items-center gap-1.5"
                    title="Open Citizen Dashboard"
                  >
                    <span className="w-2 h-2 rounded-full bg-[var(--green)] inline-block" />
                    <span>{user.displayName.split(' ')[0]}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUser(null);
                      setMobileMenuOpen(false);
                      onNavigate('/');
                    }}
                    className="btn btn-ghost btn-sm text-xs text-[var(--ink-3)] hover:text-red-600"
                    title="Sign out of this session"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 auth-row">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/auth/login');
                    }}
                  >
                    {loginText}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('/auth/register');
                    }}
                  >
                    {signupText}
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
};
