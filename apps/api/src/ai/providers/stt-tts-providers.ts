import { SpeechToTextProvider, TextToSpeechProvider } from '../interfaces.js';

export class WhisperSTTProvider implements SpeechToTextProvider {
  public readonly name = 'WhisperSTTProvider';
  private apiKey: string | undefined;
  private endpoint: string;
  private model: string;

  constructor() {
    if (process.env.GROQ_API_KEY) {
      this.apiKey = process.env.GROQ_API_KEY;
      this.endpoint = 'https://api.groq.com/openai/v1/audio/transcriptions';
      this.model = 'whisper-large-v3';
    } else if (process.env.OPENAI_API_KEY) {
      this.apiKey = process.env.OPENAI_API_KEY;
      this.endpoint = 'https://api.openai.com/v1/audio/transcriptions';
      this.model = 'whisper-1';
    } else if (process.env.WHISPER_ENDPOINT) {
      this.apiKey = process.env.WHISPER_API_KEY || 'bearer-token';
      this.endpoint = process.env.WHISPER_ENDPOINT;
      this.model = process.env.WHISPER_MODEL || 'whisper-large-v3';
    } else {
      this.apiKey = process.env.STT_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
      this.endpoint = 'https://api.openai.com/v1/audio/transcriptions';
      this.model = 'whisper-1';
    }
  }

  public isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  public async transcribe(
    audioBuffer: Buffer,
    mimeType: string = 'audio/webm',
    locale: string = 'en'
  ): Promise<{ text: string; confidence: number; provider: string }> {
    if (!this.isAvailable()) {
      return {
        text: '',
        confidence: 0,
        provider: 'none',
      };
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      return { text: '', confidence: 0, provider: this.name };
    }

    try {
      const formData = new FormData();
      const ext = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('wav') ? 'wav' : 'webm';
      const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
      formData.append('file', audioBlob, `audio.${ext}`);
      formData.append('model', this.model);

      const langCode = (locale || 'en').slice(0, 2).toLowerCase();
      if (langCode === 'hi' || langCode === 'en') {
        formData.append('language', langCode);
      }

      // Civic contextual prompt to boost recognition of Indian electoral terms
      formData.append(
        'prompt',
        'VoteRule, voter registration, EPIC number, Form 6, Form 7, Form 8, ERO, BLO, Assembly Constituency, electoral roll'
      );

      const res = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn(`[WhisperSTT] Provider returned HTTP ${res.status}: ${errText}`);
        return { text: '', confidence: 0, provider: this.name };
      }

      const data = (await res.json()) as any;
      const text = (data.text || '').trim();
      return {
        text,
        confidence: 0.98,
        provider: this.name,
      };
    } catch (err: any) {
      console.error(`[WhisperSTT] Transcription error:`, err);
      return { text: '', confidence: 0, provider: this.name };
    }
  }
}

// Backwards-compatible alias
export const CloudSpeechToTextProvider = WhisperSTTProvider;

export class CloudTextToSpeechProvider implements TextToSpeechProvider {
  public readonly name = 'CloudTextToSpeechProvider';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.TTS_API_KEY || process.env.GOOGLE_CLOUD_API_KEY || process.env.OPENAI_API_KEY;
  }

  public isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  public async synthesize(
    text: string,
    _locale: string = 'en-IN'
  ): Promise<{ audioBase64?: string; audioUrl?: string; format: string }> {
    if (!this.isAvailable()) {
      return { format: 'browser_fallback' };
    }

    try {
      // Support OpenAI TTS if key available
      if (process.env.OPENAI_API_KEY) {
        const res = await fetch('https://api.openai.com/v1/audio/speech', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'tts-1',
            input: text.slice(0, 400),
            voice: 'alloy',
          }),
        });

        if (res.ok) {
          const arrayBuf = await res.arrayBuffer();
          const base64 = Buffer.from(arrayBuf).toString('base64');
          return {
            format: 'mp3',
            audioBase64: base64,
          };
        }
      }

      return { format: 'browser_fallback' };
    } catch {
      return { format: 'browser_fallback' };
    }
  }
}
