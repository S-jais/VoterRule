import React from 'react';

export interface SmartLoadingProps {
  size?: 'inline' | 'section' | 'page';
  text?: string;
  className?: string;
}

export const SmartLoading: React.FC<SmartLoadingProps> = ({
  size = 'section',
  text = 'Checking details with statutory rules...',
  className = '',
}) => {
  const pixelSizes = { inline: 24, section: 44, page: 68 };
  const px = pixelSizes[size];

  const center = 50;
  const radius = 38;
  const innerRadius = 12;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 p-4 ${
        size === 'page' ? 'min-h-[300px]' : ''
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <style>{`
        @keyframes spokeFade {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
        .spoke-fade-0 { animation: spokeFade 1.2s infinite ease-in-out; }
        .spoke-fade-1 { animation: spokeFade 1.2s infinite ease-in-out 0.1s; }
        .spoke-fade-2 { animation: spokeFade 1.2s infinite ease-in-out 0.2s; }
        .spoke-fade-3 { animation: spokeFade 1.2s infinite ease-in-out 0.3s; }
        .spoke-fade-4 { animation: spokeFade 1.2s infinite ease-in-out 0.4s; }
        .spoke-fade-5 { animation: spokeFade 1.2s infinite ease-in-out 0.5s; }
        .spoke-fade-6 { animation: spokeFade 1.2s infinite ease-in-out 0.6s; }
        .spoke-fade-7 { animation: spokeFade 1.2s infinite ease-in-out 0.7s; }
        .spoke-fade-8 { animation: spokeFade 1.2s infinite ease-in-out 0.8s; }
        .spoke-fade-9 { animation: spokeFade 1.2s infinite ease-in-out 0.9s; }
        .spoke-fade-10 { animation: spokeFade 1.2s infinite ease-in-out 1.0s; }
        .spoke-fade-11 { animation: spokeFade 1.2s infinite ease-in-out 1.1s; }
      `}</style>

      <svg
        width={px}
        height={px}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx={center} cy={center} r={radius} stroke="#000080" strokeWidth="2.5" opacity="0.4" />
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12;
          const rad = (angle * Math.PI) / 180;
          const x1 = center + innerRadius * Math.cos(rad);
          const y1 = center + innerRadius * Math.sin(rad);
          const x2 = center + radius * Math.cos(rad);
          const y2 = center + radius * Math.sin(rad);

          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#000080"
              strokeWidth="2.5"
              strokeLinecap="round"
              className={`spoke-fade-${i}`}
            />
          );
        })}
        <circle cx={center} cy={center} r={innerRadius} fill="#000080" />
      </svg>

      {text && (
        <span className="text-xs md:text-sm font-medium text-gray-700 select-none">
          {text}
        </span>
      )}
    </div>
  );
};

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="space-y-3 w-full" aria-busy="true" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-[var(--surface)] rounded-lg border border-[var(--line)] p-4 shadow-sm animate-pulse">
          <div className="h-4 bg-[var(--surface-2)] rounded w-1/3 mb-2.5"></div>
          <div className="h-3 bg-[var(--surface-2)] opacity-80 rounded w-5/6 mb-1.5"></div>
          <div className="h-3 bg-[var(--surface-2)] opacity-60 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};
