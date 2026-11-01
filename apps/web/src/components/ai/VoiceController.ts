export type VoiceState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'RESPONDING'
  | 'SPEAKING'
  | 'ERROR'
  | 'PERMISSION_DENIED'
  | 'NOT_SUPPORTED';

export interface VoiceControllerOptions {
  onStateChange: (state: VoiceState, detail?: string) => void;
  onInterimTranscript: (text: string) => void;
  onFinalTranscript: (text: string) => void;
  onError: (errorMsg: string) => void;
  locale?: string;
  speechRate?: number;
}

export class VoiceController {
  private state: VoiceState = 'IDLE';
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private watchdogTimer: any = null;
  private options: VoiceControllerOptions;
  private speechRate: number = 1.0;
  private locale: string = 'en-IN';

  constructor(options: VoiceControllerOptions) {
    this.options = options;
    this.locale = options.locale === 'hi' ? 'hi-IN' : 'en-IN';
    this.speechRate = options.speechRate || 1.0;

    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
      this.initSpeechRecognition();
    }
  }

  private initSpeechRecognition(): void {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.transitionTo('NOT_SUPPORTED', 'Web Speech API is not supported in this browser');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = this.locale;

      this.recognition.onstart = () => {
        this.clearWatchdog();
        this.transitionTo('LISTENING');
        // Watchdog: auto-stop after 12 seconds of silence
        this.watchdogTimer = setTimeout(() => {
          this.stopListening();
        }, 12000);
      };

      this.recognition.onresult = (event: any) => {
        this.clearWatchdog();
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interimText += transcript;
          }
        }

        if (interimText) {
          this.options.onInterimTranscript(interimText);
        }

        if (finalText) {
          this.options.onFinalTranscript(finalText);
          this.stopListening();
        }
      };

      this.recognition.onerror = (event: any) => {
        this.clearWatchdog();
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.transitionTo('PERMISSION_DENIED', 'Microphone permission was denied by user or browser');
        } else {
          this.transitionTo('ERROR', `Recognition error: ${event.error}`);
        }
        this.options.onError(event.error);
      };

      this.recognition.onend = () => {
        this.clearWatchdog();
        if (this.state === 'LISTENING') {
          this.transitionTo('IDLE');
        }
      };
    } catch (err: any) {
      this.transitionTo('ERROR', err.message);
    }
  }

  public setLocale(locale: string): void {
    this.locale = locale === 'hi' ? 'hi-IN' : 'en-IN';
    if (this.recognition) {
      this.recognition.lang = this.locale;
    }
  }

  public setSpeechRate(rate: number): void {
    this.speechRate = rate;
  }

  public getState(): VoiceState {
    return this.state;
  }

  private transitionTo(newState: VoiceState, detail?: string): void {
    this.state = newState;
    this.options.onStateChange(newState, detail);
  }

  private clearWatchdog(): void {
    if (this.watchdogTimer) {
      clearTimeout(this.watchdogTimer);
      this.watchdogTimer = null;
    }
  }

  /**
   * Start listening after explicit user gesture
   * Implements Barge-in: immediately stops active speech playback if currently speaking
   */
  public startListening(): void {
    // 1. Barge-in: if currently speaking, cancel immediately
    if (this.state === 'SPEAKING' || this.synthesis?.speaking) {
      this.stopSpeaking();
    }

    if (!this.recognition) {
      this.options.onError('Speech recognition not available on this device');
      return;
    }

    try {
      this.recognition.lang = this.locale;
      this.recognition.start();
    } catch (err: any) {
      // If already started or aborting, restart cleanly
      this.recognition.abort();
      setTimeout(() => {
        try {
          this.recognition.start();
        } catch (e: any) {
          this.transitionTo('ERROR', e.message);
        }
      }, 100);
    }
  }

  public stopListening(): void {
    this.clearWatchdog();
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }
    if (this.state === 'LISTENING') {
      this.transitionTo('IDLE');
    }
  }

  /**
   * Speak response aloud using SpeechSynthesis
   */
  public speak(text: string, onEndCallback?: () => void): void {
    if (!this.synthesis || !text.trim()) {
      onEndCallback?.();
      return;
    }

    this.stopSpeaking();

    // Voice Brevity: Clean any markdown or raw brackets before speaking
    const cleanText = text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // [text](url) -> text
      .replace(/https?:\/\/[^\s]+/g, '') // remove urls
      .replace(/[*_#`~]/g, '') // remove markdown symbols
      .trim();

    if (!cleanText) {
      onEndCallback?.();
      return;
    }

    this.currentUtterance = new SpeechSynthesisUtterance(cleanText);
    this.currentUtterance.rate = this.speechRate;
    this.currentUtterance.lang = this.locale;

    // Pick best available voice matching locale
    const voices = this.synthesis.getVoices?.() || [];
    const matchedVoice = voices.find((v) => v.lang.startsWith(this.locale.slice(0, 2)));
    if (matchedVoice) {
      this.currentUtterance.voice = matchedVoice;
    }

    this.currentUtterance.onstart = () => {
      this.transitionTo('SPEAKING');
    };

    this.currentUtterance.onend = () => {
      this.transitionTo('IDLE');
      onEndCallback?.();
    };

    this.currentUtterance.onerror = () => {
      this.transitionTo('IDLE');
      onEndCallback?.();
    };

    this.synthesis.speak(this.currentUtterance);
  }

  public stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
    if (this.state === 'SPEAKING') {
      this.transitionTo('IDLE');
    }
  }

  public pauseSpeaking(): void {
    if (this.synthesis && this.state === 'SPEAKING') {
      this.synthesis.pause();
    }
  }

  public resumeSpeaking(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }
}
