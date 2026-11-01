import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { AuditService } from '../audit/audit-service.js';
import { DatabaseStore } from '../db/in-memory-db.js';
import { IntentClassifier } from './intent/classifier.js';
import {
  AIAction,
  ChatMessage,
  KnowledgeChunk,
  KnowledgeRetriever,
  LLMProvider,
  SessionStore,
  WorkflowState,
} from './interfaces.js';
import { GeminiLLMProvider } from './providers/gemini-llm-provider.js';
import { InMemorySessionStore } from './providers/in-memory-session-store.js';
import { KnowledgeBaseService } from './knowledge/knowledge-base.js';
import { WorkflowEngine } from './workflows/workflow-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ChatRequestSchema = z.object({
  sessionId: z.string().min(1).max(128),
  message: z.string().min(1).max(2000),
  currentRouteId: z.string().optional(),
  visibleSectionIds: z.array(z.string()).optional(),
  selectedOptionId: z.string().optional(),
  voiceEnabled: z.boolean().optional(),
  locale: z.enum(['en', 'hi', 'as', 'bn', 'gu', 'kn', 'kok', 'ml', 'mr', 'or', 'pa', 'ta', 'te', 'ur']).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;

export class AIOrchestrator {
  private llm: LLMProvider;
  private kb: KnowledgeRetriever;
  private sessionStore: SessionStore;
  private audit: AuditService;
  private db: DatabaseStore;

  // Allowlisted Route IDs from generated App Knowledge Map
  private allowedRouteIds = new Set<string>();
  // Allowlisted highlightable element target IDs
  private allowedTargetIds = new Set<string>();

  constructor(
    audit: AuditService,
    db: DatabaseStore,
    customLLM?: LLMProvider,
    customKB?: KnowledgeRetriever,
    customStore?: SessionStore
  ) {
    this.audit = audit;
    this.db = db;
    this.llm = customLLM || new GeminiLLMProvider();
    this.kb = customKB || new KnowledgeBaseService();
    this.sessionStore = customStore || new InMemorySessionStore();
    this.loadAllowlists();
  }

  public getDatabase(): DatabaseStore {
    return this.db;
  }

  private loadAllowlists(): void {
    try {
      const jsonPath = path.join(__dirname, 'knowledge', 'app-knowledge.generated.json');
      if (fs.existsSync(jsonPath)) {
        const routes = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        for (const r of routes) {
          this.allowedRouteIds.add(r.routeId);
          for (const h of r.highlightableElementIds || []) {
            this.allowedTargetIds.add(h.targetId);
          }
        }
      }
    } catch {
      // Fallback defaults
      ['home', 'check_voter_status', 'missing_name_assistance', 'duplicate_self_check', 'deceased_person_report', 'eligibility_check', 'dashboard'].forEach(id => this.allowedRouteIds.add(id));
    }
  }

