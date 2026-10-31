import { StatusCheckOutcome } from '@voterrule/shared';

export interface OfficialLookupQuery {
  epicNumber?: string;
  name?: string;
  relativeName?: string;
  state?: string;
  ac?: string;
  dobYear?: number;
}

export interface OfficialLookupResult {
  providerName: string;
  outcome: StatusCheckOutcome;
  isOfficialIntegration: boolean;
  messageEn: string;
  messageHi: string;
  details?: {
    maskedName?: string;
    maskedEpic?: string;
    partNumber?: string;
    pollingStation?: string;
    assemblyConstituency?: string;
  };
}

export interface OfficialRollLookupProvider {
  providerId: string;
  name: string;
  isAvailable(): boolean;
  lookup(query: OfficialLookupQuery): Promise<OfficialLookupResult>;
}

/**
 * 1. Guided Manual Provider (Default)
 * Guides the user to official ECI search tools without scraping or circumventing official portals.
 */
export class GuidedManualProvider implements OfficialRollLookupProvider {
  public providerId = 'guided-manual';
  public name = 'Guided Official Search (Manual Recording)';

  public isAvailable(): boolean {
    return true;
  }

  public async lookup(_query: OfficialLookupQuery): Promise<OfficialLookupResult> {
    return {
      providerName: this.name,
      outcome: StatusCheckOutcome.SEARCH_COULD_NOT_BE_COMPLETED,
      isOfficialIntegration: false,
      messageEn:
        'Please perform the search directly on the official Election Commission portal (electoralsearch.eci.gov.in) and record your observed outcome below.',
      messageHi:
        'कृपया आधिकारिक चुनाव आयोग पोर्टल (electoralsearch.eci.gov.in) पर सीधे खोज करें और नीचे अपने द्वारा देखे गए परिणाम को दर्ज करें।',
    };
  }
}

/**
 * 2. Demo Provider (Synthetic Data in APP_MODE=demo only)
 */
export class DemoProvider implements OfficialRollLookupProvider {
  public providerId = 'demo-synthetic';
  public name = 'Demo Synthetic Provider (Non-Official Test Simulation)';

  public isAvailable(): boolean {
    return true;
  }

  public async lookup(query: OfficialLookupQuery): Promise<OfficialLookupResult> {
    const epic = query.epicNumber?.toUpperCase().trim();

    if (epic === 'DEMO1234567') {
      return {
        providerName: this.name,
        outcome: StatusCheckOutcome.CONFIRMED_PRESENT_IN_OFFICIAL_RESULT,
        isOfficialIntegration: true,
        messageEn: 'Synthetic record confirmed present in demo simulation.',
        messageHi: 'डेमो सिमुलेशन में सिंथेटिक रिकॉर्ड उपस्थित पाया गया।',
        details: {
          maskedName: 'A*** S****',
          maskedEpic: 'DEMO***4567',
          partNumber: '42',
          pollingStation: 'Government Senior Secondary School, Room 1',
          assemblyConstituency: 'AC-10 (Model Town)',
        },
      };
    }

    if (epic === 'INCONSIST99') {
      return {
        providerName: this.name,
        outcome: StatusCheckOutcome.DETAILS_APPEAR_INCONSISTENT,
        isOfficialIntegration: true,
        messageEn: 'Electoral details appear inconsistent in synthetic simulation.',
        messageHi: 'सिंथेटिक सिमुलेशन में मतदाता विवरण असंगत प्रतीत होते हैं।',
      };
    }

    return {
      providerName: this.name,
      outcome: StatusCheckOutcome.NOT_FOUND_IN_CHECKED_SEARCH,
      isOfficialIntegration: true,
      messageEn: 'Record not found in the checked search.',
      messageHi: 'जांची गई खोज में रिकॉर्ड नहीं मिला।',
    };
  }
}

/**
 * 3. Authorized Api Provider (Documented stub that throws NOT_CONFIGURED until authorization reference exists)
 */
export class AuthorizedApiProvider implements OfficialRollLookupProvider {
  public providerId = 'authorized-api';
  public name = 'Authorized Statutory Roll API Provider';

  constructor(
    private baseUrl?: string,
    private apiKey?: string,
    private authorizationRef?: string
  ) {}

  public isAvailable(): boolean {
    return !!(this.baseUrl && this.apiKey && this.authorizationRef);
  }

  public async lookup(_query: OfficialLookupQuery): Promise<OfficialLookupResult> {
    if (!this.isAvailable()) {
      throw new Error(
        'NOT_CONFIGURED: Authorized official roll lookup API is not configured. Written authorization reference, official base URL, and credentials are required before production enablement.'
      );
    }

    // When authorized by ECI or State CEO, invoke authenticated official endpoint
    throw new Error('Authorized provider endpoint not yet bound to statutory upstream.');
  }
}
