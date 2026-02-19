import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

// Mock dependencies
vi.mock('./_core/imageGeneration', () => ({
  generateImage: vi.fn().mockResolvedValue({ url: 'https://example.com/emote.png' }),
}));

vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({ 
    url: 'https://s3.example.com/emotes/1/test-123.png',
    key: 'emotes/1/test-123.png'
  }),
}));

vi.mock('./db', () => ({
  getEmoteByName: vi.fn().mockResolvedValue(null),
  createEmote: vi.fn().mockResolvedValue(1),
  getStreamerEmotes: vi.fn().mockResolvedValue([
    {
      id: 1,
      streamerId: 1,
      name: 'happycat',
      imageUrl: 'https://s3.example.com/emotes/1/happycat.png',
      tier: 'free',
      generatedByAI: true,
      aiPrompt: 'happy cat with big smile',
      isEnabled: true,
      usageCount: 42,
      createdAt: new Date('2026-01-01'),
    },
  ]),
  getEmoteById: vi.fn().mockResolvedValue({
    id: 1,
    streamerId: 1,
    name: 'happycat',
    imageUrl: 'https://s3.example.com/emotes/1/happycat.png',
    tier: 'free',
    isEnabled: true,
  }),
  toggleEmoteEnabled: vi.fn().mockResolvedValue(true),
  deleteEmote: vi.fn().mockResolvedValue(true),
}));

describe('Emotes Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let streamerContext: Context;

  beforeEach(() => {
    // Setup streamer context
    streamerContext = {
      user: {
        id: 1,
        openId: 'test-streamer',
        name: 'Test Streamer',
        email: 'streamer@test.com',
        role: 'streamer',
        loginMethod: 'manus',
        coins: 1000,
        lastSignedIn: new Date(),
        createdAt: new Date(),
      },
      req: {} as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(streamerContext);
  });

  describe('generateWithAI', () => {
    it('should generate emote with AI successfully', async () => {
      const result = await caller.emotes.generateWithAI({
        name: 'testEmote',
        prompt: 'happy cat with big smile',
        tier: 'free',
      });

      expect(result).toHaveProperty('emoteId');
      expect(result).toHaveProperty('imageUrl');
      expect(result.success).toBe(true);
    });

    it('should reject invalid emote names', async () => {
      await expect(
        caller.emotes.generateWithAI({
          name: 'test emote!', // Invalid: contains space and special char
          prompt: 'happy cat',
          tier: 'free',
        })
      ).rejects.toThrow();
    });

    it('should reject empty prompt', async () => {
      await expect(
        caller.emotes.generateWithAI({
          name: 'testEmote',
          prompt: '', // Invalid: empty
          tier: 'free',
        })
      ).rejects.toThrow();
    });

    it('should support subscriber-only tier', async () => {
      const result = await caller.emotes.generateWithAI({
        name: 'subEmote',
        prompt: 'exclusive emote for subs',
        tier: 'subscriber',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getMyEmotes', () => {
    it('should return streamer emotes', async () => {
      const emotes = await caller.emotes.getMyEmotes();

      expect(Array.isArray(emotes)).toBe(true);
      expect(emotes.length).toBeGreaterThan(0);
      expect(emotes[0]).toHaveProperty('name');
      expect(emotes[0]).toHaveProperty('imageUrl');
      expect(emotes[0]).toHaveProperty('generatedByAI');
    });
  });

  describe('toggleEnabled', () => {
    it('should toggle emote enabled status', async () => {
      const result = await caller.emotes.toggleEnabled({ emoteId: 1 });

      expect(result.success).toBe(true);
    });

    it('should reject toggling other streamer emotes', async () => {
      const db = await import('./db');
      vi.mocked(db.getEmoteById).mockResolvedValueOnce({
        id: 2,
        streamerId: 999, // Different streamer
        name: 'otherEmote',
        imageUrl: 'https://example.com/other.png',
        tier: 'free',
        isEnabled: true,
        generatedByAI: false,
        usageCount: 0,
        createdAt: new Date(),
      });

      await expect(
        caller.emotes.toggleEnabled({ emoteId: 2 })
      ).rejects.toThrow('FORBIDDEN');
    });
  });

  describe('delete', () => {
    it('should delete own emote', async () => {
      const result = await caller.emotes.delete({ emoteId: 1 });

      expect(result.success).toBe(true);
    });

    it('should reject deleting other streamer emotes', async () => {
      const db = await import('./db');
      vi.mocked(db.getEmoteById).mockResolvedValueOnce({
        id: 2,
        streamerId: 999, // Different streamer
        name: 'otherEmote',
        imageUrl: 'https://example.com/other.png',
        tier: 'free',
        isEnabled: true,
        generatedByAI: false,
        usageCount: 0,
        createdAt: new Date(),
      });

      await expect(
        caller.emotes.delete({ emoteId: 2 })
      ).rejects.toThrow('FORBIDDEN');
    });
  });

  describe('getByStreamer', () => {
    it('should return emotes for any streamer (public)', async () => {
      const emotes = await caller.emotes.getByStreamer({ streamerId: 1 });

      expect(Array.isArray(emotes)).toBe(true);
    });
  });
});
