import React from 'react';

export interface SuggestedQuestionsProps {
  suggestions: string[];
  onSelect: (question: string) => void;
  className?: string;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  suggestions,
  onSelect,
  className = '',
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <span className="text-[11px] font-semibold tracking-wider text-[var(--ink-3)] uppercase">
        Suggested questions
      </span>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(q)}
            className="text-xs text-left px-2.5 py-1 rounded-full bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--ink-2)] hover:border-[#000080] hover:text-[#000080] dark:hover:text-white transition-colors"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
};
