import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext.js';
import { SUPPORTED_LANGUAGES, Locale } from '@voterrule/i18n';

export interface LanguageSelectorProps {
  compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const { locale, setLocale } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fallbackLang = SUPPORTED_LANGUAGES[0]!;
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === locale) ?? fallbackLang;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code: Locale) => {
    setLocale(code);
    setIsOpen(false);
  };

  return (
    <div className="lang-select-wrap" ref={containerRef}>
      <button
        type="button"
        className="lang-btn"
        id="language-selector-btn"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select Language"
        title="Select Language / भाषा चुनें"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="lang-globe" aria-hidden="true">🌐</span>
        <span className="lang-btn-text">
          {compact ? (currentLang.code === 'en' ? 'EN' : currentLang.nativeName) : currentLang.label}
        </span>
        <svg
          className="lang-chevron"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.16s ease' }}
        >
          <path d="M2.5 4.5L6 8L9.5 4.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="lang-dropdown" role="listbox" aria-label="Select Language">
          <div className="lang-dropdown-header">
            Select Language
          </div>
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="option"
              id={`lang-opt-${lang.code}`}
              aria-selected={lang.code === locale}
              className={`lang-option ${lang.code === locale ? 'active' : ''}`}
              onClick={() => handleSelect(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
