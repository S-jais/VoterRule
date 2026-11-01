export interface ActionPayload {
  type: string;
  payload: Record<string, any>;
  label?: string;
  requiresConfirmation?: boolean;
}

export interface ActionExecutorOptions {
  onNavigate: (path: string) => void;
  onConfirmRequest?: (prompt: string, onConfirm: () => void) => void;
}

// Route ID to relative URL mapping
const ROUTE_PATH_MAP: Record<string, string> = {
  home: '/',
  check_voter_status: '/app/check',
  missing_name_assistance: '/app/missing-name',
  duplicate_self_check: '/app/duplicate-self-check',
  deceased_person_report: '/app/report/deceased',
  dashboard: '/app',
  eligibility_check: '/eligibility-check',
  assisted_support: '/app/assist',
  checkin: '/app/checkin',
  how_it_works: '/how-it-works',
  methodology: '/methodology',
  privacy_policy: '/privacy',
  accessibility: '/accessibility',
  auth_login: '/auth',
};

export class ActionExecutor {
  private options: ActionExecutorOptions;

  constructor(options: ActionExecutorOptions) {
    this.options = options;
  }

  public execute(action: ActionPayload): { ok: boolean; reason?: string } {
    if (!action || !action.type) {
      return { ok: false, reason: 'Invalid action payload' };
    }

    switch (action.type) {
      case 'navigate_to': {
        const routeId = action.payload?.routeId;
        const targetPath = ROUTE_PATH_MAP[routeId];
        if (!targetPath) {
          console.warn(`[ActionExecutor] Rejected unknown routeId: ${routeId}`);
          return { ok: false, reason: `Route '${routeId}' is not an approved navigation target` };
        }

        this.options.onNavigate(targetPath);
        return { ok: true };
      }

      case 'scroll_to_section': {
        const sectionId = action.payload?.sectionId;
        if (!sectionId || typeof document === 'undefined') {
          return { ok: false, reason: 'Missing sectionId' };
        }

        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return { ok: true };
        }
        return { ok: false, reason: `Section element #${sectionId} not found in DOM` };
      }

      case 'highlight_element': {
        const targetId = action.payload?.targetId;
        if (!targetId || typeof document === 'undefined') {
          return { ok: false, reason: 'Missing targetId' };
        }

        const selector = `[data-ai-target="${targetId}"]`;
        const el = document.querySelector(selector) as HTMLElement;
        if (!el) {
          return { ok: false, reason: `Target element ${selector} not found` };
        }

        // Apply temporary accessible highlight
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ai-target-highlighted');
        el.setAttribute('data-ai-highlighted', 'true');

        setTimeout(() => {
          el.classList.remove('ai-target-highlighted');
          el.removeAttribute('data-ai-highlighted');
        }, 4000);

        return { ok: true };
      }

      case 'open_official_source': {
        const url = action.payload?.url;
        if (!url || typeof window === 'undefined') {
          return { ok: false, reason: 'Missing URL' };
        }

        // Must be verified official authority domain
        const isOfficial =
          url.startsWith('https://voters.eci.gov.in') ||
          url.startsWith('https://electoralsearch.eci.gov.in') ||
          url.startsWith('https://www.eci.gov.in') ||
          url.startsWith('https://www.indiacode.nic.in');

        if (!isOfficial) {
          console.warn(`[ActionExecutor] Refused non-official external link: ${url}`);
          return { ok: false, reason: 'Only allowlisted official government domains can be opened' };
        }

        window.open(url, '_blank', 'noopener,noreferrer');
        return { ok: true };
      }

      default:
        return { ok: false, reason: `Unsupported action type: ${action.type}` };
    }
  }
}

