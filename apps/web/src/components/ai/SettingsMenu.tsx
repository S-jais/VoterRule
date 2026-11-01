import React from 'react';

export interface SettingsMenuProps {
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  speechRate: number;
  onSelectSpeechRate: (rate: number) => void;
  onClearHistory: () => void;
  onOpenPrivacy: () => void;
  onClose: () => void;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({
  autoSpeak,
  onToggleAutoSpeak,
  speechRate,
  onSelectSpeechRate,
  onClearHistory,
  onOpenPrivacy,
  onClose,
}) => {
  return (
    <div className="absolute right-3 top-14 w-72 bg-[var(--surface)] border border-[var(--line-strong)] rounded-xl shadow-xl z-50 p-4 space-y-4 text-[var(--ink)] animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
        <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--ink-2)]">
          Assistant Settings
        </h4>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-[var(--ink-3)] hover:text-[var(--ink)]"
        >
          ✕
        </button>
      </div>

      {/* Auto Speak Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs font-semibold">Spoken Responses</span>
          <span className="text-[10px] text-[var(--ink-3)]">Speak answers aloud automatically</span>
        </div>
        <button
          type="button"
          onClick={onToggleAutoSpeak}
          className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
            autoSpeak ? 'bg-[#000080]' : 'bg-gray-300 dark:bg-gray-700'
          }`}
          aria-label="Toggle spoken responses"
        >
          <div
            className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform ${
              autoSpeak ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Speech Speed */}
      <div className="space-y-1.5">
        <span className="text-xs font-semibold">Speech Speed</span>
        <div className="grid grid-cols-3 gap-1">
          {[0.75, 1.0, 1.25].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onSelectSpeechRate(rate)}
              className={`text-xs py-1 rounded border text-center transition-colors ${
                speechRate === rate
                  ? 'bg-[#000080] text-white border-[#000080]'
                  : 'bg-[var(--surface-2)] border-[var(--line-strong)] text-[var(--ink-2)] hover:border-[#000080]'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Clear conversation */}
      <div className="pt-2 border-t border-[var(--line)] space-y-2">
        <button
          type="button"
          onClick={() => {
            onClearHistory();
            onClose();
          }}
          className="w-full text-left text-xs text-[#B91C1C] hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded transition-colors font-medium flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span>Clear Conversation History</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onOpenPrivacy();
            onClose();
          }}
          className="w-full text-left text-[11px] text-[var(--link)] hover:underline p-1 flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Microphone Privacy & DPDP Notice</span>
        </button>
      </div>
    </div>
  );
};

