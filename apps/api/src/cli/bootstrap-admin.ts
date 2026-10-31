import crypto from 'crypto';

export function generateAdminBootstrapToken(): { token: string; expiresAt: Date } {
  const token = `VR-BOOTSTRAP-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return { token, expiresAt };
}

// When run directly from command line
if (process.argv[1]?.includes('bootstrap-admin')) {
  const { token, expiresAt } = generateAdminBootstrapToken();
  console.log('================================================================');
  console.log('  VOTERRULE - FIRST ADMINISTRATOR ENROLLMENT BOOTSTRAP');
  console.log('================================================================');
  console.log(`Single-Use Enrollment Token: ${token}`);
  console.log(`Expires At: ${expiresAt.toISOString()} (15 minutes from creation)`);
  console.log('');
  console.log('Instructions:');
  console.log('1. Open the Admin Portal at /admin/enroll-bootstrap');
  console.log('2. Enter this single-use enrollment token.');
  console.log('3. Complete mandatory TOTP / Passkey multi-factor enrollment.');
  console.log('4. No default admin password or backdoor exists on this system.');
  console.log('================================================================');
}
