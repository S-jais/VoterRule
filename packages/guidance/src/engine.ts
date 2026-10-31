import { FormCode } from '@voterrule/shared';
import {
  GuidanceItem,
  RecommenderInput,
  RecommendationResult,
  StateSchedule,
} from './types.js';
import { FORM_GUIDANCE_SEEDS } from './seeds/forms.js';
import { STATE_SCHEDULE_SEEDS } from './seeds/schedules.js';
import { DOCUMENT_CHECKLIST_SEEDS } from './seeds/checklists.js';

export class GuidanceEngine {
  private items: Map<string, GuidanceItem> = new Map();
  private schedules: Map<string, StateSchedule> = new Map();

  constructor() {
    for (const item of FORM_GUIDANCE_SEEDS) {
      this.items.set(item.id, item);
    }
    for (const sched of STATE_SCHEDULE_SEEDS) {
      this.schedules.set(sched.id, sched);
    }
  }

  /**
   * Production readiness verification check:
   * Asserts that in production mode, no active guidance item has requiresVerification=true without verifiedOn.
   */
  public verifyGuidanceIntegrity(): { valid: boolean; unverifiedItems: string[] } {
    const unverified: string[] = [];

    for (const item of this.items.values()) {
      if (item.requiresVerification && !item.verifiedOn) {
        unverified.push(`GuidanceItem: ${item.id} (${item.topic})`);
      }
    }
    for (const sched of this.schedules.values()) {
      if (sched.requiresVerification && !sched.verifiedOn) {
        unverified.push(`StateSchedule: ${sched.id} (${sched.stateName})`);
      }
    }

    return {
      valid: unverified.length === 0,
      unverifiedItems: unverified,
    };
  }

