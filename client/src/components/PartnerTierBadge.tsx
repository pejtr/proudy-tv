interface PartnerTierBadgeProps {
  tier: 'basic' | 'affiliate' | 'partner';
  size?: 'sm' | 'md' | 'lg';
}

export function PartnerTierBadge({ tier, size = 'md' }: PartnerTierBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const tierConfig = {
    basic: {
      emoji: '🎬',
      label: 'Basic',
      color: 'text-gray-400',
    },
    affiliate: {
      emoji: '⭐',
      label: 'Affiliate',
      color: 'text-yellow-400',
    },
    partner: {
      emoji: '👑',
      label: 'Partner',
      color: 'text-purple-400',
    },
  };

  const config = tierConfig[tier];

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${config.color} ${sizeClasses[size]}`}
      title={`${config.label} Streamer`}
    >
      {config.emoji}
    </span>
  );
}
