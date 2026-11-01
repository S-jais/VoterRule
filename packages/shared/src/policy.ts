import { StaffRole } from './enums.js';

export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'submit'
  | 'review'
  | 'unmask_pii'
  | 'download'
  | 'export'
  | 'manage_roles'
  | 'verify_audit'
  | 'bootstrap_admin'
  | 'publish_guidance';

export type Resource =
  | 'auth'
  | 'user_profile'
  | 'case'
  | 'document'
  | 'status_check'
  | 'duplicate_candidate'
  | 'deceased_report'
  | 'guidance'
  | 'audit_log'
  | 'analytics'
  | 'staff_account'
  | 'notification'
  | 'check_in'
  | 'assisted_authorization'
  | 'ai_assistant'
  | 'ai_knowledge';

export interface ActorContext {
  id?: string;
  role?: StaffRole | 'CITIZEN' | 'ANONYMOUS';
  staffRoles?: StaffRole[];
  isAssistedAgent?: boolean;
  authorizedForSubjectId?: string;
}

export interface ResourceContext {
  userId?: string;
  assignedReviewerId?: string;
  hasSecondApproval?: boolean;
  unmaskReasonProvided?: boolean;
  isOwnData?: boolean;
}

/**
 * Central Authorization Policy - Deny by Default
 */
export function can(
  actor: ActorContext,
  action: Action,
  resource: Resource,
  context?: ResourceContext
): boolean {
  if (!actor || !actor.role || actor.role === 'ANONYMOUS') {
    // Anonymous permissions
    if (action === 'read' && (resource === 'guidance' || resource === 'status_check' || resource === 'ai_assistant' || resource === 'ai_knowledge')) return true;
    if (action === 'create' && (resource === 'auth' || resource === 'ai_assistant')) return true;
    if (action === 'delete' && resource === 'ai_assistant') return true;
    return false;
  }

  // Citizens
  if (actor.role === 'CITIZEN') {
    if (resource === 'ai_assistant' && (action === 'read' || action === 'create' || action === 'delete')) return true;
    if (resource === 'ai_knowledge' && action === 'read') return true;
    if (resource === 'user_profile' && (action === 'read' || action === 'update' || action === 'delete')) {
      return context?.isOwnData ?? true;
    }
    if (resource === 'case' && (action === 'create' || action === 'read' || action === 'update')) {
      return context?.isOwnData ?? true;
    }
    if (resource === 'document' && (action === 'create' || action === 'read' || action === 'download' || action === 'delete')) {
      return context?.isOwnData ?? true;
    }
    if (resource === 'status_check' && (action === 'create' || action === 'read')) {
      return context?.isOwnData ?? true;
    }
    if (resource === 'deceased_report' && action === 'create') {
      return true; // Any authenticated citizen can submit with anti-weaponization limit
    }
    if (resource === 'guidance' && action === 'read') return true;
    if (resource === 'notification' && (action === 'read' || action === 'update')) return context?.isOwnData ?? true;
    if (resource === 'check_in' && (action === 'read' || action === 'update')) return context?.isOwnData ?? true;
    return false;
  }

  // Assisted Support Agent
  if (actor.role === StaffRole.ASSISTED_SUPPORT_AGENT) {
    if (action === 'create' || action === 'update' || action === 'read') {
      if (resource === 'case' || resource === 'document' || resource === 'status_check') {
        // Can only act if representative authorization matches the subject
        return context?.isOwnData || (!!actor.authorizedForSubjectId && actor.authorizedForSubjectId === context?.userId);
      }
    }
    if (resource === 'guidance' && action === 'read') return true;
    return false;
  }

  // Platform Admin - Superuser with four-eyes constraints on critical grants
  if (actor.role === StaffRole.PLATFORM_ADMIN || actor.staffRoles?.includes(StaffRole.PLATFORM_ADMIN)) {
    if (action === 'manage_roles' && context && !context.hasSecondApproval) {
      // Granting or revoking PLATFORM_ADMIN requires second-admin approval
      return false;
    }
    if (action === 'unmask_pii' && !context?.unmaskReasonProvided) {
      return false;
    }
    return true;
  }

  // Case Reviewer
  if (actor.role === StaffRole.CASE_REVIEWER || actor.staffRoles?.includes(StaffRole.CASE_REVIEWER)) {
    if (resource === 'case' && (action === 'read' || action === 'review' || action === 'update')) return true;
    if (resource === 'document' && (action === 'read' || action === 'review')) return true;
    if (resource === 'guidance' && action === 'read') return true;
    if (resource === 'status_check' && action === 'read') return true;
    if (resource === 'deceased_report' && (action === 'read' || action === 'review')) return true;
    if (action === 'unmask_pii') return !!context?.unmaskReasonProvided;
    return false;
  }

  // Document Reviewer
  if (actor.role === StaffRole.DOCUMENT_REVIEWER || actor.staffRoles?.includes(StaffRole.DOCUMENT_REVIEWER)) {
    if (resource === 'document' && (action === 'read' || action === 'review')) return true;
    if (resource === 'case' && action === 'read') return true;
    if (action === 'download') return true;
    if (action === 'unmask_pii') return !!context?.unmaskReasonProvided;
    return false;
  }

  // Duplicate Match Reviewer
  if (actor.role === StaffRole.DUPLICATE_MATCH_REVIEWER || actor.staffRoles?.includes(StaffRole.DUPLICATE_MATCH_REVIEWER)) {
    if (resource === 'duplicate_candidate' && (action === 'read' || action === 'review')) return true;
    if (resource === 'case' && action === 'read') return true;
    if (action === 'unmask_pii') return !!context?.unmaskReasonProvided;
    return false;
  }

  // Analytics Viewer
  if (actor.role === StaffRole.ANALYTICS_VIEWER || actor.staffRoles?.includes(StaffRole.ANALYTICS_VIEWER)) {
    if (resource === 'analytics' && (action === 'read' || action === 'export')) return true;
    return false;
  }

  // Read-Only Auditor
  if (actor.role === StaffRole.READ_ONLY_AUDITOR || actor.staffRoles?.includes(StaffRole.READ_ONLY_AUDITOR)) {
    if (resource === 'audit_log' && (action === 'read' || action === 'verify_audit')) return true;
    if (resource === 'analytics' && action === 'read') return true;
    if (resource === 'guidance' && action === 'read') return true;
    return false;
  }

  return false;
}
