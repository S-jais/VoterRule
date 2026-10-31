import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div
      className={`bg-[var(--surface)] rounded-[var(--r-lg)] border border-[var(--line)] shadow-[var(--shadow)] p-5 md:p-6 transition-all hover:border-[var(--ink-3)] ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 border-b border-[var(--line)]">
          <div>
            {title && (
              <h3 className="text-lg font-bold text-[var(--ink)] tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--ink-3)] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
