import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoiceController, VoiceState } from '../components/ai/VoiceController.js';

describe('VoiceController & State Machine Tests', () => {
  let mockRecognitionInstance: any;
  let mockSpeechSynthesis: any;
  let states: VoiceState[];
  let controller: VoiceController;

  beforeEach(() => {
    vi.useFakeTimers();
    states = [];

    // Mock Recognition
    mockRecognitionInstance = {
      continuous: false,
      interimResults: false,
      lang: 'en-IN',
      start: vi.fn(),
      stop: vi.fn(),
      abort: vi.fn(),
      onstart: null,
      onresult: null,
      onerror: null,
      onend: null,
    };

    const MockSpeechRecognition = vi.fn(() => mockRecognitionInstance);

    // Mock Synthesis
    mockSpeechSynthesis = {
      speaking: false,
      paused: false,
      speak: vi.fn((utterance: any) => {
        mockSpeechSynthesis.speaking = true;
        // simulate async start
        setTimeout(() => {
          utterance.onstart?.();
        }, 10);
      }),
      cancel: vi.fn(() => {
        mockSpeechSynthesis.speaking = false;
      }),
      pause: vi.fn(() => {
        mockSpeechSynthesis.paused = true;
      }),
      resume: vi.fn(() => {
        mockSpeechSynthesis.paused = false;
      }),
      getVoices: vi.fn(() => [
        { lang: 'en-IN', name: 'Indian English' },
        { lang: 'hi-IN', name: 'Hindi India' },
      ]),
    };

    // Global mock
    (global as any).window = {
      SpeechRecognition: MockSpeechRecognition,
      speechSynthesis: mockSpeechSynthesis,
    };

    (global as any).SpeechSynthesisUtterance = class {
      text: string;
      rate: number = 1.0;
      lang: string = 'en-IN';
      voice: any = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: (() => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (global as any).window;
    delete (global as any).SpeechSynthesisUtterance;
  });

  it('initializes in IDLE state with default locale', () => {
    controller = new VoiceController({
      onStateChange: (s) => states.push(s),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onError: vi.fn(),
    });

    expect(controller.getState()).toBe('IDLE');
  });

  it('transitions to NOT_SUPPORTED if browser lacks Web Speech API', () => {
    delete (global as any).window.SpeechRecognition;
    delete (global as any).window.webkitSpeechRecognition;

    let notSupportedDetail = '';
    controller = new VoiceController({
      onStateChange: (s, d) => {
        states.push(s);
        if (d) notSupportedDetail = d;
      },
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onError: vi.fn(),
    });

    expect(controller.getState()).toBe('NOT_SUPPORTED');
    expect(notSupportedDetail).toContain('not supported');
  });

  it('transitions to LISTENING upon recognition start and triggers watchdog timer', () => {
    controller = new VoiceController({
      onStateChange: (s) => states.push(s),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onError: vi.fn(),
    });

    controller.startListening();
    expect(mockRecognitionInstance.start).toHaveBeenCalled();

    // Trigger onstart
    mockRecognitionInstance.onstart();
    expect(controller.getState()).toBe('LISTENING');
    expect(states).toContain('LISTENING');

    // Advance timer by 12 seconds to trigger silence watchdog
    vi.advanceTimersByTime(12000);
    expect(mockRecognitionInstance.stop).toHaveBeenCalled();
  });

  it('handles interim and final transcripts and auto-transitions on final result', () => {
    const onInterim = vi.fn();
    const onFinal = vi.fn();

    controller = new VoiceController({
      onStateChange: (s) => states.push(s),
      onInterimTranscript: onInterim,
      onFinalTranscript: onFinal,
      onError: vi.fn(),
    });

    controller.startListening();
    mockRecognitionInstance.onstart();

    // Simulate speech results
    const mockEvent = {
      resultIndex: 0,
      results: [
        [{ transcript: 'mera voter ID' }],
      ],
    };
    (mockEvent.results[0] as any).isFinal = false;

    mockRecognitionInstance.onresult(mockEvent);
    expect(onInterim).toHaveBeenCalledWith('mera voter ID');

    // Simulate final result
    const finalEvent = {
      resultIndex: 0,
      results: [
        [{ transcript: 'Form 6 status' }],
      ],
    };
    (finalEvent.results[0] as any).isFinal = true;

    mockRecognitionInstance.onresult(finalEvent);
    expect(onFinal).toHaveBeenCalledWith('Form 6 status');
    expect(mockRecognitionInstance.stop).toHaveBeenCalled();

    // Recognition onend transitions back to IDLE
    mockRecognitionInstance.onend();
    expect(controller.getState()).toBe('IDLE');
  });

  it('implements Barge-in: cancels speech synthesis immediately when user starts listening', () => {
    controller = new VoiceController({
      onStateChange: (s) => states.push(s),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onError: vi.fn(),
    });

    // Speak something
    controller.speak('Here is the official procedure for filing Form 6.');
    vi.advanceTimersByTime(15);
    expect(controller.getState()).toBe('SPEAKING');

    // User taps mic -> Barge-in should cancel speech immediately
    controller.startListening();
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(mockRecognitionInstance.start).toHaveBeenCalled();
  });

  it('sanitizes markdown, links, and formatting before vocalizing (Voice Brevity)', () => {
    controller = new VoiceController({
      onStateChange: (s) => states.push(s),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onError: vi.fn(),
    });

    let spokenUtterance: any = null;
    mockSpeechSynthesis.speak = vi.fn((utt) => {
      spokenUtterance = utt;
    });

    controller.speak('Check [Form 6](https://voters.eci.gov.in/form6) for **new voter enrollment**.');
    expect(spokenUtterance).not.toBeNull();
    expect(spokenUtterance.text).toBe('Check Form 6 for new voter enrollment.');
    expect(spokenUtterance.text).not.toContain('https://');
    expect(spokenUtterance.text).not.toContain('**');
    expect(spokenUtterance.text).not.toContain('[');
  });

  it('transitions to PERMISSION_DENIED on not-allowed microphone error', () => {
    const onError = vi.fn();
    controller = new VoiceController({
      onStateChange: (s) => states.push(s),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onError,
    });

    controller.startListening();
    mockRecognitionInstance.onstart();

    // Error: permission denied
    mockRecognitionInstance.onerror({ error: 'not-allowed' });
    expect(controller.getState()).toBe('PERMISSION_DENIED');
    expect(onError).toHaveBeenCalledWith('not-allowed');
  });

  it('transitions to ERROR on general recognition failure', () => {
    const onError = vi.fn();
    controller = new VoiceController({
      onStateChange: (s) => states.push(s),
      onInterimTranscript: vi.fn(),
      onFinalTranscript: vi.fn(),
      onError,
    });

    controller.startListening();
    mockRecognitionInstance.onstart();

    mockRecognitionInstance.onerror({ error: 'network' });
    expect(controller.getState()).toBe('ERROR');
    expect(onError).toHaveBeenCalledWith('network');
  });
});

