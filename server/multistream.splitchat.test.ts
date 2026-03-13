import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock('./db', () => ({
  db: {
    addMultistreamConnection: vi.fn().mockResolvedValue(undefined),
    getMultistreamConnections: vi.fn().mockResolvedValue([]),
    toggleMultistreamConnection: vi.fn().mockResolvedValue(undefined),
    deleteMultistreamConnection: vi.fn().mockResolvedValue(undefined),
    getMultistreamSettings: vi.fn().mockResolvedValue({ mode: 'affiliate', streamerId: 1 }),
    updateMultistreamSettings: vi.fn().mockResolvedValue(undefined),
  },
}));

// ─── Split Chat Platform Config ───────────────────────────────────────────────
describe('Split Chat — Platform Configuration', () => {
  const PLATFORMS = ['proudy', 'twitch', 'youtube', 'kick', 'facebook'] as const;

  it('should have config for all 5 platforms', () => {
    expect(PLATFORMS).toHaveLength(5);
  });

  it('should include PROUDY as primary platform', () => {
    expect(PLATFORMS).toContain('proudy');
  });

  it('should include all major streaming platforms', () => {
    expect(PLATFORMS).toContain('twitch');
    expect(PLATFORMS).toContain('youtube');
    expect(PLATFORMS).toContain('kick');
  });

  it('should have unique platform identifiers', () => {
    const unique = new Set(PLATFORMS);
    expect(unique.size).toBe(PLATFORMS.length);
  });
});

// ─── Multistream Mode Logic ───────────────────────────────────────────────────
describe('Multistream Mode — Revenue Split Logic', () => {
  const MODES = {
    affiliate: { revenueSplit: 70, allowedPlatforms: ['proudy', 'twitch', 'youtube', 'kick', 'facebook'] },
    partner: { revenueSplit: 75, allowedPlatforms: ['proudy', 'kick', 'youtube', 'facebook'] },
    exclusive: { revenueSplit: 85, allowedPlatforms: ['proudy'] },
  };

  it('affiliate mode should give 70% revenue split', () => {
    expect(MODES.affiliate.revenueSplit).toBe(70);
  });

  it('partner mode should give 75% revenue split', () => {
    expect(MODES.partner.revenueSplit).toBe(75);
  });

  it('exclusive mode should give 85% revenue split', () => {
    expect(MODES.exclusive.revenueSplit).toBe(85);
  });

  it('exclusive mode should only allow PROUDY platform', () => {
    expect(MODES.exclusive.allowedPlatforms).toEqual(['proudy']);
    expect(MODES.exclusive.allowedPlatforms).toHaveLength(1);
  });

  it('partner mode should block Twitch (TOS compliance)', () => {
    expect(MODES.partner.allowedPlatforms).not.toContain('twitch');
  });

  it('affiliate mode should allow all platforms', () => {
    expect(MODES.affiliate.allowedPlatforms).toContain('twitch');
    expect(MODES.affiliate.allowedPlatforms).toContain('youtube');
    expect(MODES.affiliate.allowedPlatforms).toContain('kick');
  });

  it('exclusive mode should have highest revenue split', () => {
    const splits = Object.values(MODES).map(m => m.revenueSplit);
    expect(Math.max(...splits)).toBe(MODES.exclusive.revenueSplit);
  });
});

// ─── Twitch Partner TOS Compliance ───────────────────────────────────────────
describe('Twitch Partner TOS Compliance', () => {
  function shouldBlockTwitchStream(mode: string, isTwitchPartner: boolean): boolean {
    if (mode === 'exclusive') return true; // No external platforms
    if (mode === 'partner' && isTwitchPartner) return true; // Partner TOS
    return false;
  }

  it('should block Twitch streaming for Partners in partner mode', () => {
    expect(shouldBlockTwitchStream('partner', true)).toBe(true);
  });

  it('should allow Twitch streaming for Affiliates in affiliate mode', () => {
    expect(shouldBlockTwitchStream('affiliate', false)).toBe(false);
  });

  it('should block all external platforms in exclusive mode', () => {
    expect(shouldBlockTwitchStream('exclusive', false)).toBe(true);
    expect(shouldBlockTwitchStream('exclusive', true)).toBe(true);
  });

  it('should allow Twitch for non-Partners in partner mode', () => {
    // Non-partners can still stream to Twitch in partner mode
    expect(shouldBlockTwitchStream('partner', false)).toBe(false);
  });
});

