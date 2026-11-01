import React, { useState, useEffect, useRef } from 'react';
import { ChakraMark } from '@voterrule/ui';
import { VoiceController, VoiceState } from './VoiceController.js';
import { ActionExecutor, ActionPayload } from './ActionExecutor.js';
import { MessageBubble, ActionItem } from './MessageBubble.js';
import { Composer } from './Composer.js';
import { SuggestedQuestions } from './SuggestedQuestions.js';
import { SettingsMenu } from './SettingsMenu.js';
import { ConfirmDialog } from './ConfirmDialog.js';

export interface AssistantPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
  locale: string;
  onSelectLocale: (locale: string) => void;
}

export interface PanelMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  spokenText?: string;
  citations?: any[];
  actions?: any[];
  workflow?: any;
  timestamp: string;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({
  isOpen,
  onClose,
  currentPath,
  onNavigate,
  locale,
  onSelectLocale,
}) => {
  const [messages, setMessages] = useState<PanelMessage[]>([]);
  const [sessionId] = useState<string>(() => `sess-${Math.random().toString(36).substring(2, 10)}`);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    'Check my voter registration',
    'My name is missing from the voter list',
    'Explain Indian voting eligibility',
    'What is Form 6?',
    'Show me how VoteRule works',
  ]);
  const [loading, setLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceControllerRef = useRef<VoiceController | null>(null);
  const actionExecutorRef = useRef<ActionExecutor | null>(null);

  // Initialize VoiceController & ActionExecutor
  useEffect(() => {
    actionExecutorRef.current = new ActionExecutor({
      onNavigate,
      onConfirmRequest: (prompt, onConfirm) => {
        setConfirmDialog({
          isOpen: true,
          message: prompt,
          onConfirm: () => {
            setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            onConfirm();
          },
        });
      },
    });

    voiceControllerRef.current = new VoiceController({
      locale,
      speechRate,
      onStateChange: (state, detail) => {
        setVoiceState(state);
        if (state === 'ERROR' && detail) {
          setErrorBanner(detail);
        }
      },
      onInterimTranscript: (text) => setInterimTranscript(text),
      onFinalTranscript: (text) => {
        setInterimTranscript('');
        handleSendMessage(text);
      },
      onError: (err) => {
        setErrorBanner(`Voice input error: ${err}`);
      },
    });

    return () => {
      voiceControllerRef.current?.stopListening();
      voiceControllerRef.current?.stopSpeaking();
    };
  }, []);

  // Update VoiceController when locale or speech rate changes
  useEffect(() => {
    if (voiceControllerRef.current) {
      voiceControllerRef.current.setLocale(locale);
      voiceControllerRef.current.setSpeechRate(speechRate);
    }
  }, [locale, speechRate]);

  // Context-aware question update based on current page
  useEffect(() => {
    if (currentPath === '/app/check') {
      setSuggestedQuestions([
        'What does "details appear inconsistent" mean?',
        'How to search without an EPIC number?',
        'What if official search times out?',
      ]);
    } else if (currentPath === '/app/missing-name') {
      setSuggestedQuestions([
        'What documents are needed for Form 6?',
        'Who is my Electoral Registration Officer?',
        'What if I have moved to another city?',
      ]);
    } else if (currentPath === '/eligibility-check') {
      setSuggestedQuestions([
        'What are the four qualifying dates?',
        'Can 17-year-olds register in advance?',
        'What is ordinary residence?',
      ]);
    } else if (currentPath === '/app/duplicate-self-check') {
      setSuggestedQuestions([
        'Why are duplicate registrations prohibited?',
        'Does having two cards cancel my vote?',
        'How does Form 8 resolve duplicates?',
      ]);
    }
  }, [currentPath]);

  // Autoscroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, interimTranscript]);

  // Esc key closes panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const safeParseResponse = async (res: Response) => {
    let json: any = null;
    let responseText = '';
    try {
      responseText = await res.text();
    } catch {
      // Stream reading error
    }

    if (responseText) {
      try {
        json = JSON.parse(responseText);
      } catch {
        // Not JSON
      }
    }

    if (!res.ok) {
      const errorMsg =
        json?.error?.message ||
        json?.message ||
        (res.status === 502 || res.status === 503 || res.status === 504
          ? 'Unable to connect to VoteRule backend service (port 4000). Please check that the API server is running.'
          : `Server returned HTTP ${res.status}: ${res.statusText || 'Error'}`);
      throw new Error(errorMsg);
    }

    if (!json) {
      throw new Error('Received an empty response from VoteRule assistant service.');
    }

    return json;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setErrorBanner(null);
    setLoading(true);

    const userMessage: PanelMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: text,
          currentRouteId: currentPath.replace('/', '') || 'home',
          locale: locale as any,
        }),
      });

      const json = await safeParseResponse(res);

      const aiMsg = json.data?.message;
      const assistantMessage: PanelMessage = {
        id: aiMsg?.id || `ai-${Date.now()}`,
        role: 'assistant',
        content: aiMsg?.content || 'Here is the statutory guidance for your question.',
        spokenText: aiMsg?.spokenText,
        citations: aiMsg?.citations || [],
        actions: aiMsg?.actions || [],
        workflow: aiMsg?.workflow,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (json.data?.message?.suggestedPrompts) {
        setSuggestedQuestions(json.data.message.suggestedPrompts);
      }

      // Voice Output: speak if enabled
      if (autoSpeak && aiMsg?.spokenText) {
        voiceControllerRef.current?.speak(aiMsg.spokenText);
      }
    } catch (err: any) {
      console.error(err);
      if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
        setErrorBanner('Network error: Unable to connect to VoteRule backend API (port 4000). Please ensure the backend is running.');
      } else {
        setErrorBanner(err.message || 'Error communicating with assistant. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: ActionItem) => {
    actionExecutorRef.current?.execute(action as ActionPayload);
  };

  const handleWorkflowOptionClick = async (optionId: string) => {
    if (loading) return;
    setErrorBanner(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: `Option chosen: ${optionId}`,
          selectedOptionId: optionId,
          currentRouteId: currentPath.replace('/', '') || 'home',
          locale: locale as any,
        }),
      });

      const json = await safeParseResponse(res);
      const aiMsg = json.data?.message;
      if (aiMsg) {
        const assistantMessage: PanelMessage = {
          id: aiMsg.id,
          role: 'assistant',
          content: aiMsg.content,
          spokenText: aiMsg.spokenText,
          citations: aiMsg.citations || [],
          actions: aiMsg.actions || [],
          workflow: aiMsg.workflow,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (autoSpeak && aiMsg.spokenText) {
          voiceControllerRef.current?.speak(aiMsg.spokenText);
        }
      }
    } catch (err: any) {
      if (err.name === 'TypeError' && err.message?.toLowerCase().includes('fetch')) {
        setErrorBanner('Network error: Unable to connect to VoteRule backend API (port 4000). Please ensure the backend is running.');
      } else {
        setErrorBanner(err.message || 'Error communicating with assistant. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch('/api/v1/ai/session/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      setMessages([]);
      voiceControllerRef.current?.stopSpeaking();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMicToggle = () => {
    if (voiceState === 'LISTENING') {
      voiceControllerRef.current?.stopListening();
    } else {
      voiceControllerRef.current?.startListening();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <section
        id="voterrule-ai-panel"
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-[var(--surface)] border-l border-[var(--line-strong)] shadow-2xl flex flex-col justify-between text-[var(--ink)] animate-in slide-in-from-right duration-300 print:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="VoteRule AI Assistant"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--line-strong)] bg-[var(--surface-2)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#000080]/10 flex items-center justify-center border border-[#000080]/20">
              <ChakraMark size={22} ringColor="#000080" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold text-sm tracking-tight text-[var(--ink)]">
                  VoteRule AI
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#138808]/10 text-[#138808] border border-[#138808]/20">
                  Civic AI
                </span>
              </div>
              <span className="text-[11px] text-[var(--ink-3)] font-sans">
                Your Digital Civic Assistant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Selector */}
            <button
              type="button"
              onClick={() => onSelectLocale(locale === 'hi' ? 'en' : 'hi')}
              className="text-xs font-bold px-2 py-1 rounded bg-[var(--surface)] border border-[var(--line-strong)] text-[#000080] hover:bg-[#000080]/10"
              title="Switch language between English and Hindi"
            >
              {locale === 'hi' ? 'EN' : 'हिन्दी'}
            </button>

            {/* Settings Trigger */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1.5 rounded-lg text-[var(--ink-2)] hover:bg-[var(--surface)]"
              title="Assistant Settings"
              aria-label="Assistant Settings"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--ink-2)] hover:bg-[var(--surface)]"
              title="Close Assistant"
              aria-label="Close Assistant"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* Settings Menu Popup */}
        {isSettingsOpen && (
          <SettingsMenu
            autoSpeak={autoSpeak}
            onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
            speechRate={speechRate}
            onSelectSpeechRate={(r) => setSpeechRate(r)}
            onClearHistory={handleClearHistory}
            onOpenPrivacy={() => onNavigate('/privacy')}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}

        {/* Error Banner */}
        {errorBanner && (
          <div className="bg-[#B91C1C]/10 border-b border-[#B91C1C]/30 px-4 py-2 flex items-center justify-between text-xs text-[#B91C1C]">
            <span>{errorBanner}</span>
            <button type="button" onClick={() => setErrorBanner(null)} className="font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Conversation Body */}
        <div
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
          role="log"
          aria-live="polite"
        >
          {/* Welcome Intro Card */}
          {messages.length === 0 && (
            <div className="bg-[var(--surface-2)] border border-[var(--line-strong)] rounded-2xl p-4 space-y-3 text-xs text-[var(--ink)]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[var(--ink)]">
                  {locale === 'hi' ? 'नमस्ते! मैं VoteRule AI हूँ।' : "Hello! I'm VoteRule AI."}
                </span>
              </div>
              <p className="text-[var(--ink-2)] leading-relaxed">
                {locale === 'hi'
                  ? 'मैं मतदाता पंजीकरण, मतदाता सूची में नाम की जांच, और आधिकारिक चुनाव प्रक्रियाओं को समझने में आपकी सहायता करता हूँ।'
                  : "I'm here to help you understand voter registration, electoral procedures, and the features of VoteRule."}
              </p>
              <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-[11px] text-[var(--ink-3)]">
                <span className="font-semibold text-[#000080]">Independence Note:</span> VoteRule is an independent civic platform and is not affiliated with the Election Commission of India. Official determinations are made solely by statutory authorities.
              </div>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              role={m.role}
              content={m.content}
              spokenText={m.spokenText}
              citations={m.citations}
              actions={m.actions}
              workflow={m.workflow}
              timestamp={m.timestamp}
              onActionClick={handleActionClick}
              onWorkflowOptionClick={handleWorkflowOptionClick}
              onSpeak={(txt) => voiceControllerRef.current?.speak(txt)}
            />
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] w-fit text-xs text-[var(--ink-2)] animate-pulse">
              <ChakraMark size={16} ringColor="#000080" />
              <span>VoteRule AI is consulting statutory records...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Footer Area: Suggestions & Composer */}
        <div className="flex flex-col">
          {/* Suggested Prompts */}
          <div className="px-3 pt-2 bg-[var(--surface)]">
            <SuggestedQuestions
              suggestions={suggestedQuestions}
              onSelect={(q) => handleSendMessage(q)}
            />
          </div>

          {/* Composer */}
          <Composer
            onSendMessage={handleSendMessage}
            voiceState={voiceState}
            interimTranscript={interimTranscript}
            onMicToggle={handleMicToggle}
            disabled={loading}
          />
        </div>
      </section>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
};

