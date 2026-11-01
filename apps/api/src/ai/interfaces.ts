export type IntentType =
  | 'greeting'
  | 'voterule_feature_explanation'
  | 'electoral_law_question'
  | 'eligibility_guidance'
  | 'voter_registration_guidance'
  | 'missing_name_assistance'
  | 'duplicate_registration_guidance'
  | 'deceased_person_reporting_guidance'
  | 'website_navigation'
  | 'user_dashboard_assistance'
  | 'case_tracking'
  | 'account_assistance'
  | 'voice_control_command'
  | 'out_of_scope_or_unsupported';

export interface IntentClassificationResult {
  intent: IntentType;
  confidence: number;
  language: 'en' | 'hi' | 'hinglish';
  needsRetrieval: boolean;
  needsAction: boolean;
  needsConfirmation: boolean;
  needsHuman: boolean;
  extractedEntities?: {
    formCode?: string;
    epicNumber?: string;
    state?: string;
    routeId?: string;
    workflowId?: string;
    actionCommand?: string;
  };
}

export interface Citation {
  id: string;
  title: string;
  officialSource: string;
  sourceUrl: string;
  lastVerifiedDate: string;
  category: string;
  snippet?: string;
}

export type ActionType =
  | 'navigate_to'
  | 'scroll_to_section'
  | 'highlight_element'
  | 'open_help'
  | 'open_official_source'
  | 'start_workflow'
  | 'confirm_action'
  | 'voice_command';

export interface AIAction {
  id: string;
  type: ActionType;
  label: string;
  payload: Record<string, any>;
  requiresConfirmation?: boolean;
  confirmationPrompt?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  spokenText?: string;
  intent?: IntentType;
  citations?: Citation[];
  actions?: AIAction[];
  workflow?: WorkflowState;
  timestamp: string;
}

export interface WorkflowStep {
  id: string;
  titleEn: string;
  titleHi: string;
  questionEn: string;
  questionHi: string;
  options?: {
    id: string;
    labelEn: string;
    labelHi: string;
    nextStepId?: string;
    recommendedAction?: AIAction;
  }[];
  allowedTools: string[];
  requiresConfirmation?: boolean;
}

export interface WorkflowDefinition {
  id: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
  steps: WorkflowStep[];
  startingRouteId: string;
  officialReference: {
    title: string;
    url: string;
  };
}

export interface WorkflowState {
  workflowId: string;
  currentStepId: string;
  stepIndex: number;
  totalSteps: number;
  answers: Record<string, any>;
  completed: boolean;
  cancelled: boolean;
  recommendedForm?: string;
  outcomeMessage?: string;
}

export type ReviewStatus = 'draft' | 'in_review' | 'published' | 'outdated' | 'withdrawn';

export interface KnowledgeChunk {
  id: string;
  title: string;
  officialSource: string;
  sourceUrl: string;
  category:
    | 'constitutional_provisions'
    | 'electoral_laws'
    | 'eci_guidelines'
    | 'registration_processes'
    | 'forms'
    | 'eligibility'
    | 'duplicate_rules'
    | 'official_faqs'
    | 'voterrule_app_docs'
    | 'voterrule_faqs'
    | 'support_procedures';
  language: string;
  publicationDate?: string;
  lastVerifiedDate: string;
  version: string;
  text: string;
  reviewStatus: ReviewStatus;
  reviewedBy?: string;
  publishedAt?: string;
  supersedes?: string;
}

export interface LLMResponse {
  displayText: string;
  spokenText: string;
  intent: IntentType;
  citations: Citation[];
  actions: AIAction[];
  suggestedPrompts: string[];
}

export interface LLMOptions {
  locale?: string;
  actorId?: string;
  actorRole?: string;
  currentRouteId?: string;
  visibleSectionIds?: string[];
  activeWorkflow?: WorkflowState;
}

export interface LLMProvider {
  name: string;
  isAvailable(): boolean;
  generateResponse(
    messages: ChatMessage[],
    retrievedChunks: KnowledgeChunk[],
    options: LLMOptions
  ): Promise<LLMResponse>;
}

export interface SpeechToTextProvider {
  name: string;
  isAvailable(): boolean;
  transcribe(audioBuffer: Buffer, mimeType: string, locale?: string): Promise<{ text: string; confidence: number }>;
}

export interface TextToSpeechProvider {
  name: string;
  isAvailable(): boolean;
  synthesize(text: string, locale?: string): Promise<{ audioBase64?: string; audioUrl?: string; format: string }>;
}

export interface KnowledgeRetriever {
  search(query: string, options?: { category?: string; limit?: number; minScore?: number }): Promise<KnowledgeChunk[]>;
  getAll(status?: ReviewStatus): Promise<KnowledgeChunk[]>;
  publish(chunkId: string, reviewer: string): Promise<boolean>;
  markOutdated(chunkId: string): Promise<boolean>;
}

export interface ChatSession {
  sessionId: string;
  userId?: string;
  messages: ChatMessage[];
  activeWorkflow?: WorkflowState;
  createdAt: string;
  lastActiveAt: string;
}

export interface SessionStore {
  getSession(sessionId: string): Promise<ChatSession | null>;
  saveSession(session: ChatSession): Promise<void>;
  clearSession(sessionId: string): Promise<void>;
}
