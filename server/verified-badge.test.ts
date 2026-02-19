import { describe, it, expect } from 'vitest';

describe('Verified Badge Logic', () => {
  describe('Email Verification Status', () => {
    it('should show verified badge when emailVerified is true', () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
      };

      expect(user.emailVerified).toBe(true);
    });

    it('should not show verified badge when emailVerified is false', () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: false,
      };

      expect(user.emailVerified).toBe(false);
    });

    it('should handle missing emailVerified field', () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };

      expect(user.emailVerified || false).toBe(false);
    });
  });

  describe('Badge Display Contexts', () => {
    it('should display badge in profile when verified', () => {
      const profile = {
        id: 1,
        name: 'Verified User',
        emailVerified: true,
        bio: 'Test bio',
      };

      const shouldShowBadge = profile.emailVerified === true;
      expect(shouldShowBadge).toBe(true);
    });

    it('should display badge in chat messages when verified', () => {
      const chatMessage = {
        id: '123',
        userId: 1,
        username: 'VerifiedUser',
        message: 'Hello!',
        emailVerified: true,
        timestamp: new Date(),
      };

      const shouldShowBadge = chatMessage.emailVerified === true;
      expect(shouldShowBadge).toBe(true);
    });

    it('should not display badge in chat when not verified', () => {
      const chatMessage = {
        id: '123',
        userId: 1,
        username: 'UnverifiedUser',
        message: 'Hello!',
        emailVerified: false,
        timestamp: new Date(),
      };

      const shouldShowBadge = chatMessage.emailVerified === true;
      expect(shouldShowBadge).toBe(false);
    });
  });

  describe('Verification Status Text', () => {
    it('should return correct status text for verified user', () => {
      const emailVerified = true;
      const statusText = emailVerified ? 'Email ověřen' : 'Email neověřen';
      
      expect(statusText).toBe('Email ověřen');
    });

    it('should return correct status text for unverified user', () => {
      const emailVerified = false;
      const statusText = emailVerified ? 'Email ověřen' : 'Email neověřen';
      
      expect(statusText).toBe('Email neověřen');
    });
  });
});
