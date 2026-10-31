import { describe, it, expect } from 'vitest';
import {
  generatePublicCaseRef,
  validateCaseRef,
  OfficialProcessStage,
  PortalCaseStatus,
  canTransitionPortalCase,
  canSetOfficialStage,
  can,
  checkForBannedTerms,
  StaffRole,
  UserRegistrationSchema,
  UserLoginSchema,
} from '../index.js';

describe('Shared Package Unit Tests', () => {
  describe('Crockford Base32 Case Reference Generator', () => {
    it('generates a valid MS-2026-XXXXXXXX reference with check symbol', () => {
      const ref = generatePublicCaseRef(2026);
      expect(ref).toMatch(/^MS-2026-[0-9A-HJKMNP-Z]{7}[0-9A-HJKMNP-Z*~$=U]$/);
      expect(validateCaseRef(ref)).toBe(true);
    });

    it('rejects tampered case references', () => {
      const validRef = generatePublicCaseRef(2026);
      // Tamper one character
      const tampered = validRef.slice(0, 10) + (validRef[10] === 'A' ? 'B' : 'A') + validRef.slice(11);
      expect(validateCaseRef(tampered)).toBe(false);
    });
  });

  describe('Portal Case Workflow State Machine', () => {
    it('allows citizen to transition from DRAFT to SUBMITTED_TO_PORTAL', () => {
      expect(canTransitionPortalCase(PortalCaseStatus.DRAFT, PortalCaseStatus.SUBMITTED_TO_PORTAL, 'CITIZEN')).toBe(true);
    });

    it('rejects citizen attempting to mark case as OUTCOME_RECEIVED or OFFICIAL_SUBMISSION_INDEPENDENTLY_CONFIRMED', () => {
      expect(canTransitionPortalCase(PortalCaseStatus.UNDER_REVIEW, PortalCaseStatus.OUTCOME_RECEIVED, 'CITIZEN')).toBe(false);
    });

    it('allows reviewer to move from SUBMITTED_TO_PORTAL to UNDER_REVIEW', () => {
      expect(canTransitionPortalCase(PortalCaseStatus.SUBMITTED_TO_PORTAL, PortalCaseStatus.UNDER_REVIEW, StaffRole.CASE_REVIEWER)).toBe(true);
    });
  });

  describe('Official Process Stage Guards', () => {
    it('allows citizen to submit user-reported submission (Stage 5)', () => {
      const result = canSetOfficialStage(OfficialProcessStage.STAGE_5_SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED, 'CITIZEN', false);
      expect(result.allowed).toBe(true);
    });

    it('strictly forbids citizen from setting Stages 6, 7, and 8', () => {
      const r6 = canSetOfficialStage(OfficialProcessStage.STAGE_6_OFFICIAL_SUBMISSION_CONFIRMED, 'CITIZEN', false);
      expect(r6.allowed).toBe(false);

      const r7 = canSetOfficialStage(OfficialProcessStage.STAGE_7_OFFICIAL_DECISION_RECEIVED, 'CITIZEN', false);
      expect(r7.allowed).toBe(false);

      const r8 = canSetOfficialStage(OfficialProcessStage.STAGE_8_ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED, 'CITIZEN', false);
      expect(r8.allowed).toBe(false);
    });

    it('requires documentary evidence and provenance for reviewer to set Stages 6-8', () => {
      const noEvidence = canSetOfficialStage(OfficialProcessStage.STAGE_6_OFFICIAL_SUBMISSION_CONFIRMED, StaffRole.CASE_REVIEWER, false);
      expect(noEvidence.allowed).toBe(false);
      expect(noEvidence.reason).toContain('documentary evidence');

      const withEvidence = canSetOfficialStage(OfficialProcessStage.STAGE_6_OFFICIAL_SUBMISSION_CONFIRMED, StaffRole.CASE_REVIEWER, true);
      expect(withEvidence.allowed).toBe(true);
    });
  });

  describe('Central Policy Module can()', () => {
    it('denies anonymous access to sensitive resources', () => {
      expect(can({ role: 'ANONYMOUS' }, 'read', 'case')).toBe(false);
      expect(can({ role: 'ANONYMOUS' }, 'delete', 'user_profile')).toBe(false);
      // Allows public guidance reading
      expect(can({ role: 'ANONYMOUS' }, 'read', 'guidance')).toBe(true);
    });

    it('restricts citizens to their own cases and documents', () => {
      expect(can({ role: 'CITIZEN' }, 'read', 'case', { isOwnData: true })).toBe(true);
      expect(can({ role: 'CITIZEN' }, 'read', 'case', { isOwnData: false })).toBe(false);
    });

    it('requires typed reason for staff unmasking PII', () => {
      expect(can({ role: StaffRole.CASE_REVIEWER }, 'unmask_pii', 'case', { unmaskReasonProvided: false })).toBe(false);
      expect(can({ role: StaffRole.CASE_REVIEWER }, 'unmask_pii', 'case', { unmaskReasonProvided: true })).toBe(true);
    });

    it('requires second platform admin approval for role management', () => {
      expect(can({ role: StaffRole.PLATFORM_ADMIN }, 'manage_roles', 'staff_account', { hasSecondApproval: false })).toBe(false);
      expect(can({ role: StaffRole.PLATFORM_ADMIN }, 'manage_roles', 'staff_account', { hasSecondApproval: true })).toBe(true);
    });
  });

  describe('Prejudicial / Accusatory Vocabulary Filter', () => {
    it('flags banned words such as "fraud", "fake", "ghost voter"', () => {
      expect(checkForBannedTerms('Detected suspected fraud voter').hasBannedTerms).toBe(true);
      expect(checkForBannedTerms('Identified potential discrepancy in records').hasBannedTerms).toBe(false);
    });
  });

  describe('Authentication Schemas & Aadhaar Collection Prohibition', () => {
    it('accepts registration with email, password, and optional EPIC voter ID', () => {
      const parsed = UserRegistrationSchema.safeParse({
        email: 'voter@example.org',
        password: 'ValidPassword123!',
        epicNumber: 'ABC1234567',
        ageConfirmed18Plus: true,
        consentNoticeVersion: '2026.1',
      });
      expect(parsed.success).toBe(true);
    });

    it('accepts registration with mobile phone', () => {
      const parsed = UserRegistrationSchema.safeParse({
        phone: '+919876543210',
        ageConfirmed18Plus: true,
        consentNoticeVersion: '2026.1',
      });
      expect(parsed.success).toBe(true);
    });

    it('strictly rejects any submission containing an Aadhaar number', () => {
      const parsedReg = UserRegistrationSchema.safeParse({
        email: 'voter@example.org',
        password: 'ValidPassword123!',
        ageConfirmed18Plus: true,
        consentNoticeVersion: '2026.1',
        aadhaar: '123456789012',
      });
      expect(parsedReg.success).toBe(false);
      if (!parsedReg.success) {
        expect(parsedReg.error.errors[0]?.message).toContain('Aadhaar numbers are strictly never collected');
      }

      const parsedLogin = UserLoginSchema.safeParse({
        email: 'voter@example.org',
        password: 'ValidPassword123!',
        aadhaar: '123456789012',
      });
      expect(parsedLogin.success).toBe(false);
      if (!parsedLogin.success) {
        expect(parsedLogin.error.errors[0]?.message).toContain('Aadhaar login is not permitted');
      }
    });
  });
});
