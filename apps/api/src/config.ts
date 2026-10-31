import dotenv from 'dotenv';
import { GuidanceEngine } from '@matdata-setu/guidance';

dotenv.config();

export interface AppConfig {
  appMode: 'demo' | 'production';
  port: number;
  adminPort: number;
  webPort: number;
  appSecret: string;
  blindIndexSecret: string;
  matchTokenSecret: string;
  sessionSecret: string;
  databaseUrl?: string;
  storageDriver: 'local' | 's3';
  storageLocalDir: string;
  s3Bucket?: string;
  officialRollAccessEnabled: boolean;
  officialApiBaseUrl?: string;
  officialApiKey?: string;
  officialApiAuthorizationRef?: string;
  clamAvEnabled: boolean;
  dpdpGrievanceEmail: string;
}

export function loadConfig(): AppConfig {
  const appMode = (process.env.APP_MODE || 'demo') as 'demo' | 'production';
  const port = parseInt(process.env.PORT || '4000', 10);
  const adminPort = parseInt(process.env.ADMIN_PORT || '4001', 10);
  const webPort = parseInt(process.env.WEB_PORT || '3000', 10);

  const config: AppConfig = {
    appMode,
    port,
    adminPort,
    webPort,
    appSecret: process.env.APP_SECRET || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef',
    blindIndexSecret: process.env.BLIND_INDEX_SECRET || 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210',
    matchTokenSecret: process.env.MATCH_TOKEN_SECRET || 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899',
    sessionSecret: process.env.SESSION_SECRET || '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff',
    databaseUrl: process.env.DATABASE_URL,
    storageDriver: (process.env.STORAGE_DRIVER || 'local') as 'local' | 's3',
    storageLocalDir: process.env.STORAGE_LOCAL_DIR || './storage/documents',
    s3Bucket: process.env.S3_BUCKET,
    officialRollAccessEnabled: process.env.OFFICIAL_ROLL_ACCESS_ENABLED === 'true',
    officialApiBaseUrl: process.env.OFFICIAL_API_BASE_URL,
    officialApiKey: process.env.OFFICIAL_API_KEY,
    officialApiAuthorizationRef: process.env.OFFICIAL_API_AUTHORIZATION_REF,
    clamAvEnabled: process.env.CLAMAV_ENABLED === 'true',
    dpdpGrievanceEmail: process.env.DPDP_GRIEVANCE_OFFICER_EMAIL || 'grievance@voterrule.org',
  };

  if (appMode === 'production') {
    validateProductionReadiness(config);
  }

  return config;
}

export function validateProductionReadiness(config: AppConfig): void {
  const missingRequirements: string[] = [];

  // 1. Check secrets are not defaults/placeholders
  if (config.appSecret.includes('0123456789abcdef')) {
    missingRequirements.push('APP_SECRET must be configured with a secure KMS or random key in production.');
  }
  if (config.blindIndexSecret.includes('fedcba9876543210')) {
    missingRequirements.push('BLIND_INDEX_SECRET must be configured with a production secret.');
  }
  if (config.matchTokenSecret.includes('aabbccddeeff0011')) {
    missingRequirements.push('MATCH_TOKEN_SECRET must be configured with a production secret.');
  }

  // 2. Storage & virus scanning
  if (!config.clamAvEnabled) {
    missingRequirements.push('CLAMAV_ENABLED must be true in production to scan uploaded documents.');
  }

  // 3. Guidance integrity check (§5: no requires_verification item unverified)
  const engine = new GuidanceEngine();
  const integrity = engine.verifyGuidanceIntegrity();
  if (!integrity.valid) {
    missingRequirements.push(
      `Guidance items require statutory verification before launch: ${integrity.unverifiedItems.join(', ')}`
    );
  }

  if (missingRequirements.length > 0) {
    const errorMsg = `[FATAL] Production mode failed closed at boot due to unmet security/statutory requirements:\n- ${missingRequirements.join(
      '\n- '
    )}`;
    throw new Error(errorMsg);
  }
}
