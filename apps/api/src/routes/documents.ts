import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import fs from 'fs';
import { DocumentType } from '@voterrule/shared';
import { DatabaseStore } from '../db/in-memory-db.js';
import { DocumentStorageService } from '../storage/storage-adapter.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerDocumentRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  storage: DocumentStorageService,
  audit: AuditService
): void {
  // Policy registration
  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/documents/upload',
    action: 'create',
    resource: 'document',
    description: 'Upload case document (PDF, JPEG, PNG) with virus scan',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/documents/:id/signed-url',
    action: 'download',
    resource: 'document',
    description: 'Generate 60-second short-lived signed access URL',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/documents/download/:token',
    action: 'download',
    resource: 'document',
    description: 'Download document via verified signed token',
  });

  // POST /api/v1/documents/upload
  app.post('/api/v1/documents/upload', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'synth-citizen-aarav-01';

    // Handle multipart file upload or base64 JSON payload
    const body = req.body as any;
    if (!body || !body.fileBase64 || !body.fileName || !body.docType) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: 'fileBase64, fileName, and docType are required', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const buffer = Buffer.from(body.fileBase64, 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      return reply.status(400).send({
        error: { code: 'FILE_TOO_LARGE', message: 'Maximum file size is 5 MB', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    try {
      const stored = await storage.storeDocument(buffer, body.fileName, body.docType as DocumentType);
      const docId = crypto.randomUUID();

      const docRecord = {
        id: docId,
        caseId: body.caseId || crypto.randomUUID(),
        storageKey: stored.storageKey,
        originalNameMasked: body.fileName.replace(/^(.{2})(.*)(\..+)$/, '$1***$3'),
        detectedMime: stored.detectedMime,
        sizeBytes: stored.sizeBytes,
        sha256: stored.sha256,
        scanStatus: stored.scanStatus,
        docType: body.docType as DocumentType,
        uploadedBy: userId,
        retentionUntil: stored.retentionUntil,
        createdAt: new Date().toISOString(),
      };

      db.caseDocuments.set(docId, docRecord);

      audit.logEvent({
        actor: userId,
        action: 'DOCUMENT_UPLOADED',
        resourceType: 'document',
        resourceRef: docId,
        reason: `Type: ${body.docType}, Size: ${stored.sizeBytes} bytes`,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return reply.status(201).send({
        data: {
          document: docRecord,
          message: 'Document uploaded and virus-scanned successfully.',
        },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    } catch (err: any) {
      return reply.status(400).send({
        error: { code: 'UPLOAD_FAILED', message: err.message, requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }
  });

  // GET /api/v1/documents/:id/signed-url
  app.get('/api/v1/documents/:id/signed-url', async (req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const { id } = req.params;
    const doc = db.caseDocuments.get(id);

    if (!doc) {
      return reply.status(404).send({
        error: { code: 'NOT_FOUND', message: 'Document not found', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const token = storage.generateSignedToken(doc.id, doc.storageKey);
    const downloadUrl = `/api/v1/documents/download/${token}`;

    audit.logEvent({
      actor: (req.headers['x-user-id'] as string) || 'unknown',
      action: 'DOCUMENT_URL_GENERATED',
      resourceType: 'document',
      resourceRef: doc.id,
      reason: (req.headers['x-access-reason'] as string) || 'User requested short-lived download link',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: {
        token,
        downloadUrl,
        expiresInSeconds: 60,
        instructions: 'This link is valid for 60 seconds only.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/documents/download/:token
  app.get('/api/v1/documents/download/:token', async (req: FastifyRequest<{ Params: { token: string } }>, reply: FastifyReply) => {
    const { token } = req.params;
    const verify = storage.verifySignedToken(token);

    if (!verify.valid || !verify.storageKey) {
      return reply.status(403).send({
        error: { code: 'LINK_EXPIRED', message: 'Signed download link is invalid or has expired', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const filePath = storage.getFilePath(verify.storageKey);
    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({
        error: { code: 'FILE_NOT_FOUND', message: 'Underlying document file not found', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const fileBuffer = fs.readFileSync(filePath);

    reply
      .header('Content-Type', 'application/octet-stream')
      .header('Content-Disposition', `attachment; filename="${verify.storageKey}"`)
      .header('X-Content-Type-Options', 'nosniff')
      .header('Cache-Control', 'no-store, no-cache, must-revalidate')
      .send(fileBuffer);
  });
}
