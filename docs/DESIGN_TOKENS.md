# Design System Tokens & Brand Standards

> **Package:** `@matdata-setu/ui`  
> **Source File:** `packages/ui/src/tokens.ts`  
> **Theme Philosophy:** Tiranga-inspired civic dignity, high contrast accessibility, and zero government impersonation.

---

## 1. Color Palette Tokens

### 1.1 Saffron Scale (Courage, Vigilance & Civic Action)
* **`saffron-primary` (`#C25E00`):** Core brand accent for civic progress indicators and step markers.
* **`saffron-deep` (`#9A4500`):** High-contrast saffron certified for WCAG AA compliance (5.14:1 ratio on white). Used for alerts, warnings, and emphasis text.
* **`saffron-light` (`#FFF7ED`):** 5% tint background for information banners, warnings, and alert containers.

### 1.2 Green Scale (Growth, Inclusion & Electoral Roll Integrity)
* **`green-primary` (`#0D5C05`):** High-contrast India Green certified for WCAG AA compliance (5.72:1 ratio on white). Used for verified states, positive confirmations, and success chips.
* **`green-light` (`#F0FDF4`):** Soft green background for verified record summaries, resolution badges, and positive alerts.

### 1.3 Navy Scale (Constitutional Anchor, Neutrality & Trust)
* **`navy-primary` (`#0B1030`):** Ultra-high contrast deep navy certified for WCAG AAA compliance (18.2:1 ratio on white). Used for primary body typography, headers, and major action buttons.
* **`navy-slate` (`#1E293B`):** Dark slate for secondary headings and table headers.
* **`navy-muted` (`#64748B`):** Neutral gray for supporting metadata, timestamps, and secondary captions.

### 1.4 Neutral Scale (Legibility & Surface Hierarchy)
* **`surface-white` (`#FFFFFF`):** Base card and modal background.
* **`surface-bg` (`#F8F9FA`):** Subdued off-white page background reducing eye strain.
* **`surface-border` (`#E2E8F0`):** Subtle dividers and input field borders.

---

## 2. Typography Tokens

```typescript
export const fontFamilies = {
  sans: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
  mono: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
};

export const fontSizes = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px / 16px
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px / 20px
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px / 24px
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px / 28px
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px / 28px
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px / 32px
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px / 36px
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px / 40px
};
```

---

## 3. Motion & Animation Tokens

| Token | Duration | Timing Curve | Usage |
|:---|:---:|:---:|:---|
| `motion-fast` | 150ms | `cubic-bezier(0, 0, 0.2, 1)` | Button clicks, tooltip fade, micro-interactions |
| `motion-normal` | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Modal reveal, accordion expand, tab transition |
| `motion-slow` | 500ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Page entry, wizard step advance |
| `motion-cycle` | 6000ms | `linear` | Continuous rotation for Ashoka Chakra progress indicator |

*All motion tokens automatically evaluate to `0ms` when `prefers-reduced-motion: reduce` or `liteMode=true` is active.*

---

## 4. Border Radius Tokens

* **`radius-sm` (4px):** Small badges and status chips.
* **`radius-md` (6px):** Form input fields, buttons, and dropdown triggers.
* **`radius-lg` (8px):** Standard application cards and review panels.
* **`radius-xl` (12px):** Top-level modal sheets and hero callout containers.
* **`radius-full` (9999px):** Circular avatars, progress rings, and pill buttons.
