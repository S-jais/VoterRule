import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ChatMessage,
  KnowledgeChunk,
  LLMOptions,
  LLMProvider,
  LLMResponse,
} from '../interfaces.js';
import { RuleBasedLLMProvider } from './rule-based-provider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class GeminiLLMProvider implements LLMProvider {
  public readonly name = 'MultiCloudCivicLLMProvider';
  private geminiKey: string | undefined;
  private groqKey: string | undefined;
  private openaiKey: string | undefined;
  private fallbackProvider: RuleBasedLLMProvider;
  private systemPromptText: string = '';

  constructor() {
    this.geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
    this.groqKey = process.env.GROQ_API_KEY;
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.fallbackProvider = new RuleBasedLLMProvider();
    this.loadSystemPrompt();
  }

  private loadSystemPrompt(): void {
    try {
      const promptPath = path.resolve(__dirname, '../../../../prompts/voterule-ai.system.md');
      if (fs.existsSync(promptPath)) {
        this.systemPromptText = fs.readFileSync(promptPath, 'utf8');
      }
    } catch {
      this.systemPromptText =
        'You are VoteRule AI, an independent digital civic assistant for Indian voter registration. VoteRule is NOT the Election Commission of India. All official statutory determinations are made exclusively by competent authorities.';
    }
  }

  public isAvailable(): boolean {
    return (
      (!!this.groqKey && this.groqKey.trim().length > 0) ||
      (!!this.geminiKey && this.geminiKey.trim().length > 0) ||
      (!!this.openaiKey && this.openaiKey.trim().length > 0)
    );
  }

  public async generateResponse(
    messages: ChatMessage[],
    retrievedChunks: KnowledgeChunk[],
    options: LLMOptions
  ): Promise<LLMResponse> {
    const fallbackResult = await this.fallbackProvider.generateResponse(messages, retrievedChunks, options);

    if (!this.isAvailable()) {
      return fallbackResult;
    }

    const contextText = retrievedChunks
      .map((c) => `[Source: ${c.officialSource} (${c.title})] ${c.text}`)
      .join('\n\n');

    const systemInstruction = `${this.systemPromptText}\n\nRELEVANT OFFICIAL KNOWLEDGE BASE CHUNKS:\n${contextText}\n\nCRITICAL OUTPUT SPECIFICATION:\nYou must respond with a strictly valid JSON object (no markdown code fence, only raw JSON) containing:\n{\n  "displayText": "Clear, patient, respectful, beautifully formatted markdown response explaining the procedure or answering the citizen's query.",\n  "spokenText": "Concise conversational text (1-3 sentences) suitable for audio read-aloud via TTS.",\n  "intent": "Intent classification string",\n  "suggestedPrompts": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"]\n}`;

    // 1. Try Groq (high-speed sub-second inference)
    if (this.groqKey && this.groqKey.trim().length > 0) {
      try {
        const groqMessages = [
          { role: 'system', content: systemInstruction },
          ...messages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ];

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.groqKey}`,
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b',
            messages: groqMessages,
            response_format: { type: 'json_object' },
            temperature: 0.2,
            max_tokens: 800,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const rawText = data.choices?.[0]?.message?.content;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              displayText: parsed.displayText || fallbackResult.displayText,
              spokenText: parsed.spokenText || fallbackResult.spokenText,
              intent: parsed.intent || fallbackResult.intent,
              citations: fallbackResult.citations,
              actions: fallbackResult.actions,
              suggestedPrompts: parsed.suggestedPrompts || fallbackResult.suggestedPrompts,
            };
          }
        } else {
          console.warn(`[Groq Provider] returned status ${res.status}, trying Gemini fallback`);
        }
      } catch (err) {
        console.warn('[Groq Provider] Request error, trying next provider:', err);
      }
    }

    // 2. Try Google Gemini API
    if (this.geminiKey && this.geminiKey.trim().length > 0) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiKey}`;
        const userMessagesFormatted = messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const res = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemInstruction }] },
            contents: userMessagesFormatted,
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 800,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              displayText: parsed.displayText || fallbackResult.displayText,
              spokenText: parsed.spokenText || fallbackResult.spokenText,
              intent: parsed.intent || fallbackResult.intent,
              citations: fallbackResult.citations,
              actions: fallbackResult.actions,
              suggestedPrompts: parsed.suggestedPrompts || fallbackResult.suggestedPrompts,
            };
          }
        }
      } catch (err) {
        console.warn('[Gemini Provider] Request error, trying OpenAI fallback:', err);
      }
    }

    // 3. Try OpenAI API
    if (this.openaiKey && this.openaiKey.trim().length > 0) {
      try {
        const openaiMessages = [
          { role: 'system', content: systemInstruction },
          ...messages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ];

        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: openaiMessages,
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
        });

        if (res.ok) {
          const data = (await res.json()) as any;
          const rawText = data.choices?.[0]?.message?.content;
          if (rawText) {
            const parsed = JSON.parse(rawText);
            return {
              displayText: parsed.displayText || fallbackResult.displayText,
              spokenText: parsed.spokenText || fallbackResult.spokenText,
              intent: parsed.intent || fallbackResult.intent,
              citations: fallbackResult.citations,
              actions: fallbackResult.actions,
              suggestedPrompts: parsed.suggestedPrompts || fallbackResult.suggestedPrompts,
            };
          }
        }
      } catch (err) {
        console.warn('[OpenAI Provider] Request error:', err);
      }
    }

    // 4. Return reliable local statutory rules fallback
    return fallbackResult;
  }
}
