import { FastifyInstance } from 'fastify';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AIOrchestrator, ChatRequestSchema } from '../ai/orchestrator.js';
import { CloudSpeechToTextProvider, CloudTextToSpeechProvider } from '../ai/providers/stt-tts-providers.js';

export function registerAIRoutes(app: FastifyInstance, orchestrator: AIOrchestrator): void {
  const sttProvider = new CloudSpeechToTextProvider();
  const ttsProvider = new CloudTextToSpeechProvider();

  // 1. Declare Route Policies in RoutePolicyRegistry
  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/ai/chat',
    action: 'create',
    resource: 'ai_assistant',
    description: 'Interact with VoteRule AI civic assistant',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/ai/config',
    action: 'read',
    resource: 'ai_assistant',
    description: 'Get AI assistant configuration and feature flags',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/ai/session/clear',
    action: 'delete',
    resource: 'ai_assistant',
    description: 'Clear an active AI conversation session',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/ai/stt',
    action: 'create',
    resource: 'ai_assistant',
    description: 'Transcribe audio via server-side STT',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/ai/tts',
    action: 'create',
    resource: 'ai_assistant',
    description: 'Synthesize speech via server-side TTS',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/ai/knowledge',
    action: 'read',
    resource: 'ai_knowledge',
    description: 'Retrieve knowledge base chunks for verification',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/ai/knowledge/publish',
    action: 'review',
    resource: 'ai_knowledge',
    description: 'Publish verified statutory knowledge chunk',
  });

  // 2. Chat Endpoint (POST /api/v1/ai/chat)
  app.post('/api/v1/ai/chat', async (req, reply) => {
    const parseResult = ChatRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid chat request schema', issues: parseResult.error.issues },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const actorId = req.headers['x-user-id'] as string | undefined;
    const actorRole = (req.headers['x-actor-role'] as string) || (actorId ? 'CITIZEN' : 'ANONYMOUS');

    try {
      const result = await orchestrator.processChat(parseResult.data, { id: actorId, role: actorRole });
      return reply.send({
        data: result,
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    } catch (err: any) {
      return reply.status(500).send({
        error: { code: 'AI_ORCHESTRATION_ERROR', message: err.message || 'Error processing AI chat' },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }
  });

  // 3. Config & Flags (GET /api/v1/ai/config)
  app.get('/api/v1/ai/config', async (req, reply) => {
    return reply.send({
      data: {
        name: 'VoteRule AI',
        role: 'Your Digital Civic Assistant',
        version: '1.0.0',
        availableLanguages: ['en', 'hi', 'hinglish'],
        voiceEnabled: true,
        features: {
          webSpeechAvailable: true,
          cloudSttConfigured: sttProvider.isAvailable(),
          cloudTtsConfigured: ttsProvider.isAvailable(),
          guidedWorkflows: ['missing_name', 'new_registration', 'duplicate_concern', 'deceased_report'],
        },
        disclaimer:
          'VoteRule AI is an independent civic assistance technology. It is not affiliated with the Election Commission of India. Official determinations are made solely by competent statutory authorities.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // 4. Session Clear (POST /api/v1/ai/session/clear)
  app.post('/api/v1/ai/session/clear', async (req, reply) => {
    const body = req.body as { sessionId?: string };
    if (!body?.sessionId) {
      return reply.status(400).send({
        error: { code: 'INVALID_SESSION_ID', message: 'sessionId is required to clear conversation' },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    await orchestrator.clearSession(body.sessionId);
    return reply.send({
      data: { cleared: true, sessionId: body.sessionId },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // 5. STT Proxy (POST /api/v1/ai/stt)
  app.post('/api/v1/ai/stt', async (req, reply) => {
    const body = req.body as { audioBase64?: string; mimeType?: string; locale?: string };
    if (!sttProvider.isAvailable()) {
      return reply.send({
        data: { text: '', fallbackToBrowser: true, message: 'Cloud STT not configured; use browser Web Speech API' },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const buffer = Buffer.from(body.audioBase64 || '', 'base64');
    const result = await sttProvider.transcribe(buffer, body.mimeType || 'audio/webm', body.locale);
    return reply.send({
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // 6. TTS Proxy (POST /api/v1/ai/tts)
  app.post('/api/v1/ai/tts', async (req, reply) => {
    const body = req.body as { text?: string; locale?: string };
    if (!ttsProvider.isAvailable()) {
      return reply.send({
        data: { fallbackToBrowser: true, format: 'browser_synthesis', message: 'Cloud TTS not configured; use browser window.speechSynthesis' },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const result = await ttsProvider.synthesize(body.text || '', body.locale);
    return reply.send({
      data: result,
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // 7. Knowledge Listing (GET /api/v1/ai/knowledge)
  app.get('/api/v1/ai/knowledge', async (req, reply) => {
    const query = req.query as { q?: string; category?: string };
    const kb = orchestrator.getKnowledgeRetriever();
    let chunks;
    if (query.q) {
      chunks = await kb.search(query.q, { category: query.category, limit: 10, minScore: 0 });
    } else {
      chunks = await kb.getAll();
    }

    return reply.send({
      data: chunks,
      meta: { count: chunks.length, requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // 8. Knowledge Publish (POST /api/v1/ai/knowledge/publish)
  app.post('/api/v1/ai/knowledge/publish', async (req, reply) => {
    const body = req.body as { chunkId?: string; reviewer?: string };
    if (!body?.chunkId) {
      return reply.status(400).send({
        error: { code: 'INVALID_CHUNK_ID', message: 'chunkId is required' },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const kb = orchestrator.getKnowledgeRetriever();
    const success = await kb.publish(body.chunkId, body.reviewer || 'Administrator');
    return reply.send({
      data: { success, chunkId: body.chunkId },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });
}

