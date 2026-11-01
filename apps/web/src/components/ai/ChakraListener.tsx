import React from 'react';

export interface ChakraListenerProps {
  isListening: boolean;
  size?: number;
  className?: string;
}

export const ChakraListener: React.FC<ChakraListenerProps> = ({
  isListening,
  size = 48,
  className = '',
}) => {
  // Generate 24 spokes for the Ashoka Chakra
  const spokes = Array.from({ length: 24 }).map((_, i) => {
    const angle = i * 15;
    return (
      <line
        key={i}
        x1="24"
        y1="24"
        x2="24"
        y2="5"
        stroke="var(--chakra-navy, #000080)"
        strokeWidth="1.2"
        strokeLinecap="round"
        transform={`rotate(${angle} 24 24)`}
      />
    );
  });

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        className={`transition-transform duration-700 ${
          isListening ? 'animate-spin-slow' : ''
        }`}
      >
        {/* Outer Ring */}
        <circle
          cx="24"
          cy="24"
          r="20"
          fill="none"
          stroke="var(--chakra-navy, #000080)"
          strokeWidth="2.5"
        />
        {/* 24 Spoke elements */}
        {spokes}
        {/* Hub / Center */}
        <circle cx="24" cy="24" r="3.5" fill="var(--chakra-navy, #000080)" />
      </svg>
    </div>
  );
};
