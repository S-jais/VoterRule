import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import {
  DeceasedReportInputSchema,
  DeceasedReviewState,
  MAX_THIRD_PARTY_REPORTS_PER_30_DAYS,
  generatePublicCaseRef,
} from '@voterrule/shared';
import { DatabaseStore } from '../db/in-memory-db.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerDeceasedRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  audit: AuditService
): void {
  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/deceased-reports',
    action: 'create',
    resource: 'deceased_report',
    description: 'Submit deceased person report with anti-weaponization limit',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/deceased-reports',
    action: 'read',
    resource: 'deceased_report',
    description: 'Admin queue of deceased person reports (internal only, never public)',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/deceased-reports/:id/review',
    action: 'review',
    resource: 'deceased_report',
    description: 'Reviewer action on deceased report',
  });

  // POST /api/v1/deceased-reports
  app.post('/api/v1/deceased-reports', async (req: FastifyRequest, reply: FastifyReply) => {
    const reporterId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';

    // 1. Anti-weaponization: Check 30-day rate limit (max 3 reports per account)
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    const pastReports = Array.from(db.deceasedReports.values()).filter(
      (r) => r.reporterId === reporterId && new Date(r.createdAt).getTime() > thirtyDaysAgo
    );

    if (pastReports.length >= MAX_THIRD_PARTY_REPORTS_PER_30_DAYS) {
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message:
            'Third-party reporting limit reached (maximum 3 reports per 30-day window). Bulk reporting is prohibited to safeguard roll integrity.',
          requestId: req.id,
        },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const parse = DeceasedReportInputSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: parse.error.errors[0]?.message, requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const data = parse.data;
    const reportId = crypto.randomUUID();
    const publicRef = generatePublicCaseRef(2026);

    const reportRecord = {
      id: reportId,
      publicRef,
      reporterId,
      reportedPersonName: data.reportedPersonName,
      relativeName: data.relativeName,
      approxAge: data.approxAge,
      state: data.state,
      district: data.district,
      assemblyConstituency: data.assemblyConstituency,
      locality: data.locality,
      basis: data.basis,
      basisExplanation: data.basisExplanation,
      optionalEpicMasked: data.optionalEpicMasked,
      stateStatus: DeceasedReviewState.PENDING_REVIEW,
      createdAt: new Date().toISOString(),
    };

    db.deceasedReports.set(reportId, reportRecord);

    audit.logEvent({
      actor: reporterId,
      action: 'DECEASED_REPORT_SUBMITTED',
      resourceType: 'deceased_report',
      resourceRef: publicRef,
      reason: `Basis: ${data.basis}, Locality: ${data.locality}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.status(201).send({
      data: {
        report: reportRecord,
        publicRef,
        message:
          'Deceased person report received for internal verification. Note: Reports never trigger automated deletions or modifications to official electoral rolls.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/deceased-reports (Admin Only)
  app.get('/api/v1/deceased-reports', async (req: FastifyRequest, reply: FastifyReply) => {
    const reports = db.getDeceasedReports();
    return reply.send({
      data: reports,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/deceased-reports/:id/review
  app.post(
    '/api/v1/deceased-reports/:id/review',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = req.params;
      const report = db.deceasedReports.get(id);

      if (!report) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Report not found', requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }

      const body = req.body as any;
      const decision = body.decision as DeceasedReviewState;
      const notes = body.notes || 'Reviewed by staff';

      report.stateStatus = decision;

      audit.logEvent({
        actor: (req.headers['x-user-id'] as string) || 'reviewer',
        action: 'DECEASED_REPORT_REVIEWED',
        resourceType: 'deceased_report',
        resourceRef: report.publicRef,
        reason: `${decision}: ${notes}`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return reply.send({
        data: {
          report,
          message: 'Review recorded. Statutory deletion decisions are made solely by competent EROs following official Form 7 submission.',
        },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }
  );
}
