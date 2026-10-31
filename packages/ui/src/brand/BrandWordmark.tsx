import React from 'react';
import { ChakraMark } from './ChakraMark.js';

export interface BrandWordmarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  hideTagline?: boolean;
}

export const BrandWordmark: React.FC<BrandWordmarkProps> = ({
  className = '',
  size = 'md',
  hideTagline = false,
}) => {
  const markSizes = { sm: 32, md: 38, lg: 48 };

  return (
    <div className={`brand flex items-center gap-2.5 ${className}`}>
      <ChakraMark size={markSizes[size]} ringColor="var(--mark-ring, #000080)" />
      <div className="flex flex-col">
        <span className="brand-name font-display font-extrabold text-[1.2rem] leading-none tracking-tight text-[var(--ink)]">
          VoterRule
        </span>
        <span className="brand-dev text-[0.8125rem] leading-tight text-[var(--ink-3)] font-medium font-sans">
          Every Eligible Voter. Every Right. Every Voice.
        </span>
        {!hideTagline && size === 'lg' && (
          <span className="text-xs text-[var(--ink-3)] font-normal mt-0.5">
            Every Eligible Voter. Every Right. Every Voice.
          </span>
        )}
      </div>
    </div>
  );
};
