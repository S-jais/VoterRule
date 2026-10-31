import {
  CaseCategory,
  DeceasedBasis,
  DeceasedReviewState,
  DocumentScanStatus,
  DocumentType,
  DuplicateReasonCode,
  DuplicateReviewState,
  FormCode,
  OfficialProcessStage,
  PortalCaseStatus,
  ProvenanceSourceType,
  SimilarityCategory,
  StaffRole,
  StatusCheckOutcome,
} from '@matdata-setu/shared';

export interface UserRecord {
  id: string;
  emailCiphertext: string;
  emailBlindIndex: string;
  phoneCiphertext?: string;
  phoneBlindIndex?: string;
  passwordHash: string;
  locale: 'en' | 'hi';
  ageConfirmed18Plus: boolean;
  status: 'ACTIVE' | 'LOCKED' | 'CLOSED';
  createdAt: string;
}

export interface UserProfileRecord {
  id: string;
  userId: string;
  displayName?: string;
  state?: string;
  district?: string;
  assemblyConstituency?: string;
  epicNumberMasked?: string;
  preferredLanguage: 'en' | 'hi';
}

export interface StaffAccountRecord {
  id: string;
  userId: string;
  email: string;
  roles: StaffRole[];
  mfaEnrolled: boolean;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface AssertionRecord {
  id: string;
  subjectType: 'USER' | 'CASE' | 'ELECTORAL_RECORD';
  subjectId: string;
  predicate: string;
  valueMasked: string;
  sourceType: ProvenanceSourceType;
  sourceRef?: string;
  obtainedAt: string;
  recordedBy: string;
  verifiedBy?: string;
  verifiedAt?: string;
  evidenceIds: string[];
  staleAfter: string;
  supersedesId?: string;
}

export interface StatusCheckRecord {
  id: string;
  userId: string;
  officialSourceId: string;
  checkedAt: string;
  outcome: StatusCheckOutcome;
  notes?: string;
  userRecorded: boolean;
  epicMasked?: string;
  state?: string;
  ac?: string;
}

export interface CaseRecord {
  id: string;
  publicRef: string;
  userId: string;
  category: CaseCategory;
  workflowStatus: PortalCaseStatus;
  officialStage: OfficialProcessStage;
  recommendedFormCode: FormCode;
  guidanceVersionIds: string[];
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  assignedReviewerId?: string;
  idempotencyKey?: string;
  state: string;
  district?: string;
  assemblyConstituency?: string;
  partNumber?: string;
  nameAsReported: string;
  relativeName?: string;
  dobYear?: number;
  addressSummary?: string;
  previousAddressSummary?: string;
  openedAt: string;
  closedAt?: string;
  reopenedCount: number;
}

export interface CaseStatusHistoryRecord {
  id: string;
  caseId: string;
  fromStatus: PortalCaseStatus;
  toStatus: PortalCaseStatus;
  actor: string;
  reason: string;
  timestamp: string;
}

export interface CaseEventRecord {
  id: string;
  caseId: string;
  title: string;
  description: string;
  timestamp: string;
  userVisible: boolean;
}

export interface CaseIntakeAnswerRecord {
  id: string;
  caseId: string;
  questionId: string;
  answer: any;
  guidanceVersion: string;
}

export interface CaseDocumentRecord {
  id: string;
  caseId: string;
  storageKey: string;
  originalNameMasked: string;
  detectedMime: 'application/pdf' | 'image/jpeg' | 'image/png';
  sizeBytes: number;
  sha256: string;
  scanStatus: DocumentScanStatus;
  docType: DocumentType;
  uploadedBy: string;
  retentionUntil: string;
  deletedAt?: string;
  createdAt: string;
}

export interface OfficialSubmissionReportRecord {
  id: string;
  caseId: string;
  reportedBy: string;
  channel: string;
  acknowledgementRef?: string;
  submittedDate: string;
  evidenceDocumentId?: string;
  confirmedBy?: string;
  confirmedVia?: string;
  notes?: string;
}

export interface DuplicateCandidateRecord {
  id: string;
  subjectARef: string;
  subjectBRef: string;
  similarityCategory: SimilarityCategory;
  score: number;
  reasonCodes: DuplicateReasonCode[];
  algorithmVersion: string;
  state: DuplicateReviewState;
  createdAt: string;
  secondReviewer?: string;
}

export interface DeceasedReportRecord {
  id: string;
  publicRef: string;
  reporterId: string;
  reportedPersonName: string;
  relativeName?: string;
  approxAge?: number;
  state: string;
  district?: string;
  assemblyConstituency?: string;
  locality: string;
  basis: DeceasedBasis;
  basisExplanation: string;
  optionalEpicMasked?: string;
  stateStatus: DeceasedReviewState;
  createdAt: string;
}

export interface CheckInRecord {
  id: string;
  userId: string;
  cycleId: string;
  sentAt: string;
  respondedAt?: string;
  channel: 'IN_APP' | 'EMAIL';
  isCurrentDetailsConfirmed?: boolean;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  templateId: string;
  channel: 'IN_APP' | 'EMAIL';
  title: string;
  message: string; // Generic only, no PII
  isRead: boolean;
  createdAt: string;
}

export class DatabaseStore {
  public users: Map<string, UserRecord> = new Map();
  public userProfiles: Map<string, UserProfileRecord> = new Map();
  public staffAccounts: Map<string, StaffAccountRecord> = new Map();
  public assertions: Map<string, AssertionRecord> = new Map();
  public statusChecks: Map<string, StatusCheckRecord> = new Map();
  public cases: Map<string, CaseRecord> = new Map();
  public caseStatusHistory: CaseStatusHistoryRecord[] = [];
  public caseEvents: CaseEventRecord[] = [];
  public caseIntakeAnswers: CaseIntakeAnswerRecord[] = [];
  public caseDocuments: Map<string, CaseDocumentRecord> = new Map();
  public officialSubmissionReports: OfficialSubmissionReportRecord[] = [];
  public duplicateCandidates: Map<string, DuplicateCandidateRecord> = new Map();
  public deceasedReports: Map<string, DeceasedReportRecord> = new Map();
  public checkIns: Map<string, CheckInRecord> = new Map();
  public notifications: Map<string, NotificationRecord> = new Map();
  public idempotencyKeys: Map<string, { result: any; createdAt: number }> = new Map();
  public bootstrapTokens: Map<string, { token: string; expiresAt: number; used: boolean }> = new Map();
  public otps: Map<string, { otpHash: string; expiresAt: number; attempts: number }> = new Map();

