import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

// Mock dependencies
vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

vi.mock('./db', () => ({
  generateVerificationToken: vi.fn().mockResolvedValue('test-token-123'),
  verifyEmailToken: vi.fn().mockResolvedValue(true),
  getUserByEmail: vi.fn().mockResolvedValue({
    id: 1,
    email: 'test@example.com',
    emailVerified: false,
  }),
}));

describe('Email Verification', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let unverifiedUserContext: Context;
  let verifiedUserContext: Context;

  beforeEach(() => {
    // Setup unverified user context
    unverifiedUserContext = {
      user: {
        id: 1,
        openId: 'test-user',
        name: 'Test User',
        email: 'test@example.com',
        role: 'streamer',
        loginMethod: 'manus',
        emailVerified: false,
        coins: 0,
        lastSignedIn: new Date(),
        createdAt: new Date(),
      },
      req: {
        headers: {
          origin: 'https://test.manus.space',
          host: 'test.manus.space',
        },
      } as any,
      res: {} as any,
    };

    // Setup verified user context
    verifiedUserContext = {
      ...unverifiedUserContext,
      user: {
        ...unverifiedUserContext.user!,
        emailVerified: true,
      },
    };
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email for unverified user', async () => {
      caller = appRouter.createCaller(unverifiedUserContext);
      
      const result = await caller.auth.sendVerificationEmail();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Verification email sent');
    });

    it('should reject if email already verified', async () => {
      caller = appRouter.createCaller(verifiedUserContext);

      await expect(
        caller.auth.sendVerificationEmail()
      ).rejects.toThrow('Email already verified');
    });

    it('should reject if no email on file', async () => {
      const noEmailContext = {
        ...unverifiedUserContext,
        user: {
          ...unverifiedUserContext.user!,
          email: null,
        },
      };
      caller = appRouter.createCaller(noEmailContext);

      await expect(
        caller.auth.sendVerificationEmail()
      ).rejects.toThrow('No email address on file');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      caller = appRouter.createCaller(unverifiedUserContext);

      const result = await caller.auth.verifyEmail({ token: 'valid-token' });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Email verified successfully!');
    });

    it('should reject invalid token', async () => {
      const db = await import('./db');
      vi.mocked(db.verifyEmailToken).mockResolvedValueOnce(false);

      caller = appRouter.createCaller(unverifiedUserContext);

      await expect(
        caller.auth.verifyEmail({ token: 'invalid-token' })
      ).rejects.toThrow('Invalid or expired verification token');
    });

    it('should work for public (non-authenticated) users', async () => {
      // Public context (no user)
      const publicContext: Context = {
        user: null,
        req: {} as any,
        res: {} as any,
      };

      caller = appRouter.createCaller(publicContext);

      const result = await caller.auth.verifyEmail({ token: 'valid-token' });

      expect(result.success).toBe(true);
    });
  });

  describe('Email verification workflow', () => {
    it('should complete full verification flow', async () => {
      // Step 1: Send verification email
      caller = appRouter.createCaller(unverifiedUserContext);
      const sendResult = await caller.auth.sendVerificationEmail();
      expect(sendResult.success).toBe(true);

      // Step 2: Verify with token
      const verifyResult = await caller.auth.verifyEmail({ token: 'test-token-123' });
      expect(verifyResult.success).toBe(true);
    });
  });
});
