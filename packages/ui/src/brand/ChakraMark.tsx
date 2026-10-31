import React from 'react';

export interface ChakraMarkProps {
  size?: number;
  className?: string;
  ringColor?: string;
  bridgeColor?: string;
  baseColor?: string;
  'aria-label'?: string;
}

/**
 * Geometric 24-point Chakra mark with saffron arch and green base.
 * Styled exactly per the VoterRule design reference.
 */
export const ChakraMark: React.FC<ChakraMarkProps> = ({
  size = 36,
  className = '',
  ringColor = 'currentColor',
  bridgeColor = '#FF9933',
  baseColor = '#138808',
  'aria-label': ariaLabel,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      className={`shrink-0 overflow-visible ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
      focusable="false"
    >
      {/* 24-point dash array on 15.5 radius circumference = ~97.38px => 24*(2.7+1.358) */}
      <circle
        cx="18"
        cy="18"
        r="15.5"
        stroke={ringColor}
        strokeWidth="2.6"
        strokeDasharray="2.7 1.358"
        className="m-ring"
      />
      {/* Saffron arch bridge */}
      <path
        d="M8.5 22.5Q18 8.5 27.5 22.5"
        fill="none"
        stroke={bridgeColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Green baseline */}
      <path
        d="M7.5 25.5h21"
        fill="none"
        stroke={baseColor}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
};
