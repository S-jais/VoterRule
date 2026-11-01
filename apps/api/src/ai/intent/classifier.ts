import { IntentClassificationResult, IntentType } from '../interfaces.js';

export class IntentClassifier {
  public static classify(
    text: string,
    context?: { currentRouteId?: string; lastIntent?: IntentType }
  ): IntentClassificationResult {
    const raw = text.trim();
    const lower = raw.toLowerCase();

    // 1. Language Detection (Devanagari script or Hindi keywords)
    const isDevanagari = /[\u0900-\u097F]/.test(raw);
    const hasHindiKeywords = /\b(namaste|kya|kaise|mera|naam|soochi|matdata|chunaav|madad|batao|karo|nahi|haan)\b/i.test(lower);
    let language: 'en' | 'hi' | 'hinglish' = 'en';
    if (isDevanagari) {
      language = 'hi';
    } else if (hasHindiKeywords) {
      language = 'hinglish';
    }

    // 2. Voice Control Commands (Intercept before content answering)
    if (/^(stop|pause|halt|ruk|ruko|chup|shant|repeat|dobara|fir se|slower|dhire|faster|tez|mute|unmute)\b/i.test(lower)) {
      return {
        intent: 'voice_control_command',
        confidence: 0.98,
        language,
        needsRetrieval: false,
        needsAction: true,
        needsConfirmation: false,
        needsHuman: false,
        extractedEntities: { actionCommand: lower },
      };
    }

    // 3. Greetings
    if (/^(hi|hello|hey|namaste|pranam|good\s*(morning|afternoon|evening)|kese\s*ho|who\s*are\s*you)\b/i.test(lower) && lower.split(/\s+/).length <= 4) {
      return {
        intent: 'greeting',
        confidence: 0.95,
        language,
        needsRetrieval: false,
        needsAction: false,
        needsConfirmation: false,
        needsHuman: false,
      };
    }

    // 4. Out of Scope / Partisan / Unrelated
    const isPartisan = /\b(vote\s+for|which\s+party|bjp|congress|aap|modi|rahul|election\s+result|who\s+will\s+win|candidate\s+opinion)\b/i.test(lower);
    const isGeneralTrivia = /\b(recipe|weather|capital\s+of|write\s+a\s+poem|joke|homework|stock\s+market)\b/i.test(lower);
    if (isPartisan || isGeneralTrivia) {
      return {
        intent: 'out_of_scope_or_unsupported',
        confidence: 0.95,
        language,
        needsRetrieval: false,
        needsAction: false,
        needsConfirmation: false,
        needsHuman: false,
      };
    }

    // 5. Website Navigation Requests
    if (
      /\b(take\s*me\s*to|navigate\s*to|open|go\s*to|show\s*me\s*the\s*page|kholo|jao)\b/i.test(lower) ||
      /^(check|status check|dashboard|missing name|eligibility|privacy|accessibility)$/i.test(lower)
    ) {
      let routeId = 'home';
      if (/check|status/i.test(lower)) routeId = 'check_voter_status';
      else if (/missing/i.test(lower)) routeId = 'missing_name_assistance';
      else if (/duplicate/i.test(lower)) routeId = 'duplicate_self_check';
      else if (/deceased|death/i.test(lower)) routeId = 'deceased_person_report';
      else if (/eligib/i.test(lower)) routeId = 'eligibility_check';
      else if (/dash|case/i.test(lower)) routeId = 'dashboard';
      else if (/assist|support|help/i.test(lower)) routeId = 'assisted_support';
      else if (/privacy/i.test(lower)) routeId = 'privacy_policy';
      else if (/how\s*it\s*works/i.test(lower)) routeId = 'how_it_works';
      else if (/method/i.test(lower)) routeId = 'methodology';

      return {
        intent: 'website_navigation',
        confidence: 0.92,
        language,
        needsRetrieval: false,
        needsAction: true,
        needsConfirmation: false,
        needsHuman: false,
        extractedEntities: { routeId },
      };
    }

    // 6. Missing Name Assistance
    if (/\b(missing|omitted|not\s*found|naam\s*nahi\s*hai|cut\s*gaya|deleted|removed|chhut\s*gaya)\b/i.test(lower)) {
      return {
        intent: 'missing_name_assistance',
        confidence: 0.94,
        language,
        needsRetrieval: true,
        needsAction: true,
        needsConfirmation: false,
        needsHuman: false,
        extractedEntities: { workflowId: 'missing_name' },
      };
    }

    // 7. Duplicate Registration Guidance
    if (/\b(duplicate|two\s*voter|multiple\s*voter|double\s*entry|dohra|ek\s*se\s*zyada|shifted|pichla\s*pata)\b/i.test(lower)) {
      return {
        intent: 'duplicate_registration_guidance',
        confidence: 0.92,
        language,
        needsRetrieval: true,
        needsAction: true,
        needsConfirmation: false,
        needsHuman: false,
        extractedEntities: { workflowId: 'duplicate_concern' },
      };
    }

    // 8. Deceased Person Reporting
    if (/\b(deceased|death|passed\s*away|expired|mrityu|mar\s*gaye|shanti|swarg)\b/i.test(lower)) {
      return {
        intent: 'deceased_person_reporting_guidance',
        confidence: 0.93,
        language,
        needsRetrieval: true,
        needsAction: true,
        needsConfirmation: false,
        needsHuman: false,
        extractedEntities: { workflowId: 'deceased_report' },
      };
    }

    // 8b. Objections & Deletions (Form 7)
    if (/\b(delete\s*him|delete\s*voter|object\s*to|objection|fake|fraudulent|hatao|naam\s*kaat)\b/i.test(lower)) {
      return {
        intent: 'voter_registration_guidance',
        confidence: 0.94,
        language,
        needsRetrieval: true,
        needsAction: false,
        needsConfirmation: false,
        needsHuman: false,
        extractedEntities: { formCode: 'FORM_7' },
      };
    }

    // 9. Eligibility Guidance
    if (/\b(eligible|eligibility|18\s*years|qualifying\s*date|patra|patrata|can\s*i\s*vote|age\s*limit)\b/i.test(lower)) {
      return {
        intent: 'eligibility_guidance',
        confidence: 0.91,
        language,
        needsRetrieval: true,
        needsAction: false,
        needsConfirmation: false,
        needsHuman: false,
      };
    }

    // 10. Voter Registration & Forms Guidance (Form 6, 6A, 6B, 7, 8)
    if (/\b(form\s*6|form\s*6a|form\s*6b|form\s*7|form\s*8|register|new\s*voter|correction|address\s*change|praroop)\b/i.test(lower)) {
      let formCode: string | undefined;
      if (/form\s*6a\b/i.test(lower)) formCode = 'FORM_6A';
      else if (/form\s*6b\b/i.test(lower)) formCode = 'FORM_6B';
      else if (/form\s*6\b/i.test(lower)) formCode = 'FORM_6';
      else if (/form\s*7\b/i.test(lower)) formCode = 'FORM_7';
      else if (/form\s*8\b/i.test(lower)) formCode = 'FORM_8';

      return {
        intent: 'voter_registration_guidance',
        confidence: 0.93,
        language,
        needsRetrieval: true,
        needsAction: false,
        needsConfirmation: false,
        needsHuman: false,
        extractedEntities: { formCode },
      };
    }

    // 11. Constitutional & Electoral Law Questions
    if (/\b(article\s*324|article\s*325|article\s*326|rpa|representation\s*of\s*the\s*people|law|constitution|samvidhan)\b/i.test(lower)) {
      return {
        intent: 'electoral_law_question',
        confidence: 0.92,
        language,
        needsRetrieval: true,
        needsAction: false,
        needsConfirmation: false,
        needsHuman: false,
      };
    }

    // 12. VoteRule Feature Explanation
    if (/\b(what\s*is\s*voterrule|how\s*voterrule\s*works|about\s*voterrule|who\s*made\s*voterrule|official\s*portal|eci\s*site)\b/i.test(lower)) {
      return {
        intent: 'voterule_feature_explanation',
        confidence: 0.94,
        language,
        needsRetrieval: true,
        needsAction: false,
        needsConfirmation: false,
        needsHuman: false,
      };
    }

    // 13. Case Tracking
    if (/\b(my\s*case|case\s*status|track|case\s*ref|pending|timeline)\b/i.test(lower)) {
      return {
        intent: 'case_tracking',
        confidence: 0.90,
        language,
        needsRetrieval: false,
        needsAction: true,
        needsConfirmation: false,
        needsHuman: false,
      };
    }

    // 14. Dashboard / Account
    if (/\b(dashboard|my\s*account|login|sign\s*in|profile)\b/i.test(lower)) {
      return {
        intent: 'user_dashboard_assistance',
        confidence: 0.88,
        language,
        needsRetrieval: false,
        needsAction: true,
        needsConfirmation: false,
        needsHuman: false,
      };
    }

    // Default fallback: Check if last intent was missing name or forms (context follow-up)
    if (context?.lastIntent === 'missing_name_assistance') {
      return {
        intent: 'missing_name_assistance',
        confidence: 0.75,
        language,
        needsRetrieval: true,
        needsAction: false,
        needsConfirmation: false,
        needsHuman: false,
      };
    }

    return {
      intent: 'voter_registration_guidance',
      confidence: 0.7,
      language,
      needsRetrieval: true,
      needsAction: false,
      needsConfirmation: false,
      needsHuman: false,
    };
  }
}
