import { useState, useEffect } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Link } from 'wouter';
import {
  Radio,
  Twitch,
  Youtube,
  Zap,
  Users,
  MessageSquare,
  TrendingUp,
  Shield,
  Crown,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  RefreshCw,
  ArrowLeft,
  Eye,
  Globe,
  Wifi,
  WifiOff,
  Settings,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLoginUrl } from '@/const';

type Platform = 'twitch' | 'kick' | 'youtube' | 'facebook';

const PLATFORM_CONFIG = {
  twitch: {
    name: 'Twitch',
    icon: Twitch,
    color: '#9146ff',
    bgClass: 'bg-[#9146ff]/10 border-[#9146ff]/30',
    textClass: 'text-[#9146ff]',
    ingestUrl: 'rtmp://live.twitch.tv/app',
    note: 'Twitch Affiliates mohou streamovat simultánně od 2023',
    partnerNote: '⚠️ Twitch Partneři nemohou streamovat simultánně (TOS)',
  },
  kick: {
    name: 'Kick',
    icon: Zap,
    color: '#53fc18',
    bgClass: 'bg-[#53fc18]/10 border-[#53fc18]/30',
    textClass: 'text-[#53fc18]',
    ingestUrl: 'rtmp://fa723fc1b171.global-contribute.live-video.net/app',
    note: 'Kick nemá žádná omezení pro simultánní streaming',
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: '#ff0000',
    bgClass: 'bg-red-500/10 border-red-500/30',
    textClass: 'text-red-500',
    ingestUrl: 'rtmp://a.rtmp.youtube.com/live2',
    note: 'YouTube Live – žádná omezení pro simultánní streaming',
  },
  facebook: {
    name: 'Facebook',
    icon: Shield,
    color: '#1877f2',
    bgClass: 'bg-blue-500/10 border-blue-500/30',
    textClass: 'text-blue-500',
    ingestUrl: 'rtmps://live-api-s.facebook.com:443/rtmp/',
    note: 'Facebook Gaming – dostupné pro všechny streamery',
  },
};

