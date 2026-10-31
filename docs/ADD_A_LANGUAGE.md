# How to Add a New Language (Data-Only Translation Guide)

> **Architectural Principle:** Adding or updating a language is a **zero-code-refactor, data-only change**.  
> The `@matdata-setu/i18n` package enforces 100% dictionary key parity at compile time via TypeScript interfaces.

---

## 1. Supported Languages Overview

Currently supported out-of-the-box:
- **English (`en`)** (Default)
- **Hindi (`hi`)** (हिन्दी)

India has 22 Eighth Schedule official languages. The steps below demonstrate adding **Tamil (`ta`)** or **Bengali (`bn`)** in under 15 minutes.

---

## 2. Step-by-Step Implementation Guide

### Step 1: Register the Language Code
Open `packages/i18n/src/types.ts` and add the new ISO 639-1 code to the `SupportedLanguage` union:

```typescript
// packages/i18n/src/types.ts
export type SupportedLanguage = 'en' | 'hi' | 'ta'; // Added 'ta'
```

Update the language metadata dictionary in the same file:

```typescript
export const LANGUAGE_METADATA: Record<SupportedLanguage, { label: string; nativeLabel: string; dir: 'ltr' | 'rtl' }> = {
  en: { label: 'English', nativeLabel: 'English', dir: 'ltr' },
  hi: { label: 'Hindi', nativeLabel: 'हिन्दी', dir: 'ltr' },
  ta: { label: 'Tamil', nativeLabel: 'தமிழ்', dir: 'ltr' }, // Added
};
```

### Step 2: Create the Translation Dictionary
Create a new file `packages/i18n/src/locales/ta.ts`. Copy the structure from `packages/i18n/src/locales/en.ts`:

```typescript
// packages/i18n/src/locales/ta.ts
import { TranslationDictionary } from '../types.js';

export const ta: TranslationDictionary = {
  appName: 'மததாதா சேது (Matdata Setu)',
  independentNotice: 'மததாதா சேது என்பது ஒரு சுதந்திரமான குடிமக்கள் உதவி தளம் ஆகும்...',
  heroTitle: 'உங்கள் வாக்காளர் பதிவு உரிமைகளை எளிமையாகவும் வெளிப்படையாகவும் பாதுகாக்கவும்',
  // Complete remaining dictionary keys...
};
```

*Note: TypeScript will highlight any missing keys in red at build time because `ta` is typed against `TranslationDictionary`.*

### Step 3: Register in the Index File
Open `packages/i18n/src/index.ts` and export the new dictionary:

```typescript
// packages/i18n/src/index.ts
import { en } from './locales/en.js';
import { hi } from './locales/hi.js';
import { ta } from './locales/ta.js';

export const dictionaries = { en, hi, ta };
export * from './types.js';
export * from './translator.js';
```

### Step 4: Verify Translation Parity via Unit Tests
Run the i18n package test suite:

```bash
pnpm --filter @matdata-setu/i18n test
```

The automated parity test will compare every key in the new dictionary against `en.ts` and confirm:
1. Zero missing keys.
2. Zero extra or untyped keys.
3. Correct ICU parameter interpolation (e.g. `{case_ref}`, `{count}`).

### Step 5: Test the UI
Start the web application:
```bash
pnpm --filter @matdata-setu/web dev
```
Open `http://localhost:3000`. Click the Language Switcher in the top right header. Your new language will appear in its native script and immediately switch all text across the portal.
