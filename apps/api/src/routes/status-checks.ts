import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import {
  StatusCheckInputSchema,
  ProvenanceSourceType,
} from '@matdata-setu/shared';
import { DatabaseStore } from '../db/in-memory-db.js';
import {
  GuidedManualProvider,
  DemoProvider,
  OfficialRollLookupProvider,
} from '../integrations/roll-lookup.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerStatusCheckRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  audit: AuditService,
  appMode: 'demo' | 'production'
): void {
  // Provider selection
  const lookupProvider: OfficialRollLookupProvider =
    appMode === 'demo' ? new DemoProvider() : new GuidedManualProvider();

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/status-checks',
    action: 'create',
    resource: 'status_check',
    description: 'Record user-observed official voter search outcome',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/status-checks',
    action: 'read',
    resource: 'status_check',
    description: 'Get user status check history with provenance',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/status-checks/lookup',
    action: 'read',
    resource: 'status_check',
    description: 'Guided or simulated voter lookup via adapter',
  });

  // POST /api/v1/status-checks (Record outcome)
  app.post('/api/v1/status-checks', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const parse = StatusCheckInputSchema.safeParse(req.body);

    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: parse.error.errors[0]?.message, requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const { officialSourceId, checkedAt, outcome, notes, epicNumberMasked, state, ac } = parse.data;
    const checkId = crypto.randomUUID();

    const record = {
      id: checkId,
      userId,
      officialSourceId,
      checkedAt,
      outcome,
      notes,
      userRecorded: true,
      epicMasked: epicNumberMasked,
      state,
      ac,
    };

    db.statusChecks.set(checkId, record);

    // Record provenance assertion
    db.assertions.set(`assert-${checkId}`, {
      id: crypto.randomUUID(),
      subjectType: 'USER',
      subjectId: userId,
      predicate: 'ROLL_STATUS_CHECK',
      valueMasked: outcome,
      sourceType: ProvenanceSourceType.USER_RECORDED_OFFICIAL_LOOKUP,
      sourceRef: officialSourceId,
      obtainedAt: checkedAt,
      recordedBy: userId,
      evidenceIds: [],
      staleAfter: new Date(Date.now() + 30 * 86400000).toISOString(),
    });

    audit.logEvent({
      actor: userId,
      action: 'STATUS_CHECK_RECORDED',
      resourceType: 'status_check',
      resourceRef: checkId,
      reason: `Outcome: ${outcome}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.status(201).send({
      data: {
        record,
        provenanceChip: {
          sourceType: ProvenanceSourceType.USER_RECORDED_OFFICIAL_LOOKUP,
          dateStr: checkedAt.split('T')[0],
          isStale: false,
        },
        message: 'Search check outcome recorded successfully.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/status-checks (History)
  app.get('/api/v1/status-checks', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const checks = db.getStatusChecksByUserId(userId);

    return reply.send({
      data: checks,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/status-checks/lookup
  app.post('/api/v1/status-checks/lookup', async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.body as any;
    const result = await lookupProvider.lookup(query || {});

    return reply.send({
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });
}
