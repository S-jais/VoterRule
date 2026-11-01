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
  useWhisperStt?: boolean;
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
  private useWhisperStt: boolean = true;

  // MediaRecorder audio capture for Whisper STT
  private mediaStream: MediaStream | null = null;
  private mediaRecorder: any = null;
  private audioChunks: Blob[] = [];
  private pendingWebSpeechFinal: string = '';

  constructor(options: VoiceControllerOptions) {
    this.options = options;
    this.locale = options.locale === 'hi' ? 'hi-IN' : 'en-IN';
    this.speechRate = options.speechRate || 1.0;
    this.useWhisperStt = options.useWhisperStt ?? true;

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
          this.pendingWebSpeechFinal = finalText;
          // If mediaRecorder is active, stopping listening will trigger recorder.onstop -> Whisper STT
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
  public async startListening(): Promise<void> {
    // 1. Barge-in: if currently speaking, cancel immediately
    if (this.state === 'SPEAKING' || this.synthesis?.speaking) {
      this.stopSpeaking();
    }

    if (!this.recognition && typeof navigator === 'undefined') {
      this.options.onError('Speech recognition not available on this device');
      return;
    }

    this.pendingWebSpeechFinal = '';
    this.audioChunks = [];

    // 2. Start MediaRecorder for Whisper STT if supported
    if (
      this.useWhisperStt &&
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== 'undefined'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaStream = stream;

        let mimeType = '';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
          mimeType = 'audio/webm;codecs=opus';
        } else if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
        }

        this.mediaRecorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event: any) => {
          if (event.data && event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.start(200);
      } catch (err: any) {
        console.warn('[VoiceController] getUserMedia for Whisper audio capture failed, using browser speech fallback:', err);
      }
    }

    // 3. Start Web Speech recognition for real-time interim transcript display
    if (this.recognition) {
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
  }

  public async stopListening(): Promise<void> {
    this.clearWatchdog();

    // Stop recognition
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
    }

    // Process Whisper recording if active
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      const recorder = this.mediaRecorder;
      this.transitionTo('PROCESSING');

      recorder.onstop = async () => {
        // Stop all audio tracks
        if (this.mediaStream) {
          this.mediaStream.getTracks().forEach((track) => track.stop());
          this.mediaStream = null;
        }

        let whisperTranscript = '';
        if (this.audioChunks.length > 0) {
          try {
            const blob = new Blob(this.audioChunks, { type: recorder.mimeType || 'audio/webm' });
            whisperTranscript = await this.sendAudioToWhisper(blob);
          } catch (err) {
            console.warn('[VoiceController] Whisper transcription call failed:', err);
          }
        }

        const finalText = whisperTranscript.trim() || this.pendingWebSpeechFinal.trim();
        if (finalText) {
          this.options.onFinalTranscript(finalText);
        }
        this.transitionTo('IDLE');
      };

      try {
        recorder.stop();
      } catch {
        // ignore
      }
      return;
    }

    // If media recorder was not active, finalize with Web Speech transcript
    if (this.pendingWebSpeechFinal.trim()) {
      this.options.onFinalTranscript(this.pendingWebSpeechFinal.trim());
      this.pendingWebSpeechFinal = '';
    }

    if (this.state === 'LISTENING') {
      this.transitionTo('IDLE');
    }
  }

  private async sendAudioToWhisper(blob: Blob): Promise<string> {
    if (typeof FileReader === 'undefined') return '';

    const base64 = await this.blobToBase64(blob);
    if (!base64) return '';

    const res = await fetch('/api/v1/ai/stt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audioBase64: base64,
        mimeType: blob.type || 'audio/webm',
        locale: this.locale,
      }),
    });

    if (!res.ok) return '';
    const json = (await res.json()) as any;
    if (json.data?.fallbackToBrowser) {
      return '';
    }
    return json.data?.text || '';
  }

  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result?.includes(',') ? result.split(',')[1] : result;
        resolve(base64 || '');
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
