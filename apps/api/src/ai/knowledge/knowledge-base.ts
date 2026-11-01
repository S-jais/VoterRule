import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KnowledgeChunk, KnowledgeRetriever, ReviewStatus } from '../interfaces.js';
import { ELECTORAL_CORPUS_SEEDS } from './electoral-seeds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class KnowledgeBaseService implements KnowledgeRetriever {
  private chunks: KnowledgeChunk[] = [];

  constructor() {
    this.initializeCorpus();
  }

  private initializeCorpus(): void {
    // 1. Ingest Statutory Electoral Seeds
    this.chunks = [...ELECTORAL_CORPUS_SEEDS];

    // 2. Ingest App Corpus from generated JSON
    try {
      const generatedJsonPath = path.join(__dirname, 'app-knowledge.generated.json');
      if (fs.existsSync(generatedJsonPath)) {
        const appRoutes = JSON.parse(fs.readFileSync(generatedJsonPath, 'utf8'));
        for (const r of appRoutes) {
          const appChunk: KnowledgeChunk = {
            id: `kb-app-route-${r.routeId}`,
            title: `VoteRule Feature: ${r.title}`,
            officialSource: 'VoteRule Verified App Specification',
            sourceUrl: `https://voterrule.org${r.path}`,
            category: 'voterrule_app_docs',
            language: 'en',
            lastVerifiedDate: '2026-10-31',
            version: '1.0.0',
            reviewStatus: 'published',
            reviewedBy: 'App Architecture Reviewer',
            publishedAt: '2026-10-31T00:00:00Z',
            text: `Route: ${r.path} (ID: ${r.routeId}). Title: ${r.title}. Purpose: ${r.purpose}. Auth Requirement: ${r.authRequirement}. Feature Availability: ${r.featureAvailability} (${r.implementationNotes}). Registered UI sections: ${r.sectionIds.join(', ')}. Highlightable elements: ${r.highlightableElementIds.map((h: any) => h.targetId).join(', ')}.`
          };
          this.chunks.push(appChunk);
        }
      }
    } catch (err) {
      console.warn('Warning: Could not load app-knowledge.generated.json in KnowledgeBaseService:', err);
    }
  }

  public async search(
    query: string,
    options?: { category?: string; limit?: number; minScore?: number }
  ): Promise<KnowledgeChunk[]> {
    const limit = options?.limit || 4;
    const minScore = options?.minScore || 1.0;
    const normalizedQuery = query.toLowerCase().trim();
    const queryTokens = normalizedQuery
      .split(/[\s,?.!;:()/-]+/)
      .filter((t) => t.length > 2);

    // Exact phrase / code extraction boosts
    const isForm6 = /\bform\s*6\b/i.test(query) && !/\bform\s*6a\b/i.test(query) && !/\bform\s*6b\b/i.test(query);
    const isForm6A = /\bform\s*6a\b/i.test(query);
    const isForm6B = /\bform\s*6b\b/i.test(query);
    const isForm7 = /\bform\s*7\b/i.test(query);
    const isForm8 = /\bform\s*8\b/i.test(query);
    const isArt326 = /\b(326|suffrage|voting age|qualifying date)\b/i.test(query);
    const isDuplicate = /\b(duplicate|section 17|section 18|two voter ids|double)\b/i.test(query);
    const isMissing = /\b(missing|omitted|not in list|deleted|can't find)\b/i.test(query);
    const isHelpline = /\b(1950|helpline|contact|phone|call)\b/i.test(query);

    const scored = this.chunks
      .filter((c) => c.reviewStatus === 'published')
      .filter((c) => !options?.category || c.category === options.category)
      .map((chunk) => {
        let score = 0;
        const textLower = chunk.text.toLowerCase();
        const titleLower = chunk.title.toLowerCase();

        // 1. Token Frequency & Title Weights
        for (const token of queryTokens) {
          if (titleLower.includes(token)) score += 5.0;
          if (textLower.includes(token)) score += 1.5;
        }

        // 2. High-value statutory boosts
        if (isForm6 && chunk.id === 'kb-form-6-guide') score += 15.0;
        if (isForm6A && chunk.id === 'kb-form-6a-guide') score += 15.0;
        if (isForm6B && chunk.id === 'kb-form-6b-guide') score += 15.0;
        if (isForm7 && chunk.id === 'kb-form-7-guide') score += 15.0;
        if (isForm8 && chunk.id === 'kb-form-8-guide') score += 15.0;
        if (isArt326 && (chunk.id === 'kb-const-art-326' || chunk.id === 'kb-rpa-qualifying-dates')) score += 12.0;
        if (isDuplicate && chunk.id === 'kb-rpa-single-registration') score += 12.0;
        if (isMissing && chunk.id === 'kb-missing-name-protocol') score += 12.0;
        if (isHelpline && chunk.id === 'kb-helpline-1950') score += 15.0;

        return { chunk, score };
      })
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.chunk);

    return scored;
  }

  public async getAll(status?: ReviewStatus): Promise<KnowledgeChunk[]> {
    if (!status) return this.chunks;
    return this.chunks.filter((c) => c.reviewStatus === status);
  }

  public async publish(chunkId: string, reviewer: string): Promise<boolean> {
    const chunk = this.chunks.find((c) => c.id === chunkId);
    if (!chunk) return false;
    chunk.reviewStatus = 'published';
    chunk.reviewedBy = reviewer;
    chunk.publishedAt = new Date().toISOString();
    return true;
  }

  public async markOutdated(chunkId: string): Promise<boolean> {
    const chunk = this.chunks.find((c) => c.id === chunkId);
    if (!chunk) return false;
    chunk.reviewStatus = 'outdated';
    return true;
  }
}
