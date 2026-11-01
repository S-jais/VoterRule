import { ChatSession, SessionStore } from '../interfaces.js';

export class InMemorySessionStore implements SessionStore {
  private sessions = new Map<string, ChatSession>();
  private readonly ttlMs = 30 * 60 * 1000; // 30 minutes
  private readonly maxMessagesPerSession = 20;

  public async getSession(sessionId: string): Promise<ChatSession | null> {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const now = Date.now();
    const lastActive = new Date(session.lastActiveAt).getTime();
    if (now - lastActive > this.ttlMs) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  public async saveSession(session: ChatSession): Promise<void> {
    // Sliding window of messages
    const trimmedMessages = session.messages.slice(-this.maxMessagesPerSession);
    const updated: ChatSession = {
      ...session,
      messages: trimmedMessages,
      lastActiveAt: new Date().toISOString(),
    };
    this.sessions.set(session.sessionId, updated);
  }

  public async clearSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }
}

