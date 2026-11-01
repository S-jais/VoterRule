import { describe, it, expect, beforeEach } from 'vitest';
import { AuditService } from '../audit/audit-service.js';
import { DatabaseStore } from '../db/in-memory-db.js';
import { AIOrchestrator } from '../ai/orchestrator.js';
import { IntentClassifier } from '../ai/intent/classifier.js';
import { KnowledgeBaseService } from '../ai/knowledge/knowledge-base.js';

describe('AI Orchestrator & Knowledge Subsystem', () => {
  let orchestrator: AIOrchestrator;
  let audit: AuditService;
  let db: DatabaseStore;

  beforeEach(() => {
    audit = new AuditService();
    db = new DatabaseStore();
    orchestrator = new AIOrchestrator(audit, db);
  });

  describe('Intent Classification (All 14 Intents)', () => {
    it('classifies greetings', () => {
      const res = IntentClassifier.classify('Hello there, namaste!');
      expect(res.intent).toBe('greeting');
    });

    it('classifies missing name assistance requests', () => {
      const res = IntentClassifier.classify('My name is missing from the voter list in Delhi');
      expect(res.intent).toBe('missing_name_assistance');
      expect(res.needsRetrieval).toBe(true);
    });

    it('classifies eligibility queries', () => {
      const res = IntentClassifier.classify('Am I eligible to vote if I turn 18 on 1 October?');
      expect(res.intent).toBe('eligibility_guidance');
      expect(res.needsRetrieval).toBe(true);
    });

    it('classifies voter registration and statutory forms', () => {
      const res6 = IntentClassifier.classify('How do I apply for Form 6?');
      expect(res6.intent).toBe('voter_registration_guidance');
      expect(res6.extractedEntities?.formCode).toBe('FORM_6');

      const res8 = IntentClassifier.classify('I need to shift my address using Form 8');
      expect(res8.intent).toBe('voter_registration_guidance');
      expect(res8.extractedEntities?.formCode).toBe('FORM_8');
    });

    it('classifies duplicate registration concerns', () => {
      const res = IntentClassifier.classify('I moved cities, do I have a duplicate voter ID?');
      expect(res.intent).toBe('duplicate_registration_guidance');
      expect(res.needsRetrieval).toBe(true);
    });

    it('classifies deceased elector reporting', () => {
      const res = IntentClassifier.classify('How can I report a deceased relative to remove them from the roll?');
      expect(res.intent).toBe('deceased_person_reporting_guidance');
      expect(res.needsRetrieval).toBe(true);
    });

    it('classifies electoral law questions', () => {
      const res = IntentClassifier.classify('What does Article 326 of the Constitution say?');
      expect(res.intent).toBe('electoral_law_question');
      expect(res.needsRetrieval).toBe(true);
    });

    it('classifies website navigation commands', () => {
      const res = IntentClassifier.classify('Take me to status check');
      expect(res.intent).toBe('website_navigation');
      expect(res.extractedEntities?.routeId).toBe('check_voter_status');
    });

    it('classifies voice control commands', () => {
      const res = IntentClassifier.classify('Stop speaking');
      expect(res.intent).toBe('voice_control_command');
      expect(res.needsAction).toBe(true);
    });

    it('classifies out of scope / partisan requests', () => {
      const res = IntentClassifier.classify('Which political party should I vote for in the upcoming election?');
      expect(res.intent).toBe('out_of_scope_or_unsupported');
    });
  });

  describe('PII Redaction Engine', () => {
    it('redacts EPIC numbers from user text', () => {
      const text = 'My voter card number is ABC1234567, please check it.';
      const sanitized = orchestrator.redactPII(text);
      expect(sanitized).not.toContain('ABC1234567');
      expect(sanitized).toContain('[REDACTED_EPIC]');
    });

    it('redacts 12-digit Aadhaar patterns', () => {
      const text = 'Here is my id: 1234 5678 9012 for verification';
      const sanitized = orchestrator.redactPII(text);
      expect(sanitized).not.toContain('1234 5678 9012');
      expect(sanitized).toContain('[REDACTED_AADHAAR_PATTERN]');
    });

    it('redacts Indian mobile phone numbers', () => {
      const text = 'Call me at +919876543210 regarding my case';
      const sanitized = orchestrator.redactPII(text);
      expect(sanitized).not.toContain('9876543210');
      expect(sanitized).toContain('[REDACTED_PHONE]');
    });
  });

  describe('Knowledge Retrieval (RAG)', () => {
    it('retrieves Form 6 statutory chunk with official citation and verification date', async () => {
      const kb = new KnowledgeBaseService();
      const chunks = await kb.search('Form 6 application for inclusion of name', { limit: 2 });
      expect(chunks.length).toBeGreaterThan(0);
      const chunk = chunks[0]!;
      expect(chunk.title).toContain('Form 6');
      expect(chunk.officialSource).toContain('Registration of Electors Rules 1960');
      expect(chunk.reviewStatus).toBe('published');
      expect(chunk.lastVerifiedDate).toBeDefined();
    });

    it('retrieves Article 326 constitutional provisions', async () => {
      const kb = new KnowledgeBaseService();
      const chunks = await kb.search('Article 326 universal adult suffrage', { limit: 2 });
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]!.text).toContain('Article 326');
      expect(chunks[0]!.officialSource).toBe('Constitution of India');
    });

    it('retrieves National Voter Helpline 1950', async () => {
      const kb = new KnowledgeBaseService();
      const chunks = await kb.search('National Voter Helpline 1950 toll free', { limit: 1 });
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]!.text).toContain('1950');
    });
  });

  describe('End-to-End Orchestration & Session Isolation', () => {
    it('processes user chat and returns structured message with citations and spokenText', async () => {
      const res = await orchestrator.processChat(
        {
          sessionId: 'test-session-001',
          message: 'My name is missing from the roll, how do I apply for Form 6?',
          locale: 'en',
        },
        { id: 'user-001', role: 'CITIZEN' }
      );

      expect(res.message.role).toBe('assistant');
      expect(res.message.content.length).toBeGreaterThan(20);
      expect(res.message.spokenText).toBeDefined();
      expect(res.message.spokenText?.length).toBeGreaterThan(5);
      // Voice brevity: spoken text should not contain markdown raw URLs
      expect(res.message.spokenText).not.toContain('http');
      expect(res.message.citations?.length).toBeGreaterThan(0);
    });

    it('clears conversation session completely on request', async () => {
      await orchestrator.processChat(
        { sessionId: 'session-to-clear', message: 'Hello' },
        { id: 'user-002', role: 'ANONYMOUS' }
      );
      await orchestrator.clearSession('session-to-clear');
      // New turn starts fresh
      const res = await orchestrator.processChat(
        { sessionId: 'session-to-clear', message: 'Hello again' },
        { id: 'user-002', role: 'ANONYMOUS' }
      );
      expect(res.session.messageCount).toBe(2); // Only this turn (1 user + 1 assistant)
    });
  });
});
