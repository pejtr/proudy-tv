interface PartnerBadgeProps {
  tier: 'basic' | 'affiliate' | 'partner';
  size?: 'sm' | 'md' | 'lg';
}

const TIER_CONFIG = {
  basic: {
    badge: '🎬',
    name: 'Basic',
    color: 'text-gray-400',
  },
  affiliate: {
    badge: '⭐',
    name: 'Affiliate',
    color: 'text-yellow-400',
  },
  partner: {
    badge: '👑',
    name: 'Partner',
    color: 'text-yellow-500',
  },
};

const SIZE_CONFIG = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
};

export default function PartnerBadge({ tier, size = 'md' }: PartnerBadgeProps) {
  const config = TIER_CONFIG[tier];
  const sizeClass = SIZE_CONFIG[size];

  // Don't show badge for basic tier
  if (tier === 'basic') {
    return null;
  }

  return (
    <span 
      className={`inline-flex items-center gap-1 ${sizeClass} ${config.color} font-semibold`}
      title={`${config.name} Streamer`}
    >
      <span>{config.badge}</span>
    </span>
  );
}
