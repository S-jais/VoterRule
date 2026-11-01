import React from 'react';
import { ChakraMark } from '@voterrule/ui';
import { VoiceState } from './VoiceController.js';

export interface AssistantLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  voiceState: VoiceState;
  hasUnread?: boolean;
}

export const AssistantLauncher: React.FC<AssistantLauncherProps> = ({
  isOpen,
  onToggle,
  voiceState,
  hasUnread = false,
}) => {
  const isListening = voiceState === 'LISTENING';
  const isSpeaking = voiceState === 'SPEAKING';

  return (
    <aside
      className="fixed bottom-5 right-5 z-40 print:hidden select-none"
      aria-label="VoteRule AI Civic Assistant"
    >
      <button
        type="button"
        onClick={onToggle}
        className={`group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#000080]/30 ${
          isOpen
            ? 'bg-[#000080] text-white rotate-90 scale-95'
            : isListening
            ? 'bg-[#B91C1C] text-white ring-4 ring-[#B91C1C]/40 animate-pulse'
            : isSpeaking
            ? 'bg-[#138808] text-white ring-4 ring-[#138808]/40'
            : 'bg-[var(--surface)] text-[var(--ink)] border-2 border-[#000080] hover:scale-105 hover:shadow-xl'
        }`}
        aria-expanded={isOpen}
        aria-controls="voterrule-ai-panel"
        aria-label={
          isOpen
            ? 'Close VoteRule AI panel'
            : isListening
            ? 'VoteRule AI is listening'
            : 'Open VoteRule AI Digital Civic Assistant'
        }
      >
        {isOpen ? (
          <svg className="w-6 h-6 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <div className="relative flex items-center justify-center">
            <ChakraMark
              size={32}
              ringColor={isListening ? '#FFFFFF' : isSpeaking ? '#FFFFFF' : '#000080'}
            />
            {/* Listening indicator dot */}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full border-2 border-white animate-ping" />
            )}
            {/* Unread badge */}
            {hasUnread && !isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF9933] rounded-full border-2 border-white" />
            )}
          </div>
        )}

        {/* Hover Pill Tooltip */}
        {!isOpen && (
          <span className="sr-only sm:not-sr-only absolute right-16 px-3 py-1.5 rounded-full bg-[#000080] text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
            Ask VoteRule AI
          </span>
        )}
      </button>
    </aside>
  );
};

