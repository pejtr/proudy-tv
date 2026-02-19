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
 * Revenue Split - 85% to streamer, 15% to platform
 */
export const REVENUE_SPLIT = {
  streamer: 0.85,
  platform: 0.15,
};

/**
 * Calculate streamer earnings from coins
 */
export function calculateStreamerEarnings(coins: number): number {
  return Math.floor(coins * REVENUE_SPLIT.streamer);
}

/**
 * Calculate platform fee from coins
 */
export function calculatePlatformFee(coins: number): number {
  return Math.floor(coins * REVENUE_SPLIT.platform);
}
