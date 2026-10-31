import { describe, it, expect } from 'vitest';
import { FormCode } from '@matdata-setu/shared';
import { GuidanceEngine } from '../index.js';

describe('Guidance Engine Unit Tests', () => {
  const engine = new GuidanceEngine();

  describe('Form Recommender Decision Tree', () => {
    it('recommends Form 6 for first-time voter registration', () => {
      const result = engine.recommendForm({
        hasPreviousRegistration: 'NO',
        hasEpicCard: 'NO',
        isShiftingResidence: 'NO',
        hasNameOrParticularsCorrection: false,
        needsReplacementEpic: false,
        needsPwdMarking: false,
        isOverseasCitizen: false,
        suspectsDuplicateRecord: false,
      });

      expect(result.recommendedForm).toBe(FormCode.FORM_6);
      expect(result.formNameEn).toContain('Form 6');
      expect(result.documentChecklistIds).toContain('doc-age-proof');
      expect(result.caveatEn).toContain('Electoral Registration Officer');
    });

    it('recommends Form 6A for Indian citizens residing abroad (NRIs)', () => {
      const result = engine.recommendForm({
        hasPreviousRegistration: 'NOT_SURE',
        hasEpicCard: 'NO',
        isShiftingResidence: 'NO',
        hasNameOrParticularsCorrection: false,
        needsReplacementEpic: false,
        needsPwdMarking: false,
        isOverseasCitizen: true,
        suspectsDuplicateRecord: false,
      });

      expect(result.recommendedForm).toBe(FormCode.FORM_6A);
      expect(result.reasonsEn[0]).toContain('Indian citizen residing outside India');
    });

    it('recommends Form 8 for shifting of residence', () => {
      const result = engine.recommendForm({
        hasPreviousRegistration: 'YES',
        hasEpicCard: 'YES',
        isShiftingResidence: 'ACROSS_CONSTITUENCY',
        hasNameOrParticularsCorrection: false,
        needsReplacementEpic: false,
        needsPwdMarking: false,
        isOverseasCitizen: false,
        suspectsDuplicateRecord: false,
      });

      expect(result.recommendedForm).toBe(FormCode.FORM_8);
      expect(result.reasonsEn[0]).toContain('new Assembly Constituency');
    });

    it('recommends Form 8 for corrections and PwD marking', () => {
      const result = engine.recommendForm({
        hasPreviousRegistration: 'YES',
        hasEpicCard: 'YES',
        isShiftingResidence: 'NO',
        hasNameOrParticularsCorrection: true,
        needsReplacementEpic: false,
        needsPwdMarking: true,
        isOverseasCitizen: false,
        suspectsDuplicateRecord: false,
      });

      expect(result.recommendedForm).toBe(FormCode.FORM_8);
      expect(result.reasonsEn).toEqual(
        expect.arrayContaining([
          expect.stringContaining('discrepancies in your existing electoral roll details'),
          expect.stringContaining('marking as a Person with Disability'),
        ])
      );
    });

    it('recommends Form 7 for deleting outdated prior registration in duplicate self-check', () => {
      const result = engine.recommendForm({
        hasPreviousRegistration: 'YES',
        hasEpicCard: 'YES',
        isShiftingResidence: 'NO',
        hasNameOrParticularsCorrection: false,
        needsReplacementEpic: false,
        needsPwdMarking: false,
        isOverseasCitizen: false,
        suspectsDuplicateRecord: true,
      });

      expect(result.recommendedForm).toBe(FormCode.FORM_7);
      expect(result.statutoryBasisEn).toContain('Section 17 & 18');
    });
  });

  describe('Deadlines & Schedule Lookup', () => {
    it('returns verified dates for verified state schedule (Delhi DL)', () => {
      const deadline = engine.getStateDeadline('DL');
      expect(deadline.hasVerifiedSchedule).toBe(true);
      expect(deadline.schedule?.claimsAndObjectionsEnd).toBe('2025-11-28');
    });

    it('returns fallback and guidance when state schedule is unverified (Bihar BR)', () => {
      const deadline = engine.getStateDeadline('BR');
      expect(deadline.hasVerifiedSchedule).toBe(false);
      expect(deadline.messageEn).toContain('pending verification');
      expect(deadline.fallbackUrl).toContain('ceobihar.nic.in');
    });
  });

  describe('Guidance Integrity Verification', () => {
    it('detects unverified state schedule item in seeds', () => {
      const check = engine.verifyGuidanceIntegrity();
      // Bihar schedule is seeded with requiresVerification=true and verifiedOn=null
      expect(check.valid).toBe(false);
      expect(check.unverifiedItems.some((i) => i.includes('Bihar'))).toBe(true);
    });
  });
});
