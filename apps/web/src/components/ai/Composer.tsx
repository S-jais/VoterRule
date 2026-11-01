import React, { useState, useRef } from 'react';
import { VoiceState } from './VoiceController.js';
import { ChakraListener } from './ChakraListener.js';
import { TricolorWaveform } from './TricolorWaveform.js';

export interface ComposerProps {
  onSendMessage: (text: string) => void;
  voiceState: VoiceState;
  interimTranscript: string;
  onMicToggle: () => void;
  disabled?: boolean;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  voiceState,
  interimTranscript,
  onMicToggle,
  disabled = false,
}) => {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isListening = voiceState === 'LISTENING';
  const isSpeaking = voiceState === 'SPEAKING';
  const isProcessing = voiceState === 'PROCESSING';

  const handleSend = () => {
    const textToSend = inputText.trim() || interimTranscript.trim();
    if (!textToSend || disabled) return;

    onSendMessage(textToSend);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[var(--line-strong)] bg-[var(--surface)] p-3 space-y-2">
      {/* Live Interim Transcript or Listening Visual */}
      {isListening && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#000080]/5 border border-[#000080]/20 text-xs text-[var(--ink)]">
          <div className="flex items-center gap-2">
            <ChakraListener isListening={true} size={20} />
            <span className="italic text-[var(--ink-2)]">
              {interimTranscript || 'Listening... Speak your voter question clearly'}
            </span>
          </div>
          <TricolorWaveform active={true} />
        </div>
      )}

      {isSpeaking && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-[#138808]/5 border border-[#138808]/20 text-xs text-[var(--ink)]">
          <span className="font-medium text-[#138808]">Speaking answer aloud... Tap mic to interrupt (barge-in)</span>
          <TricolorWaveform active={true} />
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? 'Listening to speech...'
              : 'Ask VoteRule AI about voter rolls, forms, or missing names...'
          }
          disabled={disabled || isListening}
          rows={1}
          className="flex-1 max-h-24 resize-none bg-[var(--surface-2)] border border-[var(--line-strong)] rounded-xl px-3 py-2 text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--ink-3)] focus:outline-none focus:border-[#000080] focus:ring-1 focus:ring-[#000080]"
          aria-label="Ask VoteRule AI a question"
        />

        {/* Microphone Button */}
        <button
          type="button"
          onClick={onMicToggle}
          disabled={disabled || isProcessing}
          className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? 'bg-[#B91C1C] text-white shadow-md animate-pulse ring-2 ring-[#B91C1C]/40'
              : 'bg-[#FF9933] text-white hover:bg-[#A84F00] shadow-xs'
          }`}
          title={isListening ? 'Stop listening' : 'Start voice input (Speak)'}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          {isListening ? (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!inputText.trim() && !interimTranscript.trim())}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-[#000080] text-white hover:bg-[#1A237E] disabled:opacity-40 disabled:hover:bg-[#000080] flex items-center justify-center transition-colors shadow-xs"
          title="Send message"
          aria-label="Send message"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
