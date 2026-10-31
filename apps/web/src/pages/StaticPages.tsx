import React from 'react';
import {
  Card,
  Button,
  ChakraMark,
  BrandWordmark,
  CivicPulse,
  AshokaChakraProgressRing,
  SmartLoading,
} from '@voterrule/ui';

export const HowItWorksPage: React.FC<{ onNavigate: (p: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">How VoterRule Works</h1>
      <p className="text-sm text-[var(--ink-2)] leading-relaxed">
        VoterRule bridges the gap between citizens and official election processes through transparent, statutory guidance:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card title="1. Verify Official Search">
          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            Citizens are guided to official ECI search tools without CAPTCHA circumvention. The observed result is recorded with a tamper-proof provenance timestamp.
          </p>
        </Card>
        <Card title="2. Diagnose Statutory Issue">
          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            Our data-driven guidance engine evaluates whether your case represents first-time inclusion, omission re-inclusion, shifting residence, or spelling correction.
          </p>
        </Card>
        <Card title="3. Prepare Official Form">
          <p className="text-xs text-[var(--ink-2)] leading-relaxed">
            We generate a structured Application Preparation Sheet (PDF) matching official Form 6, 7, or 8 fields for hassle-free online or physical ERO submission.
          </p>
        </Card>
      </div>

      <div className="pt-4 flex justify-center">
        <Button variant="primary" size="md" onClick={() => onNavigate('/app/check')}>
          Start with a Voter Search →
        </Button>
      </div>
    </div>
  );
};

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-sm text-[var(--ink)] leading-relaxed">
      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">Verification Methodology & Civic Neutrality</h1>
      <Card title="Civic Neutrality & Non-Affiliation Guarantee">
        <p className="text-xs text-[var(--ink-2)] leading-relaxed">
          VoterRule is an independent civic-assistance platform. We maintain strict non-partisan neutrality:
        </p>
        <ul className="list-disc list-inside text-xs text-[var(--ink-2)] space-y-1.5 mt-2">
          <li><strong>No Shadow Roll Copy:</strong> We do not ingest or maintain shadow copies of the electoral roll.</li>
          <li><strong>No Scraping:</strong> We never scrape official government websites, automate searches, or bypass CAPTCHAs.</li>
          <li><strong>No Adverse Inferences:</strong> When an official search fails, we never assume illegal deletion or fraud.</li>
          <li><strong>Human Review:</strong> All discrepancies and statutory recommendations require human sign-off; automated systems never delete, reject, or mark individuals.</li>
        </ul>
      </Card>
    </div>
  );
};

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-xs text-[var(--ink)] leading-relaxed">
      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">Privacy Notice & DPDP Framework Alignment</h1>
      <Card title="Digital Personal Data Protection (DPDP) Act 2023 Alignment">
        <div className="space-y-3">
          <p>
            <strong>Version:</strong> 2026.1 • <strong>Effective Date:</strong> 1 January 2026
          </p>
          <p>
            <strong>1. Data Minimization:</strong> We collect only minimum information needed to diagnose inclusion issues (name, age year, locality). We strictly NEVER collect or store Aadhaar numbers or biometric data.
          </p>
          <p>
            <strong>2. Encryption:</strong> Field-level envelope encryption (AES-256-GCM) secures identifiers. Blind indexes (HMAC-SHA256) are used for equality lookups.
          </p>
          <p>
            <strong>3. Data Principal Rights:</strong> Citizens have full statutory rights under DPDP 2023 to access, export, correct, and withdraw consent for account closure.
          </p>
          <p>
            <strong>4. Grievance Officer:</strong> Inquiries may be addressed to <code>grievance@voterrule.org</code>.
          </p>
        </div>
      </Card>
    </div>
  );
};

export const AccessibilityPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 text-sm text-[var(--ink)]">
      <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">Accessibility Statement (WCAG 2.2 AA)</h1>
      <Card title="Commitment to Universal Civic Access">
        <ul className="list-disc list-inside text-xs text-[var(--ink-2)] space-y-2">
          <li><strong>High Contrast Tokens:</strong> All text tokens meet or exceed WCAG 2.2 AA contrast ratios (saffron text uses darker shade #9A4500 achieving 4.8:1 contrast).</li>
          <li><strong>Keyboard Operability:</strong> Skip-to-content landmarks, visible focus rings, and full keyboard-accessible controls.</li>
          <li><strong>Motion & Lite Mode:</strong> Respects <code>prefers-reduced-motion</code> and provides a visible Lite Mode toggle disabling ambient animations.</li>
          <li><strong>Screen Reader Support:</strong> Color is never used as the sole conveyor of status; all progress rings carry <code>role="progressbar"</code> and live regions.</li>
        </ul>
      </Card>
    </div>
  );
};

export const StyleguidePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="font-display font-extrabold text-3xl text-[var(--ink)] tracking-tight">Design System & Component Styleguide</h1>
        <p className="text-sm text-[var(--ink-2)]">
          Original Tiranga-inspired civic design tokens, brand marks, and accessible motion primitives.
        </p>
      </div>

      {/* Brand Marks */}
      <Card title="1. Brand Identity & Lockups">
        <div className="flex flex-wrap items-center gap-8 py-4">
          <ChakraMark size={56} aria-label="Original 24-Spoke Chakra Mark" />
          <BrandWordmark size="lg" />
        </div>
      </Card>

      {/* Color Tokens */}
      <Card title="2. Tiranga Design Tokens & Contrast Checks">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-[#FF9933] text-[#0B1030] font-bold">
            Saffron #FF9933 (Fill)
          </div>
          <div className="p-4 rounded-lg bg-white text-[#9A4500] font-bold border border-gray-200">
            SaffronText #9A4500 (AA 4.8:1)
          </div>
          <div className="p-4 rounded-lg bg-[#138808] text-white font-bold">
            Green #138808 (Fill)
          </div>
          <div className="p-4 rounded-lg bg-white text-[#0D5C05] font-bold border border-gray-200">
            GreenText #0D5C05 (AA 5.5:1)
          </div>
          <div className="p-4 rounded-lg bg-[#000080] text-white font-bold">
            Chakra Navy #000080
          </div>
          <div className="p-4 rounded-lg bg-white text-[#0B1030] font-bold border border-gray-200">
            NavyText #0B1030 (17.2:1)
          </div>
          <div className="p-4 rounded-lg bg-[#FFFBF5] text-[#0B1030] font-bold border border-gray-200">
            WarmWhite #FFFBF5
          </div>
        </div>
      </Card>

      {/* Motion Primitives */}
      <Card title="3. The 5 Tiranga Motion Primitives">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <span className="text-xs font-bold text-gray-700 block">Ashoka Chakra Progress Ring:</span>
            <AshokaChakraProgressRing completed={3} total={5} size={72} />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-2">
            <span className="text-xs font-bold text-gray-700 block">Civic Pulse:</span>
            <CivicPulse message="Civic milestone verified" triggerKey={1} />
          </div>

          <div className="p-4 bg-gray-50 rounded-xl space-y-2 md:col-span-2">
            <span className="text-xs font-bold text-gray-700 block">Smart Loading Loader:</span>
            <SmartLoading size="section" text="Simulating statutory rule check..." />
          </div>
        </div>
      </Card>
    </div>
  );
};
