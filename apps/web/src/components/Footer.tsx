import React from 'react';
import { useApp } from '../context/AppContext.js';

export interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { locale } = useApp();
  const isHindi = locale === 'hi';

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('/');
      setTimeout(() => {
        document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 180);
    }
  };

  return (
    <footer className="foot">
      <div className="tri" aria-hidden="true" />
      <div className="wrap">
        <div className="foot-grid">
          {/* Column 1: Brand */}
          <div>
            <button
              type="button"
              className="brand cursor-pointer bg-transparent border-0 text-left p-0"
              onClick={() => {
                onNavigate('/');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-label="VoterRule, back to top"
            >
              <svg aria-hidden="true">
                <use href="#mark" />
              </svg>
              <span>
                <span className="brand-name">VoterRule</span>
                <span className="brand-dev">Every Eligible Voter. Every Right. Every Voice.</span>
              </span>
            </button>
            <p className="about font-medium">
              Every Eligible Voter. Every Right. Every Voice.
            </p>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4>{isHindi ? 'मंच' : 'Platform'}</h4>
            <ul>
              <li>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 text-left cursor-pointer text-[var(--foot-fg-2)] hover:text-white"
                  onClick={() => onNavigate('/about')}
                >
                  {isHindi ? 'मंच के बारे में' : 'About the platform'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 text-left cursor-pointer text-[var(--foot-fg-2)] hover:text-white"
                  onClick={() => scrollToSection('#how')}
                >
                  {isHindi ? 'यह कैसे काम करता है' : 'How it works'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 text-left cursor-pointer text-[var(--foot-fg-2)] hover:text-white"
                  onClick={() => scrollToSection('#method')}
                >
                  {isHindi ? 'कार्यप्रणाली' : 'Methodology'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div>
            <h4>{isHindi ? 'नीतियाँ' : 'Policies'}</h4>
            <ul>
              <li>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 text-left cursor-pointer text-[var(--foot-fg-2)] hover:text-white"
                  onClick={() => onNavigate('/privacy')}
                >
                  {isHindi ? 'गोपनीयता नीति' : 'Privacy policy'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 text-left cursor-pointer text-[var(--foot-fg-2)] hover:text-white"
                  onClick={() => onNavigate('/terms')}
                >
                  {isHindi ? 'उपयोग की शर्तें' : 'Terms of use'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 text-left cursor-pointer text-[var(--foot-fg-2)] hover:text-white"
                  onClick={() => onNavigate('/accessibility')}
                >
                  {isHindi ? 'सुलभता' : 'Accessibility'}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 text-left cursor-pointer text-[var(--foot-fg-2)] hover:text-white"
                  onClick={() => onNavigate('/security')}
                >
                  {isHindi ? 'सुरक्षा संपर्क' : 'Security contact'}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Official Election Services */}
          <div>
            <h4>{isHindi ? 'आधिकारिक चुनाव सेवाएँ' : 'Official election services'}</h4>
            <ul>
              <li>
                <a
                  href="https://eci.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--foot-fg-2)] hover:text-white"
                >
                  <span>{isHindi ? 'भारत निर्वाचन आयोग' : 'Election Commission of India'}</span>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-ext" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://voters.eci.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--foot-fg-2)] hover:text-white"
                >
                  <span>{isHindi ? 'वोटर्स सर्विस पोर्टल' : 'Voters’ Service Portal'}</span>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-ext" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href="https://electoralsearch.eci.gov.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--foot-fg-2)] hover:text-white"
                >
                  <span>{isHindi ? 'मतदाता सूची में खोजें' : 'Search the electoral roll'}</span>
                  <svg className="icon" aria-hidden="true">
                    <use href="#i-ext" />
                  </svg>
                </a>
              </li>
              <li>
                <span className="grv">
                  {isHindi ? 'वोटर हेल्पलाइन: 1950' : 'Voter Helpline: 1950'}
                </span>
              </li>
            </ul>
          </div>

          {/* Column 5: Grievance & Support */}
          <div>
            <h4>{isHindi ? 'शिकायत और सहायता' : 'Grievance and support'}</h4>
            <ul>
              <li>
                <span className="grv">
                  {isHindi
                    ? 'डेटा सुरक्षा शिकायत संपर्क: लॉन्च से पहले प्रकाशित होगा'
                    : 'Data protection grievance contact: to be published before launch'}
                </span>
              </li>
              <li>
                <button
                  type="button"
                  className="bg-transparent border-0 p-0 text-left cursor-pointer text-[var(--foot-fg-2)] hover:text-white"
                  onClick={() => onNavigate('/app/assist')}
                >
                  {isHindi ? 'सहायक सेवा पाएँ' : 'Access Assisted Support'}
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Ground Truth */}
        <div className="foot-legal">
          <p>
            <strong>
              {isHindi
                ? 'VoterRule एक स्वतंत्र नागरिक-सहायता मंच है।'
                : 'VoterRule is an independent civic-assistance platform.'}
            </strong>{' '}
            <span>
              {isHindi
                ? 'यह भारत निर्वाचन आयोग नहीं है और किसी सरकारी निकाय द्वारा समर्थित नहीं है। पंजीकरण, सुधार, नाम जोड़ने और हटाने के निर्णय केवल सक्षम निर्वाचन अधिकारी लेते हैं।'
                : 'It is not the Election Commission of India and is not endorsed by any government body. Registration, correction, inclusion and deletion decisions are made only by the competent election authorities.'}
            </span>
          </p>
          <p>
            {isHindi
              ? 'डेमो पेज: काल्पनिक डेटा, कोई वास्तविक रिकॉर्ड नहीं।'
              : 'Demo page: synthetic data, no real records.'}
          </p>
        </div>
      </div>
    </footer>
  );
};