// Simulated live viewer counts from external platforms
function useSimulatedViewerCounts(isLive: boolean) {
  const [counts, setCounts] = useState({
    proudy: 0,
    twitch: 0,
    youtube: 0,
    kick: 0,
  });

  useEffect(() => {
    if (!isLive) {
      setCounts({ proudy: 0, twitch: 0, youtube: 0, kick: 0 });
      return;
    }
    // Initial counts
    setCounts({
      proudy: Math.floor(Math.random() * 200) + 50,
      twitch: Math.floor(Math.random() * 150) + 30,
      youtube: Math.floor(Math.random() * 100) + 20,
      kick: Math.floor(Math.random() * 80) + 10,
    });
    // Fluctuate every 5 seconds
    const interval = setInterval(() => {
      setCounts(prev => ({
        proudy: Math.max(0, prev.proudy + Math.floor(Math.random() * 10) - 4),
        twitch: Math.max(0, prev.twitch + Math.floor(Math.random() * 8) - 3),
        youtube: Math.max(0, prev.youtube + Math.floor(Math.random() * 6) - 2),
        kick: Math.max(0, prev.kick + Math.floor(Math.random() * 5) - 2),
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, [isLive]);

  return counts;
}

export default function MultiStreamControlCenter() {
  const { user, isAuthenticated } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [showAddForm, setShowAddForm] = useState<Platform | null>(null);
  const [newStreamKey, setNewStreamKey] = useState('');
  const [isTwitchPartner, setIsTwitchPartner] = useState(false);

  const viewerCounts = useSimulatedViewerCounts(isLive);
  const totalViewers = Object.values(viewerCounts).reduce((a, b) => a + b, 0);

  const { data: settings, refetch: refetchSettings } = trpc.multistreaming.getSettings.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: connections, refetch: refetchConnections } = trpc.multistreaming.getConnections.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const addConnectionMutation = trpc.multistreaming.addConnection.useMutation({
    onSuccess: () => {
      toast.success('Platforma připojena!');
      setShowAddForm(null);
      setNewStreamKey('');
      refetchConnections();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleConnectionMutation = trpc.multistreaming.toggleConnection.useMutation({
    onSuccess: () => refetchConnections(),
    onError: (err) => toast.error(err.message),
  });

  const deleteConnectionMutation = trpc.multistreaming.deleteConnection.useMutation({
    onSuccess: () => {
      toast.success('Platforma odpojena');
      refetchConnections();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateModeMutation = trpc.multistreaming.updateMode.useMutation({
    onSuccess: (data) => {
      toast.success(`Režim změněn na ${data.mode}`);
      refetchSettings();
    },
  });

  const currentMode = settings?.mode || 'affiliate';

  const connectedPlatforms = new Set(connections?.map(c => c.platform) || []);

  const handleAddConnection = (platform: Platform) => {
    if (!newStreamKey.trim()) {
      toast.error('Zadejte stream key');
      return;
    }
    addConnectionMutation.mutate({
      platform,
      streamKey: newStreamKey,
      ingestUrl: PLATFORM_CONFIG[platform].ingestUrl,
      isTwitchPartner: platform === 'twitch' ? isTwitchPartner : false,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Radio className="h-12 w-12 mx-auto mb-4 text-purple-500" />
          <h2 className="text-2xl font-bold mb-2">Multistream Control Center</h2>
          <p className="text-muted-foreground mb-6">Přihlas se pro přístup k multistreaming dashboardu</p>
          <Button asChild>
            <a href={getLoginUrl()}>Přihlásit se</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <div className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-purple-500" />
              <h1 className="font-bold text-lg">Multistream Control Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isLive ? (
              <Badge className="bg-red-500 text-white animate-pulse gap-1">
                <span className="w-2 h-2 rounded-full bg-white inline-block" />
                LIVE
              </Badge>
            ) : (
              <Badge variant="secondary">OFFLINE</Badge>
            )}
            <Button
              onClick={() => setIsLive(!isLive)}
              variant={isLive ? 'destructive' : 'default'}
              size="sm"
              className={!isLive ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              {isLive ? 'Ukončit stream' : 'Simulovat Live'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Live Stats Bar */}
        {isLive && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Card className="p-3 col-span-2 md:col-span-1 bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Globe className="h-3 w-3" /> Celkem diváků
              </div>
              <div className="text-2xl font-bold text-purple-300">{totalViewers.toLocaleString()}</div>
            </Card>
            {Object.entries(viewerCounts).map(([platform, count]) => {
              const cfg = platform === 'proudy'
                ? { name: 'PROUDY.TV', color: '#7c3aed', icon: '🌊' }
                : { ...PLATFORM_CONFIG[platform as Platform], icon: platform === 'twitch' ? '🟣' : platform === 'youtube' ? '🔴' : '🟢' };
              return (
                <Card key={platform} className="p-3" style={{ borderColor: cfg.color + '44', backgroundColor: cfg.color + '11' }}>
                  <div className="text-xs text-muted-foreground mb-1">{cfg.icon} {cfg.name}</div>
                  <div className="text-xl font-bold" style={{ color: cfg.color }}>{count.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {totalViewers > 0 ? Math.round((count / totalViewers) * 100) : 0}%
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Mode Selection & Setup */}
          <div className="lg:col-span-2 space-y-4">
            {/* Streaming Mode */}
            <Card className="p-5">
              <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Settings className="h-4 w-4 text-purple-400" />
                Streaming Režim
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  {
                    id: 'affiliate',
                    label: 'Affiliate',
                    split: '70/30',
                    icon: TrendingUp,
                    color: 'from-blue-500 to-cyan-500',
                    desc: 'PROUDY + všechny platformy',
                    detail: 'Ideální pro začínající streamery. Streamuješ primárně na PROUDY.TV a my automaticky redistribuujeme na Twitch, YouTube, Kick.',
                  },
                  {
                    id: 'partner',
                    label: 'Partner',
                    split: '75/25',
                    icon: Shield,
                    color: 'from-purple-500 to-pink-500',
                    desc: 'PROUDY + Kick + YouTube',
                    detail: 'Pro Twitch Partnery. Respektuje Twitch exclusivity TOS — redistribujeme jen na Kick a YouTube, ne na Twitch.',
                  },
                  {
                    id: 'exclusive',
                    label: 'PROUDY Exclusive',
                    split: '85/15',
                    icon: Crown,
                    color: 'from-orange-500 to-red-500',
                    desc: 'Pouze PROUDY.TV',
                    detail: 'Nejlepší revenue split. Streamuješ exkluzivně na PROUDY.TV a získáváš 85 % příjmů.',
                  },
                ].map(mode => {
                  const Icon = mode.icon;
                  const isActive = currentMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => updateModeMutation.mutate({ mode: mode.id as any })}
                      className={cn(
                        'p-4 rounded-lg border text-left transition-all',
                        isActive
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-border hover:border-border/80 hover:bg-muted/30'
                      )}
                    >
                      <div className={`inline-flex p-2 rounded-md bg-gradient-to-br ${mode.color} mb-2`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="font-semibold text-sm">{mode.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{mode.desc}</div>
                      <div className="mt-2 text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        {mode.split}
                      </div>
                      <div className="text-[10px] text-muted-foreground">revenue split</div>
                      {isActive && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                          <CheckCircle2 className="h-3 w-3" /> Aktivní
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 p-3 rounded-md bg-muted/30 text-xs text-muted-foreground">
                {currentMode === 'affiliate' && '🔄 Affiliate: OBS → PROUDY.TV → automatická redistribuce na Twitch, YouTube, Kick. Twitch Affiliates mohou streamovat simultánně od roku 2023.'}
                {currentMode === 'partner' && '🛡️ Partner: OBS → PROUDY.TV → redistribuce na Kick + YouTube. Twitch je automaticky blokován pro Twitch Partnery (respektujeme jejich TOS).'}
                {currentMode === 'exclusive' && '👑 Exclusive: OBS → PROUDY.TV pouze. Žádná redistribuce, maximální revenue split 85/15.'}
              </div>
            </Card>

            {/* Platform Connections */}
            <Card className="p-5">
              <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-400" />
                Připojené platformy
              </h2>
              <div className="space-y-3">
                {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG[Platform]][]).map(([platform, cfg]) => {
                  const connection = connections?.find(c => c.platform === platform);
                  const isConnected = !!connection;
                  const isBlocked = currentMode === 'partner' && platform === 'twitch' && connection?.isTwitchPartner;
                  const isExclusive = currentMode === 'exclusive';
                  const Icon = cfg.icon;

                  return (
                    <div
                      key={platform}
                      className={cn(
                        'p-3 rounded-lg border transition-all',
                        isConnected ? cfg.bgClass : 'border-border bg-muted/10',
                        (isBlocked || isExclusive) && 'opacity-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded-md"
                            style={{ backgroundColor: cfg.color + '22' }}
                          >
                            <Icon className="h-4 w-4" style={{ color: cfg.color }} />
                          </div>
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">
                              {cfg.name}
                              {isConnected && !isBlocked && !isExclusive && (
                                <span className="flex items-center gap-1 text-xs text-green-400">
                                  <Wifi className="h-3 w-3" /> Připojeno
                                </span>
                              )}
                              {isBlocked && (
                                <span className="flex items-center gap-1 text-xs text-yellow-400">
                                  <AlertTriangle className="h-3 w-3" /> Blokováno (Partner TOS)
                                </span>
                              )}
                              {isExclusive && (
                                <span className="text-xs text-muted-foreground">(Exclusive mode)</span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">{cfg.note}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isConnected && !isExclusive && (
                            <Switch
                              checked={connection.enabled && !isBlocked}
                              disabled={isBlocked}
                              onCheckedChange={(enabled) =>
                                toggleConnectionMutation.mutate({ id: connection.id, enabled })
                              }
                            />
                          )}
                          {!isConnected ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowAddForm(platform)}
                              className="text-xs h-7"
                              style={{ borderColor: cfg.color + '66', color: cfg.color }}
                            >
                              + Připojit
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteConnectionMutation.mutate({ id: connection.id })}
                              className="text-xs h-7 text-red-400 hover:text-red-300"
                            >
                              Odpojit
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Add form */}
                      {showAddForm === platform && (
                        <div className="mt-3 pt-3 border-t border-border space-y-2">
                          <div>
                            <Label className="text-xs">Stream Key z {cfg.name}</Label>
                            <Input
                              type="password"
                              value={newStreamKey}
                              onChange={e => setNewStreamKey(e.target.value)}
                              placeholder={`Vložte ${cfg.name} stream key...`}
                              className="mt-1 h-8 text-sm"
                            />
                          </div>
                          {platform === 'twitch' && (
                            <div className="flex items-center gap-2">
                              <Switch
                                id="twitch-partner"
                                checked={isTwitchPartner}
                                onCheckedChange={setIsTwitchPartner}
                              />
                              <Label htmlFor="twitch-partner" className="text-xs text-yellow-400">
                                Jsem Twitch Partner (blokuje simultánní streaming)
                              </Label>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddConnection(platform)}
                              disabled={addConnectionMutation.isPending}
                              className="h-7 text-xs"
                              style={{ backgroundColor: cfg.color, color: '#000' }}
                            >
                              Připojit {cfg.name}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setShowAddForm(null); setNewStreamKey(''); }}
                              className="h-7 text-xs"
                            >
                              Zrušit
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right: OBS Setup & Info */}
          <div className="space-y-4">
            {/* OBS Setup */}
            <Card className="p-5">
              <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                <Radio className="h-4 w-4 text-purple-400" />
                OBS Nastavení
              </h2>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">RTMP URL (primární)</Label>
                  <div className="flex gap-1 mt-1">
                    <Input
                      value="rtmp://proudy.tv/live"
                      readOnly
                      className="h-8 text-xs bg-muted/30 font-mono"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2"
                      onClick={() => {
                        navigator.clipboard.writeText('rtmp://proudy.tv/live');
                        toast.success('Zkopírováno!');
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs space-y-1">
                  <p className="font-semibold text-purple-300">Jak to funguje:</p>
                  <p className="text-muted-foreground">1. V OBS nastav RTMP URL na PROUDY.TV</p>
                  <p className="text-muted-foreground">2. Zadej svůj stream key</p>
                  <p className="text-muted-foreground">3. Spusť stream — my ho automaticky redistribuujeme</p>
                  <p className="text-muted-foreground">4. Diváci ze všech platforem vidí tvůj stream</p>
                </div>
                <Link href="/dashboard/stream">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    <Settings className="h-3.5 w-3.5 mr-1" />
                    Stream nastavení
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Split Chat Info */}
            <Card className="p-5">
              <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-400" />
                Split Chat
              </h2>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Zprávy ze všech platforem se zobrazují v jednom unified chatu na tvém stream stránce.</p>
                <div className="space-y-1 mt-2">
                  {[
                    { platform: 'PROUDY.TV', color: '#7c3aed', icon: '🌊', status: 'Nativní' },
                    { platform: 'Twitch', color: '#9146ff', icon: '🟣', status: 'IRC bridge' },
                    { platform: 'YouTube', color: '#ff0000', icon: '🔴', status: 'Live API' },
                    { platform: 'Kick', color: '#53fc18', icon: '🟢', status: 'WebSocket' },
                  ].map(p => (
                    <div key={p.platform} className="flex items-center justify-between">
                      <span style={{ color: p.color }}>{p.icon} {p.platform}</span>
                      <Badge variant="outline" className="text-[10px] h-4">{p.status}</Badge>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-2 text-muted-foreground/70">
                  * Twitch/YouTube/Kick chat bridge vyžaduje OAuth token dané platformy
                </p>
              </div>
            </Card>

            {/* Revenue Summary */}
            <Card className="p-5">
              <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                Revenue Split
              </h2>
              <div className="space-y-2">
                {[
                  { mode: 'affiliate', split: 70, label: 'Affiliate', color: 'bg-blue-500' },
                  { mode: 'partner', split: 75, label: 'Partner', color: 'bg-purple-500' },
                  { mode: 'exclusive', split: 85, label: 'Exclusive', color: 'bg-orange-500' },
                ].map(item => (
                  <div key={item.mode}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className={currentMode === item.mode ? 'text-foreground font-semibold' : 'text-muted-foreground'}>
                        {item.label}
                      </span>
                      <span className={currentMode === item.mode ? 'text-green-400 font-bold' : 'text-muted-foreground'}>
                        {item.split}% tvoje
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', item.color)}
                        style={{ width: `${item.split}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground mt-2">
                  Srovnání: Twitch 50%, YouTube 70%, Kick 95% (ale menší audience)
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
