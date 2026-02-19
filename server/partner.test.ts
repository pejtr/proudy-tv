import { describe, it, expect } from 'vitest';
import { determinePartnerTier, calculateStreamerEarnings, calculatePlatformFee, PARTNER_TIERS } from './products';

describe('Partner Program', () => {
  describe('determinePartnerTier', () => {
    it('should return basic tier for new streamers', () => {
      const tier = determinePartnerTier(0, 0);
      expect(tier).toBe('basic');
    });

    it('should return affiliate tier when requirements met', () => {
      const tier = determinePartnerTier(20, 10);
      expect(tier).toBe('affiliate');
    });

    it('should return partner tier when requirements met', () => {
      const tier = determinePartnerTier(50, 50);
      expect(tier).toBe('partner');
    });

    it('should require both hours AND subscribers for upgrade', () => {
      // Has hours but not subscribers
      expect(determinePartnerTier(50, 5)).toBe('basic');
      
      // Has subscribers but not hours
      expect(determinePartnerTier(10, 50)).toBe('basic');
    });

    it('should upgrade to highest tier possible', () => {
      // Exceeds partner requirements
      expect(determinePartnerTier(100, 100)).toBe('partner');
      
      // Between affiliate and partner
      expect(determinePartnerTier(30, 25)).toBe('affiliate');
    });
  });

  describe('calculateStreamerEarnings', () => {
    it('should calculate 60% for basic tier', () => {
      const earnings = calculateStreamerEarnings(100, 'basic');
      expect(earnings).toBe(60);
    });

    it('should calculate 70% for affiliate tier', () => {
      const earnings = calculateStreamerEarnings(100, 'affiliate');
      expect(earnings).toBe(70);
    });

    it('should calculate 80% for partner tier', () => {
      const earnings = calculateStreamerEarnings(100, 'partner');
      expect(earnings).toBe(80);
    });

    it('should floor decimal results', () => {
      const earnings = calculateStreamerEarnings(99, 'basic');
      expect(earnings).toBe(59); // 99 * 0.6 = 59.4 → 59
    });

    it('should default to basic tier if not specified', () => {
      const earnings = calculateStreamerEarnings(100);
      expect(earnings).toBe(60);
    });
  });

  describe('calculatePlatformFee', () => {
    it('should calculate 40% for basic tier', () => {
      const fee = calculatePlatformFee(100, 'basic');
      expect(fee).toBe(40);
    });

    it('should calculate 30% for affiliate tier', () => {
      const fee = calculatePlatformFee(100, 'affiliate');
      expect(fee).toBe(30);
    });

    it('should calculate 20% for partner tier', () => {
      const fee = calculatePlatformFee(100, 'partner');
      expect(fee).toBe(20);
    });

    it('should ensure streamer + platform = total', () => {
      const coins = 100;
      
      for (const tier of ['basic', 'affiliate', 'partner'] as const) {
        const streamer = calculateStreamerEarnings(coins, tier);
        const platform = calculatePlatformFee(coins, tier);
        
        // Allow 1 coin difference due to floor rounding
        expect(streamer + platform).toBeGreaterThanOrEqual(coins - 1);
        expect(streamer + platform).toBeLessThanOrEqual(coins);
      }
    });
  });

  describe('PARTNER_TIERS configuration', () => {
    it('should have correct revenue splits', () => {
      expect(PARTNER_TIERS.basic.revenueSplit.streamer).toBe(0.60);
      expect(PARTNER_TIERS.basic.revenueSplit.platform).toBe(0.40);
      
      expect(PARTNER_TIERS.affiliate.revenueSplit.streamer).toBe(0.70);
      expect(PARTNER_TIERS.affiliate.revenueSplit.platform).toBe(0.30);
      
      expect(PARTNER_TIERS.partner.revenueSplit.streamer).toBe(0.80);
      expect(PARTNER_TIERS.partner.revenueSplit.platform).toBe(0.20);
    });

    it('should have progressive requirements', () => {
      expect(PARTNER_TIERS.basic.minHours).toBe(0);
      expect(PARTNER_TIERS.basic.minSubscribers).toBe(0);
      
      expect(PARTNER_TIERS.affiliate.minHours).toBe(20);
      expect(PARTNER_TIERS.affiliate.minSubscribers).toBe(10);
      
      expect(PARTNER_TIERS.partner.minHours).toBe(50);
      expect(PARTNER_TIERS.partner.minSubscribers).toBe(50);
    });

    it('should have unique badges for each tier', () => {
      const badges = [
        PARTNER_TIERS.basic.badge,
        PARTNER_TIERS.affiliate.badge,
        PARTNER_TIERS.partner.badge,
      ];
      
      const uniqueBadges = new Set(badges);
      expect(uniqueBadges.size).toBe(3);
    });
  });
});
