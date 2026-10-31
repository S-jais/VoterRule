import { z } from 'zod';
import {
  CaseCategory,
  DeceasedBasis,
  DocumentScanStatus,
  DocumentType,
  DuplicateReasonCode,
  DuplicateReviewState,
  FormCode,
  ProvenanceSourceType,
  SimilarityCategory,
  StatusCheckOutcome,
} from './enums.js';

// API Response Envelope
export const ApiMetaSchema = z.object({
  requestId: z.string(),
  timestamp: z.string().datetime(),
  version: z.string().default('v1'),
  cursor: z.string().optional(),
  hasMore: z.boolean().optional(),
});

export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
  requestId: z.string(),
});

export function apiEnvelopeSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: dataSchema.optional(),
    error: ApiErrorSchema.optional(),
    meta: ApiMetaSchema,
  });
}

// User & Consent
export const UserRegistrationSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format (e.g. +919876543210 or 9876543210)').optional(),
    password: z.string().min(10, 'Password must be at least 10 characters').optional(),
    epicNumber: z
      .string()
      .regex(/^[A-Z]{3}[0-9]{7}$/i, 'EPIC (Voter ID) must be 3 letters followed by 7 digits (e.g. ABC1234567)')
      .optional()
      .or(z.literal('')),
    aadhaar: z
      .string()
      .optional()
      .refine((val) => !val || !val.trim(), {
        message:
          'Aadhaar numbers are strictly never collected or accepted on VoterRule in compliance with the Supreme Court Puttaswamy ruling, the Aadhaar Act, and the DPDP Act. Please use your Voter ID (EPIC) or mobile number.',
      }),
    ageConfirmed18Plus: z.literal(true, {
      errorMap: () => ({ message: 'You must confirm you are at least 18 years old to create an account' }),
    }),
    locale: z.enum(['en', 'hi']).default('en'),
    consentNoticeVersion: z.string().min(1),
  })
  .refine(
    (data) => (data.email && data.password) || data.phone,
    {
      message: 'Either email with password or a valid mobile number is required for registration',
    }
  );

export const UserLoginSchema = z
  .object({
    email: z.string().email().optional(),
    phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format').optional(),
    password: z.string().min(1).optional(),
    otp: z.string().length(6, 'OTP must be 6 digits').optional(),
    aadhaar: z
      .string()
      .optional()
      .refine((val) => !val || !val.trim(), {
        message:
          'Aadhaar login is not permitted on non-governmental civic platforms under the Aadhaar Act and Supreme Court rulings. Please sign in using your Email, Mobile OTP, or linked Voter ID (EPIC).',
      }),
  })
  .refine(
    (data) => (data.email && data.password) || (data.phone && data.otp),
    {
      message: 'Provide email and password, or mobile number and OTP',
    }
  );

export const SendOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format (e.g. +919876543210 or 9876543210)'),
  aadhaar: z
    .string()
    .optional()
    .refine((val) => !val || !val.trim(), {
      message:
        'Aadhaar numbers are never collected on VoterRule under Indian privacy regulations. Use your mobile number instead.',
    }),
});

export const VerifyOtpSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  ageConfirmed18Plus: z.boolean().optional(),
  consentNoticeVersion: z.string().optional(),
  epicNumber: z
    .string()
    .regex(/^[A-Z]{3}[0-9]{7}$/i, 'EPIC (Voter ID) must be 3 letters followed by 7 digits (e.g. ABC1234567)')
    .optional()
    .or(z.literal('')),
});

export const UserProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  state: z.string().min(2).max(50).optional(),
  district: z.string().min(2).max(100).optional(),
  assemblyConstituency: z.string().min(1).max(100).optional(),
  preferredLanguage: z.enum(['en', 'hi']).default('en'),
});

// Assertion Schema (Provenance on every material claim)
export const AssertionSchema = z.object({
  id: z.string().uuid(),
  subjectType: z.enum(['USER', 'CASE', 'ELECTORAL_RECORD']),
  subjectId: z.string(),
  predicate: z.string(), // e.g. 'EPIC_NUMBER', 'INCLUSION_STATUS', 'RESIDENCE_ADDRESS'
  valueMasked: z.string(),
  sourceType: z.nativeEnum(ProvenanceSourceType),
  sourceRef: z.string().optional(), // link or document id
  obtainedAt: z.string().datetime(),
  recordedBy: z.string(),
  verifiedBy: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
  evidenceIds: z.array(z.string()).default([]),
  staleAfter: z.string().datetime(),
  supersedesId: z.string().optional(),
});