  public findUserByBlindIndex(blindIndex: string): UserRecord | undefined {
    for (const u of this.users.values()) {
      if (u.emailBlindIndex === blindIndex) return u;
    }
    return undefined;
  }

  public findUserByPhoneBlindIndex(blindIndex: string): UserRecord | undefined {
    for (const u of this.users.values()) {
      if (u.phoneBlindIndex === blindIndex) return u;
    }
    return undefined;
  }

  public findCaseByPublicRef(ref: string): CaseRecord | undefined {
    for (const c of this.cases.values()) {
      if (c.publicRef === ref) return c;
    }
    return undefined;
  }

  public getCasesByUserId(userId: string): CaseRecord[] {
    return Array.from(this.cases.values()).filter((c) => c.userId === userId);
  }

  public getDocumentsByCaseId(caseId: string): CaseDocumentRecord[] {
    return Array.from(this.caseDocuments.values()).filter((d) => d.caseId === caseId && !d.deletedAt);
  }

  public getAssertionsBySubjectId(subjectId: string): AssertionRecord[] {
    return Array.from(this.assertions.values()).filter((a) => a.subjectId === subjectId);
  }

  public getStatusChecksByUserId(userId: string): StatusCheckRecord[] {
    return Array.from(this.statusChecks.values()).filter((s) => s.userId === userId);
  }

  public getDeceasedReports(): DeceasedReportRecord[] {
    return Array.from(this.deceasedReports.values());
  }

  public getDuplicateCandidates(): DuplicateCandidateRecord[] {
    return Array.from(this.duplicateCandidates.values());
  }

  public getNotificationsByUserId(userId: string): NotificationRecord[] {
    return Array.from(this.notifications.values()).filter((n) => n.userId === userId);
  }
}
