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
  public readonly name = 'GoogleGeminiProvider';
  private apiKey: string | undefined;
  private fallbackProvider: RuleBasedLLMProvider;
  private systemPromptText: string = '';

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
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
      this.systemPromptText = 'You are VoteRule AI, an independent digital civic assistant for Indian voter registration.';
    }
  }

  public isAvailable(): boolean {
    return !!this.apiKey && this.apiKey.trim().length > 0;
  }

  public async generateResponse(
    messages: ChatMessage[],
    retrievedChunks: KnowledgeChunk[],
    options: LLMOptions
  ): Promise<LLMResponse> {
    if (!this.isAvailable()) {
      return this.fallbackProvider.generateResponse(messages, retrievedChunks, options);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
      const contextText = retrievedChunks
        .map((c) => `[Source: ${c.officialSource} (${c.title})] ${c.text}`)
        .join('\n\n');

      const userMessagesFormatted = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const systemInstruction = `${this.systemPromptText}\n\nRELEVANT OFFICIAL KNOWLEDGE BASE CHUNKS:\n${contextText}\n\nIMPORTANT: Return concise JSON with: {"displayText": "...", "spokenText": "...", "intent": "...", "suggestedPrompts": ["..."]}`;

      const payload = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: userMessagesFormatted,
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 800,
          responseMimeType: 'application/json',
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.warn(`[Gemini Provider] API error status ${res.status}, falling back to rules engine`);
        return this.fallbackProvider.generateResponse(messages, retrievedChunks, options);
      }

      const data = await res.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return this.fallbackProvider.generateResponse(messages, retrievedChunks, options);
      }

      const parsed = JSON.parse(rawText);
      const fallbackResult = await this.fallbackProvider.generateResponse(messages, retrievedChunks, options);

      return {
        displayText: parsed.displayText || fallbackResult.displayText,
        spokenText: parsed.spokenText || fallbackResult.spokenText,
        intent: parsed.intent || fallbackResult.intent,
        citations: fallbackResult.citations,
        actions: fallbackResult.actions,
        suggestedPrompts: parsed.suggestedPrompts || fallbackResult.suggestedPrompts,
      };
    } catch (err) {
      console.warn('[Gemini Provider] Exception in cloud generation, using rules fallback:', err);
      return this.fallbackProvider.generateResponse(messages, retrievedChunks, options);
    }
  }
}
