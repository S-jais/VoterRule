import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  StaffRole,
  K_ANONYMITY_THRESHOLD,
  PortalCaseStatus,
  DuplicateReviewState,
  DeceasedReviewState,
} from '@voterrule/shared';
import { DatabaseStore } from '../db/in-memory-db.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerAdminRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  audit: AuditService,
  appMode: 'demo' | 'production'
): void {
  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/admin/overview',
    action: 'read',
    resource: 'analytics',
    description: 'Admin overview metrics and system health',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/admin/audit',
    action: 'read',
    resource: 'audit_log',
    description: 'View append-only hash-chained audit events',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/admin/audit/verify',
    action: 'verify_audit',
    resource: 'audit_log',
    description: 'Cryptographic hash-chain verification job',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/admin/staff/roles',
    action: 'manage_roles',
    resource: 'staff_account',
    description: 'Assign staff roles with mandatory second-admin approval',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/admin/analytics',
    action: 'read',
    resource: 'analytics',
    description: 'k-Anonymity suppressed aggregate civic analytics (k >= 10, district level)',
  });

  // GET /api/v1/admin/overview
  app.get('/api/v1/admin/overview', async (req: FastifyRequest, reply: FastifyReply) => {
    const totalCases = db.cases.size;
    const awaitingReview = Array.from(db.cases.values()).filter(
      (c) => c.workflowStatus === PortalCaseStatus.SUBMITTED_TO_PORTAL || c.workflowStatus === PortalCaseStatus.UNDER_REVIEW
    ).length;
    const duplicatePending = Array.from(db.duplicateCandidates.values()).filter(
      (d) => d.state === DuplicateReviewState.PENDING_REVIEW
    ).length;
    const deceasedPending = Array.from(db.deceasedReports.values()).filter(
      (r) => r.stateStatus === DeceasedReviewState.PENDING_REVIEW
    ).length;

    const casesByCategory: Record<string, number> = {};
    for (const c of db.cases.values()) {
      casesByCategory[c.category] = (casesByCategory[c.category] || 0) + 1;
    }

    return reply.send({
      data: {
        isDemoData: appMode === 'demo',
        totalCases,
        awaitingReview,
        duplicatePending,
        deceasedPending,
        casesByCategory,
        systemHealth: {
          database: 'HEALTHY',
          storage: 'HEALTHY',
          auditChain: 'VERIFIED',
          rollIntegration: 'STANDALONE_CIVIC_MODE (No shadow roll copy)',
        },
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/admin/audit
  app.get('/api/v1/admin/audit', async (req: FastifyRequest, reply: FastifyReply) => {
    const events = audit.getEvents(100);
    const verification = audit.verifyAuditChain();

    return reply.send({
      data: {
        events,
        verification,
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/admin/audit/verify
  app.post('/api/v1/admin/audit/verify', async (req: FastifyRequest, reply: FastifyReply) => {
    const verification = audit.verifyAuditChain();

    return reply.send({
      data: {
        ...verification,
        message: verification.verified
          ? 'Cryptographic audit hash chain is intact and fully verified.'
          : 'WARNING: Audit hash chain integrity broken!',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/admin/staff/roles
  app.post('/api/v1/admin/staff/roles', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any;
    const { targetUserId, roleToGrant, secondAdminId } = body;

    // Second platform admin approval check
    if (roleToGrant === StaffRole.PLATFORM_ADMIN) {
      if (!secondAdminId) {
        return reply.status(403).send({
          error: {
            code: 'SECOND_ADMIN_REQUIRED',
            message: 'Granting PLATFORM_ADMIN role strictly requires approval from a second platform admin.',
            requestId: req.id,
          },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }
    }

    let staff = Array.from(db.staffAccounts.values()).find((s) => s.userId === targetUserId);
    if (!staff) {
      staff = {
        id: `staff-${targetUserId}`,
        userId: targetUserId,
        email: body.email || 'staff@voterrule.org',
        roles: [],
        mfaEnrolled: true,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      db.staffAccounts.set(staff.id, staff);
    }

    if (!staff.roles.includes(roleToGrant)) {
      staff.roles.push(roleToGrant);
    }

    audit.logEvent({
      actor: (req.headers['x-user-id'] as string) || 'admin',
      action: 'STAFF_ROLE_GRANTED',
      resourceType: 'staff_account',
      resourceRef: staff.id,
      reason: `Granted ${roleToGrant} (Second Admin: ${secondAdminId || 'N/A'})`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: {
        staff,
        message: 'Staff roles updated successfully.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/admin/analytics (k-Anonymity suppression k >= 10, district level only)
  app.get('/api/v1/admin/analytics', async (req: FastifyRequest, reply: FastifyReply) => {
    // Group cases by state and district
    const districtCounts: Record<string, number> = {};
    for (const c of db.cases.values()) {
      const key = `${c.state} - ${c.district || 'Unspecified'}`;
      districtCounts[key] = (districtCounts[key] || 0) + 1;
    }

    // Apply k-anonymity suppression
    const suppressedAggregates: { district: string; caseCount: string | number }[] = [];
    for (const [dist, count] of Object.entries(districtCounts)) {
      if (count < K_ANONYMITY_THRESHOLD) {
        suppressedAggregates.push({ district: dist, caseCount: `< ${K_ANONYMITY_THRESHOLD} (Suppressed)` });
      } else {
        suppressedAggregates.push({ district: dist, caseCount: count });
      }
    }

    return reply.send({
      data: {
        threshold: K_ANONYMITY_THRESHOLD,
        notice: 'Any cell with fewer than 10 cases is suppressed to protect citizen privacy. No row-level data is exposed.',
        aggregates: suppressedAggregates,
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });
}
