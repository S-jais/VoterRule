import React from 'react';
import { ProvenanceSourceType } from '@voterrule/shared';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'info' | 'neutral' | 'error';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  icon,
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-[var(--green-wash)] text-[var(--green-deep)] border-[var(--green-deep)]/20',
    warning: 'bg-[var(--saffron-wash)] text-[var(--saffron-deep)] border-[var(--saffron-deep)]/30',
    info: 'bg-[var(--surface-2)] text-[var(--link)] border-[var(--line-strong)]',
    neutral: 'bg-[var(--surface-2)] text-[var(--ink-2)] border-[var(--line)]',
    error: 'bg-red-50 text-red-700 border-red-200',
  };

  const defaultIcons = {
    success: (
      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    warning: (
      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    info: (
      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    neutral: null,
    error: (
      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    ),
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {icon || defaultIcons[variant]}
      <span>{label}</span>
    </span>
  );
};

export const ProvenanceChip: React.FC<{
  sourceType: ProvenanceSourceType;
  dateStr?: string;
  isStale?: boolean;
  className?: string;
}> = ({ sourceType, dateStr, isStale = false, className = '' }) => {
  const getSourceLabel = (type: ProvenanceSourceType) => {
    switch (type) {
      case ProvenanceSourceType.SELF_REPORTED:
        return 'Self-reported';
      case ProvenanceSourceType.USER_RECORDED_OFFICIAL_LOOKUP:
        return 'User-recorded official check';
      case ProvenanceSourceType.DOCUMENT_REVIEWED:
        return 'Document reviewed';
      case ProvenanceSourceType.REVIEWER_CONFIRMED:
        return 'Reviewer-confirmed';
      case ProvenanceSourceType.OFFICIAL_INTEGRATION:
        return 'Official integration';
      default:
        return 'Unverified';
    }
  };

  return (
    <span
      className={`pc ${isStale ? 'st-i' : sourceType === ProvenanceSourceType.OFFICIAL_INTEGRATION ? 'of' : sourceType === ProvenanceSourceType.REVIEWER_CONFIRMED ? 'rv' : ''} ${className}`}
      title={isStale ? 'This record may be out of date (past 30-day staleness threshold)' : undefined}
    >
      <i />
      <span>{getSourceLabel(sourceType)}</span>
      {dateStr && <span className="text-[var(--ink-3)] font-normal text-xs">on {dateStr}</span>}
      {isStale && <span className="text-[var(--saffron-deep)] font-medium text-xs">(may be out of date)</span>}
    </span>
  );
};
