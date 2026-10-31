import crypto from 'crypto';

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string; // Base64
  tag: string; // Base64
  keyVersion: number;
}

export class FieldEncryptionService {
  private masterKey: Buffer;
  private currentKeyVersion = 1;
  private blindIndexKey: Buffer;
  private matchTokenKey: Buffer;

  constructor(appSecretHex: string, blindIndexSecretHex: string, matchTokenSecretHex: string) {
    this.masterKey = Buffer.from(appSecretHex.padEnd(64, '0').slice(0, 64), 'hex');
    this.blindIndexKey = Buffer.from(blindIndexSecretHex.padEnd(64, '0').slice(0, 64), 'hex');
    this.matchTokenKey = Buffer.from(matchTokenSecretHex.padEnd(64, '0').slice(0, 64), 'hex');
  }

  /**
   * AES-256-GCM Envelope Encryption for PII fields
   */
  public encryptField(plaintext: string): EncryptedPayload {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.masterKey, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
    ciphertext += cipher.final('base64');
    const tag = cipher.getAuthTag();

    return {
      ciphertext,
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
      keyVersion: this.currentKeyVersion,
    };
  }

  /**
   * AES-256-GCM Decryption with auth tag verification
   */
  public decryptField(payload: EncryptedPayload): string {
    const iv = Buffer.from(payload.iv, 'base64');
    const tag = Buffer.from(payload.tag, 'base64');
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.masterKey, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(payload.ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  /**
   * Blind Index for Equality Lookup (HMAC-SHA256)
   * Used for looking up email or EPIC equality without storing raw plaintext or decrypting all rows.
   */
  public computeBlindIndex(value: string): string {
    const normalized = value.trim().toLowerCase();
    return crypto.createHmac('sha256', this.blindIndexKey).update(normalized).digest('hex');
  }

  /**
   * Match Token Generator for Candidate Duplicate Blocking
   * Keyed HMAC-SHA256 with isolated matchTokenKey.
   */
  public computeMatchToken(tokenType: string, tokenValue: string): string {
    const normalized = tokenValue.trim().toLowerCase();
    return crypto
      .createHmac('sha256', this.matchTokenKey)
      .update(`${tokenType}:${normalized}`)
      .digest('hex');
  }

  /**
   * Password Hashing using Scrypt (with Argon2id-compatible memory hardening)
   */
  public async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    return new Promise((resolve, reject) => {
      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) reject(err);
        resolve(`${salt}:${derivedKey.toString('hex')}`);
      });
    });
  }

  public async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;

    return new Promise((resolve) => {
      crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
        if (err) return resolve(false);
        const match = crypto.timingSafeEqual(Buffer.from(key, 'hex'), derivedKey);
        resolve(match);
      });
    });
  }
}
