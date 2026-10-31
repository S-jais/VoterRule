import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  GuidanceEngine,
  ELIGIBILITY_QUESTIONS,
  HELPLINE_SEEDS,
  OFFICIAL_LINKS_SEEDS,
} from '@matdata-setu/guidance';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';

export function registerGuidanceRoutes(app: FastifyInstance, guidanceEngine: GuidanceEngine): void {
  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/guidance/items',
    action: 'read',
    resource: 'guidance',
    description: 'Get verified statutory guidance items (Forms 6, 6A, 6B, 7, 8)',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/guidance/recommend',
    action: 'read',
    resource: 'guidance',
    description: 'Run data-driven decision tree recommender',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/guidance/deadlines/:state',
    action: 'read',
    resource: 'guidance',
    description: 'Get verified state revision schedules and deadlines',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/guidance/checklists',
    action: 'read',
    resource: 'guidance',
    description: 'Document checklists per path with Aadhaar masking instructions',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/guidance/eligibility-questions',
    action: 'read',
    resource: 'guidance',
    description: 'Stateless eligibility questionnaire for adults and minors (no data stored)',
  });

  // GET /api/v1/guidance/items
  app.get('/api/v1/guidance/items', async (req: FastifyRequest, reply: FastifyReply) => {
    const items = guidanceEngine.getAllGuidanceItems();
    return reply.send({
      data: items,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/guidance/recommend
  app.get('/api/v1/guidance/recommend', async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const recommendation = guidanceEngine.recommendForm({
      hasPreviousRegistration: query.hasPreviousRegistration || 'NOT_SURE',
      hasEpicCard: query.hasEpicCard || 'NO',
      isShiftingResidence: query.isShiftingResidence || 'NO',
      hasNameOrParticularsCorrection: query.hasNameOrParticularsCorrection === 'true',
      needsReplacementEpic: query.needsReplacementEpic === 'true',
      needsPwdMarking: query.needsPwdMarking === 'true',
      isOverseasCitizen: query.isOverseasCitizen === 'true',
      suspectsDuplicateRecord: query.suspectsDuplicateRecord === 'true',
      userState: query.userState,
    });

    return reply.send({
      data: recommendation,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/guidance/deadlines/:state
  app.get('/api/v1/guidance/deadlines/:state', async (req: FastifyRequest<{ Params: { state: string } }>, reply: FastifyReply) => {
    const { state } = req.params;
    const deadlines = guidanceEngine.getStateDeadline(state);

    return reply.send({
      data: deadlines,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/guidance/checklists
  app.get('/api/v1/guidance/checklists', async (req: FastifyRequest, reply: FastifyReply) => {
    const checklists = guidanceEngine.getDocumentRequirements();
    return reply.send({
      data: checklists,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/guidance/eligibility-questions
  app.get('/api/v1/guidance/eligibility-questions', async (req: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      data: {
        questions: ELIGIBILITY_QUESTIONS,
        helplines: HELPLINE_SEEDS,
        officialLinks: OFFICIAL_LINKS_SEEDS,
        statelessNotice: 'This is an educational eligibility checker. No data or answers are stored.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });
}