  /**
   * Data-driven decision tree for official form recommendation
   */
  public recommendForm(input: RecommenderInput): RecommendationResult {
    // 1. Overseas elector
    if (input.isOverseasCitizen) {
      const guidance = this.items.get('guidance-form-6a-v2026')!;
      return {
        recommendedForm: FormCode.FORM_6A,
        formNameEn: 'Form 6A (Application for Overseas Elector)',
        formNameHi: 'प्रारूप 6क (प्रवासी मतदाता के लिए आवेदन)',
        reasonsEn: [
          'You indicated that you are an Indian citizen residing outside India.',
          'Form 6A enables Non-Resident Indians (NRIs) who have not acquired foreign citizenship to be registered.',
        ],
        reasonsHi: [
          'आपने संकेत दिया है कि आप भारत से बाहर रहने वाले भारतीय नागरिक हैं।',
          'प्रारूप 6क उन अनिवासी भारतीयों (एनआरआई) को नामांकित करने के लिए है जिन्होंने विदेशी नागरिकता प्राप्त नहीं की है।',
        ],
        statutoryBasisEn: 'Registration of Electors Rules 1960, Rule 8A.',
        statutoryBasisHi: 'निर्वाचक रजिस्ट्रीकरण नियम 1960, नियम 8क।',
        officialSourceUrl: guidance.sourceUrl,
        verifiedOn: guidance.verifiedOn,
        caveatEn: 'If your situation does not match, contact your Electoral Registration Officer (ERO) or dial 1950.',
        caveatHi: 'यदि आपकी स्थिति मेल नहीं खाती है, तो अपने निर्वाचक पंजीकरण अधिकारी (ईआरओ) से संपर्क करें या 1950 डायल करें।',
        documentChecklistIds: ['doc-age-proof', 'doc-address-proof'],
      };
    }

    // 2. Shifting of residence (within or across constituencies)
    if (input.isShiftingResidence !== 'NO') {
      const guidance = this.items.get('guidance-form-8-v2026')!;
      const isAcross = input.isShiftingResidence === 'ACROSS_CONSTITUENCY';
      return {
        recommendedForm: FormCode.FORM_8,
        formNameEn: 'Form 8 (Shifting of Residence)',
        formNameHi: 'प्रारूप 8 (निवास परिवर्तन)',
        reasonsEn: [
          `You indicated shifting your residence ${isAcross ? 'to a new Assembly Constituency' : 'within the same Assembly Constituency'}.`,
          'Under statutory guidelines, existing registered voters who have moved their ordinary residence submit Form 8 (Section 1: Shifting of Residence) rather than a fresh Form 6.',
        ],
        reasonsHi: [
          `आपने ${isAcross ? 'नए विधानसभा क्षेत्र' : 'समान विधानसभा क्षेत्र के भीतर'} अपने सामान्य निवास स्थान के परिवर्तन का संकेत दिया है।`,
          'नियमों के अनुसार पंजीकृत मतदाता निवास परिवर्तन के लिए नए प्रारूप 6 के बजाय प्रारूप 8 (भाग 1) जमा करते हैं।',
        ],
        statutoryBasisEn: 'Registration of Electors Rules 1960, Rule 26 & ECI Form 8 Guidelines.',
        statutoryBasisHi: 'निर्वाचक रजिस्ट्रीकरण नियम 1960, नियम 26 एवं चुनाव आयोग दिशानिर्देश।',
        officialSourceUrl: guidance.sourceUrl,
        verifiedOn: guidance.verifiedOn,
        caveatEn: 'If your situation does not match, contact your Electoral Registration Officer (ERO) or dial 1950.',
        caveatHi: 'यदि आपकी स्थिति मेल नहीं खाती है, तो अपने निर्वाचक पंजीकरण अधिकारी (ईआरओ) से संपर्क करें या 1950 डायल करें।',
        documentChecklistIds: ['doc-address-proof'],
      };
    }

    // 3. Correction of particulars / Replacement EPIC / PwD marking
    if (input.hasNameOrParticularsCorrection || input.needsReplacementEpic || input.needsPwdMarking) {
      const guidance = this.items.get('guidance-form-8-v2026')!;
      const reasonsEn: string[] = [];
      const reasonsHi: string[] = [];

      if (input.hasNameOrParticularsCorrection) {
        reasonsEn.push('You indicated discrepancies in your existing electoral roll details (name, DOB, or relationship).');
        reasonsHi.push('आपने अपने वर्तमान मतदाता विवरण (नाम, जन्मतिथि, या संबंध) में विसंगति का संकेत दिया है।');
      }
      if (input.needsReplacementEpic) {
        reasonsEn.push('You requested a replacement EPIC card without change of entries.');
        reasonsHi.push('आपने बिना प्रविष्टि परिवर्तन के प्रतिस्थापन ईपीआईसी कार्ड का अनुरोध किया है।');
      }
      if (input.needsPwdMarking) {
        reasonsEn.push('You requested marking as a Person with Disability (PwD) for accessible voting facilitation.');
        reasonsHi.push('आपने सुगम मतदान सुविधा हेतु दिव्यांगजन (PwD) के रूप में चिन्हांकन का अनुरोध किया है।');
      }

      return {
        recommendedForm: FormCode.FORM_8,
        formNameEn: 'Form 8 (Correction of Entries / Replacement / PwD)',
        formNameHi: 'प्रारूप 8 (प्रविष्टियों में सुधार / प्रतिस्थापन / दिव्यांगजन चिन्हांकन)',
        reasonsEn,
        reasonsHi,
        statutoryBasisEn: 'Registration of Electors Rules 1960, Rule 13(1) & 26.',
        statutoryBasisHi: 'निर्वाचक रजिस्ट्रीकरण नियम 1960, नियम 13(1) एवं 26।',
        officialSourceUrl: guidance.sourceUrl,
        verifiedOn: guidance.verifiedOn,
        caveatEn: 'If your situation does not match, contact your Electoral Registration Officer (ERO) or dial 1950.',
        caveatHi: 'यदि आपकी स्थिति मेल नहीं खाती है, तो अपने निर्वाचक पंजीकरण अधिकारी (ईआरओ) से संपर्क करें या 1950 डायल करें।',
        documentChecklistIds: ['doc-age-proof', 'doc-address-proof'],
      };
    }

    // 4. Suspects duplicate record (own situation)
    if (input.suspectsDuplicateRecord) {
      const guidance = this.items.get('guidance-form-7-v2026')!;
      return {
        recommendedForm: FormCode.FORM_7,
        formNameEn: 'Form 7 (Application for Deletion of Superfluous/Outdated Entry)',
        formNameHi: 'प्रारूप 7 (अनावश्यक या पुराने रिकॉर्ड को हटाने हेतु आवेदन)',
        reasonsEn: [
          'You indicated that you may have an outdated or redundant electoral registration from a prior address.',
          'Section 17 of RPA 1950 prohibits enrollment in more than one constituency. Form 7 is submitted to delete the outdated entry.',
        ],
        reasonsHi: [
          'आपने संकेत दिया है कि पुराने पते से आपका पुराना या अतिरिक्त पंजीकरण अभी भी मौजूद हो सकता है।',
          'आरपीए 1950 की धारा 17 एक से अधिक स्थानों पर पंजीकरण को प्रतिबंधित करती है। पुराना नाम हटाने के लिए प्रारूप 7 उपयोग किया जाता है।',
        ],
        statutoryBasisEn: 'Representation of the People Act 1950, Section 17 & 18; Registration of Electors Rules 1960, Rule 13(2).',
        statutoryBasisHi: 'लोक प्रतिनिधित्व अधिनियम 1950, धारा 17 व 18; निर्वाचक रजिस्ट्रीकरण नियम 1960, नियम 13(2)।',
        officialSourceUrl: guidance.sourceUrl,
        verifiedOn: guidance.verifiedOn,
        caveatEn: 'Verify your current valid registration before requesting deletion of any record.',
        caveatHi: 'किसी भी रिकॉर्ड को हटाने का अनुरोध करने से पहले अपने वर्तमान वैध पंजीकरण की पुष्टि करें।',
        documentChecklistIds: ['doc-address-proof'],
      };
    }

    // 5. Default / New registration or Re-inclusion after omission
    const form6Guidance = this.items.get('guidance-form-6-v2026')!;
    const isNewRegistration = input.hasPreviousRegistration === 'NO';
    return {
      recommendedForm: FormCode.FORM_6,
      formNameEn: isNewRegistration
        ? 'Form 6 (Application for New Voter Registration)'
        : 'Form 6 (Application for Re-Inclusion in Electoral Roll)',
      formNameHi: isNewRegistration
        ? 'प्रारूप 6 (नए मतदाता पंजीकरण हेतु आवेदन)'
        : 'प्रारूप 6 (मतदाता सूची में पुनः समावेशन हेतु आवेदन)',
      reasonsEn: isNewRegistration
        ? [
            'You are registering as a voter for the first time.',
            'Form 6 is the statutory form under Rule 13(1) of Registration of Electors Rules 1960 for first-time inclusion.',
          ]
        : [
            'Your name was not found in the official electoral roll search, or has been omitted.',
            'Form 6 is submitted during the claims and objections period for re-inclusion of omitted eligible electors.',
          ],
      reasonsHi: isNewRegistration
        ? [
            'आप पहली बार मतदाता के रूप में पंजीकरण कर रहे हैं।',
            'प्रारूप 6 पहली बार नाम जुड़वाने के लिए वैधानिक आवेदन है।',
          ]
        : [
            'आधिकारिक खोज में आपका नाम नहीं मिला या सूची से छूट गया था।',
            'पात्र मतदाताओं के पुनः समावेशन के लिए प्रारूप 6 प्रस्तुत किया जाता है।',
          ],
      statutoryBasisEn: 'Registration of Electors Rules 1960, Rule 13(1) and Rule 26.',
      statutoryBasisHi: 'निर्वाचक रजिस्ट्रीकरण नियम 1960, नियम 13(1) और नियम 26।',
      officialSourceUrl: form6Guidance.sourceUrl,
      verifiedOn: form6Guidance.verifiedOn,
      caveatEn: 'If your situation does not match, contact your Electoral Registration Officer (ERO) or dial 1950.',
      caveatHi: 'यदि आपकी स्थिति मेल नहीं खाती है, तो अपने निर्वाचक पंजीकरण अधिकारी (ईआरओ) से संपर्क करें या 1950 डायल करें।',
      documentChecklistIds: ['doc-age-proof', 'doc-address-proof'],
    };
  }

