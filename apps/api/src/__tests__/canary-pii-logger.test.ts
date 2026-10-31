import { describe, it, expect } from 'vitest';
import { RedactedLogger } from '../logger/redacted-logger.js';

describe('Canary PII Logger Redaction Test', () => {
  it('asserts canary PII values never appear in logged output or contexts', () => {
    const logger = new RedactedLogger();

    // Canary values
    const canaryEmail = 'canary.citizen.sensitive@domain.gov.in';
    const canaryPhone = '9876543210';
    const canaryEpic = 'CAN1234567';
    const canaryAadhaar = '9999 8888 7777';

    // Log messages and structured objects with canary values
    logger.info(`User signed in with email: ${canaryEmail} and phone: ${canaryPhone}`);
    logger.warn(`Discrepancy observed for EPIC card: ${canaryEpic}`);
    logger.error('Incident report', {
      email: canaryEmail,
      phone: canaryPhone,
      epicNumber: canaryEpic,
      suspectedAadhaar: canaryAadhaar,
      safeNote: 'Audit canary check execution',
    });

    const logs = logger.getRecentLogs();
    const serialized = JSON.stringify(logs);

    // Assert that raw canary values are completely absent from logs
    expect(serialized).not.toContain(canaryEmail);
    expect(serialized).not.toContain(canaryPhone);
    expect(serialized).not.toContain(canaryEpic);
    expect(serialized).not.toContain('9999 8888 7777');

    // Assert that redaction placeholders were substituted
    expect(serialized).toContain('[REDACTED_PII]');
    expect(serialized).toContain('[REDACTED_FIELD]');
  });
});
