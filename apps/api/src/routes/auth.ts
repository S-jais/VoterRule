import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import {
  UserRegistrationSchema,
  UserLoginSchema,
  SendOtpSchema,
  VerifyOtpSchema,
  StaffRole,
} from '@voterrule/shared';
import { DatabaseStore } from '../db/in-memory-db.js';
import { FieldEncryptionService } from '../crypto/encryption.js';
import { RoutePolicyRegistry } from '../policy/policy-registry.js';
import { AuditService } from '../audit/audit-service.js';

export function registerAuthRoutes(
  app: FastifyInstance,
  db: DatabaseStore,
  encryption: FieldEncryptionService,
  audit: AuditService
): void {
  // Policy registration
  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/auth/register',
    action: 'create',
    resource: 'auth',
    description: 'Citizen registration (18+ confirmed, consent required)',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/auth/login',
    action: 'create',
    resource: 'auth',
    description: 'User login with session cookie',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/auth/otp/send',
    action: 'create',
    resource: 'auth',
    description: 'Send mobile OTP for citizen authentication',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/auth/otp/verify',
    action: 'create',
    resource: 'auth',
    description: 'Verify mobile OTP and authenticate citizen',
  });

  RoutePolicyRegistry.register({
    method: 'GET',
    path: '/api/v1/auth/me',
    action: 'read',
    resource: 'user_profile',
    description: 'Get authenticated user profile and roles',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/auth/logout',
    action: 'create',
    resource: 'auth',
    description: 'User logout and session invalidation',
  });

  RoutePolicyRegistry.register({
    method: 'POST',
    path: '/api/v1/auth/recover',
    action: 'create',
    resource: 'auth',
    description: 'Account recovery / password reset initiation',
  });

  // POST /api/v1/auth/register
  app.post('/api/v1/auth/register', async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = UserRegistrationSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: parse.error.errors[0]?.message, requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const { email, phone, password, epicNumber, locale, ageConfirmed18Plus } = parse.data;

    const emailBlindIndex = email ? encryption.computeBlindIndex(email) : '';
    const phoneBlindIndex = phone ? encryption.computeBlindIndex(phone) : '';

    if (email && db.findUserByBlindIndex(emailBlindIndex)) {
      return reply.status(400).send({
        error: { code: 'REGISTRATION_FAILED', message: 'Unable to complete registration. If you already have an account, please sign in.', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    if (phone && db.findUserByPhoneBlindIndex(phoneBlindIndex)) {
      return reply.status(400).send({
        error: { code: 'REGISTRATION_FAILED', message: 'An account is already associated with this mobile number. Please sign in.', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const userId = crypto.randomUUID();
    const passwordHash = password ? await encryption.hashPassword(password) : '';
    const encEmail = email ? encryption.encryptField(email) : undefined;
    const encPhone = phone ? encryption.encryptField(phone) : undefined;

    db.users.set(userId, {
      id: userId,
      emailCiphertext: encEmail ? encEmail.ciphertext : '',
      emailBlindIndex,
      phoneCiphertext: encPhone ? encPhone.ciphertext : undefined,
      phoneBlindIndex: phoneBlindIndex || undefined,
      passwordHash,
      locale: locale as 'en' | 'hi',
      ageConfirmed18Plus,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    });

    const displayName = email ? email.split('@')[0] : phone ? `Citizen-${phone.slice(-4)}` : 'Citizen';
    const epicMasked = epicNumber ? `${epicNumber.slice(0, 3)}****${epicNumber.slice(-3)}` : undefined;

    db.userProfiles.set(`prof-${userId}`, {
      id: `prof-${userId}`,
      userId,
      displayName,
      epicNumberMasked: epicMasked,
      preferredLanguage: locale as 'en' | 'hi',
    });

    const emailLowerReg = (email || '').toLowerCase().trim();
    const isOwnerAdminReg =
      emailLowerReg === 'sj6161362@gmail.com' ||
      emailLowerReg === (process.env.ADMIN_EMAIL || '').toLowerCase().trim() ||
      (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map((x) => x.trim()).includes(emailLowerReg);

    if (isOwnerAdminReg) {
      db.staffAccounts.set(`staff-owner-${userId}`, {
        id: `staff-owner-${userId}`,
        userId,
        email: emailLowerReg,
        roles: [StaffRole.PLATFORM_ADMIN, StaffRole.CASE_REVIEWER, StaffRole.DOCUMENT_REVIEWER],
        mfaEnrolled: true,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      });
    }

    audit.logEvent({
      actor: userId,
      action: 'USER_REGISTERED',
      resourceType: 'user',
      resourceRef: userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.status(201).send({
      data: {
        userId,
        emailMasked: email ? email.replace(/(^.{2})(.*)(?=@)/, (_, a, b) => a + '*'.repeat(b.length)) : undefined,
        phoneMasked: phone ? `${phone.slice(0, 3)}*****${phone.slice(-3)}` : undefined,
        epicNumberMasked: epicMasked,
        locale,
        message: 'Registration successful. You may now sign in.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/auth/login
  app.post('/api/v1/auth/login', async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = UserLoginSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: parse.error.errors[0]?.message || 'Valid credentials required', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const { email, phone, password, otp } = parse.data;

    let user;
    if (email) {
      const blindIndex = encryption.computeBlindIndex(email);
      user = db.findUserByBlindIndex(blindIndex);

      if (!user || !user.passwordHash || !password) {
        await new Promise((res) => setTimeout(res, 80));
        return reply.status(401).send({
          error: { code: 'AUTH_FAILED', message: 'Invalid email or password', requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }

      const passwordValid = await encryption.verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        return reply.status(401).send({
          error: { code: 'AUTH_FAILED', message: 'Invalid email or password', requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }
    } else if (phone) {
      const phoneBlindIndex = encryption.computeBlindIndex(phone);
      user = db.findUserByPhoneBlindIndex(phoneBlindIndex);

      if (!user) {
        await new Promise((res) => setTimeout(res, 80));
        return reply.status(401).send({
          error: { code: 'AUTH_FAILED', message: 'No account registered with this phone number. Please register first.', requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }

      // Check OTP (demo allows '123456')
      const storedOtp = db.otps.get(phone);
      const isOtpValid = otp === '123456' || (storedOtp && storedOtp.otpHash === otp && storedOtp.expiresAt > Date.now());
      if (!isOtpValid) {
        return reply.status(401).send({
          error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP. Use demo OTP 123456.', requestId: req.id },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }
    } else {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: 'Email or phone required', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    // Check staff roles & automatically recognize owner/admin emails
    let staff = Array.from(db.staffAccounts.values()).find((s) => s.userId === user.id);
    const emailLower = (email || '').toLowerCase().trim();
    const isOwnerAdmin =
      emailLower === 'sj6161362@gmail.com' ||
      emailLower === (process.env.ADMIN_EMAIL || '').toLowerCase().trim() ||
      (process.env.ADMIN_EMAILS || '').toLowerCase().split(',').map((x) => x.trim()).includes(emailLower);

    if (isOwnerAdmin && !staff) {
      staff = {
        id: `staff-owner-${user.id}`,
        userId: user.id,
        email: emailLower,
        roles: [StaffRole.PLATFORM_ADMIN, StaffRole.CASE_REVIEWER, StaffRole.DOCUMENT_REVIEWER],
        mfaEnrolled: true,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      db.staffAccounts.set(staff.id, staff);
    }

    const roles = staff ? staff.roles : [];
    const token = crypto.randomBytes(32).toString('hex');

    audit.logEvent({
      actor: user.id,
      action: 'USER_LOGIN',
      resourceType: 'auth',
      resourceRef: user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: {
        userId: user.id,
        locale: user.locale,
        isStaff: !!staff,
        roles,
        token,
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/auth/otp/send
  app.post('/api/v1/auth/otp/send', async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = SendOtpSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: parse.error.errors[0]?.message, requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const { phone } = parse.data;
    const demoOtp = '123456';
    const expiresAt = Date.now() + 5 * 60 * 1000;

    db.otps.set(phone, {
      otpHash: demoOtp,
      expiresAt,
      attempts: 0,
    });

    audit.logEvent({
      actor: phone.slice(-4),
      action: 'OTP_DISPATCHED',
      resourceType: 'auth',
      resourceRef: phone.slice(0, 3) + '*****' + phone.slice(-3),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: {
        message: 'OTP dispatched successfully. Enter the 6-digit verification code.',
        phoneMasked: `${phone.slice(0, 3)}*****${phone.slice(-3)}`,
        expiresInSeconds: 300,
        demoNotice: 'Demo mode active: Use OTP 123456',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/auth/otp/verify
  app.post('/api/v1/auth/otp/verify', async (req: FastifyRequest, reply: FastifyReply) => {
    const parse = VerifyOtpSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: { code: 'INVALID_INPUT', message: parse.error.errors[0]?.message, requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const { phone, otp, ageConfirmed18Plus, epicNumber } = parse.data;
    const storedOtp = db.otps.get(phone);
    const isOtpValid = otp === '123456' || (storedOtp && storedOtp.otpHash === otp && storedOtp.expiresAt > Date.now());

    if (!isOtpValid) {
      return reply.status(401).send({
        error: { code: 'INVALID_OTP', message: 'Invalid or expired OTP. (Demo code: 123456)', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const phoneBlindIndex = encryption.computeBlindIndex(phone);
    let user = db.findUserByPhoneBlindIndex(phoneBlindIndex);

    if (!user) {
      // Must be adult (18+)
      if (ageConfirmed18Plus !== true) {
        return reply.status(400).send({
          error: {
            code: 'AGE_CONFIRMATION_REQUIRED',
            message: 'You must confirm you are at least 18 years old to create an account on VoterRule.',
            requestId: req.id,
          },
          meta: { requestId: req.id, timestamp: new Date().toISOString() },
        });
      }

      const userId = crypto.randomUUID();
      const encPhone = encryption.encryptField(phone);

      user = {
        id: userId,
        emailCiphertext: '',
        emailBlindIndex: '',
        phoneCiphertext: encPhone.ciphertext,
        phoneBlindIndex,
        passwordHash: '',
        locale: 'en',
        ageConfirmed18Plus: true,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };
      db.users.set(userId, user);

      const epicMasked = epicNumber ? `${epicNumber.slice(0, 3)}****${epicNumber.slice(-3)}` : undefined;
      db.userProfiles.set(`prof-${userId}`, {
        id: `prof-${userId}`,
        userId,
        displayName: `Citizen-${phone.slice(-4)}`,
        epicNumberMasked: epicMasked,
        preferredLanguage: 'en',
      });

      audit.logEvent({
        actor: userId,
        action: 'USER_REGISTERED_PHONE',
        resourceType: 'user',
        resourceRef: userId,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      });
    }

    const staff = Array.from(db.staffAccounts.values()).find((s) => s.userId === user.id);
    const token = crypto.randomBytes(32).toString('hex');

    audit.logEvent({
      actor: user.id,
      action: 'USER_LOGIN_OTP',
      resourceType: 'auth',
      resourceRef: user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: {
        userId: user.id,
        locale: user.locale,
        isStaff: !!staff,
        roles: staff ? staff.roles : [],
        token,
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // GET /api/v1/auth/me
  app.get('/api/v1/auth/me', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = req.headers['x-user-id'] as string;

    if (!userId) {
      return reply.status(401).send({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const user = db.users.get(userId);
    if (!user) {
      return reply.status(404).send({
        error: { code: 'USER_NOT_FOUND', message: 'User record not found', requestId: req.id },
        meta: { requestId: req.id, timestamp: new Date().toISOString() },
      });
    }

    const profile = db.userProfiles.get(`prof-${userId}`);
    const staff = Array.from(db.staffAccounts.values()).find((s) => s.userId === userId);

    return reply.send({
      data: {
        userId: user.id,
        locale: user.locale,
        ageConfirmed18Plus: user.ageConfirmed18Plus,
        displayName: profile?.displayName || 'Citizen',
        state: profile?.state,
        district: profile?.district,
        assemblyConstituency: profile?.assemblyConstituency,
        isStaff: !!staff,
        staffRoles: staff?.roles || [],
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/auth/logout
  app.post('/api/v1/auth/logout', async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.headers['x-user-id'] as string) || 'anonymous';
    audit.logEvent({
      actor: userId,
      action: 'USER_LOGOUT',
      resourceType: 'auth',
      resourceRef: userId,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    return reply.send({
      data: { message: 'Logged out successfully' },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });

  // POST /api/v1/auth/recover
  app.post('/api/v1/auth/recover', async (req: FastifyRequest, reply: FastifyReply) => {
    // Equalized timing response
    await new Promise((res) => setTimeout(res, 60));
    return reply.send({
      data: {
        message: 'If an account exists with the provided details, recovery instructions have been sent.',
      },
      meta: { requestId: req.id, timestamp: new Date().toISOString() },
    });
  });
}
