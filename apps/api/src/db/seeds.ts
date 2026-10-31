import {
  CaseCategory,
  DeceasedBasis,
  DeceasedReviewState,
  DuplicateReasonCode,
  DuplicateReviewState,
  FormCode,
  OfficialProcessStage,
  PortalCaseStatus,
  ProvenanceSourceType,
  SimilarityCategory,
  StaffRole,
  StatusCheckOutcome,
  generatePublicCaseRef,
} from '@voterrule/shared';
import { DatabaseStore } from './in-memory-db.js';
import { FieldEncryptionService } from '../crypto/encryption.js';

export async function seedDemoDatabase(
  db: DatabaseStore,
  encryption: FieldEncryptionService
): Promise<void> {
  const commonPasswordHash = await encryption.hashPassword('DemoVoterRulePass2026!');

  // 1. Staff Accounts
  const adminUserId = 'synth-user-admin-01';
  db.users.set(adminUserId, {
    id: adminUserId,
    emailCiphertext: encryption.encryptField('admin.demo@voterrule.org').ciphertext,
    emailBlindIndex: encryption.computeBlindIndex('admin.demo@voterrule.org'),
    passwordHash: commonPasswordHash,
    locale: 'en',
    ageConfirmed18Plus: true,
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01').toISOString(),
  });
  db.staffAccounts.set('staff-admin-01', {
    id: 'staff-admin-01',
    userId: adminUserId,
    email: 'admin.demo@voterrule.org',
    roles: [StaffRole.PLATFORM_ADMIN, StaffRole.CASE_REVIEWER],
    mfaEnrolled: true,
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01').toISOString(),
  });

  const reviewerUserId = 'synth-user-reviewer-01';
  db.users.set(reviewerUserId, {
    id: reviewerUserId,
    emailCiphertext: encryption.encryptField('reviewer.demo@voterrule.org').ciphertext,
    emailBlindIndex: encryption.computeBlindIndex('reviewer.demo@voterrule.org'),
    passwordHash: commonPasswordHash,
    locale: 'en',
    ageConfirmed18Plus: true,
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01').toISOString(),
  });
  db.staffAccounts.set('staff-reviewer-01', {
    id: 'staff-reviewer-01',
    userId: reviewerUserId,
    email: 'reviewer.demo@voterrule.org',
    roles: [StaffRole.CASE_REVIEWER, StaffRole.DOCUMENT_REVIEWER, StaffRole.DUPLICATE_MATCH_REVIEWER],
    mfaEnrolled: true,
    status: 'ACTIVE',
    createdAt: new Date('2026-01-01').toISOString(),
  });

  // 2. Demo Citizen 1: Present Voter (Aarav Sharma - SYNTH-PRESENT-01)
  const citizen1Id = 'synth-citizen-aarav-01';
  db.users.set(citizen1Id, {
    id: citizen1Id,
    emailCiphertext: encryption.encryptField('aarav.synthetic@demo.voterrule').ciphertext,
    emailBlindIndex: encryption.computeBlindIndex('aarav.synthetic@demo.voterrule'),
    passwordHash: commonPasswordHash,
    locale: 'en',
    ageConfirmed18Plus: true,
    status: 'ACTIVE',
    createdAt: new Date('2026-02-15').toISOString(),
  });
  db.userProfiles.set(`prof-${citizen1Id}`, {
    id: `prof-${citizen1Id}`,
    userId: citizen1Id,
    displayName: 'Aarav Sharma (SYNTHETIC)',
    state: 'Delhi',
    district: 'New Delhi',
    assemblyConstituency: 'AC-40 (New Delhi)',
    preferredLanguage: 'en',
  });
  // Status check: Confirmed present
  db.statusChecks.set('check-aarav-01', {
    id: 'check-aarav-01',
    userId: citizen1Id,
    officialSourceId: 'link-eci-voter-search',
    checkedAt: new Date('2026-10-15').toISOString(),
    outcome: StatusCheckOutcome.CONFIRMED_PRESENT_IN_OFFICIAL_RESULT,
    notes: 'Record confirmed on official search in Part 14.',
    userRecorded: true,
    epicMasked: 'SYNTH***1234',
    state: 'Delhi',
    ac: 'AC-40',
  });
  db.assertions.set('assert-aarav-epic', {
    id: 'assert-aarav-epic',
    subjectType: 'USER',
    subjectId: citizen1Id,
    predicate: 'EPIC_NUMBER',
    valueMasked: 'SYNTH***1234',
    sourceType: ProvenanceSourceType.USER_RECORDED_OFFICIAL_LOOKUP,
    obtainedAt: new Date('2026-10-15').toISOString(),
    recordedBy: citizen1Id,
    evidenceIds: [],
    staleAfter: new Date(Date.now() + 30 * 86400000).toISOString(),
  });

  // 3. Demo Citizen 2: Missing Name Case (Priya Verma - SYNTH-MISSING-02)
  const citizen2Id = 'synth-citizen-priya-02';
  db.users.set(citizen2Id, {
    id: citizen2Id,
    emailCiphertext: encryption.encryptField('priya.synthetic@demo.voterrule').ciphertext,
    emailBlindIndex: encryption.computeBlindIndex('priya.synthetic@demo.voterrule'),
    passwordHash: commonPasswordHash,
    locale: 'hi',
    ageConfirmed18Plus: true,
    status: 'ACTIVE',
    createdAt: new Date('2026-03-01').toISOString(),
  });
  db.userProfiles.set(`prof-${citizen2Id}`, {
    id: `prof-${citizen2Id}`,
    userId: citizen2Id,
    displayName: 'Priya Verma (SYNTHETIC)',
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    assemblyConstituency: 'AC-171 (Lucknow Central)',
    preferredLanguage: 'hi',
  });
  db.statusChecks.set('check-priya-01', {
    id: 'check-priya-01',
    userId: citizen2Id,
    officialSourceId: 'link-eci-voter-search',
    checkedAt: new Date('2026-10-20').toISOString(),
    outcome: StatusCheckOutcome.NOT_FOUND_IN_CHECKED_SEARCH,
    notes: 'Searched by details and old EPIC; name not appearing in SSR 2026 draft roll.',
    userRecorded: true,
    state: 'Uttar Pradesh',
    ac: 'AC-171',
  });
  // Case for Missing Name: Form 6 Re-inclusion
  const priyaCaseId = 'case-priya-missing-01';
  const priyaCaseRef = generatePublicCaseRef(2026);
  db.cases.set(priyaCaseId, {
    id: priyaCaseId,
    publicRef: priyaCaseRef,
    userId: citizen2Id,
    category: CaseCategory.MISSING_NAME,
    workflowStatus: PortalCaseStatus.UNDER_REVIEW,
    officialStage: OfficialProcessStage.STAGE_4_APPLICATION_PREPARED,
    recommendedFormCode: FormCode.FORM_6,
    guidanceVersionIds: ['guidance-form-6-v2026'],
    priority: 'HIGH',
    assignedReviewerId: reviewerUserId,
    state: 'Uttar Pradesh',
    district: 'Lucknow',
    assemblyConstituency: 'AC-171 (Lucknow Central)',
    nameAsReported: 'Priya Verma (SYNTHETIC)',
    relativeName: 'Ramesh Verma',
    dobYear: 1998,
    addressSummary: '12/4 Hazratganj, Lucknow, UP',
    openedAt: new Date('2026-10-21').toISOString(),
    reopenedCount: 0,
  });
  db.caseStatusHistory.push({
    id: 'hist-priya-1',
    caseId: priyaCaseId,
    fromStatus: PortalCaseStatus.SUBMITTED_TO_PORTAL,
    toStatus: PortalCaseStatus.UNDER_REVIEW,
    actor: reviewerUserId,
    reason: 'Initial document checklist validated for Form 6 re-inclusion path.',
    timestamp: new Date('2026-10-22').toISOString(),
  });
  db.caseEvents.push({
    id: 'ev-priya-1',
    caseId: priyaCaseId,
    title: 'Application Preparation Sheet Generated',
    description: 'Statutory Form 6 preparation sheet prepared for submission at ERO office or voters.eci.gov.in.',
    timestamp: new Date('2026-10-21').toISOString(),
    userVisible: true,
  });

  // 4. Demo Citizen 3: Correction of Particulars (Vikram Patel - Form 8)
  const citizen3Id = 'synth-citizen-vikram-03';
  db.users.set(citizen3Id, {
    id: citizen3Id,
    emailCiphertext: encryption.encryptField('vikram.synthetic@demo.voterrule').ciphertext,
    emailBlindIndex: encryption.computeBlindIndex('vikram.synthetic@demo.voterrule'),
    passwordHash: commonPasswordHash,
    locale: 'en',
    ageConfirmed18Plus: true,
    status: 'ACTIVE',
    createdAt: new Date('2026-04-10').toISOString(),
  });
  const vikramCaseId = 'case-vikram-corr-01';
  db.cases.set(vikramCaseId, {
    id: vikramCaseId,
    publicRef: generatePublicCaseRef(2026),
    userId: citizen3Id,
    category: CaseCategory.CORRECTION_PARTICULARS,
    workflowStatus: PortalCaseStatus.OFFICIAL_PROCESS_RECOMMENDED,
    officialStage: OfficialProcessStage.STAGE_4_APPLICATION_PREPARED,
    recommendedFormCode: FormCode.FORM_8,
    guidanceVersionIds: ['guidance-form-8-v2026'],
    priority: 'NORMAL',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    assemblyConstituency: 'AC-165 (Andheri West)',
    nameAsReported: 'Vikram Patel (SYNTHETIC)',
    relativeName: 'Hasmukh Patel',
    dobYear: 1985,
    addressSummary: 'Flat 402, Sea Breeze, Andheri West, Mumbai',
    openedAt: new Date('2026-10-18').toISOString(),
    reopenedCount: 0,
  });

  // 5. Demo Citizen 4: Shifting Residence (Legitimate Address Change - Form 8)
  const citizen4Id = 'synth-citizen-ananya-04';
  db.users.set(citizen4Id, {
    id: citizen4Id,
    emailCiphertext: encryption.encryptField('ananya.synthetic@demo.voterrule').ciphertext,
    emailBlindIndex: encryption.computeBlindIndex('ananya.synthetic@demo.voterrule'),
    passwordHash: commonPasswordHash,
    locale: 'en',
    ageConfirmed18Plus: true,
    status: 'ACTIVE',
    createdAt: new Date('2026-05-01').toISOString(),
  });
  const ananyaCaseId = 'case-ananya-shifting-01';
  db.cases.set(ananyaCaseId, {
    id: ananyaCaseId,
    publicRef: generatePublicCaseRef(2026),
    userId: citizen4Id,
    category: CaseCategory.SHIFTING_RESIDENCE,
    workflowStatus: PortalCaseStatus.OFFICIAL_SUBMISSION_REPORTED_BY_USER,
    officialStage: OfficialProcessStage.STAGE_5_SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED,
    recommendedFormCode: FormCode.FORM_8,
    guidanceVersionIds: ['guidance-form-8-v2026'],
    priority: 'NORMAL',
    state: 'Karnataka',
    district: 'Bangalore Urban',
    assemblyConstituency: 'AC-160 (Sarvagnanagar)',
    nameAsReported: 'Ananya Rao (SYNTHETIC)',
    relativeName: 'K. Rao',
    dobYear: 1992,
    addressSummary: 'Indiranagar 2nd Stage, Bengaluru, Karnataka',
    previousAddressSummary: 'Banjara Hills, Hyderabad, Telangana',
    openedAt: new Date('2026-09-10').toISOString(),
    reopenedCount: 0,
  });
  db.officialSubmissionReports.push({
    id: 'report-ananya-01',
    caseId: ananyaCaseId,
    reportedBy: citizen4Id,
    channel: 'ECI_VOTERS_PORTAL',
    acknowledgementRef: 'KA2026091000987 (User Reported)',
    submittedDate: new Date('2026-09-12').toISOString(),
    notes: 'Submitted online Form 8 for interstate shifting.',
  });

  // 6. Duplicate Candidate Pairs (Rule-based candidate test cases)
  // Pair 1: True Duplicate Candidate (Same person registered under previous address)
  db.duplicateCandidates.set('cand-dup-01', {
    id: 'cand-dup-01',
    subjectARef: 'SYNTH-REC-A101',
    subjectBRef: 'SYNTH-REC-B102',
    similarityCategory: SimilarityCategory.STRONG,
    score: 85,
    reasonCodes: [
      DuplicateReasonCode.EPIC_TOKEN_MATCH,
      DuplicateReasonCode.NAME_SIMILAR,
      DuplicateReasonCode.DOB_AGREEMENT,
      DuplicateReasonCode.ADDRESS_HISTORY_OVERLAP,
    ],
    algorithmVersion: '2026.rule-v1',
    state: DuplicateReviewState.PENDING_REVIEW,
    createdAt: new Date('2026-10-25').toISOString(),
  });

  // Pair 2: False Positive / Different People with Similar Names (Rajesh Kumar, different relatives, conflicting DOBs)
  db.duplicateCandidates.set('cand-dup-02', {
    id: 'cand-dup-02',
    subjectARef: 'SYNTH-REC-DIFF-01',
    subjectBRef: 'SYNTH-REC-DIFF-02',
    similarityCategory: SimilarityCategory.WEAK,
    score: 25,
    reasonCodes: [
      DuplicateReasonCode.NAME_SIMILAR,
      DuplicateReasonCode.COMMON_NAME_DAMPENED,
      DuplicateReasonCode.DOB_CONFLICT,
    ],
    algorithmVersion: '2026.rule-v1',
    state: DuplicateReviewState.DISMISSED_FALSE_POSITIVE,
    createdAt: new Date('2026-10-26').toISOString(),
  });

  // 7. Deceased Person Report Awaiting Review (Third-Party Safeguard)
  db.deceasedReports.set('report-deceased-01', {
    id: 'report-deceased-01',
    publicRef: generatePublicCaseRef(2026),
    reporterId: citizen1Id,
    reportedPersonName: 'Late Mohan Lal (SYNTHETIC)',
    relativeName: 'Sita Ram',
    approxAge: 82,
    state: 'Delhi',
    district: 'Central Delhi',
    assemblyConstituency: 'AC-21 (Matia Mahal)',
    locality: 'Daryaganj, Ward 3',
    basis: DeceasedBasis.IMMEDIATE_FAMILY,
    basisExplanation: 'Grandfather passed away in August 2026. Death certificate issued by North DMC attached.',
    optionalEpicMasked: 'SYNTH***9911',
    stateStatus: DeceasedReviewState.PENDING_REVIEW,
    createdAt: new Date('2026-10-27').toISOString(),
  });

  // 8. Voluntary Contact Check-in
  db.checkIns.set('checkin-aarav-01', {
    id: 'checkin-aarav-01',
    userId: citizen1Id,
    cycleId: 'cycle-2026-q4',
    sentAt: new Date('2026-10-01').toISOString(),
    respondedAt: new Date('2026-10-03').toISOString(),
    channel: 'IN_APP',
    isCurrentDetailsConfirmed: true,
  });

  // 9. Notifications (Generic only, zero PII)
  db.notifications.set('notif-priya-01', {
    id: 'notif-priya-01',
    userId: citizen2Id,
    templateId: 'CASE_STATUS_UPDATED',
    channel: 'IN_APP',
    title: 'Case Update',
    message: `Your assistance case ${priyaCaseRef} has been updated. Sign in to view next steps.`,
    isRead: false,
    createdAt: new Date('2026-10-22').toISOString(),
  });
}
