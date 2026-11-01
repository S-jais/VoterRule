import React from 'react';

export interface BallotSlotLogoProps {
  size?: number;
  className?: string;
  variant?: 'full' | 'simplified' | 'auto';
  inkColor?: string;
  saffronColor?: string;
  whiteColor?: string;
  greenColor?: string;
  slotColor?: string;
  'aria-label'?: string;
}

/**
 * VoteRule Ballot Slot Logo (Direction 2)
 * Features a tricolour ballot slip with a V-shaped notch entering a ballot slot.
 */
export const BallotSlotLogo: React.FC<BallotSlotLogoProps> = ({
  size = 36,
  className = '',
  variant = 'auto',
  inkColor,
  saffronColor = '#FF9933',
  whiteColor = '#FFFFFF',
  greenColor = '#138808',
  slotColor,
  'aria-label': ariaLabel,
}) => {
  const isSmall = variant === 'simplified' || (variant === 'auto' && size < 44);
  const effectiveInk = inkColor || 'currentColor';
  const effectiveSlot = slotColor || effectiveInk;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel || 'VoteRule Ballot Slot logo'}
      className={`shrink-0 overflow-visible ${className}`}
      style={
        {
          '--ink': effectiveInk,
          '--b1': saffronColor,
          '--b2': whiteColor,
          '--b3': greenColor,
        } as React.CSSProperties
      }
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g transform="rotate(-7 100 135)">
        {/* Top Saffron Band with V-Notch */}
        <path
          d="M58 30 Q58 22 66 22 L88 22 L100 46 L112 22 L134 22 Q142 22 142 30 L142 62 L58 62 Z"
          style={{ fill: 'var(--b1)' }}
        />

        {/* Middle White Band */}
        <rect x="58" y="62" width="84" height="36" style={{ fill: 'var(--b2)' }} />

        {/* Lower Green Band */}
        <rect x="58" y="98" width="84" height="37" style={{ fill: 'var(--b3)' }} />

        {/* Ashoka Chakra & Band Lines */}
        {isSmall ? (
          <g style={{ stroke: 'var(--ink)' }} fill="none" strokeWidth="3">
            <line x1="58" y1="62" x2="142" y2="62" />
            <line x1="58" y1="98" x2="142" y2="98" />
            <circle cx="100" cy="80" r="11" strokeWidth="3.4" />
          </g>
        ) : (
          <>
            <g style={{ stroke: 'var(--ink)' }} fill="none" strokeWidth="1.6" strokeLinecap="round">
              <circle cx="100" cy="80" r="12" strokeWidth="2.6" />
              <line x1="100" y1="77" x2="100" y2="70" />
              <line x1="101.5" y1="77.4" x2="105" y2="71.3" />
              <line x1="102.6" y1="78.5" x2="108.7" y2="75" />
              <line x1="103" y1="80" x2="110" y2="80" />
              <line x1="102.6" y1="81.5" x2="108.7" y2="85" />
              <line x1="101.5" y1="82.6" x2="105" y2="88.7" />
              <line x1="100" y1="83" x2="100" y2="90" />
              <line x1="98.5" y1="82.6" x2="95" y2="88.7" />
              <line x1="97.4" y1="81.5" x2="91.3" y2="85" />
              <line x1="97" y1="80" x2="90" y2="80" />
              <line x1="97.4" y1="78.5" x2="91.3" y2="75" />
              <line x1="98.5" y1="77.4" x2="95" y2="71.3" />
            </g>
            <g style={{ stroke: 'var(--ink)' }} fill="none" strokeWidth="3">
              <line x1="58" y1="62" x2="142" y2="62" />
              <line x1="58" y1="98" x2="142" y2="98" />
            </g>
          </>
        )}

        {/* Ballot Slip Outer Border with V-Notch */}
        <path
          d="M58 30 Q58 22 66 22 L88 22 L100 46 L112 22 L134 22 Q142 22 142 30 L142 135 L58 135 Z"
          fill="none"
          strokeWidth="5"
          strokeLinejoin="round"
          style={{ stroke: 'var(--ink)' }}
        />
      </g>

      {/* Ballot Slot Base Bar */}
      <rect
        x="24"
        y="124"
        width="152"
        height="26"
        rx="13"
        style={{ fill: effectiveSlot }}
      />
    </svg>
  );
};

