import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface RouteKnowledge {
  routeId: string;
  path: string;
  title: string;
  purpose: string;
  requiredInputs: string[];
  authRequirement: 'ANONYMOUS' | 'CITIZEN' | 'STAFF' | 'ANY';
  roleRequirement?: string[];
  sectionIds: string[];
  highlightableElementIds: {
    targetId: string;
    description: string;
    selector: string;
  }[];
  statusMeanings: Record<string, string>;
  featureAvailability: 'fully_implemented' | 'partly_implemented' | 'mocked_in_demo' | 'not_yet_integrated';
  implementationNotes: string;
  officialReferences: {
    title: string;
    url: string;
    formOrSection?: string;
  }[];
}

export const APP_ROUTES_MAP: RouteKnowledge[] = [
  {
    routeId: 'home',
    path: '/',
    title: 'VoteRule Home',
    purpose: 'Independent civic-assistance platform landing page explaining how to verify electoral roll status, diagnose missing names, and prepare statutory ECI applications.',
    requiredInputs: [],
    authRequirement: 'ANY',
    sectionIds: ['top', 'hero', 'quick-actions', 'features', 'guidance-summary', 'footer'],
    highlightableElementIds: [
      { targetId: 'home-check-btn', description: 'Start voter status check button', selector: '[data-ai-target="home-check-btn"]' },
      { targetId: 'home-missing-btn', description: 'Missing from roll assistance button', selector: '[data-ai-target="home-missing-btn"]' },
      { targetId: 'home-eligibility-btn', description: 'Check voter eligibility button', selector: '[data-ai-target="home-eligibility-btn"]' },
      { targetId: 'home-duplicate-btn', description: 'Check duplicate registration button', selector: '[data-ai-target="home-duplicate-btn"]' },
      { targetId: 'home-deceased-btn', description: 'Report deceased elector entry button', selector: '[data-ai-target="home-deceased-btn"]' }
    ],
    statusMeanings: {},
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Fully implemented interactive landing page with multilingual support and light/dark theme.',
    officialReferences: [
      { title: 'Election Commission of India', url: 'https://www.eci.gov.in' },
      { title: 'Voters Service Portal', url: 'https://voters.eci.gov.in' }
    ]
  },
  {
    routeId: 'check_voter_status',
    path: '/app/check',
    title: 'Electoral Roll Status Check & Record',
    purpose: 'Guides electors to perform official roll verification on voters.eci.gov.in and record the neutral outcome with timestamped provenance.',
    requiredInputs: ['State', 'EPIC Number (or name details)'],
    authRequirement: 'ANY',
    sectionIds: ['check-header', 'official-search-link', 'record-outcome-form', 'status-notes'],
    highlightableElementIds: [
      { targetId: 'check-epic-input', description: 'EPIC Number input field', selector: '[data-ai-target="check-epic-input"]' },
      { targetId: 'check-state-select', description: 'State/UT dropdown selector', selector: '[data-ai-target="check-state-select"]' },
      { targetId: 'check-simulate-btn', description: 'Simulate/Verify button', selector: '[data-ai-target="check-simulate-btn"]' },
      { targetId: 'check-outcome-selector', description: 'Official outcome radio buttons', selector: '[data-ai-target="check-outcome-selector"]' },
      { targetId: 'check-save-btn', description: 'Save check outcome button', selector: '[data-ai-target="check-save-btn"]' }
    ],
    statusMeanings: {
      CONFIRMED_PRESENT_IN_OFFICIAL_RESULT: 'Your name, EPIC, and polling station were located on the official roll.',
      NOT_FOUND_IN_CHECKED_SEARCH: 'The official search returned zero matching records for the details entered.',
      DETAILS_APPEAR_INCONSISTENT: 'Record was located, but spelling, age, relative name, or address differs from current reality.',
      SEARCH_COULD_NOT_BE_COMPLETED: 'Technical timeout, official server downtime, or OTP not received on official portal.',
      NEEDS_FURTHER_VERIFICATION: 'Multiple similar records found or ambiguous assembly constituency boundaries.'
    },
    featureAvailability: 'mocked_in_demo',
    implementationNotes: 'In demo mode, automated roll lookup is simulated against synthetic seeds. Live lookups are performed directly on official ECI portal by the citizen, and result is recorded here.',
    officialReferences: [
      { title: 'ECI Electoral Search', url: 'https://electoralsearch.eci.gov.in', formOrSection: 'National Electoral Roll Search' }
    ]
  },
  {
    routeId: 'missing_name_assistance',
    path: '/app/missing-name',
    title: 'Missing Name & Omission Assistance',
    purpose: 'Assists citizens whose name was omitted or deleted from the electoral roll in diagnosing the issue, collecting necessary facts, and preparing official Form 6.',
    requiredInputs: ['Full Name', 'Relative Name', 'Year of Birth', 'State', 'District', 'Assembly Constituency', 'Address', 'Informed Consent'],
    authRequirement: 'ANY',
    sectionIds: ['step-prior-entry', 'step-personal-info', 'step-location', 'step-verification-date', 'step-consent', 'step-summary'],
    highlightableElementIds: [
      { targetId: 'missing-name-input', description: 'Full legal name input field', selector: '[data-ai-target="missing-name-input"]' },
      { targetId: 'missing-relative-input', description: 'Relative name input field', selector: '[data-ai-target="missing-relative-input"]' },
      { targetId: 'missing-state-select', description: 'State selector dropdown', selector: '[data-ai-target="missing-state-select"]' },
      { targetId: 'missing-constituency-input', description: 'Assembly constituency input field', selector: '[data-ai-target="missing-constituency-input"]' },
      { targetId: 'missing-consent-checkbox', description: 'Informed consent checkbox', selector: '[data-ai-target="missing-consent-checkbox"]' },
      { targetId: 'missing-submit-btn', description: 'Create assistance case button', selector: '[data-ai-target="missing-submit-btn"]' }
    ],
    statusMeanings: {
      DRAFT: 'Case information entered but not yet saved.',
      SUBMITTED_TO_PORTAL: 'Case recorded on VoteRule and queued for statutory guidance.',
      AWAITING_INITIAL_REVIEW: 'Awaiting review by VoteRule case specialist.',
      OFFICIAL_PROCESS_RECOMMENDED: 'Recommended official form (Form 6) preparation sheet generated.'
    },
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Creates an in-app assistance case with Crockford Base32 case reference and prepares Form 6 application preparation sheet.',
    officialReferences: [
      { title: 'ECI Form 6 - Inclusion of Name', url: 'https://voters.eci.gov.in', formOrSection: 'Registration of Electors Rules 1960 (Rule 13(1) & 26)' }
    ]
  },
  {
    routeId: 'dashboard',
    path: '/app',
    title: 'Citizen Civic Dashboard',
    purpose: 'Unified view of the citizen’s recorded status checks, active assistance cases, statutory revision schedules, and official next steps.',
    requiredInputs: [],
    authRequirement: 'CITIZEN',
    sectionIds: ['dashboard-summary', 'recent-checks', 'active-cases', 'ssr-deadlines', 'support-actions'],
    highlightableElementIds: [
      { targetId: 'dashboard-new-check-btn', description: 'Perform new status check button', selector: '[data-ai-target="dashboard-new-check-btn"]' },
      { targetId: 'dashboard-active-case-card', description: 'Active case status card', selector: '[data-ai-target="dashboard-active-case-card"]' }
    ],
    statusMeanings: {
      DRAFT: 'Assistance case in draft state.',
      SUBMITTED_TO_PORTAL: 'Case submitted to VoteRule for guidance.',
      UNDER_REVIEW: 'Case specialist evaluating statutory options.',
      OFFICIAL_PROCESS_RECOMMENDED: 'Form preparation guidance ready for citizen.',
      CLOSED: 'Case resolved or concluded.'
    },
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Fetches user cases and status checks from API with session owner isolation.',
    officialReferences: [
      { title: 'ECI Special Summary Revision (SSR) Guidelines', url: 'https://www.eci.gov.in' }
    ]
  },
  {
    routeId: 'case_detail',
    path: '/app/cases/:caseRef',
    title: 'Assistance Case Details & Timeline',
    purpose: 'Deep view of a specific civic assistance case, showing statutory two-system stage progression, audit events, and PDF generation.',
    requiredInputs: ['caseRef'],
    authRequirement: 'CITIZEN',
    sectionIds: ['case-header', 'two-system-tracker', 'audit-history', 'document-checklist', 'guidance-actions'],
    highlightableElementIds: [
      { targetId: 'case-download-sheet-btn', description: 'Download Application Preparation Sheet button', selector: '[data-ai-target="case-download-sheet-btn"]' },
      { targetId: 'case-report-official-btn', description: 'Report official submission button', selector: '[data-ai-target="case-report-official-btn"]' }
    ],
    statusMeanings: {
      ACCOUNT_CREATED: 'Account created on civic portal.',
      INFO_SUBMITTED_TO_PORTAL: 'Case details submitted for assistance.',
      APPLICATION_PREPARED: 'Statutory preparation sheet generated for Form 6/7/8.',
      SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED: 'Citizen reported submitting application to ECI.',
      OFFICIAL_SUBMISSION_CONFIRMED: 'Reviewed against official ECI acknowledgement slip.',
      OFFICIAL_DECISION_RECEIVED: 'Statutory ERO decision issued.',
      ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED: 'Name independently verified as appearing in the published roll.'
    },
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Stages 6-8 are strictly guarded and cannot be advanced by self-reporting alone.',
    officialReferences: [
      { title: 'ECI Application Tracking', url: 'https://voters.eci.gov.in', formOrSection: 'Track Application Status' }
    ]
  },
  {
    routeId: 'duplicate_self_check',
    path: '/app/duplicate-self-check',
    title: 'Duplicate Registration Self-Check',
    purpose: 'Allows citizens to identify and resolve redundant electoral entries across different addresses or assembly constituencies under Section 17 & 18 RPA 1950.',
    requiredInputs: ['Full Name', 'Current State', 'Current Address', 'Previous State (Optional)', 'Previous Address (Optional)'],
    authRequirement: 'ANY',
    sectionIds: ['duplicate-intro', 'duplicate-form', 'duplicate-results', 'duplicate-guidance'],
    highlightableElementIds: [
      { targetId: 'duplicate-name-input', description: 'Full name input for duplicate check', selector: '[data-ai-target="duplicate-name-input"]' },
      { targetId: 'duplicate-state-select', description: 'Current state dropdown selector', selector: '[data-ai-target="duplicate-state-select"]' },
      { targetId: 'duplicate-submit-btn', description: 'Run duplicate self-check button', selector: '[data-ai-target="duplicate-submit-btn"]' }
    ],
    statusMeanings: {
      NO_DUPLICATE_FOUND: 'No matching duplicate records found in synthetic index.',
      POTENTIAL_MATCH_SAME_CONSTITUENCY: 'Potential multiple entries within the same assembly constituency.',
      POTENTIAL_MATCH_DIFFERENT_STATE: 'Potential un-deleted prior registration in another state/district.'
    },
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Evaluates equality using HMAC blind indexing and blocking match tokens. Name similarity alone does NOT prove identity.',
    officialReferences: [
      { title: 'Representation of the People Act 1950', url: 'https://www.indiacode.nic.in', formOrSection: 'Sections 17 and 18 (No person registered in more than one constituency)' },
      { title: 'ECI Form 8 - Shifting / Deletion of Previous Entry', url: 'https://voters.eci.gov.in', formOrSection: 'Form 8 / Form 7' }
    ]
  },
  {
    routeId: 'deceased_person_report',
    path: '/app/report/deceased',
    title: 'Report Deceased Elector Entry for Verification',
    purpose: 'Allows immediate family or verified neighbours to report a deceased person entry to prevent roll bloat, guarded by anti-weaponization limits and mandatory ERO physical verification.',
    requiredInputs: ['Reported Person Name', 'Relative Name', 'Approximate Age', 'State', 'Locality', 'Basis of Knowledge', 'Explanation'],
    authRequirement: 'CITIZEN',
    sectionIds: ['deceased-safeguards', 'deceased-form', 'deceased-consent', 'deceased-confirmation'],
    highlightableElementIds: [
      { targetId: 'deceased-name-input', description: 'Name of deceased elector input', selector: '[data-ai-target="deceased-name-input"]' },
      { targetId: 'deceased-basis-select', description: 'Basis of knowledge selector (Immediate family, legal heir, etc.)', selector: '[data-ai-target="deceased-basis-select"]' },
      { targetId: 'deceased-submit-btn', description: 'Submit report for human review button', selector: '[data-ai-target="deceased-submit-btn"]' }
    ],
    statusMeanings: {
      RECEIVED: 'Report received and queued for review.',
      AWAITING_DEATH_CERTIFICATE: 'Supporting official death record or verification requested.',
      RECOMMENDED_FOR_FORM_7: 'Guidance prepared for filing statutory Form 7 objection.',
      REJECTED: 'Report rejected due to insufficient basis or weaponization safeguard.'
    },
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Enforces max 3 reports per citizen per 30-day window. Explains that deletion requires statutory Form 7 and official ERO verification.',
    officialReferences: [
      { title: 'ECI Form 7 - Objections & Deletions', url: 'https://voters.eci.gov.in', formOrSection: 'Registration of Electors Rules 1960 (Rule 13(2))' },
      { title: 'Registration of Births and Deaths Act 1969', url: 'https://www.indiacode.nic.in' }
    ]
  },
  {
    routeId: 'eligibility_check',
    path: '/eligibility-check',
    title: 'Stateless Electoral Eligibility Guidance',
    purpose: 'Educational, anonymous questionnaire to evaluate voter eligibility under Article 326 of the Constitution of India and RPA 1950 without saving any data.',
    requiredInputs: ['Citizenship Status', 'Age / Qualifying Date', 'Disqualification Status'],
    authRequirement: 'ANY',
    sectionIds: ['eligibility-intro', 'questions-form', 'evaluation-result'],
    highlightableElementIds: [
      { targetId: 'eligibility-question-citizenship', description: 'Citizenship question options', selector: '[data-ai-target="eligibility-question-citizenship"]' },
      { targetId: 'eligibility-question-age', description: 'Age and qualifying date options', selector: '[data-ai-target="eligibility-question-age"]' },
      { targetId: 'eligibility-eval-btn', description: 'Evaluate eligibility button', selector: '[data-ai-target="eligibility-eval-btn"]' }
    ],
    statusMeanings: {
      ELIGIBLE_NOW: 'Meets citizenship, age, and ordinary residence requirements for immediate Form 6 enrollment.',
      PROSPECTIVE_ELECTOR: 'Aged 17+ turning 18 on one of the four qualifying dates (1 Jan, 1 Apr, 1 Jul, 1 Oct). Eligible for advance Form 6.',
      NOT_ELIGIBLE: 'Currently does not meet statutory eligibility conditions.'
    },
    featureAvailability: 'fully_implemented',
    implementationNotes: '100% stateless and anonymous. No personal data collected or stored. Safe for minors under 18 checking advance eligibility.',
    officialReferences: [
      { title: 'Constitution of India, Article 326', url: 'https://www.indiacode.nic.in', formOrSection: 'Article 326 - Universal Adult Suffrage' },
      { title: 'Representation of the People Act 1950', url: 'https://www.indiacode.nic.in', formOrSection: 'Section 14 & 19 (Qualifying dates & eligibility)' }
    ]
  },
  {
    routeId: 'assisted_support',
    path: '/app/assist',
    title: 'Assisted Support & Representative Authorization',
    purpose: 'Guidance for senior citizens, low-literacy voters, and people with disabilities who require authorized assistance, plus official 1950 helpline directory.',
    requiredInputs: ['Representative Name', 'Relationship', 'Phone Number', 'Explicit Citizen Authorization'],
    authRequirement: 'ANY',
    sectionIds: ['helplines-card', 'assisted-agent-form', 'rights-notice'],
    highlightableElementIds: [
      { targetId: 'assist-rep-name-input', description: 'Representative legal name input', selector: '[data-ai-target="assist-rep-name-input"]' },
      { targetId: 'assist-auth-checkbox', description: 'Citizen explicit authorization checkbox', selector: '[data-ai-target="assist-auth-checkbox"]' },
      { targetId: 'assist-submit-btn', description: 'Record authorized representative button', selector: '[data-ai-target="assist-submit-btn"]' }
    ],
    statusMeanings: {},
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Provides National Voter Helpline (1950) details and ensures representative actions remain strictly auditable.',
    officialReferences: [
      { title: 'ECI Accessible Elections Guidelines (PwD & Senior Citizens)', url: 'https://www.eci.gov.in' }
    ]
  },
  {
    routeId: 'checkin',
    path: '/app/checkin',
    title: 'Periodic Contact Check-in (Voluntary)',
    purpose: 'Allows registered citizens to voluntarily re-confirm contact preferences and maintain active notification channels.',
    requiredInputs: ['Cycle ID'],
    authRequirement: 'CITIZEN',
    sectionIds: ['checkin-safeguard', 'checkin-action-card'],
    highlightableElementIds: [
      { targetId: 'checkin-confirm-btn', description: 'Confirm contact check-in button', selector: '[data-ai-target="checkin-confirm-btn"]' }
    ],
    statusMeanings: {},
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Explicit non-retaliation safeguard: Inactivity or non-response NEVER results in adverse determinations or account closure.',
    officialReferences: [
      { title: 'Digital Personal Data Protection Act 2023', url: 'https://www.indiacode.nic.in' }
    ]
  },
  {
    routeId: 'how_it_works',
    path: '/how-it-works',
    title: 'How VoteRule Works',
    purpose: 'Step-by-step overview of VoteRule’s three-stage civic process: Verify Official Search, Diagnose Statutory Issue, and Prepare Official Form.',
    requiredInputs: [],
    authRequirement: 'ANY',
    sectionIds: ['stages-grid', 'cta-search'],
    highlightableElementIds: [
      { targetId: 'how-start-search-btn', description: 'Start voter search CTA button', selector: '[data-ai-target="how-start-search-btn"]' }
    ],
    statusMeanings: {},
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Educational informational page.',
    officialReferences: [
      { title: 'ECI Citizen Services Overview', url: 'https://voters.eci.gov.in' }
    ]
  },
  {
    routeId: 'methodology',
    path: '/methodology',
    title: 'Verification Methodology & Civic Neutrality',
    purpose: 'Detailed explanation of our civic independence, zero-scraping policy, anti-shadow roll commitment, and cryptographic auditability.',
    requiredInputs: [],
    authRequirement: 'ANY',
    sectionIds: ['neutrality-guarantee', 'data-security', 'audit-chain'],
    highlightableElementIds: [],
    statusMeanings: {},
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Living document detailing operational boundaries.',
    officialReferences: [
      { title: 'ECI Central API & Roll Access Policy', url: 'https://www.eci.gov.in' }
    ]
  },
  {
    routeId: 'privacy_policy',
    path: '/privacy',
    title: 'Privacy Policy & DPDP Notice',
    purpose: 'Comprehensive privacy policy compliant with the Digital Personal Data Protection Act 2023, disclosing encryption, retention, and AI assistant data processing.',
    requiredInputs: [],
    authRequirement: 'ANY',
    sectionIds: ['privacy-notice', 'data-fiduciary', 'ai-voice-processing', 'grievance-officer'],
    highlightableElementIds: [],
    statusMeanings: {},
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Includes Grievance Redressal Officer contact and right to data erasure.',
    officialReferences: [
      { title: 'Digital Personal Data Protection Act 2023', url: 'https://www.indiacode.nic.in' }
    ]
  },
  {
    routeId: 'accessibility',
    path: '/accessibility',
    title: 'Accessibility Statement (WCAG 2.2 AA)',
    purpose: 'Accessibility commitments, keyboard shortcuts, screen reader compatibility, high-contrast modes, and reduced motion settings.',
    requiredInputs: [],
    authRequirement: 'ANY',
    sectionIds: ['accessibility-statement', 'assistive-tech-details'],
    highlightableElementIds: [],
    statusMeanings: {},
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Documents compliance with IS 17802 / WCAG 2.2 AA.',
    officialReferences: [
      { title: 'Guidelines for Indian Government Websites (GIGW 3.0)', url: 'https://guidelines.india.gov.in' }
    ]
  },
  {
    routeId: 'auth_login',
    path: '/auth',
    title: 'Citizen Sign In',
    purpose: 'Secure authentication using mobile number or synthetic demo citizen account.',
    requiredInputs: ['Identifier / Phone', 'Password or OTP'],
    authRequirement: 'ANY',
    sectionIds: ['login-form', 'demo-accounts'],
    highlightableElementIds: [
      { targetId: 'auth-email-input', description: 'Identifier/Email input field', selector: '[data-ai-target="auth-email-input"]' },
      { targetId: 'auth-password-input', description: 'Password input field', selector: '[data-ai-target="auth-password-input"]' },
      { targetId: 'auth-submit-btn', description: 'Sign In button', selector: '[data-ai-target="auth-submit-btn"]' },
      { targetId: 'auth-demo-aarav-btn', description: 'Demo Quick Login (Aarav Sharma)', selector: '[data-ai-target="auth-demo-aarav-btn"]' }
    ],
    statusMeanings: {},
    featureAvailability: 'fully_implemented',
    implementationNotes: 'Provides demo logins in demo mode and password hashing with HMAC blind indexing.',
    officialReferences: []
  }
];

