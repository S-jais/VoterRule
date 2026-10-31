import React, { useEffect, useState } from 'react';

export interface CivicPulseProps {
  message: string;
  triggerKey?: string | number;
  className?: string;
  onComplete?: () => void;
}

export const CivicPulse: React.FC<CivicPulseProps> = ({
  message,
  triggerKey,
  className = '',
  onComplete,
}) => {
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    setPulsing(true);
    const timer = setTimeout(() => {
      setPulsing(false);
      onComplete?.();
    }, 650);

    return () => clearTimeout(timer);
  }, [triggerKey]);

  return (
    <div
      className={`relative inline-flex items-center gap-2 ${className}`}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes singlePulseRing {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1.18); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-ring {
            animation: none !important;
            opacity: 0 !important;
          }
        }
      `}</style>

      <div className="relative flex items-center justify-center">
        {/* Expanding pulse ring */}
        {pulsing && (
          <div
            className="animate-pulse-ring absolute w-7 h-7 rounded-full bg-[#138808] pointer-events-none"
            style={{
              animation: 'singlePulseRing 600ms cubic-bezier(0.2, 0, 0, 1) forwards',
            }}
          />
        )}

        {/* Stable Checkmark icon */}
        <div className="w-5 h-5 rounded-full bg-[#138808] flex items-center justify-center text-white z-10">
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      <span className="text-sm font-medium text-[#0D5C05]">{message}</span>
    </div>
  );
};
