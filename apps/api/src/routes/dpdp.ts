import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { DatabaseStore } from '../db/in-memory-db.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerDpdpRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  audit: AuditService,
  grievanceEmail: string
): void {
  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/dpdp/export',
    action: 'export',
    resource: 'user_profile',
    description: 'Data Principal Right to Access and Export Personal Data (DPDP Act 2023)',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/dpdp/withdraw-consent',
    action: 'delete',
    resource: 'user_profile',
    description: 'Withdraw consent and request account closure / data erasure',
  });

  // GET /api/v1/dpdp/export
  app.get('/api/v1/dpdp/export', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const profile = db.userProfiles.get(`prof-${userId}`);
    const cases = db.getCasesByUserId(userId);
    const checks = db.getStatusChecksByUserId(userId);

    audit.logEvent({
      actor: userId,
      action: 'DPDP_DATA_EXPORT_REQUESTED',
      resourceType: 'user_profile',
      resourceRef: userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: {
        principalId: userId,
        exportedAt: new Date().toISOString(),
        profile,
        cases,
        statusChecks: checks,
        grievanceContact: {
          officerName: 'DPDP Grievance Redressal Officer',
          email: grievanceEmail,
        },
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/dpdp/withdraw-consent
  app.post('/api/v1/dpdp/withdraw-consent', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const user = db.users.get(userId);

    if (user) {
      user.status = 'CLOSED';
    }

    audit.logEvent({
      actor: userId,
      action: 'DPDP_CONSENT_WITHDRAWN',
      resourceType: 'user_profile',
      resourceRef: userId,
      reason: 'Citizen requested consent withdrawal and account closure.',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: {
        message:
          'Consent has been withdrawn and your account is closed. Non-case identity data will be removed during the next retention sweep. Open assistance cases remain preserved for legal compliance as required by statutory rules.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });
}
