import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { DatabaseStore } from '../db/in-memory-db.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerCheckInRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  audit: AuditService
): void {
  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/checkin',
    action: 'read',
    resource: 'check_in',
    description: 'Get voluntary periodic contact check-in status',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/checkin/confirm',
    action: 'update',
    resource: 'check_in',
    description: 'Voluntary confirmation of current contact details',
  });

  // GET /api/v1/checkin
  app.get('/api/v1/checkin', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const checkin = Array.from(db.checkIns.values()).find((c) => c.userId === userId);

    return reply.send({
      data: {
        checkin: checkin || {
          userId,
          cycleId: 'cycle-2026-annual',
          sentAt: new Date().toISOString(),
          channel: 'IN_APP',
        },
        notice:
          'Contact check-ins are strictly voluntary. Non-response has no adverse effect on your cases or account. Inactivity is never treated as evidence of ineligibility.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/checkin/confirm
  app.post('/api/v1/checkin/confirm', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const body = req.body as any;

    const checkinId = crypto.randomUUID();
    const record = {
      id: checkinId,
      userId,
      cycleId: body.cycleId || 'cycle-2026-annual',
      sentAt: new Date().toISOString(),
      respondedAt: new Date().toISOString(),
      channel: 'IN_APP' as const,
      isCurrentDetailsConfirmed: true,
    };

    db.checkIns.set(checkinId, record);

    audit.logEvent({
      actor: userId,
      action: 'CHECK_IN_CONFIRMED',
      resourceType: 'check_in',
      resourceRef: checkinId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: {
        record,
        message: 'Thank you. Your contact details have been confirmed current.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });
}
