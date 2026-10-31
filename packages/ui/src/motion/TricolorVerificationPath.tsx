import React, { useState } from 'react';

export interface TricolorVerificationPathProps {
  currentStageIndex?: number; // 0, 1, or 2
  locale?: 'en' | 'hi';
  className?: string;
  onSelectStage?: (index: number) => void;
}

export const TricolorVerificationPath: React.FC<TricolorVerificationPathProps> = ({
  currentStageIndex = 0,
  locale = 'en',
  className = '',
  onSelectStage,
}) => {
  const [activeTab, setActiveTab] = useState(currentStageIndex);

  const handleTabClick = (idx: number) => {
    setActiveTab(idx);
    if (onSelectStage) {
      onSelectStage(idx);
    }
  };

  const steps = [
    {
      num: 1,
      titleEn: 'Check your information',
      titleHi: 'अपनी जानकारी जाँचें',
      descEn: 'Search the official voter list through the official service, then record what you found here.',
      descHi: 'आधिकारिक सेवा से मतदाता सूची में खोजें, फिर जो मिला उसे यहाँ दर्ज करें।',
      bulletsEn: [
        'We link you to the official search and list what to keep ready.',
        'You choose one result: present, not found, details differ, search failed, or needs checking.',
        'Anything you enter is marked as self-reported.',
      ],
      bulletsHi: [
        'हम आपको आधिकारिक खोज तक ले जाते हैं और तैयार रखने की चीज़ों की सूची देते हैं।',
        'आप एक परिणाम चुनते हैं: मिला, नहीं मिला, विवरण अलग हैं, खोज नहीं हो सकी, या और जाँच चाहिए।',
        'आप जो भी दर्ज करते हैं वह ‘स्वयं-रिपोर्ट’ के रूप में चिह्नित होता है।',
      ],
    },
    {
      num: 2,
      titleEn: 'Understand the issue',
      titleHi: 'समस्या समझें',
      descEn: 'A few questions place you in the right case, with reasons, the source and the date we last checked it.',
      descHi: 'कुछ सवाल आपको सही स्थिति में रखते हैं, कारण, स्रोत और हमारी आख़िरी जाँच की तारीख़ के साथ।',
      bulletsEn: [
        'A missing name is never assumed to be a wrongful deletion.',
        'Eligibility questions are guidance, not a legal decision.',
        'If the rules are unclear, we send you to your Electoral Registration Officer.',
      ],
      bulletsHi: [
        'किसी छूटे नाम को कभी ग़लत तरीके से हटाया गया नहीं मान लिया जाता।',
        'पात्रता के सवाल मार्गदर्शन हैं, कानूनी निर्णय नहीं।',
        'नियम स्पष्ट न हों तो हम आपको आपके निर्वाचक रजिस्ट्रीकरण अधिकारी के पास भेजते हैं।',
      ],
    },
    {
      num: 3,
      titleEn: 'Follow the official process',
      titleHi: 'आधिकारिक प्रक्रिया अपनाएँ',
      descEn: 'You get the right form, a document checklist and a printable sheet with your details laid out for the form. You submit through the official channel.',
      descHi: 'आपको सही फ़ॉर्म, दस्तावेज़ों की सूची और फ़ॉर्म के हिसाब से आपके विवरण वाली छापने योग्य शीट मिलती है। आप आधिकारिक माध्यम से जमा करते हैं।',
      bulletsEn: [
        'Form 6 for new registration, Form 7 for objections or deletion, Form 8 for corrections and change of residence.',
        'No internet? Use the printable guidance or call the Voter Helpline, 1950.',
        'You tell us what you submitted. We record an official outcome only with evidence.',
      ],
      bulletsHi: [
        'नए पंजीकरण के लिए फ़ॉर्म 6, आपत्ति या नाम हटाने के लिए फ़ॉर्म 7, सुधार और निवास बदलने के लिए फ़ॉर्म 8।',
        'इंटरनेट नहीं है? छापने योग्य मार्गदर्शन लें या वोटर हेल्पलाइन 1950 पर कॉल करें।',
        'आप बताते हैं कि क्या जमा किया। आधिकारिक परिणाम हम केवल प्रमाण के साथ दर्ज करते हैं।',
      ],
    },
  ];

  // Highlight offset percentage: step 0 = ~16%, step 1 = 50%, step 2 = ~84%
  const hlScale = activeTab === 0 ? 0.33 : activeTab === 1 ? 0.66 : 1;

  return (
    <div className={`w-full ${className}`}>
      <div className="path" id="path">
        <div className="path-track" aria-hidden="true">
          <i />
          <i />
          <i />
          <span
            className="hl"
            style={{ transform: `scaleX(${hlScale})` }}
          />
        </div>

        <div className="path-tabs" role="tablist" aria-label="Three steps">
          {steps.map((step, idx) => {
            const isSelected = activeTab === idx;
            return (
              <button
                key={step.num}
                type="button"
                className="ptab"
                role="tab"
                id={`tab-${step.num}`}
                aria-selected={isSelected}
                aria-controls={`panel-${step.num}`}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => handleTabClick(idx)}
              >
                <span className="node">{step.num}</span>
                <span>{locale === 'hi' ? step.titleHi : step.titleEn}</span>
                <span className="now">{locale === 'hi' ? 'देख रहे हैं' : 'Viewing'}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="panels">
        {steps.map((step, idx) => {
          if (activeTab !== idx) return null;
          return (
            <div
              key={step.num}
              className="panel"
              role="tabpanel"
              id={`panel-${step.num}`}
              aria-labelledby={`tab-${step.num}`}
            >
              <p>{locale === 'hi' ? step.descHi : step.descEn}</p>
              <ul>
                {(locale === 'hi' ? step.bulletsHi : step.bulletsEn).map((bullet, bIdx) => (
                  <li key={bIdx}>
                    <svg
                      className="icon"
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12.5 4.5 4.5L19 7.5" />
                    </svg>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
};
