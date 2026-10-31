import { OfficialProcessStage, PortalCaseStatus, StaffRole } from './enums.js';

export interface TransitionRule<TStatus, TRole> {
  from: TStatus;
  to: TStatus[];
  allowedRoles: (TRole | 'CITIZEN' | 'SYSTEM_INTEGRATION')[];
  requiresEvidence?: boolean;
}

/**
 * Legal transitions for the Portal-Case Workflow Status
 */
export const PORTAL_CASE_TRANSITIONS: TransitionRule<PortalCaseStatus, StaffRole>[] = [
  {
    from: PortalCaseStatus.DRAFT,
    to: [PortalCaseStatus.SUBMITTED_TO_PORTAL, PortalCaseStatus.CLOSED],
    allowedRoles: ['CITIZEN', StaffRole.ASSISTED_SUPPORT_AGENT, StaffRole.PLATFORM_ADMIN],
  },
  {
    from: PortalCaseStatus.SUBMITTED_TO_PORTAL,
    to: [PortalCaseStatus.AWAITING_INITIAL_REVIEW, PortalCaseStatus.UNDER_REVIEW, PortalCaseStatus.CLOSED],
    allowedRoles: [StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN, 'SYSTEM_INTEGRATION'],
  },
  {
    from: PortalCaseStatus.AWAITING_INITIAL_REVIEW,
    to: [PortalCaseStatus.UNDER_REVIEW, PortalCaseStatus.ADDITIONAL_INFO_REQUIRED, PortalCaseStatus.OFFICIAL_PROCESS_RECOMMENDED, PortalCaseStatus.CLOSED],
    allowedRoles: [StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN],
  },
  {
    from: PortalCaseStatus.ADDITIONAL_INFO_REQUIRED,
    to: [PortalCaseStatus.UNDER_REVIEW, PortalCaseStatus.CLOSED],
    allowedRoles: ['CITIZEN', StaffRole.ASSISTED_SUPPORT_AGENT, StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN],
  },
  {
    from: PortalCaseStatus.UNDER_REVIEW,
    to: [
      PortalCaseStatus.ADDITIONAL_INFO_REQUIRED,
      PortalCaseStatus.OFFICIAL_PROCESS_RECOMMENDED,
      PortalCaseStatus.REFERRED_TO_AUTHORIZED_CHANNEL,
      PortalCaseStatus.CLOSED,
    ],
    allowedRoles: [StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN],
  },
  {
    from: PortalCaseStatus.OFFICIAL_PROCESS_RECOMMENDED,
    to: [PortalCaseStatus.OFFICIAL_SUBMISSION_REPORTED_BY_USER, PortalCaseStatus.CLOSED, PortalCaseStatus.REOPENED],
    allowedRoles: ['CITIZEN', StaffRole.ASSISTED_SUPPORT_AGENT, StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN],
  },
  {
    from: PortalCaseStatus.REFERRED_TO_AUTHORIZED_CHANNEL,
    to: [PortalCaseStatus.OFFICIAL_SUBMISSION_REPORTED_BY_USER, PortalCaseStatus.OFFICIAL_SUBMISSION_INDEPENDENTLY_CONFIRMED, PortalCaseStatus.OUTCOME_RECEIVED, PortalCaseStatus.CLOSED],
    allowedRoles: [StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN, 'SYSTEM_INTEGRATION'],
  },
  {
    from: PortalCaseStatus.OFFICIAL_SUBMISSION_REPORTED_BY_USER,
    to: [PortalCaseStatus.OFFICIAL_SUBMISSION_INDEPENDENTLY_CONFIRMED, PortalCaseStatus.OUTCOME_RECEIVED, PortalCaseStatus.CLOSED],
    allowedRoles: [StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN, 'SYSTEM_INTEGRATION'],
  },
  {
    from: PortalCaseStatus.OFFICIAL_SUBMISSION_INDEPENDENTLY_CONFIRMED,
    to: [PortalCaseStatus.OUTCOME_RECEIVED, PortalCaseStatus.CLOSED],
    allowedRoles: [StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN, 'SYSTEM_INTEGRATION'],
  },
  {
    from: PortalCaseStatus.OUTCOME_RECEIVED,
    to: [PortalCaseStatus.CLOSED, PortalCaseStatus.REOPENED],
    allowedRoles: [StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN],
  },
  {
    from: PortalCaseStatus.CLOSED,
    to: [PortalCaseStatus.REOPENED],
    allowedRoles: ['CITIZEN', StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN],
  },
  {
    from: PortalCaseStatus.REOPENED,
    to: [PortalCaseStatus.UNDER_REVIEW, PortalCaseStatus.AWAITING_INITIAL_REVIEW, PortalCaseStatus.CLOSED],
    allowedRoles: [StaffRole.CASE_REVIEWER, StaffRole.PLATFORM_ADMIN],
  },
];

export function canTransitionPortalCase(
  current: PortalCaseStatus,
  target: PortalCaseStatus,
  actorRole: StaffRole | 'CITIZEN' | 'SYSTEM_INTEGRATION'
): boolean {
  const rule = PORTAL_CASE_TRANSITIONS.find((r) => r.from === current);
  if (!rule) return false;
  if (!rule.to.includes(target)) return false;
  return rule.allowedRoles.includes(actorRole);
}

/**
 * Guards for OfficialProcessStage
 * Stages 6, 7, and 8 can ONLY be set by:
 * (a) An authorized integration event, OR
 * (b) A reviewer who attaches documentary evidence & provenance.
 * Never by the citizen alone, and never by an automated AI model.
 */
export const RESTRICTED_OFFICIAL_STAGES: OfficialProcessStage[] = [
  OfficialProcessStage.STAGE_6_OFFICIAL_SUBMISSION_CONFIRMED,
  OfficialProcessStage.STAGE_7_OFFICIAL_DECISION_RECEIVED,
  OfficialProcessStage.STAGE_8_ROLL_INCLUSION_INDEPENDENTLY_CONFIRMED,
];

export function canSetOfficialStage(
  stage: OfficialProcessStage,
  actorRole: StaffRole | 'CITIZEN' | 'SYSTEM_INTEGRATION',
  hasEvidence: boolean
): { allowed: boolean; reason?: string } {
  // If target stage is one of stages 6 to 8:
  if (RESTRICTED_OFFICIAL_STAGES.includes(stage)) {
    if (actorRole === 'CITIZEN') {
      return {
        allowed: false,
        reason: 'Citizens cannot confirm official election authority decisions or roll inclusion. Only user-reported submission (Stage 5) is allowed.',
      };
    }
    if (actorRole === 'SYSTEM_INTEGRATION') {
      return { allowed: true };
    }
    // Reviewer role
    if (actorRole === StaffRole.CASE_REVIEWER || actorRole === StaffRole.PLATFORM_ADMIN) {
      if (!hasEvidence) {
        return {
          allowed: false,
          reason: 'Advancing to Stages 6–8 requires attaching verifiable documentary evidence and a provenance audit record.',
        };
      }
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Your role does not have authorization to certify official statutory stages.',
    };
  }

  // Stages 1-5
  if (stage === OfficialProcessStage.STAGE_5_SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED) {
    if (actorRole === 'CITIZEN' || actorRole === StaffRole.ASSISTED_SUPPORT_AGENT || actorRole === StaffRole.CASE_REVIEWER || actorRole === StaffRole.PLATFORM_ADMIN) {
      return { allowed: true };
    }
  }

  return { allowed: true };
}
