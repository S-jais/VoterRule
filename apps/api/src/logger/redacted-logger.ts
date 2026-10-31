export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  requestId?: string;
  context?: Record<string, any>;
}

export class RedactedLogger {
  private logSink: LogEntry[] = [];
  private static PII_PATTERNS = [
    // Standard EPIC card pattern (3 letters + 7 numbers) or variant
    /\b[A-Z]{3}[0-9]{7}\b/gi,
    // Email addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Phone numbers (Indian 10-digit mobile or with +91)
    /\b(?:\+91[-\s]?)?[6-9]\d{9}\b/g,
    // Aadhaar-like 12 digit sequences (if mistakenly present)
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  ];

  public log(level: 'info' | 'warn' | 'error' | 'debug', message: string, context?: Record<string, any>, requestId?: string): LogEntry {
    const redactedMessage = this.redactString(message);
    const redactedContext = context ? this.redactObject(context) : undefined;

    const entry: LogEntry = {
      level,
      message: redactedMessage,
      timestamp: new Date().toISOString(),
      requestId,
      context: redactedContext,
    };

    this.logSink.push(entry);
    return entry;
  }

  public info(message: string, context?: Record<string, any>, requestId?: string): LogEntry {
    return this.log('info', message, context, requestId);
  }

  public warn(message: string, context?: Record<string, any>, requestId?: string): LogEntry {
    return this.log('warn', message, context, requestId);
  }

  public error(message: string, context?: Record<string, any>, requestId?: string): LogEntry {
    return this.log('error', message, context, requestId);
  }

  public getRecentLogs(): LogEntry[] {
    return this.logSink.slice(-200);
  }

  public clear(): void {
    this.logSink = [];
  }

  public redactString(str: string): string {
    let result = str;
    for (const pattern of RedactedLogger.PII_PATTERNS) {
      result = result.replace(pattern, '[REDACTED_PII]');
    }
    return result;
  }

  public redactObject(obj: Record<string, any>): Record<string, any> {
    const output: Record<string, any> = {};
    const sensitiveKeys = ['email', 'phone', 'epic', 'name', 'aadhaar', 'token', 'password', 'documentName'];

    for (const [key, value] of Object.entries(obj)) {
      const isSensitiveKey = sensitiveKeys.some((s) => key.toLowerCase().includes(s));
      if (isSensitiveKey && typeof value === 'string') {
        output[key] = '[REDACTED_FIELD]';
      } else if (typeof value === 'string') {
        output[key] = this.redactString(value);
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        output[key] = this.redactObject(value);
      } else {
        output[key] = value;
      }
    }

    return output;
  }
}