// Status Check Record
export const StatusCheckInputSchema = z.object({
  officialSourceId: z.string(),
  checkedAt: z.string().datetime(),
  outcome: z.nativeEnum(StatusCheckOutcome),
  notes: z.string().max(500).optional(),
  epicNumberMasked: z.string().regex(/^[A-Z]{3}[0-9]{7}$|^[A-Z0-9\/\-]{5,16}$/i).optional(),
  state: z.string().min(2).optional(),
  ac: z.string().optional(),
});

// Case Creation & Intake
export const CaseIntakeAnswerSchema = z.object({
  questionId: z.string(),
  answer: z.union([z.string(), z.array(z.string()), z.boolean()]),
  guidanceVersion: z.string(),
});

export const CreateCaseSchema = z.object({
  category: z.nativeEnum(CaseCategory),
  recommendedFormCode: z.nativeEnum(FormCode),
  guidanceVersionIds: z.array(z.string()).min(1),
  answers: z.array(CaseIntakeAnswerSchema),
  epicNumberProvided: z.string().optional(),
  state: z.string().min(2),
  district: z.string().optional(),
  assemblyConstituency: z.string().optional(),
  partNumber: z.string().optional(),
  nameAsReported: z.string().min(1).max(150),
  relativeName: z.string().max(150).optional(),
  dobYear: z.number().int().min(1900).max(2010).optional(),
  addressSummary: z.string().max(500).optional(),
  previousAddressSummary: z.string().max(500).optional(),
  officialCheckOutcome: z.nativeEnum(StatusCheckOutcome).optional(),
});

// Case Document Metadata
export const CaseDocumentSchema = z.object({
  id: z.string().uuid(),
  caseId: z.string().uuid(),
  docType: z.nativeEnum(DocumentType),
  originalNameMasked: z.string(),
  detectedMime: z.enum(['application/pdf', 'image/jpeg', 'image/png']),
  sizeBytes: z.number().int().max(5 * 1024 * 1024),
  sha256: z.string().length(64),
  scanStatus: z.nativeEnum(DocumentScanStatus),
  uploadedBy: z.string(),
  retentionUntil: z.string().datetime(),
  createdAt: z.string().datetime(),
});

// Official Submission Report (User-Reported)
export const ReportOfficialSubmissionSchema = z.object({
  caseId: z.string().uuid(),
  channel: z.enum(['ECI_VOTERS_PORTAL', 'VOTER_HELPLINE_APP', 'BLO_DIRECT', 'ERO_OFFICE']),
  acknowledgementRef: z.string().max(100).optional(),
  submittedDate: z.string().datetime(),
  evidenceDocumentId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
});

// Deceased Person Report (Third-Party Reporting Safeguards)
export const DeceasedReportInputSchema = z.object({
  reportedPersonName: z.string().min(2).max(150),
  relativeName: z.string().max(150).optional(),
  approxAge: z.number().int().min(18).max(130).optional(),
  state: z.string().min(2),
  district: z.string().optional(),
  assemblyConstituency: z.string().optional(),
  locality: z.string().min(2).max(200),
  basis: z.nativeEnum(DeceasedBasis),
  basisExplanation: z.string().min(10).max(1000),
  optionalEpicMasked: z.string().optional(),
});

// Duplicate Candidate Review
export const DuplicateCandidateSchema = z.object({
  id: z.string().uuid(),
  subjectARef: z.string(),
  subjectBRef: z.string(),
  similarityCategory: z.nativeEnum(SimilarityCategory),
  reasonCodes: z.array(z.nativeEnum(DuplicateReasonCode)),
  score: z.number().min(0).max(100),
  algorithmVersion: z.string(),
  state: z.nativeEnum(DuplicateReviewState),
  createdAt: z.string().datetime(),
});

export const DuplicateReviewDecisionSchema = z.object({
  decision: z.nativeEnum(DuplicateReviewState),
  reasonText: z.string().min(10, 'A clear documented reason is required'),
  unmaskReasonProvided: z.string().optional(),
});

// Audit Event Schema (Append-only hash chained)
export const AuditEventSchema = z.object({
  id: z.string().uuid(),
  actor: z.string(),
  action: z.string(),
  resourceType: z.string(),
  resourceRef: z.string(),
  reason: z.string().optional(),
  ipHash: z.string(),
  uaHash: z.string(),
  prevHash: z.string(),
  hash: z.string(),
  timestamp: z.string().datetime(),
});
