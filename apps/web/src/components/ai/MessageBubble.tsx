import React from 'react';
import { ChakraMark } from '@voterrule/ui';

export interface CitationItem {
  id: string;
  title: string;
  officialSource: string;
  sourceUrl: string;
  lastVerifiedDate: string;
}

export interface ActionItem {
  id: string;
  type: string;
  label: string;
  payload: Record<string, any>;
}

export interface MessageBubbleProps {
  role: 'user' | 'assistant' | 'system';
  content: string;
  spokenText?: string;
  citations?: CitationItem[];
  actions?: ActionItem[];
  workflow?: any;
  timestamp?: string;
  onActionClick?: (action: ActionItem) => void;
  onWorkflowOptionClick?: (optionId: string) => void;
  onSpeak?: (text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  role,
  content,
  spokenText,
  citations = [],
  actions = [],
  workflow,
  timestamp,
  onActionClick,
  onWorkflowOptionClick,
  onSpeak,
}) => {
  const isUser = role === 'user';

  // Format simple markdown lines (bold, bullet points, blockquotes)
  const renderFormattedContent = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-sm text-[var(--ink)] mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote
            key={idx}
            className="border-l-2 border-[#000080] pl-2.5 my-1.5 text-xs italic text-[var(--ink-2)]"
          >
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const bulletText = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-xs sm:text-sm my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(bulletText) }} />
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        const itemText = line.replace(/^\d+\.\s/, '');
        return (
          <li key={idx} className="ml-4 list-decimal text-xs sm:text-sm my-0.5">
            <span dangerouslySetInnerHTML={{ __html: formatInline(itemText) }} />
          </li>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p
          key={idx}
          className="text-xs sm:text-sm leading-relaxed my-0.5"
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    });
  };

  const formatInline = (str: string) => {
    return str
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div className={`flex gap-2.5 max-w-[88%] sm:max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="flex-shrink-0 mt-1">
            <div className="w-7 h-7 rounded-full bg-[#000080]/10 flex items-center justify-center border border-[#000080]/20">
              <ChakraMark size={20} ringColor="#000080" />
            </div>
          </div>
        )}

        <div className="flex flex-col space-y-1.5">
          <div
            className={`p-3.5 rounded-2xl shadow-sm ${
              isUser
                ? 'bg-[#000080] text-white rounded-tr-none'
                : 'bg-[var(--surface)] border border-[var(--line-strong)] text-[var(--ink)] rounded-tl-none'
            }`}
          >
            <div className="space-y-1">{renderFormattedContent(content)}</div>

            {/* Read aloud trigger button for assistant */}
            {!isUser && onSpeak && (
              <div className="mt-2.5 pt-2 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--ink-3)]">
                <button
                  type="button"
                  onClick={() => onSpeak(spokenText || content)}
                  className="inline-flex items-center gap-1 hover:text-[#000080] font-medium"
                  aria-label="Read this response aloud"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span>Listen</span>
                </button>
                {timestamp && <span className="text-[10px] opacity-75">{timestamp}</span>}
              </div>
            )}
          </div>

          {/* Official Citation Source Chips */}
          {!isUser && citations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {citations.map((cite) => (
                <a
                  key={cite.id}
                  href={cite.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--ink-2)] hover:border-[#000080] hover:text-[#000080] transition-colors"
                  title={`${cite.title} • Verified on ${cite.lastVerifiedDate}`}
                >
                  <span className="font-semibold">{cite.officialSource}</span>
                  <span className="opacity-60 text-[10px]">({cite.lastVerifiedDate})</span>
                  <svg className="w-2.5 h-2.5 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          )}

          {/* Action Chips */}
          {!isUser && actions.length > 0 && onActionClick && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {actions.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => onActionClick(act)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#000080]/10 border border-[#000080]/30 text-[#000080] dark:text-[#8D94BD] hover:bg-[#000080] hover:text-white transition-all shadow-xs"
                >
                  <span>{act.label}</span>
                  <span>→</span>
                </button>
              ))}
            </div>
          )}

          {/* Interactive Guided Workflow Options */}
          {!isUser && workflow && !workflow.completed && workflow.currentStep?.options && onWorkflowOptionClick && (
            <div className="flex flex-col gap-1.5 pt-2">
              <span className="text-[11px] font-semibold text-[var(--ink-3)]">Select an option to continue:</span>
              <div className="flex flex-wrap gap-1.5">
                {workflow.currentStep.options.map((opt: any) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onWorkflowOptionClick(opt.id)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-[var(--r-md)] bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--ink)] hover:border-[var(--link)] hover:text-[var(--link)] transition-colors text-left"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
