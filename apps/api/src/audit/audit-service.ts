import crypto from 'crypto';

export interface AuditEventRecord {
  id: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceRef: string;
  reason?: string;
  ipHash: string;
  uaHash: string;
  prevHash: string;
  hash: string;
  timestamp: string;
}

export class AuditService {
  private events: AuditEventRecord[] = [];
  private lastHash = '0000000000000000000000000000000000000000000000000000000000000000';

  /**
   * Append an audit event to the cryptographically linked hash chain
   */
  public logEvent(params: {
    actor: string;
    action: string;
    resourceType: string;
    resourceRef: string;
    reason?: string;
    ip?: string;
    userAgent?: string;
  }): AuditEventRecord {
    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const prevHash = this.lastHash;

    const ipHash = crypto
      .createHash('sha256')
      .update(params.ip || '127.0.0.1')
      .digest('hex');
    const uaHash = crypto
      .createHash('sha256')
      .update(params.userAgent || 'unknown')
      .digest('hex');

    // Canonical payload string to hash
    const payload = `${id}|${params.actor}|${params.action}|${params.resourceType}|${params.resourceRef}|${params.reason || ''}|${ipHash}|${uaHash}|${prevHash}|${timestamp}`;
    const hash = crypto.createHash('sha256').update(payload).digest('hex');

    const record: AuditEventRecord = {
      id,
      actor: params.actor,
      action: params.action,
      resourceType: params.resourceType,
      resourceRef: params.resourceRef,
      reason: params.reason,
      ipHash,
      uaHash,
      prevHash,
      hash,
      timestamp,
    };

    this.events.push(record);
    this.lastHash = hash;
    return record;
  }

  /**
   * Cryptographic verification of the entire audit chain
   * Ensures that no rows have been modified, inserted out of order, or deleted.
   */
  public verifyAuditChain(): { verified: boolean; brokenAtIndex?: number; totalEvents: number } {
    let currentPrev = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < this.events.length; i++) {
      const e = this.events[i]!;
      if (e.prevHash !== currentPrev) {
        return { verified: false, brokenAtIndex: i, totalEvents: this.events.length };
      }

      const payload = `${e.id}|${e.actor}|${e.action}|${e.resourceType}|${e.resourceRef}|${e.reason || ''}|${e.ipHash}|${e.uaHash}|${e.prevHash}|${e.timestamp}`;
      const computedHash = crypto.createHash('sha256').update(payload).digest('hex');

      if (computedHash !== e.hash) {
        return { verified: false, brokenAtIndex: i, totalEvents: this.events.length };
      }

      currentPrev = e.hash;
    }

    return { verified: true, totalEvents: this.events.length };
  }

  public getEvents(limit = 100): AuditEventRecord[] {
    return this.events.slice(-limit).reverse();
  }
}
