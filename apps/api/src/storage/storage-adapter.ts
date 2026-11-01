import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { DocumentScanStatus, DocumentType } from '@voterrule/shared';

export interface StorageObjectMetadata {
  storageKey: string;
  originalName: string;
  detectedMime: 'application/pdf' | 'image/jpeg' | 'image/png';
  sizeBytes: number;
  sha256: string;
  scanStatus: DocumentScanStatus;
  retentionUntil: string;
}

export class DocumentStorageService {
  private localDir: string;
  private clamAvEnabled: boolean;
  private signedUrlTokens: Map<string, { storageKey: string; expiresAt: number; docId: string }> = new Map();

  constructor(localDir = './storage/documents', clamAvEnabled = false) {
    this.localDir = localDir;
    this.clamAvEnabled = clamAvEnabled;

    if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }
  }

  /**
   * Magic bytes verification for allowed file types
   */
  public detectMimeFromBuffer(buffer: Buffer): 'application/pdf' | 'image/jpeg' | 'image/png' | null {
    if (buffer.length < 4) return null;

    // PDF magic bytes: %PDF (0x25 0x50 0x44 0x46)
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'application/pdf';
    }

    // JPEG magic bytes: 0xFF 0xD8 0xFF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'image/jpeg';
    }

    // PNG magic bytes: 0x89 0x50 0x4E 0x47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
      return 'image/png';
    }

    return null;
  }

  /**
   * Antivirus scan adapter (ClamAV with safe simulated signature rejection)
   */
  public async scanBuffer(buffer: Buffer): Promise<DocumentScanStatus> {
    // EICAR test string or simulated malware signature check
    const content = buffer.toString('utf8', 0, Math.min(buffer.length, 1024));
    if (content.includes('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*')) {
      return DocumentScanStatus.INFECTED;
    }

    // In production, connect to live ClamAV daemon TCP socket
    if (this.clamAvEnabled) {
      // Live ClamAV scanner integration point
      return DocumentScanStatus.CLEAN;
    }

    return DocumentScanStatus.CLEAN;
  }

  /**
   * Store document under random UUID key with retention date
   */
  public async storeDocument(
    buffer: Buffer,
    originalName: string,
    _docType: DocumentType
  ): Promise<StorageObjectMetadata> {
    const detectedMime = this.detectMimeFromBuffer(buffer);
    if (!detectedMime) {
      throw new Error('Unsupported or spoofed file format. Allowed types are PDF, JPEG, PNG only.');
    }

    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
    const scanStatus = await this.scanBuffer(buffer);

    if (scanStatus === DocumentScanStatus.INFECTED) {
      throw new Error('Document rejected: Security scanner detected suspicious or infected content.');
    }

    const storageKey = `${crypto.randomUUID()}.${detectedMime === 'application/pdf' ? 'pdf' : detectedMime === 'image/jpeg' ? 'jpg' : 'png'}`;
    const filePath = path.join(this.localDir, storageKey);
    fs.writeFileSync(filePath, buffer);

    // Retention: 90 days default for verification docs, user can request earlier erasure
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() + 90);

    return {
      storageKey,
      originalName,
      detectedMime,
      sizeBytes: buffer.length,
      sha256,
      scanStatus,
      retentionUntil: retentionDate.toISOString(),
    };
  }

  /**
   * Generate short-lived signed download token (valid 60 seconds)
   */
  public generateSignedToken(docId: string, storageKey: string): string {
    const token = crypto.randomBytes(24).toString('hex');
    const expiresAt = Date.now() + 60 * 1000; // 60 seconds
    this.signedUrlTokens.set(token, { storageKey, expiresAt, docId });
    return token;
  }

  public verifySignedToken(token: string): { valid: boolean; storageKey?: string; docId?: string } {
    const entry = this.signedUrlTokens.get(token);
    if (!entry) return { valid: false };
    if (Date.now() > entry.expiresAt) {
      this.signedUrlTokens.delete(token);
      return { valid: false };
    }
    return { valid: true, storageKey: entry.storageKey, docId: entry.docId };
  }

  public getFilePath(storageKey: string): string {
    return path.join(this.localDir, storageKey);
  }
}
