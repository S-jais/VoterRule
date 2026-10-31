import React, { useState } from 'react';

export interface LanguageSwitcherProps {
  currentLocale: string;
  onLocaleChange: (locale: any) => void;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLocale,
  onLocaleChange,
  className = '',
}) => {
  return (
    <div
      role="group"
      aria-label="Language"
      className={`seg ${className}`}
    >
      <button
        type="button"
        onClick={() => onLocaleChange('en')}
        aria-pressed={currentLocale === 'en'}
        lang="en"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onLocaleChange('hi')}
        aria-pressed={currentLocale === 'hi'}
        lang="hi"
      >
        हिन्दी
      </button>
    </div>
  );
};

export interface LiteModeToggleProps {
  liteMode: boolean;
  onToggle: (lite: boolean) => void;
  className?: string;
}

export const LiteModeToggle: React.FC<LiteModeToggleProps> = ({
  liteMode,
  onToggle,
  className = '',
}) => {
  const [pulseActive, setPulseActive] = useState(false);

  const handleClick = () => {
    onToggle(!liteMode);
    setPulseActive(true);
    setTimeout(() => setPulseActive(false), 600);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liteMode}
      className={`lite ${className}`}
      title={liteMode ? 'Disable Lite Mode' : 'Enable Lite Mode (disables animations)'}
    >
      <span className="track" aria-hidden="true" />
      <span>{liteMode ? 'Lite mode: Active' : 'Lite mode'}</span>
      <span className={`pulse ${pulseActive ? 'go' : ''}`} aria-hidden="true" />
    </button>
  );
};

export const DemoBanner: React.FC<{ isDemo?: boolean }> = ({ isDemo = true }) => {
  if (!isDemo) return null;
  return (
    <>
      <div className="strip" role="note">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
          <b>DEMO MODE · Synthetic data</b>
          <span className="text-gray-300">
            Independent civic-assistance platform. Not an Election Commission of India website.
          </span>
        </div>
      </div>
      <div className="tri" aria-hidden="true" />
    </>
  );
};

export const IndependentNotice: React.FC<{ locale?: string; className?: string }> = ({
  locale = 'en',
  className = '',
}) => {
  return (
    <div
      className={`bg-[var(--saffron-wash)] border border-[var(--line-strong)] rounded-[var(--r-md)] p-3.5 text-xs text-[var(--ink)] flex items-start gap-2.5 ${className}`}
    >
      <span className="text-[var(--saffron-deep)] font-bold text-sm leading-none shrink-0" aria-hidden="true">
        ℹ
      </span>
      <div className="space-y-1">
        <strong className="block text-[var(--ink)] font-semibold">
          {locale === 'hi'
            ? 'महत्वपूर्ण स्वतंत्र नागरिक मंच सूचना'
            : 'Important Independent Platform Notice'}
        </strong>
        <p className="text-[var(--ink-2)] leading-relaxed">
          {locale === 'hi'
            ? 'VoterRule एक स्वतंत्र नागरिक सहायता मंच है और भारत निर्वाचन आयोग (ECI) से संबद्ध नहीं है। मतदाता सूची में नाम जोड़ने, सुधारने या विलोपन के सभी वैधानिक निर्णय केवल सक्षम निर्वाचक रजिस्ट्रीकरण अधिकारियों (ERO) द्वारा लिए जाते हैं।'
            : 'VoterRule is an independent civic-assistance platform and is not affiliated with the Election Commission of India. Statutory roll registration, correction, inclusion, and deletion decisions are made solely by competent election authorities.'}
        </p>
      </div>
    </div>
  );
};
