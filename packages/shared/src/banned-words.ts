import { BANNED_TERMS } from './constants.js';

export function checkForBannedTerms(text: string): { hasBannedTerms: boolean; found: string[] } {
  if (!text) return { hasBannedTerms: false, found: [] };
  const lower = text.toLowerCase();
  const found: string[] = [];

  for (const term of BANNED_TERMS) {
    if (lower.includes(term.toLowerCase())) {
      found.push(term);
    }
  }

  return {
    hasBannedTerms: found.length > 0,
    found,
  };
}

export function assertNoBannedTerms(text: string, contextDescription = 'Content'): void {
  const result = checkForBannedTerms(text);
  if (result.hasBannedTerms) {
    throw new Error(
      `Prejudicial or prohibited civic term detected in ${contextDescription}: [${result.found.join(', ')}]. Use neutral, objective, and legally sound terminology.`
    );
  }
}