export function generateAppMapMarkdown(): string {
  let md = '# VoteRule Application Knowledge Map (APP_MAP)\n\n';
  md += '> Machine-generated knowledge map for VoteRule AI conversational assistant.\n';
  md += `> Last Generated: ${new Date().toISOString()}\n\n`;
  md += '## 1. Executive Summary & Routing Architecture\n\n';
  md += 'VoteRule operates a single-page reactive application using custom state-based client routing, with persistent global state across route transitions. The AI assistant is mounted at the root level and retains state during user navigation.\n\n';
  md += '## 2. Route Registry & Gating\n\n';
  md += '| Route ID | Path | Title | Auth Level | Feature Availability |\n';
  md += '|---|---|---|---|---|\n';

  for (const r of APP_ROUTES_MAP) {
    md += `| \`${r.routeId}\` | \`${r.path}\` | ${r.title} | ${r.authRequirement} | \`${r.featureAvailability}\` |\n`;
  }

  md += '\n## 3. Detailed Route Specifications\n\n';

  for (const r of APP_ROUTES_MAP) {
    md += `### ${r.title} (\`${r.routeId}\`)\n\n`;
    md += `- **Path:** \`${r.path}\`\n`;
    md += `- **Purpose:** ${r.purpose}\n`;
    md += `- **Auth Requirement:** ${r.authRequirement}\n`;
    md += `- **Availability:** \`${r.featureAvailability}\` (${r.implementationNotes})\n`;
    md += `- **Registered Sections:** ${r.sectionIds.map(s => `\`${s}\``).join(', ')}\n`;
    
    if (r.requiredInputs.length > 0) {
      md += `- **Required Inputs:** ${r.requiredInputs.join(', ')}\n`;
    }

    if (r.highlightableElementIds.length > 0) {
      md += `- **Highlightable UI Targets (\`data-ai-target\`):**\n`;
      for (const el of r.highlightableElementIds) {
        md += `  - \`${el.targetId}\`: ${el.description} (selector: \`${el.selector}\`)\n`;
      }
    }

    if (Object.keys(r.statusMeanings).length > 0) {
      md += `- **Status Values & Meanings:**\n`;
      for (const [k, v] of Object.entries(r.statusMeanings)) {
        md += `  - \`${k}\`: ${v}\n`;
      }
    }

    if (r.officialReferences.length > 0) {
      md += `- **Official References:**\n`;
      for (const ref of r.officialReferences) {
        md += `  - [${ref.title}](${ref.url}) ${ref.formOrSection ? `(${ref.formOrSection})` : ''}\n`;
      }
    }
    md += '\n---\n\n';
  }

  return md;
}