  /**
   * Redact sensitive personal identifiers before sending to external LLM or logs
   */
  public redactPII(text: string): string {
    return text
      // Redact Indian mobile phone numbers first (with optional +91 or 91)
      .replace(/(?:\+?91[\s-]?)?[6789]\d{9}\b/g, '[REDACTED_PHONE]')
      // Redact 10-character alphanumeric EPIC numbers (e.g. ABC1234567)
      .replace(/\b[A-Z]{3}[0-9]{7}\b/gi, '[REDACTED_EPIC]')
      // Redact 12-digit Aadhaar patterns
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\b/g, '[REDACTED_AADHAAR_PATTERN]');
  }

  public async processChat(
    req: ChatRequest,
    actor: { id?: string; role?: string }
  ): Promise<{
    message: ChatMessage;
    session: { sessionId: string; messageCount: number };
  }> {
    // 1. Fetch or initialize session
    let session = await this.sessionStore.getSession(req.sessionId);
    if (!session) {
      session = {
        sessionId: req.sessionId,
        userId: actor.id,
        messages: [],
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
    }

    // 2. Redact sensitive PII from incoming message
    const sanitizedText = this.redactPII(req.message.trim());

    // 3. Classify Intent & Detect Language
    const classification = IntentClassifier.classify(sanitizedText, {
      currentRouteId: req.currentRouteId,
      lastIntent: session.messages[session.messages.length - 1]?.intent,
    });

    // 4. Handle Workflow Transitions
    let activeWorkflow: WorkflowState | undefined = session.activeWorkflow;

    if (req.selectedOptionId && activeWorkflow && !activeWorkflow.completed) {
      const stepResult = WorkflowEngine.transition(activeWorkflow, req.selectedOptionId);
      activeWorkflow = stepResult.nextState;
    } else if (classification.extractedEntities?.workflowId && !activeWorkflow) {
      activeWorkflow = WorkflowEngine.startWorkflow(classification.extractedEntities.workflowId);
    }

    // 5. Knowledge Retrieval
    let retrievedChunks: KnowledgeChunk[] = [];
    if (classification.needsRetrieval) {
      retrievedChunks = await this.kb.search(sanitizedText, { limit: 4 });
    }

    // 6. Generate Response via Provider
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: sanitizedText,
      intent: classification.intent,
      timestamp: new Date().toISOString(),
    };

    const conversationHistory = [...session.messages, userMsg];

    const llmResult = await this.llm.generateResponse(conversationHistory, retrievedChunks, {
      locale: req.locale || classification.language,
      actorId: actor.id,
      actorRole: actor.role,
      currentRouteId: req.currentRouteId,
      visibleSectionIds: req.visibleSectionIds,
      activeWorkflow,
    });

    // 7. Validate Actions Against Allowlist
    const validatedActions: AIAction[] = [];
    for (const act of llmResult.actions) {
      if (act.type === 'navigate_to') {
        const routeId = act.payload?.routeId;
        if (routeId && this.allowedRouteIds.has(routeId)) {
          validatedActions.push(act);
        }
      } else if (act.type === 'highlight_element') {
        const targetId = act.payload?.targetId;
        if (targetId && this.allowedTargetIds.has(targetId)) {
          validatedActions.push(act);
        }
      } else if (act.type === 'scroll_to_section') {
        validatedActions.push(act);
      } else if (act.type === 'open_official_source') {
        // Must be verified official domain
        const url = act.payload?.url || '';
        if (url.startsWith('https://voters.eci.gov.in') || url.startsWith('https://electoralsearch.eci.gov.in') || url.startsWith('https://www.eci.gov.in') || url.startsWith('https://www.indiacode.nic.in')) {
          validatedActions.push(act);
        }
      } else if (act.type === 'start_workflow') {
        validatedActions.push(act);
      } else {
        validatedActions.push(act);
      }
    }

    // 8. If workflow is active, present workflow state
    let finalDisplayText = llmResult.displayText;
    let finalSpokenText = llmResult.spokenText;

    if (activeWorkflow && !activeWorkflow.completed) {
      const def = WorkflowEngine.getDefinition(activeWorkflow.workflowId);
      const step = def?.steps.find((s) => s.id === activeWorkflow?.currentStepId);
      if (step) {
        const isHi = req.locale === 'hi' || classification.language === 'hi';
        const qText = isHi ? step.questionHi : step.questionEn;
        finalDisplayText = `${qText}\n\n**Step ${activeWorkflow.stepIndex} of ${activeWorkflow.totalSteps}: ${isHi ? step.titleHi : step.titleEn}**`;
        finalSpokenText = qText;

        if (step.options) {
          for (const opt of step.options) {
            if (opt.recommendedAction) {
              validatedActions.push(opt.recommendedAction);
            }
          }
        }
      }
    }

    // 9. Assemble Assistant Message
    const assistantMsg: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      role: 'assistant',
      content: finalDisplayText,
      spokenText: finalSpokenText,
      intent: classification.intent,
      citations: llmResult.citations,
      actions: validatedActions,
      workflow: activeWorkflow,
      timestamp: new Date().toISOString(),
    };

    // 10. Update Session State
    session.messages.push(userMsg, assistantMsg);
    session.activeWorkflow = activeWorkflow;
    await this.sessionStore.saveSession(session);

    // 11. Write Cryptographic Audit Entry
    this.audit.logEvent({
      actor: actor.id || 'anonymous',
      action: 'query_ai_assistant',
      resourceType: 'ai_assistant',
      resourceRef: req.sessionId,
      reason: `intent:${classification.intent}`,
    });

    return {
      message: assistantMsg,
      session: {
        sessionId: session.sessionId,
        messageCount: session.messages.length,
      },
    };
  }

  public async clearSession(sessionId: string): Promise<void> {
    await this.sessionStore.clearSession(sessionId);
  }

  public getKnowledgeRetriever(): KnowledgeRetriever {
    return this.kb;
  }
}
