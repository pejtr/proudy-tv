/**
 * Proudy Coins - Platform Currency
 * 1 Proudy Coin = 1 Kč (Czech Koruna)
 */

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  priceKc: number; // Price in Kč
  priceCents: number; // Price in cents for Stripe (Kč * 100)
  bonus?: number; // Bonus coins for larger packages
  popular?: boolean;
}

export const COIN_PACKAGES: CoinPackage[] = [
  {
    id: 'coins_100',
    name: '100 Coins',
    coins: 100,
    priceKc: 100,
    priceCents: 10000,
  },
  {
    id: 'coins_500',
    name: '500 Coins',
    coins: 500,
    priceKc: 500,
    priceCents: 50000,
  },
  {
    id: 'coins_1000',
    name: '1,000 Coins',
    coins: 1000,
    priceKc: 1000,
    priceCents: 100000,
    popular: true,
  },
  {
    id: 'coins_5000',
    name: '5,000 Coins',
    coins: 5000,
    priceKc: 5000,
    priceCents: 500000,
    bonus: 250, // 5% bonus
  },
  {
    id: 'coins_10000',
    name: '10,000 Coins',
    coins: 10000,
    priceKc: 10000,
    priceCents: 1000000,
    bonus: 1000, // 10% bonus
  },
];

/**
 * Subscription - 88 Coins per month
 */
export const SUBSCRIPTION_PRICE = {
  coins: 88,
  priceKc: 88,
  priceCents: 8800,
  interval: 'month' as const,
};

/**
 * Donation Tiers - Custom amounts with video/audio alerts
 * Streamers can configure 12 slots with these amounts
 */
export const DONATION_AMOUNTS = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 5000, 10000
];

/**
 * Partner Program Tiers with Revenue Splits
 */
export const PARTNER_TIERS = {
  basic: {
    name: 'Basic Streamer',
    minHours: 0,
    minSubscribers: 0,
    revenueSplit: { streamer: 0.60, platform: 0.40 },
    badge: '🎬',
    requirements: 'Ověřený email',
  },
  affiliate: {
    name: 'Affiliate',
    minHours: 20,
    minSubscribers: 10,
    revenueSplit: { streamer: 0.70, platform: 0.30 },
    badge: '⭐',
    requirements: '20+ hodin/měsíc, 10+ subscribers',
  },
  partner: {
    name: 'PROUDY Partner',
    minHours: 50,
    minSubscribers: 50,
    revenueSplit: { streamer: 0.80, platform: 0.20 },
    badge: '👑',
    requirements: '50+ hodin/měsíc, 50+ subscribers, KYC',
  },
} as const;

export type PartnerTier = keyof typeof PARTNER_TIERS;

/**
 * Legacy revenue split (kept for backwards compatibility)
 * @deprecated Use PARTNER_TIERS instead
 */
export const REVENUE_SPLIT = {
  streamer: 0.60, // Default to Basic tier
  platform: 0.40,
};

/**
 * Calculate streamer earnings from coins based on partner tier
 */
export function calculateStreamerEarnings(coins: number, tier: PartnerTier = 'basic'): number {
  return Math.floor(coins * PARTNER_TIERS[tier].revenueSplit.streamer);
}

/**
 * Calculate platform fee from coins based on partner tier
 */
export function calculatePlatformFee(coins: number, tier: PartnerTier = 'basic'): number {
  return Math.floor(coins * PARTNER_TIERS[tier].revenueSplit.platform);
}

/**
 * Determine partner tier based on hours and subscribers
 */
export function determinePartnerTier(monthlyHours: number, activeSubscribers: number): PartnerTier {
  if (monthlyHours >= PARTNER_TIERS.partner.minHours && activeSubscribers >= PARTNER_TIERS.partner.minSubscribers) {
    return 'partner';
  }
  if (monthlyHours >= PARTNER_TIERS.affiliate.minHours && activeSubscribers >= PARTNER_TIERS.affiliate.minSubscribers) {
    return 'affiliate';
  }
  return 'basic';
}
