import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { GuidanceEngine } from '@voterrule/guidance';
import { AppConfig, loadConfig } from './config.js';
import { DatabaseStore } from './db/in-memory-db.js';
import { seedDemoDatabase } from './db/seeds.js';
import { FieldEncryptionService } from './crypto/encryption.js';
import { AuditService } from './audit/audit-service.js';
import { DocumentStorageService } from './storage/storage-adapter.js';
import { RedactedLogger } from './logger/redacted-logger.js';
import { RoutePolicyRegistry } from './policy/policy-registry.js';
import { registerAuthRoutes } from './routes/auth.js';
import { registerCaseRoutes } from './routes/cases.js';
import { registerStatusCheckRoutes } from './routes/status-checks.js';
import { registerDocumentRoutes } from './routes/documents.js';
import { registerGuidanceRoutes } from './routes/guidance.js';
import { registerDuplicateRoutes } from './routes/duplicate.js';
import { registerDeceasedRoutes } from './routes/deceased.js';
import { registerCheckInRoutes } from './routes/checkin.js';
import { registerAdminRoutes } from './routes/admin.js';
import { registerDpdpRoutes } from './routes/dpdp.js';
import { AIOrchestrator } from './ai/orchestrator.js';
import { registerAIRoutes } from './routes/ai.js';

export async function buildApp(customConfig?: Partial<AppConfig>): Promise<{
  app: FastifyInstance;
  db: DatabaseStore;
  encryption: FieldEncryptionService;
  audit: AuditService;
  storage: DocumentStorageService;
  logger: RedactedLogger;
  aiOrchestrator: AIOrchestrator;
}> {
  const config = { ...loadConfig(), ...customConfig };
  const app = Fastify({
    logger: false,
    requestIdHeader: 'x-request-id',
    genReqId: () => `req-${Math.random().toString(36).substring(2, 10)}`,
  });

  const db = new DatabaseStore();
  const encryption = new FieldEncryptionService(
    config.appSecret,
    config.blindIndexSecret,
    config.matchTokenSecret
  );
  const audit = new AuditService();
  const storage = new DocumentStorageService(config.storageLocalDir, config.clamAvEnabled);
  const logger = new RedactedLogger();
  const guidanceEngine = new GuidanceEngine();
  const aiOrchestrator = new AIOrchestrator(audit, db);

  // Seed synthetic data in demo mode
  if (config.appMode === 'demo') {
    await seedDemoDatabase(db, encryption);
  }

  // Security Plugins
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  await app.register(cors, {
    origin: [`http://localhost:${config.webPort}`, `http://localhost:${config.adminPort}`],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  // OpenAPI Swagger Documentation (served at /api/docs)
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'VoterRule API',
        description: 'Independent Electoral-Roll Verification and Inclusion-Assistance Platform API',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${config.port}` }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Global Central Policy Authorization Hook
  app.addHook('onRequest', async (req, reply) => {
    // Exempt docs, health check, and signed token downloads (which authenticate via the short-lived cryptographic token)
    if (
      req.url.startsWith('/api/docs') ||
      req.url === '/health' ||
      req.url === '/api/v1/health' ||
      req.url.startsWith('/api/v1/documents/download/')
    ) {
      return;
    }

    const actorRole = (req.headers['x-actor-role'] as any) || (req.headers['x-user-id'] ? 'CITIZEN' : 'ANONYMOUS');
    const actorId = req.headers['x-user-id'] as string;

    const pathPattern = (req as any).routeOptions?.url || req.routerPath || req.url.split('?')[0]!;
    const authCheck = RoutePolicyRegistry.authorize(
      req.method,
      pathPattern,
      { id: actorId, role: actorRole },
      { isOwnData: true }
    );

    if (!authCheck.allowed) {
      return reply.status(403).send({
        error: { code: 'POLICY_DENIED', message: authCheck.reason, requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }
  });

  // Health check endpoints
  app.get('/health', async (_req, reply) => {
    return reply.send({
      status: 'OK',
      mode: config.appMode,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/v1/health', async (_req, reply) => {
    return reply.send({
      status: 'OK',
      mode: config.appMode,
      timestamp: new Date().toISOString(),
    });
  });

  // Register All Route Modules
  registerAuthRoutes(app, db, encryption, audit);
  registerCaseRoutes(app, db, guidanceEngine, audit);
  registerStatusCheckRoutes(app, db, audit, config.appMode);
  registerDocumentRoutes(app, db, storage, audit);
  registerGuidanceRoutes(app, guidanceEngine);
  registerDuplicateRoutes(app, db, audit);
  registerDeceasedRoutes(app, db, audit);
  registerCheckInRoutes(app, db, audit);
  registerAdminRoutes(app, db, audit, config.appMode);
  registerDpdpRoutes(app, db, audit, config.dpdpGrievanceEmail);
  registerAIRoutes(app, aiOrchestrator);

  return { app, db, encryption, audit, storage, logger, aiOrchestrator };
}
