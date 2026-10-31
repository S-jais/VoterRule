import {
  DuplicateReasonCode,
  SimilarityCategory,
} from '@voterrule/shared';
import { FieldEncryptionService } from '../crypto/encryption.js';

export interface SubjectDetails {
  refId: string;
  fullName: string;
  relativeName?: string;
  epicNumber?: string;
  dobYear?: number;
  state: string;
  ac?: string;
  locality?: string;
  previousAddress?: string;
}

export interface CandidateScoringResult {
  similarityCategory: SimilarityCategory;
  score: number;
  reasonCodes: DuplicateReasonCode[];
  algorithmVersion: string;
}

export class DuplicateDetectionService {
  public static ALGORITHM_VERSION = '2026.rule-v1';

  private static COMMON_INDIAN_SURNAMES = new Set([
    'kumar',
    'singh',
    'sharma',
    'verma',
    'gupta',
    'yadav',
    'patel',
    'das',
    'devi',
  ]);

  private static HONORIFICS = [
    'shri',
    'shrimati',
    'smt',
    'mr',
    'mrs',
    'ms',
    'dr',
    'prof',
    'late',
    'श्री',
    'श्रीमती',
    'डॉ',
  ];

  constructor(private encryptionService: FieldEncryptionService) {}

  /**
   * Normalization: Unicode NFC, strip honorifics, normalize relationship markers, collapse whitespace
   */
  public normalizeText(text: string): string {
    if (!text) return '';
    let norm = text.normalize('NFC').toLowerCase().trim();

    // Strip common honorifics
    for (const h of DuplicateDetectionService.HONORIFICS) {
      norm = norm.replace(new RegExp(`^${h}\\.?\\s+`, 'i'), '');
    }

    // Normalize Indian relationship terms
    norm = norm
      .replace(/\b(s\/o|son of|d\/o|daughter of|w\/o|wife of|c\/o|care of)\b/g, ' ')
      .replace(/\b(पिता|माता|पति|सुपुत्र|सुपुत्री)\b/g, ' ')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return norm;
  }

  /**
   * Generate blocking key tokens for efficient matching without full-table scans
   */
  public generateBlockingTokens(subject: SubjectDetails): string[] {
    const tokens: string[] = [];
    const normName = this.normalizeText(subject.fullName);
    const firstName = normName.split(' ')[0] || '';
    const state = subject.state.toUpperCase().trim();
    const dobYear = subject.dobYear ? String(subject.dobYear) : 'XXXX';

    // Token 1: Name prefix + DOB Year + State
    if (firstName.length >= 3) {
      const coarseKey = `${firstName.slice(0, 4)}|${dobYear}|${state}`;
      tokens.push(this.encryptionService.computeMatchToken('NAME_DOB_STATE', coarseKey));
    }

    // Token 2: Normalized EPIC token if provided
    if (subject.epicNumber) {
      const cleanEpic = subject.epicNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
      tokens.push(this.encryptionService.computeMatchToken('EPIC_EXACT', cleanEpic));
    }

    return tokens;
  }

  /**
   * Transparent Rule-Based Scoring Engine with Explainable Reason Codes
   */
  public scorePair(a: SubjectDetails, b: SubjectDetails): CandidateScoringResult {
    let score = 0;
    const reasons: DuplicateReasonCode[] = [];

    const normA = this.normalizeText(a.fullName);
    const normB = this.normalizeText(b.fullName);

    // 1. Exact EPIC match
    if (a.epicNumber && b.epicNumber) {
      const cleanA = a.epicNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const cleanB = b.epicNumber.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (cleanA === cleanB && cleanA.length >= 8) {
        score += 50;
        reasons.push(DuplicateReasonCode.EPIC_TOKEN_MATCH);
      }
    }

    // 2. Name Similarity (Levenshtein distance on normalized strings)
    const nameDist = this.levenshtein(normA, normB);
    const maxLen = Math.max(normA.length, normB.length);
    const nameSim = maxLen > 0 ? 1 - nameDist / maxLen : 0;

    if (nameSim >= 0.85) {
      // Check if it's a very common surname to dampen weight
      const lastName = normA.split(' ').pop() || '';
      if (DuplicateDetectionService.COMMON_INDIAN_SURNAMES.has(lastName)) {
        score += 20;
        reasons.push(DuplicateReasonCode.COMMON_NAME_DAMPENED);
      } else {
        score += 30;
      }
      reasons.push(DuplicateReasonCode.NAME_SIMILAR);
    }

    // 3. Relative Name Similarity
    if (a.relativeName && b.relativeName) {
      const normRelA = this.normalizeText(a.relativeName);
      const normRelB = this.normalizeText(b.relativeName);
      const relDist = this.levenshtein(normRelA, normRelB);
      const relMax = Math.max(normRelA.length, normRelB.length);
      const relSim = relMax > 0 ? 1 - relDist / relMax : 0;

      if (relSim >= 0.85) {
        score += 20;
        reasons.push(DuplicateReasonCode.RELATIVE_NAME_SIMILAR);
      } else if (relSim < 0.4) {
        // Conflicting relative names penalty
        score -= 25;
      }
    }

    // 4. DOB Agreement vs Conflict
    if (a.dobYear && b.dobYear) {
      if (a.dobYear === b.dobYear) {
        score += 15;
        reasons.push(DuplicateReasonCode.DOB_AGREEMENT);
      } else if (Math.abs(a.dobYear - b.dobYear) > 2) {
        score -= 30; // Strong penalty for conflicting birth years
        reasons.push(DuplicateReasonCode.DOB_CONFLICT);
      }
    }

    // 5. Address History Overlap (Legitimate change of residence is explainable)
    if (a.previousAddress && b.locality) {
      const normPrev = this.normalizeText(a.previousAddress);
      const normLoc = this.normalizeText(b.locality);
      if (normPrev.includes(normLoc) || normLoc.includes(normPrev)) {
        score += 15;
        reasons.push(DuplicateReasonCode.ADDRESS_HISTORY_OVERLAP);
      }
    }

    // Clamp score to 0..100
    const finalScore = Math.min(100, Math.max(0, score));

    let category: SimilarityCategory = SimilarityCategory.WEAK;
    if (finalScore >= 70) {
      category = SimilarityCategory.STRONG;
    } else if (finalScore >= 45) {
      category = SimilarityCategory.MODERATE;
    }

    return {
      similarityCategory: category,
      score: finalScore,
      reasonCodes: reasons,
      algorithmVersion: DuplicateDetectionService.ALGORITHM_VERSION,
    };
  }

  private levenshtein(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;
    const d: number[][] = [];

    for (let i = 0; i <= m; i++) d[i] = [i];
    for (let j = 0; j <= n; j++) d[0]![j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        d[i]![j] = Math.min(d[i - 1]![j]! + 1, d[i]![j - 1]! + 1, d[i - 1]![j - 1]! + cost);
      }
    }

    return d[m]![n]!;
  }
}
