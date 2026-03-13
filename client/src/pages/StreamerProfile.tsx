import { useState } from 'react';
import { useParams, Link } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import {
  Twitter,
  Instagram,
  Youtube,
  Music,
  MessageCircle,
  Heart,
  Users,
  Radio,
  Play,
  Scissors,
  Bell,
  BellOff,
  Star,
  Crown,
  Shield,
  ExternalLink,
  Calendar,
  Clock,
  TrendingUp,
  Smile,
  Eye,
} from 'lucide-react';
import VerifiedBadge from '@/components/VerifiedBadge';
import { PartnerTierBadge } from '@/components/PartnerTierBadge';
import { getLoginUrl } from '@/const';
import { cn } from '@/lib/utils';

const SOCIAL_ICONS: Record<string, any> = {
  twitter: Twitter,
  instagram: Instagram,
  youtube: Youtube,
  tiktok: Music,
  discord: MessageCircle,
};

const SOCIAL_COLORS: Record<string, string> = {
  twitter: '#1da1f2',
  instagram: '#e1306c',
  youtube: '#ff0000',
  tiktok: '#69c9d0',
  discord: '#5865f2',
};

// Demo streamer data for profiles not yet in DB
const DEMO_STREAMERS: Record<string, any> = {
  'jakub_gaming': {
    id: 1,
    name: 'Jakub Gaming',
    bio: 'Profesionální hráč CS2 a Valorant. Streamuji každý den od 18:00. Česká komunita na prvním místě! 🎮',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jakub',
    partnerTier: 'partner',
    emailVerified: true,
    socialLinks: { twitter: 'jakub_gaming', youtube: 'JakubGamingCZ', discord: 'jakubgg' },
    activeSubscribers: 1240,
    monthlyStreamHours: 120,
    streams: [
      { id: 1, title: 'CS2 Ranked — Cesta na Global Elite', category: 'Gaming', viewerCount: 3200, isLive: true, thumbnailUrl: 'https://picsum.photos/seed/cs2/400/225' },
      { id: 2, title: 'Valorant s kamarády', category: 'Gaming', viewerCount: 0, isLive: false, thumbnailUrl: 'https://picsum.photos/seed/val/400/225' },
    ],
    clips: [
      { id: 1, title: 'Ace na Mirage!', viewCount: 45000, thumbnailUrl: 'https://picsum.photos/seed/clip1/400/225' },
      { id: 2, title: 'Clutch 1v5', viewCount: 28000, thumbnailUrl: 'https://picsum.photos/seed/clip2/400/225' },
    ],
    emotes: [
      { id: 1, name: 'jakubLUL', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=lul', tier: 'free' },
      { id: 2, name: 'jakubGG', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=gg', tier: 'subscriber' },
    ],
  },
  'tereza_asmr': {
    id: 2,
    name: 'Tereza ASMR',
    bio: 'ASMR streamerka a content creator. Relaxační streamy každý večer. Přijď si odpočinout 🌙✨',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tereza',
    partnerTier: 'affiliate',
    emailVerified: true,
    socialLinks: { instagram: 'tereza_asmr', tiktok: 'terezaasmr' },
    activeSubscribers: 456,
    monthlyStreamHours: 80,
    streams: [
      { id: 3, title: 'Relaxační ASMR — Šeptání a zvuky přírody', category: 'ASMR', viewerCount: 850, isLive: true, thumbnailUrl: 'https://picsum.photos/seed/asmr/400/225' },
    ],
    clips: [
      { id: 3, title: 'Nejlepší ASMR moment', viewCount: 12000, thumbnailUrl: 'https://picsum.photos/seed/clip3/400/225' },
    ],
    emotes: [
      { id: 3, name: 'terezaHeart', imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=heart', tier: 'free' },
    ],
  },
};

export default function StreamerProfile() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Try to get from demo data first, then DB
  const demoStreamer = username ? DEMO_STREAMERS[username] : null;

  // Real DB query by username (name field)
  const { data: dbProfile } = trpc.profile.get.useQuery(
    { userId: 1 },
    { enabled: !demoStreamer }
  );

  const profile = demoStreamer || dbProfile;

  const followMutation = trpc.follows.follow.useMutation({
    onSuccess: () => {
      setIsFollowing(true);
      toast.success(`Sleduješ ${profile?.name}!`);
    },
  });

  const unfollowMutation = trpc.follows.unfollow.useMutation({
    onSuccess: () => {
      setIsFollowing(false);
      toast.success('Přestal jsi sledovat');
    },
  });

  const handleFollow = () => {
    if (!isAuthenticated) {
      toast.error('Přihlas se pro sledování');
      return;
    }
    if (isFollowing) {
      unfollowMutation.mutate({ userId: profile?.id || 1 });
    } else {
      followMutation.mutate({ userId: profile?.id || 1 });
    }
  };

  const handleSubscribe = () => {
    if (!isAuthenticated) {
      toast.error('Přihlas se pro odběr');
      return;
    }
    setIsSubscribed(!isSubscribed);
    toast.success(isSubscribed ? 'Odběr zrušen' : `Odebíráš ${profile?.name} za 59 Kč/měsíc!`);
  };

  const handleNotifications = () => {
    if (!isAuthenticated) return;
    setNotificationsEnabled(!notificationsEnabled);
    toast.success(notificationsEnabled ? 'Notifikace vypnuty' : 'Dostaneš notifikaci když bude live!');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Streamer nenalezen</h2>
          <p className="text-muted-foreground mb-4">Profil @{username} neexistuje</p>
          <Link href="/browse">
            <Button>Procházet streamery</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const socialLinks = typeof profile.socialLinks === 'string'
    ? JSON.parse(profile.socialLinks || '{}')
    : profile.socialLinks || {};

  const liveStream = profile.streams?.find((s: any) => s.isLive);

  return (
    <div className="min-h-screen bg-background">
      {/* Banner / Hero */}
      <div className="relative h-48 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)',
          }}
        />
        {liveStream && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-red-500 text-white animate-pulse gap-1 text-sm px-3 py-1">
              <span className="w-2 h-2 rounded-full bg-white inline-block" />
              LIVE — {liveStream.viewerCount.toLocaleString()} diváků
            </Badge>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                alt={profile.name}
                className="w-28 h-28 rounded-full border-4 border-background bg-muted object-cover"
              />
              {liveStream && (
                <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-1">
                  <Radio className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            {/* Name & Actions */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold truncate">{profile.name}</h1>
                {profile.emailVerified && <VerifiedBadge verified={true} />}
                {profile.partnerTier && <PartnerTierBadge tier={profile.partnerTier} />}
              </div>
              <p className="text-muted-foreground text-sm">@{username}</p>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {(profile.activeSubscribers || 0).toLocaleString()} odběratelů
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {profile.monthlyStreamHours || 0}h / měsíc
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {liveStream && (
                <Link href={`/stream/${liveStream.id}`}>
                  <Button className="bg-red-500 hover:bg-red-600 gap-1">
                    <Radio className="h-4 w-4" />
                    Sledovat LIVE
                  </Button>
                </Link>
              )}
              <Button
                onClick={handleSubscribe}
                className={cn(
                  'gap-1',
                  isSubscribed
                    ? 'bg-purple-700 hover:bg-purple-800'
                    : 'bg-purple-600 hover:bg-purple-700'
                )}
              >
                <Star className="h-4 w-4" />
                {isSubscribed ? 'Odebíráš ✓' : 'Odebírat (59 Kč/měs)'}
              </Button>
              <Button
                onClick={handleFollow}
                variant={isFollowing ? 'secondary' : 'outline'}
                className="gap-1"
              >
                <Heart className={cn('h-4 w-4', isFollowing && 'fill-red-500 text-red-500')} />
                {isFollowing ? 'Sleduješ' : 'Sledovat'}
              </Button>
              <Button
                onClick={handleNotifications}
                variant="ghost"
                size="icon"
                className={notificationsEnabled ? 'text-yellow-400' : 'text-muted-foreground'}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Social Links */}
          {Object.keys(socialLinks).length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {Object.entries(socialLinks).map(([platform, handle]) => {
                if (!handle) return null;
                const Icon = SOCIAL_ICONS[platform];
                const color = SOCIAL_COLORS[platform];
                if (!Icon) return null;
                return (
                  <a
                    key={platform}
                    href={`#${platform}`}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors hover:bg-muted/50"
                    style={{ borderColor: color + '44', color }}
                  >
                    <Icon className="h-3 w-3" />
                    {handle as string}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <Separator className="mb-6" />

        {/* Tabs */}
        <Tabs defaultValue="streams" className="pb-12">
          <TabsList className="mb-6">
            <TabsTrigger value="streams" className="gap-1">
              <Radio className="h-3.5 w-3.5" /> Streamy
            </TabsTrigger>
            <TabsTrigger value="clips" className="gap-1">
              <Scissors className="h-3.5 w-3.5" /> Klipy
            </TabsTrigger>
            <TabsTrigger value="emotes" className="gap-1">
              <Smile className="h-3.5 w-3.5" /> Emotes
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1">
              <Shield className="h-3.5 w-3.5" /> O streamerovi
            </TabsTrigger>
          </TabsList>

          {/* Streams Tab */}
          <TabsContent value="streams">
            {profile.streams?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.streams.map((stream: any) => (
                  <Link key={stream.id} href={`/stream/${stream.id}`}>
                    <Card className="overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group">
                      <div className="relative aspect-video bg-muted">
                        <img
                          src={stream.thumbnailUrl || `https://picsum.photos/seed/${stream.id}/400/225`}
                          alt={stream.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {stream.isLive && (
                          <Badge className="absolute top-2 left-2 bg-red-500 text-white text-xs animate-pulse">
                            LIVE
                          </Badge>
                        )}
                        {stream.isLive && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {stream.viewerCount.toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium text-sm line-clamp-2">{stream.title}</p>
                        <Badge variant="secondary" className="mt-1 text-xs">{stream.category}</Badge>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Radio className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Žádné streamy zatím</p>
              </div>
            )}
          </TabsContent>

          {/* Clips Tab */}
          <TabsContent value="clips">
            {profile.clips?.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.clips.map((clip: any) => (
                  <Card key={clip.id} className="overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer group">
                    <div className="relative aspect-video bg-muted">
                      <img
                        src={clip.thumbnailUrl || `https://picsum.photos/seed/clip${clip.id}/400/225`}
                        alt={clip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                        <Play className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm line-clamp-2">{clip.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {clip.viewCount.toLocaleString()} zhlédnutí
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Scissors className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>Žádné klipy zatím</p>
              </div>
            )}
          </TabsContent>

          {/* Emotes Tab */}
          <TabsContent value="emotes">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Emotes od {profile.name}</h3>
                <p className="text-xs text-muted-foreground">
                  Zakup emotes za Proudy Coins nebo odebírej pro přístup k sub emotes
                </p>
              </div>
              {profile.emotes?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {profile.emotes.map((emote: any) => (
                    <Card key={emote.id} className="p-4 text-center hover:border-purple-500/50 transition-all">
                      <img
                        src={emote.imageUrl}
                        alt={emote.name}
                        className="w-16 h-16 mx-auto mb-2 rounded"
                      />
                      <p className="text-sm font-medium">:{emote.name}:</p>
                      <Badge
                        variant={emote.tier === 'free' ? 'secondary' : 'default'}
                        className={cn(
                          'mt-1 text-xs',
                          emote.tier === 'subscriber' && 'bg-purple-600'
                        )}
                      >
                        {emote.tier === 'free' ? 'Zdarma' : 'Pro odběratele'}
                      </Badge>
                      {emote.tier === 'free' && (
                        <Button size="sm" variant="outline" className="mt-2 w-full text-xs h-7">
                          50 🪙 koupit
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Smile className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Žádné emotes zatím</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <div className="max-w-2xl space-y-4">
              <Card className="p-5">
                <h3 className="font-semibold mb-3">Statistiky</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Odběratelé', value: (profile.activeSubscribers || 0).toLocaleString(), icon: Star },
                    { label: 'Hodin/měsíc', value: profile.monthlyStreamHours || 0, icon: Clock },
                    { label: 'Partner tier', value: profile.partnerTier || 'basic', icon: Crown },
                    { label: 'Kategorie', value: profile.streams?.[0]?.category || 'Různé', icon: TrendingUp },
                  ].map(stat => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-purple-500/10">
                          <Icon className="h-4 w-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="font-semibold text-sm capitalize">{stat.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="font-semibold mb-3">Subscription Tiers</h3>
                <div className="space-y-2">
                  {[
                    { tier: 'Tier 1', price: '59 Kč', perks: ['Subscriber badge', 'Sub emotes', 'Ad-free viewing'] },
                    { tier: 'Tier 2', price: '119 Kč', perks: ['Vše z Tier 1', 'Exkluzivní emotes', 'Prioritní chat'] },
                    { tier: 'Tier 3', price: '299 Kč', perks: ['Vše z Tier 2', 'Discord role', 'Osobní poděkování'] },
                  ].map(t => (
                    <div key={t.tier} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-purple-500/40 transition-colors">
                      <div>
                        <p className="font-medium text-sm">{t.tier}</p>
                        <p className="text-xs text-muted-foreground">{t.perks.join(' · ')}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-xs h-7"
                        onClick={handleSubscribe}
                      >
                        {t.price}/měs
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
