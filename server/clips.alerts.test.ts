import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { Context } from './_core/context';

describe('Clips Router', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let mockContext: Context;

  beforeAll(() => {
    // Mock context for authenticated streamer
    mockContext = {
      user: {
        id: 1,
        openId: 'test-open-id',
        name: 'Test Streamer',
        email: 'test@example.com',
        role: 'streamer',
        emailVerified: true,
        partnerTier: 'basic',
        coinsBalance: 1200,
      },
      req: {} as any,
      res: {} as any,
    };

    caller = appRouter.createCaller(mockContext);
  });

  it('should validate clip duration (5-60 seconds)', async () => {
    // Test too short clip (< 5s)
    await expect(
      caller.clips.create({
        streamId: 1,
        title: 'Short clip',
        startTime: 0,
        endTime: 3, // Only 3 seconds
      })
    ).rejects.toThrow('5 and 60 seconds');

    // Test too long clip (> 60s)
    await expect(
      caller.clips.create({
        streamId: 1,
        title: 'Long clip',
        startTime: 0,
        endTime: 70, // 70 seconds
      })
    ).rejects.toThrow('5 and 60 seconds');
  });

  it('should accept valid clip duration', async () => {
    // This will fail if stream doesn't exist, but validates duration logic
    const result = await caller.clips.create({
      streamId: 999999, // Non-existent stream
      title: 'Valid duration clip',
      startTime: 10,
      endTime: 25, // 15 seconds - valid
    }).catch(err => err);

    // Should fail on stream not found, not duration validation
    expect(result.message).not.toContain('5 and 60 seconds');
  });

  it('should require authentication for clip creation', async () => {
    const unauthCaller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    await expect(
      unauthCaller.clips.create({
        streamId: 1,
        title: 'Test clip',
        startTime: 0,
        endTime: 10,
      })
    ).rejects.toThrow('Please login');
  });

  it('should allow public access to clip queries', async () => {
    const publicCaller = appRouter.createCaller({
      user: null,
      req: {} as any,
      res: {} as any,
    });

    // Should not throw auth error
    const clips = await publicCaller.clips.getByStream({ streamId: 1 });
    expect(Array.isArray(clips)).toBe(true);
  });
});

describe('Alerts Router', () => {
  let streamerCaller: ReturnType<typeof appRouter.createCaller>;
  let viewerCaller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    // Mock context for streamer
    const streamerContext: Context = {
      user: {
        id: 1,
        openId: 'streamer-open-id',
        name: 'Test Streamer',
        email: 'streamer@example.com',
        role: 'streamer',
        emailVerified: true,
        partnerTier: 'basic',
        coinsBalance: 1200,
      },
      req: {} as any,
      res: {} as any,
    };

    // Mock context for viewer (non-streamer)
    const viewerContext: Context = {
      user: {
        id: 2,
        openId: 'viewer-open-id',
        name: 'Test Viewer',
        email: 'viewer@example.com',
        role: 'viewer',
        emailVerified: true,
        partnerTier: 'basic',
        coinsBalance: 100,
      },
      req: {} as any,
      res: {} as any,
    };

    streamerCaller = appRouter.createCaller(streamerContext);
    viewerCaller = appRouter.createCaller(viewerContext);
  });

  it('should return alert settings for streamers', async () => {
    const settings = await streamerCaller.alerts.getMySettings();
    
    expect(settings).toBeDefined();
    expect(typeof settings.followEnabled).toBe('boolean');
    expect(typeof settings.subEnabled).toBe('boolean');
    expect(typeof settings.donationEnabled).toBe('boolean');
    expect(typeof settings.raidEnabled).toBe('boolean');
    
    // Check animations are valid values
    expect(['bounce', 'slide', 'fade', 'confetti', 'fireworks']).toContain(settings.followAnimation);
    expect(['bounce', 'slide', 'fade', 'confetti', 'fireworks']).toContain(settings.subAnimation);
    expect(['bounce', 'slide', 'fade', 'confetti', 'fireworks']).toContain(settings.donationAnimation);
    expect(['bounce', 'slide', 'fade', 'confetti', 'fireworks']).toContain(settings.raidAnimation);
  });

  it('should update alert settings', async () => {
    const result = await streamerCaller.alerts.updateSettings({
      followEnabled: false,
      followAnimation: 'fade',
      followTextTemplate: 'Custom follow text: {username}',
      followDuration: 8,
    });

    expect(result.success).toBe(true);

    // Verify settings were updated
    const settings = await streamerCaller.alerts.getMySettings();
    expect(settings.followEnabled).toBe(false);
    expect(settings.followAnimation).toBe('fade');
    expect(settings.followTextTemplate).toBe('Custom follow text: {username}');
    expect(settings.followDuration).toBe(8);
  });

  it('should validate duration range (1-30 seconds)', async () => {
    // Test duration too short (< 1s)
    await expect(
      streamerCaller.alerts.updateSettings({
        followDuration: 0,
      })
    ).rejects.toThrow();

    // Test duration too long (> 30s)
    await expect(
      streamerCaller.alerts.updateSettings({
        followDuration: 35,
      })
    ).rejects.toThrow();
  });

  it('should restrict alert settings to streamers only', async () => {
    // Viewer should not be able to access alert settings
    await expect(
      viewerCaller.alerts.getMySettings()
    ).rejects.toThrow('Only streamers can access this');

    await expect(
      viewerCaller.alerts.updateSettings({
        followEnabled: false,
      })
    ).rejects.toThrow('Only streamers can access this');
  });

  it('should accept all valid animation types', async () => {
    const animations = ['bounce', 'slide', 'fade', 'confetti', 'fireworks'] as const;

    for (const animation of animations) {
      const result = await streamerCaller.alerts.updateSettings({
        followAnimation: animation,
      });
      expect(result.success).toBe(true);
    }
  });
});
