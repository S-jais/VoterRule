import React, { useEffect, useRef, useState } from 'react';

export interface TricolorCivicFlowProps {
  liteMode?: boolean;
  className?: string;
}

/**
 * Tricolor Civic Flow
 * Exact geometric SVG composition with saffron/white/green ribbons, alignment brackets,
 * and 24-spoke Ashoka Chakra ring per the VoterRule design reference.
 */
export const TricolorCivicFlow: React.FC<TricolorCivicFlowProps> = ({
  liteMode = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting ?? true);
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  const isPaused = liteMode || !isInView;

  return (
    <div
      ref={containerRef}
      className={`hero-art w-full overflow-hidden select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className={`art ${isPaused ? 'paused' : ''} w-full h-auto`}
        viewBox="0 0 760 620"
        preserveAspectRatio="xMaxYMid slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="shW" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="shN" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={{ stopColor: 'var(--sheen-n)', stopOpacity: 0 }} />
            <stop offset="0.5" style={{ stopColor: 'var(--sheen-n)' }} />
            <stop offset="1" style={{ stopColor: 'var(--sheen-n)', stopOpacity: 0 }} />
          </linearGradient>
          <linearGradient id="gF" gradientUnits="userSpaceOnUse" x1="-30" y1="0" x2="748" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.14" stopColor="#fff" />
            <stop offset="0.9" stopColor="#fff" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="mFade" maskUnits="userSpaceOnUse" x="-40" y="-10" width="840" height="640">
            <rect x="-40" y="-10" width="840" height="640" fill="url(#gF)" />
          </mask>
          <clipPath id="cpS">
            <rect className="cp-rect" x="-40" y="0" width="840" height="620" />
          </clipPath>
          <clipPath id="cpW">
            <rect className="cp-rect cp-w" x="-40" y="0" width="840" height="620" />
          </clipPath>
          <clipPath id="cpG">
            <rect className="cp-rect cp-g" x="-40" y="0" width="840" height="620" />
          </clipPath>
          <mask id="mkS" maskUnits="userSpaceOnUse" x="-40" y="0" width="840" height="620">
            <path className="mk" d="M -30 96 C 120 96 170 276 310 276 L 748 276" />
          </mask>
          <mask id="mkW" maskUnits="userSpaceOnUse" x="-40" y="0" width="840" height="620">
            <path className="mk" d="M -30 420 C 130 420 170 310 310 310 L 748 310" />
          </mask>
          <mask id="mkG" maskUnits="userSpaceOnUse" x="-40" y="0" width="840" height="620">
            <path className="mk" d="M -30 566 C 130 566 170 344 310 344 L 748 344" />
          </mask>
        </defs>

        <g mask="url(#mFade)">
          {/* Geometric channel: rails, ticks, halos */}
          <g className="fade-a">
            <path className="rail" d="M -30 40 H 120 L 236 234 H 424" />
            <path className="rail" d="M -30 600 H 120 L 236 386 H 424" />
            <path className="tick" d="M 60 62 V 578 M 120 62 V 578 M 180 150 V 490" />
            <circle className="halo" cx="520" cy="310" r="152" />
            <circle className="halo" cx="520" cy="310" r="190" />
          </g>

          {/* Ribbons */}
          <g clipPath="url(#cpS)">
            <path className="rb rb-s" d="M -30 96 C 120 96 170 276 310 276 L 748 276" />
            <g mask="url(#mkS)">
              <rect className="sheen sh1" x="-330" y="0" width="260" height="620" />
            </g>
          </g>
          <g clipPath="url(#cpW)">
            <path className="rb-e" d="M -30 420 C 130 420 170 310 310 310 L 748 310" />
            <path className="rb rb-w" d="M -30 420 C 130 420 170 310 310 310 L 748 310" />
            <g mask="url(#mkW)">
              <rect className="sheen sw sh2" x="-330" y="0" width="260" height="620" />
            </g>
          </g>
          <g clipPath="url(#cpG)">
            <path className="rb rb-g" d="M -30 566 C 130 566 170 344 310 344 L 748 344" />
            <g mask="url(#mkG)">
              <rect className="sheen sh3" x="-330" y="0" width="260" height="620" />
            </g>
          </g>
        </g>

        {/* Alignment bracket and nodes */}
        <g className="fade-c">
          <path className="bracket" d="M 310 258 V 362 M 303 258 H 317 M 303 362 H 317" />
          <circle className="nd-s" cx="310" cy="276" r="5.5" />
          <circle className="nd-w" cx="310" cy="310" r="5.5" />
          <circle className="nd-g" cx="310" cy="344" r="5.5" />
        </g>

        {/* Ashoka Chakra-inspired ring: 24 spokes */}
        <g transform="translate(520 310)">
          <g className="fade-b">
            <circle className="disc" r="122" />
            <circle className="rim2" r="104" />
            {/* 24 rim dots */}
            <circle className="dot" cx="14.75" cy="-112.03" r="2.4" />
            <circle className="dot" cx="43.24" cy="-104.40" r="2.4" />
            <circle className="dot" cx="68.79" cy="-89.65" r="2.4" />
            <circle className="dot" cx="89.65" cy="-68.79" r="2.4" />
            <circle className="dot" cx="104.40" cy="-43.24" r="2.4" />
            <circle className="dot" cx="112.03" cy="-14.75" r="2.4" />
            <circle className="dot" cx="112.03" cy="14.75" r="2.4" />
            <circle className="dot" cx="104.40" cy="43.24" r="2.4" />
            <circle className="dot" cx="89.65" cy="68.79" r="2.4" />
            <circle className="dot" cx="68.79" cy="89.65" r="2.4" />
            <circle className="dot" cx="43.24" cy="104.40" r="2.4" />
            <circle className="dot" cx="14.75" cy="112.03" r="2.4" />
            <circle className="dot" cx="-14.75" cy="112.03" r="2.4" />
            <circle className="dot" cx="-43.24" cy="104.40" r="2.4" />
            <circle className="dot" cx="-68.79" cy="89.65" r="2.4" />
            <circle className="dot" cx="-89.65" cy="68.79" r="2.4" />
            <circle className="dot" cx="-104.40" cy="43.24" r="2.4" />
            <circle className="dot" cx="-112.03" cy="14.75" r="2.4" />
            <circle className="dot" cx="-112.03" cy="-14.75" r="2.4" />
            <circle className="dot" cx="-104.40" cy="-43.24" r="2.4" />
            <circle className="dot" cx="-89.65" cy="-68.79" r="2.4" />
            <circle className="dot" cx="-68.79" cy="-89.65" r="2.4" />
            <circle className="dot" cx="-43.24" cy="-104.40" r="2.4" />
            <circle className="dot" cx="-14.75" cy="-112.03" r="2.4" />
          </g>

          {/* 24 spokes */}
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              className="spoke"
              style={{ ['--i' as any]: i }}
              x1="0"
              y1="-22"
              x2="0"
              y2="-100"
              transform={`rotate(${i * 15})`}
            />
          ))}

          <g className="fade-b">
            <circle className="hub" r="14" />
            <circle className="hub2" r="6" />
          </g>
        </g>
      </svg>
    </div>
  );
};
