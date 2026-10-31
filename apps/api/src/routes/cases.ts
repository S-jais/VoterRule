import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import {
  CreateCaseSchema,
  PortalCaseStatus,
  OfficialProcessStage,
  StaffRole,
  canTransitionPortalCase,
  canSetOfficialStage,
  generatePublicCaseRef,
} from '@voterrule/shared';
import { GuidanceEngine } from '@voterrule/guidance';
import { DatabaseStore } from '../db/in-memory-db.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerCaseRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  guidanceEngine: GuidanceEngine,
  audit: AuditService
): void {
  // Policy registration
  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/cases',
    action: 'create',
    resource: 'case',
    description: 'Create a new civic assistance case (idempotent)',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/cases',
    action: 'read',
    resource: 'case',
    description: 'List assistance cases for current user',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/cases/:ref',
    action: 'read',
    resource: 'case',
    description: 'Get case details and activity timeline by public reference',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/cases/:ref/report-submission',
    action: 'update',
    resource: 'case',
    description: 'Report user submission to official election authorities (Stage 5)',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/cases/:ref/transition',
    action: 'update',
    resource: 'case',
    description: 'Transition portal case workflow status or official statutory stage',
  });

  // POST /api/v1/cases (Create Case)
  app.post('/api/v1/cases', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const idempotencyKey = req.headers['idempotency-key'] as string;

    // Check Idempotency Key
    if (idempotencyKey && db.idempotencyKeys.has(idempotencyKey)) {
      const cached = db.idempotencyKeys.get(idempotencyKey)!;
      return reply.send(cached.result);
    }

    const parse = CreateCaseSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: parse.error.errors[0]?.message, requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const data = parse.data;
    const caseId = crypto.randomUUID();
    const publicRef = generatePublicCaseRef(2026);

    // Run decision tree recommender
    const recommendation = guidanceEngine.recommendForm({
      hasPreviousRegistration: 'YES',
      hasEpicCard: data.epicNumberProvided ? 'YES' : 'NO',
      isShiftingResidence: data.previousAddressSummary ? 'ACROSS_CONSTITUENCY' : 'NO',
      hasNameOrParticularsCorrection: data.category === 'CORRECTION_PARTICULARS',
      needsReplacementEpic: data.category === 'REPLACEMENT_EPIC',
      needsPwdMarking: data.category === 'PWD_MARKING',
      isOverseasCitizen: data.category === 'OVERSEAS_ELECTOR',
      suspectsDuplicateRecord: data.category === 'OWN_DUPLICATE_CHECK',
      userState: data.state,
    });

    const newCase = {
      id: caseId,
      publicRef,
      userId,
      category: data.category,
      workflowStatus: PortalCaseStatus.SUBMITTED_TO_PORTAL,
      officialStage: OfficialProcessStage.STAGE_4_APPLICATION_PREPARED,
      recommendedFormCode: recommendation.recommendedForm,
      guidanceVersionIds: data.guidanceVersionIds,
      priority: 'NORMAL' as const,
      idempotencyKey,
      state: data.state,
      district: data.district,
      assemblyConstituency: data.assemblyConstituency,
      partNumber: data.partNumber,
      nameAsReported: data.nameAsReported,
      relativeName: data.relativeName,
      dobYear: data.dobYear,
      addressSummary: data.addressSummary,
      previousAddressSummary: data.previousAddressSummary,
      openedAt: new Date().toISOString(),
      reopenedCount: 0,
    };

    db.cases.set(caseId, newCase);

    // Save Intake Answers
    for (const ans of data.answers) {
      db.caseIntakeAnswers.push({
        id: crypto.randomUUID(),
        caseId,
        questionId: ans.questionId,
        answer: ans.answer,
        guidanceVersion: ans.guidanceVersion,
      });
    }

    // Initial Case Status History
    db.caseStatusHistory.push({
      id: crypto.randomUUID(),
      caseId,
      fromStatus: PortalCaseStatus.DRAFT,
      toStatus: PortalCaseStatus.SUBMITTED_TO_PORTAL,
      actor: userId,
      reason: 'Citizen completed intake wizard and submitted assistance case.',
      timestamp: new Date().toISOString(),
    });

    // Case Event
    db.caseEvents.push({
      id: crypto.randomUUID(),
      caseId,
      title: 'Assistance Case Initiated',
      description: `Portal case reference ${publicRef} created. Recommended: ${recommendation.formNameEn}.`,
      timestamp: new Date().toISOString(),
      userVisible: true,
    });

    // Generate Application Preparation Sheet data
    const preparationSheet = {
      title: 'Application Preparation Sheet (Offline & Online Guide)',
      disclaimer: 'NOT AN OFFICIAL FORM. This sheet does NOT register you. Use these fields to complete the official form at voters.eci.gov.in or submit to your Electoral Registration Officer (ERO).',
      portalReference: publicRef,
      recommendedForm: recommendation.formNameEn,
      recommendedFormHi: recommendation.formNameHi,
      statutoryBasis: recommendation.statutoryBasisEn,
      officialPortalUrl: recommendation.officialSourceUrl,
      applicantFields: {
        name: data.nameAsReported,
        relativeName: data.relativeName || 'Not specified',
        birthYear: data.dobYear || 'Not specified',
        state: data.state,
        district: data.district || 'Not specified',
        assemblyConstituency: data.assemblyConstituency || 'Not specified',
        address: data.addressSummary || 'Not specified',
        priorAddress: data.previousAddressSummary || 'None',
      },
      documentChecklist: recommendation.documentChecklistIds,
      instructions: [
        '1. Ensure you have an acceptable proof of age and proof of ordinary residence.',
        '2. Mask the first 8 digits of Aadhaar on all uploaded or submitted documents.',
        '3. Visit voters.eci.gov.in or your local ERO office during claims & objections window.',
        '4. Keep the official ECI acknowledgement receipt number safely and report it here.',
      ],
    };

    audit.logEvent({
      actor: userId,
      action: 'CASE_CREATED',
      resourceType: 'case',
      resourceRef: publicRef,
      reason: `Category: ${data.category}`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    const responsePayload = {
      data: {
        case: newCase,
        publicRef,
        recommendation,
        preparationSheet,
        message: 'Assistance case successfully created.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    };

    if (idempotencyKey) {
      db.idempotencyKeys.set(idempotencyKey, { result: responsePayload, createdAt: Date.now() });
    }

    return reply.status(201).send(responsePayload);
  });

  // GET /api/v1/cases (List User Cases)
  app.get('/api/v1/cases', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';
    const userCases = db.getCasesByUserId(userId);

    return reply.send({
      data: userCases,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/cases/:ref (Get Case Details)
  app.get('/api/v1/cases/:ref', async (req: FastifyRequest<{ Params: { ref: string } }>, reply: FastifyReply) => {
    const { ref } = req.params;
    const c = db.findCaseByPublicRef(ref);

    if (!c) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Assistance case reference not found', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const events = db.caseEvents.filter((e) => e.caseId === c.id);
    const documents = db.getDocumentsByCaseId(c.id);
    const answers = db.caseIntakeAnswers.filter((a) => a.caseId === c.id);
    const submissionReports = db.officialSubmissionReports.filter((r) => r.caseId === c.id);

    return reply.send({
      data: {
        case: c,
        events,
        documents,
        answers,
        submissionReports,
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/cases/:ref/report-submission (Stage 5 user-reported submission)
  app.post(
    '/api/v1/cases/:ref/report-submission',
    async (req: FastifyRequest<{ Params: { ref: string } }>, reply: FastifyReply) => {
      const { ref } = req.params;
      const c = db.findCaseByPublicRef(ref);

      if (!c) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Case not found', requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }

      const body = req.body as any;
      const channel = body.channel || 'ECI_VOTERS_PORTAL';
      const acknowledgementRef = body.acknowledgementRef;

      // Update case to Stage 5
      c.officialStage = OfficialProcessStage.STAGE_5_SUBMITTED_VIA_OFFICIAL_CHANNEL_USER_REPORTED;
      c.workflowStatus = PortalCaseStatus.OFFICIAL_SUBMISSION_REPORTED_BY_USER;

      db.officialSubmissionReports.push({
        id: crypto.randomUUID(),
        caseId: c.id,
        reportedBy: c.userId,
        channel,
        acknowledgementRef: acknowledgementRef ? `${acknowledgementRef} (User Reported)` : undefined,
        submittedDate: new Date().toISOString(),
        notes: body.notes,
      });

      db.caseEvents.push({
        id: crypto.randomUUID(),
        caseId: c.id,
        title: 'Official Submission Reported by Citizen',
        description: `Citizen reported submitting via ${channel}. Acknowledgement Ref: ${acknowledgementRef || 'None provided'} (Self-reported, not officially confirmed).`,
        timestamp: new Date().toISOString(),
        userVisible: true,
      });

      audit.logEvent({
        actor: c.userId,
        action: 'OFFICIAL_SUBMISSION_REPORTED',
        resourceType: 'case',
        resourceRef: c.publicRef,
        reason: `Channel: ${channel}`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return reply.send({
        data: {
          case: c,
          message: 'Official submission report recorded. Note: This indicates self-reported submission and is not an official ECI confirmation.',
        },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }
  );

  // POST /api/v1/cases/:ref/transition (Workflow & Official Stage Transitions)
  app.post(
    '/api/v1/cases/:ref/transition',
    async (req: FastifyRequest<{ Params: { ref: string } }>, reply: FastifyReply) => {
      const { ref } = req.params;
      const c = db.findCaseByPublicRef(ref);

      if (!c) {
        return reply.status(404).send({
          error: { code: 'NOT_FOUND', message: 'Case not found', requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }

      const body = req.body as any;
      const targetWorkflowStatus = body.targetWorkflowStatus as PortalCaseStatus | undefined;
      const targetOfficialStage = body.targetOfficialStage as OfficialProcessStage | undefined;
      const actorRole = (req.headers['x-actor-role'] as StaffRole) || 'CITIZEN';
      const actorId = (req.headers['x-user-id'] as string) || c.userId;
      const hasEvidence = !!body.evidenceDocumentId;

      // 1. Check Official Stage Guards (§4: Stages 6-8 require reviewer + evidence)
      if (targetOfficialStage) {
        const guard = canSetOfficialStage(targetOfficialStage, actorRole, hasEvidence);
        if (!guard.allowed) {
          return reply.status(403).send({
            error: {
              code: 'STAGE_GUARD_REJECTED',
              message: guard.reason || 'Unauthorized official stage transition',
              requestId: req.id,
            },
            meta: { requestId: req.id, timestamp: new Date().toISOString() },
          });
        }
        c.officialStage = targetOfficialStage;
      }

      // 2. Check Portal Workflow Status transitions
      if (targetWorkflowStatus) {
        const isLegal = canTransitionPortalCase(c.workflowStatus, targetWorkflowStatus, actorRole);
        if (!isLegal) {
          return reply.status(400).send({
            error: {
              code: 'ILLEGAL_TRANSITION',
              message: `Cannot transition case workflow from ${c.workflowStatus} to ${targetWorkflowStatus} with role ${actorRole}`,
              requestId: req.id,
            },
            meta: { requestId: req.id, timestamp: new Date().toISOString() },
          });
        }

        const oldStatus = c.workflowStatus;
        c.workflowStatus = targetWorkflowStatus;

        db.caseStatusHistory.push({
          id: crypto.randomUUID(),
          caseId: c.id,
          fromStatus: oldStatus,
          toStatus: targetWorkflowStatus,
          actor: actorId,
          reason: body.reason || 'Status updated via state machine transition',
          timestamp: new Date().toISOString(),
        });
      }

      audit.logEvent({
        actor: actorId,
        action: 'CASE_STATUS_TRANSITIONED',
        resourceType: 'case',
        resourceRef: c.publicRef,
        reason: body.reason,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return reply.send({
        data: {
          case: c,
          message: 'Case status updated successfully.',
        },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }
  );
}
