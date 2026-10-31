import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  description,
  error,
  containerClassName = '',
  className = '',
  required,
  ...props
}) => {
  const inputId = id ?? `input-${Math.random().toString(36).substring(2, 9)}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      <label
        htmlFor={inputId}
        className="text-sm font-semibold text-[var(--ink)] flex items-center justify-between"
      >
        <span>
          {label} {required && <span className="text-red-700">*</span>}
        </span>
      </label>

      {description && (
        <span id={descId} className="text-xs text-[var(--ink-3)]">
          {description}
        </span>
      )}

      <input
        id={inputId}
        aria-describedby={
          [descId, errorId].filter(Boolean).join(' ') || undefined
        }
        aria-invalid={!!error}
        aria-required={required}
        className={`w-full min-h-[44px] px-3.5 py-2 rounded-[var(--r-md)] border text-base text-[var(--ink)] bg-[var(--surface)] placeholder-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--focus)] focus:border-transparent transition-colors ${
          error ? 'border-red-600 focus:ring-red-600' : 'border-[var(--line-strong)]'
        } ${className}`}
        {...props}
      />

      {error && (
        <span
          id={errorId}
          role="alert"
          className="text-xs font-medium text-red-700 flex items-center gap-1 mt-0.5"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};