  /**
   * Deadlines Card Lookup:
   * Returns deadlines ONLY from verified, in-effect schedule entries for the state.
   * If unverified or unavailable, returns explicit instruction to check State CEO website.
   */
  public getStateDeadline(stateCode: string): {
    hasVerifiedSchedule: boolean;
    schedule?: StateSchedule;
    fallbackUrl?: string;
    messageEn: string;
    messageHi: string;
  } {
    const found = Array.from(this.schedules.values()).find(
      (s) => s.stateCode.toUpperCase() === stateCode.toUpperCase()
    );

    if (found && !found.requiresVerification && found.verifiedOn) {
      return {
        hasVerifiedSchedule: true,
        schedule: found,
        messageEn: `Claims and Objections period is open until ${found.claimsAndObjectionsEnd}.`,
        messageHi: `दावे और आपत्तियां दर्ज कराने की अवधि ${found.claimsAndObjectionsEnd} तक खुली है।`,
      };
    }

    return {
      hasVerifiedSchedule: false,
      fallbackUrl: found?.sourceUrl ?? 'https://voters.eci.gov.in',
      messageEn: 'Official schedule for your state is pending verification. Please check your State CEO website directly.',
      messageHi: 'आपके राज्य की आधिकारिक समय-सारणी का सत्यापन लंबित है। कृपया सीधे अपने राज्य के मुख्य निर्वाचन अधिकारी की वेबसाइट देखें।',
    };
  }

  public getAllGuidanceItems(): GuidanceItem[] {
    return Array.from(this.items.values());
  }

  public getDocumentRequirements(): typeof DOCUMENT_CHECKLIST_SEEDS {
    return DOCUMENT_CHECKLIST_SEEDS;
  }
}
