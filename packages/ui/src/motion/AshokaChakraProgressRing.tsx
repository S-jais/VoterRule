import React from 'react';

export interface AshokaChakraProgressRingProps {
  completed: number;
  total: number;
  size?: number;
  className?: string;
  showLabel?: boolean;
}

/**
 * Ashoka Chakra Progress Ring
 * Exact 24-spoke ring with dots and active/inactive illuminated spokes per design reference.
 */
export const AshokaChakraProgressRing: React.FC<AshokaChakraProgressRingProps> = ({
  completed,
  total,
  className = '',
  showLabel = true,
}) => {
  const safeTotal = Math.max(1, total);
  const safeCompleted = Math.min(safeTotal, Math.max(0, completed));
  const activeSpokes = Math.round((24 * safeCompleted) / safeTotal);

  return (
    <div
      className={`ring ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={safeTotal}
      aria-valuenow={safeCompleted}
      aria-label={`Case progress: ${safeCompleted} of ${safeTotal} steps complete`}
    >
      <svg viewBox="0 0 160 160" aria-hidden="true" focusable="false">
        <g transform="translate(80 80)">
          <circle className="rim" r="74" />
          {/* 24 rim dots */}
          <circle className="dt" cx="8.68" cy="-65.93" r="1.7" />
          <circle className="dt" cx="25.45" cy="-61.44" r="1.7" />
          <circle className="dt" cx="40.48" cy="-52.76" r="1.7" />
          <circle className="dt" cx="52.76" cy="-40.48" r="1.7" />
          <circle className="dt" cx="61.44" cy="-25.45" r="1.7" />
          <circle className="dt" cx="65.93" cy="-8.68" r="1.7" />
          <circle className="dt" cx="65.93" cy="8.68" r="1.7" />
          <circle className="dt" cx="61.44" cy="25.45" r="1.7" />
          <circle className="dt" cx="52.76" cy="40.48" r="1.7" />
          <circle className="dt" cx="40.48" cy="52.76" r="1.7" />
          <circle className="dt" cx="25.45" cy="61.44" r="1.7" />
          <circle className="dt" cx="8.68" cy="65.93" r="1.7" />
          <circle className="dt" cx="-8.68" cy="65.93" r="1.7" />
          <circle className="dt" cx="-25.45" cy="61.44" r="1.7" />
          <circle className="dt" cx="-40.48" cy="52.76" r="1.7" />
          <circle className="dt" cx="-52.76" cy="40.48" r="1.7" />
          <circle className="dt" cx="-61.44" cy="25.45" r="1.7" />
          <circle className="dt" cx="-65.93" cy="8.68" r="1.7" />
          <circle className="dt" cx="-65.93" cy="-8.68" r="1.7" />
          <circle className="dt" cx="-61.44" cy="-25.45" r="1.7" />
          <circle className="dt" cx="-52.76" cy="-40.48" r="1.7" />
          <circle className="dt" cx="-40.48" cy="-52.76" r="1.7" />
          <circle className="dt" cx="-25.45" cy="-61.44" r="1.7" />
          <circle className="dt" cx="-8.68" cy="-65.93" r="1.7" />

          {/* 24 spokes (inactive baseline) */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={`off-${i}`}
              className="off"
              x1="0"
              y1="-37"
              x2="0"
              y2="-58"
              transform={`rotate(${i * 15})`}
            />
          ))}

          {/* Active illuminated spokes */}
          {Array.from({ length: activeSpokes }).map((_, i) => (
            <line
              key={`on-${i}`}
              className="on"
              style={{ ['--i' as any]: i }}
              x1="0"
              y1="-37"
              x2="0"
              y2="-58"
              transform={`rotate(${i * 15})`}
            />
          ))}
        </g>
      </svg>
      {showLabel && (
        <div className="ring-label" aria-hidden="true">
          <strong>{safeCompleted}/{safeTotal}</strong>
          <span>steps</span>
        </div>
      )}
    </div>
  );
};
