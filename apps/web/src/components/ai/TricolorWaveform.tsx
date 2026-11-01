import React from 'react';

export interface TricolorWaveformProps {
  active: boolean;
  className?: string;
}

export const TricolorWaveform: React.FC<TricolorWaveformProps> = ({
  active,
  className = '',
}) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 h-6 px-2 ${className}`}
      aria-label={active ? 'Audio wave active' : 'Audio wave inactive'}
    >
      {/* Saffron Bar */}
      <span
        className={`w-1 rounded-full bg-[#FF9933] transition-all duration-300 ${
          active ? 'h-5 animate-pulse' : 'h-1.5 opacity-60'
        }`}
        style={{ animationDelay: '0ms' }}
      />
      {/* Saffron-Light Bar */}
      <span
        className={`w-1 rounded-full bg-[#FFB366] transition-all duration-300 ${
          active ? 'h-6 animate-pulse' : 'h-2 opacity-60'
        }`}
        style={{ animationDelay: '150ms' }}
      />
      {/* White / Neutral Center Bar */}
      <span
        className={`w-1 rounded-full bg-white border border-gray-300 transition-all duration-300 ${
          active ? 'h-4 animate-pulse' : 'h-1.5 opacity-80'
        }`}
        style={{ animationDelay: '300ms' }}
      />
      {/* Green-Light Bar */}
      <span
        className={`w-1 rounded-full bg-[#34A828] transition-all duration-300 ${
          active ? 'h-6 animate-pulse' : 'h-2 opacity-60'
        }`}
        style={{ animationDelay: '200ms' }}
      />
      {/* Green Deep Bar */}
      <span
        className={`w-1 rounded-full bg-[#138808] transition-all duration-300 ${
          active ? 'h-5 animate-pulse' : 'h-1.5 opacity-60'
        }`}
        style={{ animationDelay: '50ms' }}
      />
    </div>
  );
};

