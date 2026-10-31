import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import {
  DuplicateReviewDecisionSchema,
  DuplicateReviewState,
  CaseCategory,
  FormCode,
  OfficialProcessStage,
  PortalCaseStatus,
  generatePublicCaseRef,
} from '@voterrule/shared';
import { DatabaseStore } from '../db/in-memory-db.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerDuplicateRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  audit: AuditService
): void {
  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/duplicate/self-check',
    action: 'create',
    resource: 'case',
    description: 'Self-check own situation for outdated past registration',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/duplicate/candidates',
    action: 'read',
    resource: 'duplicate_candidate',
    description: 'Review queue of potential duplicate candidates (masked)',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/duplicate/candidates/:id/review',
    action: 'review',
    resource: 'duplicate_candidate',
    description: 'Review duplicate candidate decision with four-eyes requirement',
  });

  // POST /api/v1/duplicate/self-check (Citizen Own-Duplicate Self Check)
  app.post('/api/v1/duplicate/self-check', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const body = req.body as any;

    const caseId = crypto.randomUUID();
    const publicRef = generatePublicCaseRef(2026);

    const newCase = {
      id: caseId,
      publicRef,
      userId,
      category: CaseCategory.OWN_DUPLICATE_CHECK,
      workflowStatus: PortalCaseStatus.OFFICIAL_PROCESS_RECOMMENDED,
      officialStage: OfficialProcessStage.STAGE_4_APPLICATION_PREPARED,
      recommendedFormCode: FormCode.FORM_7,
      guidanceVersionIds: ['guidance-form-7-v2026'],
      priority: 'NORMAL' as const,
      state: body.currentState || 'Delhi',
      nameAsReported: body.fullName || 'Self-Check User',
      addressSummary: body.currentAddress,
      previousAddressSummary: body.previousAddress,
      openedAt: new Date().toISOString(),
      reopenedCount: 0,
    };

    db.cases.set(caseId, newCase);

    db.caseEvents.push({
      id: crypto.randomUUID(),
      caseId,
      title: 'Duplicate Self-Check Initiated',
      description: 'Self-check guidance provided: Section 17 RPA 1950 prohibits duplicate registration. Recommended statutory Form 7 for outdated entry deletion.',
      timestamp: new Date().toISOString(),
      userVisible: true,
    });

    audit.logEvent({
      actor: userId,
      action: 'DUPLICATE_SELF_CHECK_CREATED',
      resourceType: 'case',
      resourceRef: publicRef,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.status(201).send({
      data: {
        case: newCase,
        publicRef,
        recommendedForm: 'Form 7 (Application for Deletion of Superfluous/Outdated Entry)',
        instructions: [
          'Verify your current valid registration first before seeking deletion of your old entry.',
          'Submit statutory Form 7 to the ERO of your previous constituency to delete the prior record.',
        ],
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/duplicate/candidates (Reviewer Queue)
  app.get('/api/v1/duplicate/candidates', async (req: FastifyRequest, reply: FastifyReply) => {
    const candidates = db.getDuplicateCandidates();

    return reply.send({
      data: candidates,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/duplicate/candidates/:id/review
  app.post(
    '/api/v1/duplicate/candidates/:id/review',
    async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      const { id } = req.params;
      const candidate = db.duplicateCandidates.get(id);

      if (!candidate) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Candidate record not found', requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }

      const parse = DuplicateReviewDecisionSchema.safeParse(req.body);
      if (!parse.success) {
        return reply.status(400).send({
          error: { code: 'INVALID_INPUT', message: parse.error.errors[0]?.message, requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }

      const { decision, reasonText } = parse.data;
      const reviewerId = (req.headers['x-user-id'] as string) || 'reviewer-01';

      // 4-eyes approval constraint for VERIFIED_DISCREPANCY_RECORDED
      if (decision === DuplicateReviewState.VERIFIED_DISCREPANCY_RECORDED) {
        const body = req.body as any;
        const secondReviewerId = body.secondReviewerId;

        if (!secondReviewerId || secondReviewerId === reviewerId) {
          return reply.status(403).send({
            error: {
              code: 'FOUR_EYES_REQUIRED',
              message:
                'Recording a verified discrepancy for referral strictly requires concurrence from an independent second reviewer.',
              requestId: req.id,
            },
            meta: { requestId: req.id, timestamp: new Date().toISOString() },
          });
        }

        candidate.secondReviewer = secondReviewerId;
      }

      candidate.state = decision;

      audit.logEvent({
        actor: reviewerId,
        action: 'DUPLICATE_CANDIDATE_REVIEWED',
        resourceType: 'duplicate_candidate',
        resourceRef: candidate.id,
        reason: `${decision}: ${reasonText}`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return reply.send({
        data: {
          candidate,
          message: 'Review decision recorded. Note: Candidate scoring never alters citizen roll records or case status automatically.',
        },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }
  );
}
