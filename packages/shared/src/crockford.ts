/**
 * Crockford Base32 Identifier Generator & Validator
 * Format: MS-YYYY-XXXXXXXX
 * Uses Crockford Base32 alphabet: 0123456789ABCDEFGHJKMNPQRSTVWXYZ (excludes I, L, O, U)
 * Appends a modulo-37 check symbol at the end.
 */

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const CHECK_SYMBOLS = '0123456789ABCDEFGHJKMNPQRSTVWXYZ*~$=U';

export function generateCrockfordSymbol(value: number): string {
  return ALPHABET[value % 32]!;
}

export function generatePublicCaseRef(year = 2026): string {
  // Generate 7 random Crockford chars + 1 check character = 8 chars
  let payload = '';
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    const rand = Math.floor(Math.random() * 32);
    payload += ALPHABET[rand];
    sum = (sum * 32 + rand) % 37;
  }
  const checkChar = CHECK_SYMBOLS[sum % 37] ?? '0';
  return `MS-${year}-${payload}${checkChar}`;
}

export function validateCaseRef(ref: string): boolean {
  const match = /^MS-(\d{4})-([0-9A-HJKMNP-Z]{7})([0-9A-HJKMNP-Z*~$=U])$/.exec(ref);
  if (!match) return false;
  const payload = match[2]!;
  const checkChar = match[3]!;

  let sum = 0;
  for (let i = 0; i < payload.length; i++) {
    const idx = ALPHABET.indexOf(payload[i]!);
    if (idx === -1) return false;
    sum = (sum * 32 + idx) % 37;
  }
  const expectedCheck = CHECK_SYMBOLS[sum % 37];
  return checkChar === expectedCheck;
}