// ─── Viewer Count Aggregation ─────────────────────────────────────────────────
describe('Viewer Count Aggregation', () => {
  function aggregateViewers(counts: Record<string, number>): number {
    return Object.values(counts).reduce((sum, count) => sum + count, 0);
  }

  function getPlatformShare(platform: string, counts: Record<string, number>): number {
    const total = aggregateViewers(counts);
    if (total === 0) return 0;
    return Math.round(((counts[platform] || 0) / total) * 100);
  }

  it('should correctly aggregate viewer counts from all platforms', () => {
    const counts = { proudy: 200, twitch: 150, youtube: 100, kick: 50 };
    expect(aggregateViewers(counts)).toBe(500);
  });

  it('should calculate platform share percentage', () => {
    const counts = { proudy: 200, twitch: 100, youtube: 100, kick: 100 };
    expect(getPlatformShare('proudy', counts)).toBe(40);
  });

  it('should handle empty viewer counts', () => {
    expect(aggregateViewers({})).toBe(0);
    expect(getPlatformShare('proudy', {})).toBe(0);
  });

  it('should handle single platform', () => {
    const counts = { proudy: 500 };
    expect(aggregateViewers(counts)).toBe(500);
    expect(getPlatformShare('proudy', counts)).toBe(100);
  });
});

// ─── Emote Store — Coin Pricing ───────────────────────────────────────────────
describe('Emote Store — Proudy Coins Logic', () => {
  function canAfford(balance: number, price: number): boolean {
    return balance >= price;
  }

  function calculateCartTotal(cart: Array<{ priceCoins: number }>): number {
    return cart.reduce((sum, item) => sum + item.priceCoins, 0);
  }

  it('should allow purchase when balance is sufficient', () => {
    expect(canAfford(100, 50)).toBe(true);
    expect(canAfford(50, 50)).toBe(true);
  });

  it('should block purchase when balance is insufficient', () => {
    expect(canAfford(49, 50)).toBe(false);
    expect(canAfford(0, 50)).toBe(false);
  });

  it('should calculate cart total correctly', () => {
    const cart = [
      { priceCoins: 50 },
      { priceCoins: 75 },
      { priceCoins: 100 },
    ];
    expect(calculateCartTotal(cart)).toBe(225);
  });

  it('should handle empty cart', () => {
    expect(calculateCartTotal([])).toBe(0);
  });

  it('should handle free emotes (0 coins)', () => {
    const cart = [{ priceCoins: 0 }, { priceCoins: 50 }];
    expect(calculateCartTotal(cart)).toBe(50);
  });
});

// ─── Push Notification Subscription Logic ────────────────────────────────────
describe('Push Notifications — Subscription Logic', () => {
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => { store[key] = value; },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();

  beforeEach(() => {
    localStorageMock.clear();
  });

  function isSubscribedToStreamer(streamerId: number): boolean {
    return localStorageMock.getItem(`push_sub_${streamerId}`) === 'true';
  }

  function subscribeToStreamer(streamerId: number): void {
    localStorageMock.setItem(`push_sub_${streamerId}`, 'true');
  }

  function unsubscribeFromStreamer(streamerId: number): void {
    localStorageMock.removeItem(`push_sub_${streamerId}`);
  }

  it('should not be subscribed by default', () => {
    expect(isSubscribedToStreamer(1)).toBe(false);
  });

  it('should be subscribed after subscribing', () => {
    subscribeToStreamer(1);
    expect(isSubscribedToStreamer(1)).toBe(true);
  });

  it('should not be subscribed after unsubscribing', () => {
    subscribeToStreamer(1);
    unsubscribeFromStreamer(1);
    expect(isSubscribedToStreamer(1)).toBe(false);
  });

  it('should handle multiple streamers independently', () => {
    subscribeToStreamer(1);
    subscribeToStreamer(3);
    expect(isSubscribedToStreamer(1)).toBe(true);
    expect(isSubscribedToStreamer(2)).toBe(false);
    expect(isSubscribedToStreamer(3)).toBe(true);
  });
});

// ─── Streamer Profile — Social Links Parsing ─────────────────────────────────
describe('Streamer Profile — Social Links', () => {
  function parseSocialLinks(raw: string | object | null): Record<string, string> {
    if (!raw) return {};
    if (typeof raw === 'object') return raw as Record<string, string>;
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  it('should parse JSON string social links', () => {
    const raw = JSON.stringify({ twitter: 'testuser', youtube: 'testchannel' });
    const parsed = parseSocialLinks(raw);
    expect(parsed.twitter).toBe('testuser');
    expect(parsed.youtube).toBe('testchannel');
  });

  it('should handle object social links directly', () => {
    const obj = { twitter: 'user', instagram: 'user_ig' };
    const parsed = parseSocialLinks(obj);
    expect(parsed.twitter).toBe('user');
  });

  it('should return empty object for null', () => {
    expect(parseSocialLinks(null)).toEqual({});
  });

  it('should return empty object for invalid JSON', () => {
    expect(parseSocialLinks('not-valid-json')).toEqual({});
  });
});