export function main() {
  const root = path.resolve(__dirname, '..');
  const docsDir = path.join(root, 'docs', 'voterule-ai');
  const targetJsonDir = path.join(root, 'apps', 'api', 'src', 'ai', 'knowledge');

  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }
  if (!fs.existsSync(targetJsonDir)) {
    fs.mkdirSync(targetJsonDir, { recursive: true });
  }

  // 1. Write docs/voterule-ai/APP_MAP.md
  const mdPath = path.join(docsDir, 'APP_MAP.md');
  fs.writeFileSync(mdPath, generateAppMapMarkdown(), 'utf8');
  console.log(`Generated: ${path.relative(root, mdPath)}`);

  // 2. Write app-knowledge.generated.json
  const jsonPath = path.join(targetJsonDir, 'app-knowledge.generated.json');
  fs.writeFileSync(jsonPath, JSON.stringify(APP_ROUTES_MAP, null, 2), 'utf8');
  console.log(`Generated: ${path.relative(root, jsonPath)}`);

  // Also write copy in docs/voterule-ai/ for easy review
  const docJsonPath = path.join(docsDir, 'app-knowledge.generated.json');
  fs.writeFileSync(docJsonPath, JSON.stringify(APP_ROUTES_MAP, null, 2), 'utf8');
  console.log(`Generated: ${path.relative(root, docJsonPath)}`);
}

main();
