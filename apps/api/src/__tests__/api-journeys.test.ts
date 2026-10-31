import { describe, it, expect, beforeAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import {
  StatusCheckOutcome,
  OfficialProcessStage,
  PortalCaseStatus,
  StaffRole,
  validateCaseRef,
} from '@matdata-setu/shared';
import { buildApp } from '../app.js';

describe('End-to-End API Functional & Security Journeys', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    const context = await buildApp();
    app = context.app;
    await app.ready();
  });

  describe('Journey 1: Citizen Registration, Consent & Sign-In', () => {
    it('registers a new adult citizen with age confirmation and consent', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'citizen.test@domain.org',
          password: 'SecurePassword123!',
          ageConfirmed18Plus: true,
          locale: 'en',
          consentNoticeVersion: '2026.1',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data.userId).toBeDefined();
      expect(body.data.emailMasked).toContain('ci***');
    });

    it('rejects registration if 18+ age confirmation is missing', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'minor@domain.org',
          password: 'SecurePassword123!',
          ageConfirmed18Plus: false,
          locale: 'en',
          consentNoticeVersion: '2026.1',
        },
      });

      expect(res.statusCode).toBe(400);
      expect(res.json().error.code).toBe('INVALID_INPUT');
    });

    it('signs in with valid credentials and receives session token', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'citizen.test@domain.org',
          password: 'SecurePassword123!',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.token).toBeDefined();
    });

    it('sends mobile OTP to citizen phone number', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/otp/send',
        payload: {
          phone: '+919876543210',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.phoneMasked).toContain('+91*****210');
      expect(body.data.demoNotice).toContain('123456');
    });

    it('authenticates and creates an account using phone OTP and optional EPIC voter ID', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/otp/verify',
        payload: {
          phone: '+919876543210',
          otp: '123456',
          ageConfirmed18Plus: true,
          epicNumber: 'XYZ9876543',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.userId).toBeDefined();
      expect(body.data.token).toBeDefined();
    });

    it('strictly rejects registration or login attempts that submit an Aadhaar number, citing legal prohibition', async () => {
      // Registration with Aadhaar attempted
      const regRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'aadhaar.test@domain.org',
          password: 'SecurePassword123!',
          ageConfirmed18Plus: true,
          consentNoticeVersion: '2026.1',
          aadhaar: '987654321098',
        },
      });

      expect(regRes.statusCode).toBe(400);
      expect(regRes.json().error.message).toContain('Aadhaar numbers are strictly never collected');

      // Login with Aadhaar attempted
      const loginRes = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'aadhaar.test@domain.org',
          password: 'SecurePassword123!',
          aadhaar: '987654321098',
        },
      });

      expect(loginRes.statusCode).toBe(400);
      expect(loginRes.json().error.message).toContain('Aadhaar login is not permitted');
    });
  });

  describe('Journey 2: Recording Official Voter Search Outcome', () => {
    it('records a user-observed official status check with the allowed outcomes', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/status-checks',
        headers: {
          'x-user-id': 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        payload: {
          officialSourceId: 'link-eci-voter-search',
          checkedAt: new Date().toISOString(),
          outcome: StatusCheckOutcome.NOT_FOUND_IN_CHECKED_SEARCH,
          notes: 'Searched using details in AC-40; name not listed in draft roll.',
          state: 'Delhi',
          ac: 'AC-40',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(body.data.record.outcome).toBe(StatusCheckOutcome.NOT_FOUND_IN_CHECKED_SEARCH);
      expect(body.data.provenanceChip.sourceType).toBe('USER_RECORDED_OFFICIAL_LOOKUP');
    });
  });

  describe('Journey 3: Missing Name Wizard & Case Creation with PDF Prep Sheet', () => {
    it('creates an assistance case with Crockford Base32 ref and statutory Form 6 recommendation', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/cases',
        headers: {
          'x-user-id': 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
          'idempotency-key': 'idem-test-case-001',
        },
        payload: {
          category: 'MISSING_NAME',
          recommendedFormCode: 'FORM_6',
          guidanceVersionIds: ['guidance-form-6-v2026'],
          answers: [
            { questionId: 'prior_registration', answer: 'NO', guidanceVersion: '2026.2' },
            { questionId: 'has_epic', answer: 'NO', guidanceVersion: '2026.2' },
          ],
          state: 'Delhi',
          district: 'New Delhi',
          assemblyConstituency: 'AC-40 (New Delhi)',
          nameAsReported: 'Aarav Sharma',
          dobYear: 2004,
          addressSummary: '15 Barakhamba Road, New Delhi',
        },
      });

      expect(res.statusCode).toBe(201);
      const body = res.json();
      expect(validateCaseRef(body.data.publicRef)).toBe(true);
      expect(body.data.publicRef).toMatch(/^MS-2026-[0-9A-HJKMNP-Z]{7}[0-9A-HJKMNP-Z*~$=U]$/);
      expect(body.data.recommendation.recommendedForm).toBe('FORM_6');
      expect(body.data.preparationSheet.disclaimer).toContain('NOT AN OFFICIAL FORM');

      // Idempotency check: Repeat identical request returns identical result
      const duplicateRes = await app.inject({
        method: 'POST',
        url: '/api/v1/cases',
        headers: {
          'x-user-id': 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
          'idempotency-key': 'idem-test-case-001',
        },
        payload: {
          category: 'MISSING_NAME',
          recommendedFormCode: 'FORM_6',
          guidanceVersionIds: ['guidance-form-6-v2026'],
          answers: [],
          state: 'Delhi',
          nameAsReported: 'Aarav Sharma',
        },
      });

      expect(duplicateRes.statusCode).toBe(200);
      expect(duplicateRes.json().data.publicRef).toBe(body.data.publicRef);
    });
  });

  describe('Journey 4: Document Upload with Magic Bytes and Signed URL Download', () => {
    it('accepts valid PDF upload, scans it, and generates 60s signed download link', async () => {
      // Valid PDF Header (%PDF-1.4...)
      const pdfHeader = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');
      const base64Pdf = pdfHeader.toString('base64');

      const uploadRes = await app.inject({
        method: 'POST',
        url: '/api/v1/documents/upload',
        headers: {
          'x-user-id': 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        payload: {
          fileName: 'proof_of_age.pdf',
          docType: 'AGE_PROOF',
          fileBase64: base64Pdf,
        },
      });

      expect(uploadRes.statusCode).toBe(201);
      const uploadBody = uploadRes.json();
      const docId = uploadBody.data.document.id;
      expect(docId).toBeDefined();

      // Request short-lived signed URL
      const urlRes = await app.inject({
        method: 'GET',
        url: `/api/v1/documents/${docId}/signed-url`,
        headers: {
          'x-user-id': 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
      });

      expect(urlRes.statusCode).toBe(200);
      const signedBody = urlRes.json();
      expect(signedBody.data.expiresInSeconds).toBe(60);

      // Download using the signed token
      const downloadRes = await app.inject({
        method: 'GET',
        url: signedBody.data.downloadUrl,
      });

      expect(downloadRes.statusCode).toBe(200);
      expect(downloadRes.headers['x-content-type-options']).toBe('nosniff');
      expect(downloadRes.headers['content-disposition']).toContain('attachment');
    });

    it('rejects disguised executable spoofed as PDF', async () => {
      // Windows PE executable header (MZ...) disguised with .pdf filename
      const exeHeader = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00');
      const base64Exe = exeHeader.toString('base64');

      const uploadRes = await app.inject({
        method: 'POST',
        url: '/api/v1/documents/upload',
        headers: {
          'x-user-id': 'synth-citizen-aarav-01',
          'x-actor-role': 'CITIZEN',
        },
        payload: {
          fileName: 'malicious.pdf',
          docType: 'AGE_PROOF',
          fileBase64: base64Exe,
        },
      });

      expect(uploadRes.statusCode).toBe(400);
      expect(uploadRes.json().error.code).toBe('UPLOAD_FAILED');
      expect(uploadRes.json().error.message).toContain('Unsupported or spoofed');
    });
  });

  describe('Journey 5: Official Submission & State Machine Guards', () => {
    it('allows citizen to report submission to official authorities (moves to Stage 5)', async () => {
      const casesRes = await app.inject({
        method: 'GET',
        url: '/api/v1/cases',
        headers: { 'x-user-id': 'synth-citizen-priya-02', 'x-actor-role': 'CITIZEN' },
      });

      const priyaCase = casesRes.json().data[0];
      expect(priyaCase).toBeDefined();

      const reportRes = await app.inject({
        method: 'POST',
        url: `/api/v1/cases/${priyaCase.publicRef}/report-submission`,
        headers: { 'x-user-id': 'synth-citizen-priya-02', 'x-actor-role': 'CITIZEN' },
        payload: {
          channel: 'ECI_VOTERS_PORTAL',
          acknowledgementRef: 'UP2026-ACK-98765',
          notes: 'Submitted online Form 6 on official portal.',
        },
      });

      expect(reportRes.statusCode).toBe(200);
      const updated = reportRes.json().data.case;
      expect(updated.officialStage).toBe(OfficialProcessStage.STAGE_5_SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED);
      expect(updated.workflowStatus).toBe(PortalCaseStatus.OFFICIAL_SUBMISSION_REPORTED_BY_USER);
    });

    it('strictly forbids citizen or unauthorized role from setting Stages 6 to 8', async () => {
      const casesRes = await app.inject({
        method: 'GET',
        url: '/api/v1/cases',
        headers: { 'x-user-id': 'synth-citizen-priya-02', 'x-actor-role': 'CITIZEN' },
      });
      const priyaCase = casesRes.json().data[0];

      const illegalRes = await app.inject({
        method: 'POST',
        url: `/api/v1/cases/${priyaCase.publicRef}/transition`,
        headers: { 'x-user-id': 'synth-citizen-priya-02', 'x-actor-role': 'CITIZEN' },
        payload: {
          targetOfficialStage: OfficialProcessStage.STAGE_8_ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED,
        },
      });

      expect(illegalRes.statusCode).toBe(403);
      expect(illegalRes.json().error.code).toBe('STAGE_GUARD_REJECTED');
    });
  });

  describe('Journey 6: Deceased Person Reporting Anti-Weaponization Rate Limits', () => {
    it('enforces maximum 3 third-party reports per 30 days per account', async () => {
      const reporterId = 'rate-limit-test-reporter-01';

      for (let i = 1; i <= 3; i++) {
        const res = await app.inject({
          method: 'POST',
          url: '/api/v1/deceased-reports',
          headers: { 'x-user-id': reporterId, 'x-actor-role': 'CITIZEN' },
          payload: {
            reportedPersonName: `Person ${i} (SYNTHETIC)`,
            state: 'Delhi',
            locality: 'Karol Bagh',
            basis: 'NEIGHBOUR',
            basisExplanation: `Documented neighbour notification for elector ${i}.`,
          },
        });
        expect(res.statusCode).toBe(201);
      }

      // 4th report within 30 days must be blocked
      const fourthRes = await app.inject({
        method: 'POST',
        url: '/api/v1/deceased-reports',
        headers: { 'x-user-id': reporterId, 'x-actor-role': 'CITIZEN' },
        payload: {
          reportedPersonName: 'Person 4 (SYNTHETIC)',
          state: 'Delhi',
          locality: 'Karol Bagh',
          basis: 'NEIGHBOUR',
          basisExplanation: 'Excess fourth report attempting bulk reporting.',
        },
      });

      expect(fourthRes.statusCode).toBe(429);
      expect(fourthRes.json().error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(fourthRes.json().error.message).toContain('maximum 3 reports');
    });
  });

  describe('Journey 7: Cryptographic Audit Hash-Chain Verification', () => {
    it('verifies that the audit hash chain is intact and untampered', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/admin/audit/verify',
        headers: { 'x-user-id': 'admin-01', 'x-actor-role': StaffRole.PLATFORM_ADMIN },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.data.verified).toBe(true);
      expect(body.data.totalEvents).toBeGreaterThan(0);
    });
  });
});
