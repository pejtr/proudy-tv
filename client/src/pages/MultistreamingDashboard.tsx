import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { 
  Check, Plus, Settings, TrendingUp, Twitch as TwitchIcon, 
  Youtube, Zap, Shield, Crown, Trash2, Power, Eye, EyeOff 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RevenueCalculator } from "@/components/RevenueCalculator";

type MultistreamMode = "affiliate" | "partner" | "exclusive";
type Platform = "twitch" | "kick" | "youtube" | "facebook";

const PLATFORM_ICONS: Record<Platform, any> = {
  twitch: TwitchIcon,
  kick: Zap,
  youtube: Youtube,
  facebook: Shield,
};

const PLATFORM_COLORS: Record<Platform, string> = {
  twitch: "text-purple-500",
  kick: "text-green-500",
  youtube: "text-red-500",
  facebook: "text-blue-500",
};

const MODE_CONFIG = {
  affiliate: {
    title: "Affiliate Mode",
    icon: TrendingUp,
    split: "70/30",
    color: "from-blue-500 to-cyan-500",
    features: [
      "Stream to PROUDY.TV + all connected platforms",
      "70% revenue split",
      "Twitch Affiliate compatible (allowed since 2023)",
      "Multi-platform reach",
    ],
  },
  partner: {
    title: "Partner Mode",
    icon: Shield,
    split: "75/25",
    color: "from-purple-500 to-pink-500",
    features: [
      "Stream ONLY to PROUDY.TV (respects Twitch Partner exclusivity)",
      "75% revenue split",
      "Redistribution to Kick + YouTube (not Twitch)",
      "Partner-friendly setup",
    ],
  },
  exclusive: {
    title: "PROUDY Exclusive",
    icon: Crown,
    split: "85/15",
    color: "from-orange-500 to-red-500",
    features: [
      "100% exclusivity on PROUDY.TV",
      "85% revenue split (best deal!)",
      "No redistribution to other platforms",
      "Priority support + custom features",
    ],
  },
};

export default function MultistreamingDashboard() {
  const { user } = useAuth();
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("twitch");
  const [platformUsername, setPlatformUsername] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [ingestUrl, setIngestUrl] = useState("");
  const [isTwitchPartner, setIsTwitchPartner] = useState(false);
  const [showStreamKey, setShowStreamKey] = useState(false);

  const { data: settings, refetch: refetchSettings } = trpc.multistreaming.getSettings.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: connections, refetch: refetchConnections } = trpc.multistreaming.getConnections.useQuery(undefined, {
    enabled: !!user,
  });

  const updateMode = trpc.multistreaming.updateMode.useMutation({
    onSuccess: () => {
      toast.success("Multistreaming mode updated!");
      refetchSettings();
    },
  });

  const addConnection = trpc.multistreaming.addConnection.useMutation({
    onSuccess: () => {
      toast.success("Platform connected!");
      refetchConnections();
      setShowAddPlatform(false);
      setPlatformUsername("");
      setStreamKey("");
      setIngestUrl("");
    },
  });

  const toggleConnection = trpc.multistreaming.toggleConnection.useMutation({
    onSuccess: () => {
      toast.success("Connection updated!");
      refetchConnections();
    },
  });

  const deleteConnection = trpc.multistreaming.deleteConnection.useMutation({
    onSuccess: () => {
      toast.success("Platform disconnected!");
      refetchConnections();
    },
  });

  const currentMode: MultistreamMode = settings?.mode || "affiliate";

  const handleAddPlatform = () => {
    if (!streamKey || !ingestUrl) {
      toast.error("Please fill in all required fields");
      return;
    }

    addConnection.mutate({
      platform: selectedPlatform,
      platformUsername: platformUsername || undefined,
      streamKey,
      ingestUrl,
      isTwitchPartner: selectedPlatform === "twitch" ? isTwitchPartner : false,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold gradient-text-animated">Multistreaming Dashboard</h1>
        <p className="text-muted-foreground">
          Stream to multiple platforms simultaneously with smart revenue optimization
        </p>
      </div>

      {/* Mode Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Select Your Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.entries(MODE_CONFIG) as [MultistreamMode, typeof MODE_CONFIG.affiliate][]).map(([mode, config]) => {
            const Icon = config.icon;
            const isActive = currentMode === mode;
            
            return (
              <button
                key={mode}
                onClick={() => updateMode.mutate({ mode })}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  isActive
                    ? "border-primary bg-primary/10 scale-105"
                    : "border-muted hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`h-8 w-8 bg-gradient-to-r ${config.color} bg-clip-text text-transparent`} />
                  {isActive && <Check className="h-5 w-5 text-primary" />}
                </div>
                <h3 className="font-bold text-lg mb-1">{config.title}</h3>
                <div className={`text-2xl font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent mb-3`}>
                  {config.split}
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {config.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Connected Platforms */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Connected Platforms
          </h2>
          <Button
            onClick={() => setShowAddPlatform(!showAddPlatform)}
            variant={showAddPlatform ? "outline" : "default"}
          >
            <Plus className="h-4 w-4 mr-2" />
            {showAddPlatform ? "Cancel" : "Add Platform"}
          </Button>
        </div>

        {/* Add Platform Form */}
        {showAddPlatform && (
          <div className="mb-6 p-4 border rounded-lg space-y-4">
            <div>
              <label className="text-sm font-medium">Platform</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(["twitch", "kick", "youtube", "facebook"] as Platform[]).map((platform) => {
                  const Icon = PLATFORM_ICONS[platform];
                  return (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`p-3 rounded-lg border-2 capitalize ${
                        selectedPlatform === platform
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`h-6 w-6 mx-auto mb-1 ${PLATFORM_COLORS[platform]}`} />
                      <span className="text-xs">{platform}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Username (optional)</label>
              <input
                type="text"
                value={platformUsername}
                onChange={(e) => setPlatformUsername(e.target.value)}
                placeholder="Your username on this platform"
                className="w-full mt-1 px-3 py-2 bg-muted rounded-md"
              />
            </div>

            <div>
              <label className="text-sm font-medium">RTMP Ingest URL</label>
              <input
                type="text"
                value={ingestUrl}
                onChange={(e) => setIngestUrl(e.target.value)}
                placeholder="rtmp://live.platform.com/app"
                className="w-full mt-1 px-3 py-2 bg-muted rounded-md font-mono text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Stream Key</label>
              <input
                type={showStreamKey ? "text" : "password"}
                value={streamKey}
                onChange={(e) => setStreamKey(e.target.value)}
                placeholder="Your stream key"
                className="w-full mt-1 px-3 py-2 bg-muted rounded-md font-mono text-sm"
              />
              <button
                onClick={() => setShowStreamKey(!showStreamKey)}
                className="text-xs text-muted-foreground hover:text-foreground mt-1"
              >
                {showStreamKey ? <><EyeOff className="h-3 w-3 inline mr-1" />Hide</> : <><Eye className="h-3 w-3 inline mr-1" />Show</>}
              </button>
            </div>

            {selectedPlatform === "twitch" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="twitchPartner"
                  checked={isTwitchPartner}
                  onChange={(e) => setIsTwitchPartner(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="twitchPartner" className="text-sm">
                  I am a Twitch Partner (will disable Twitch restreaming)
                </label>
              </div>
            )}

            <Button
              onClick={handleAddPlatform}
              disabled={addConnection.isPending}
              className="w-full"
            >
              Connect Platform
            </Button>
          </div>
        )}

        {/* Connected Platforms List */}
        <div className="space-y-3">
          {connections && connections.length > 0 ? (
            connections.map((conn) => {
              const Icon = PLATFORM_ICONS[conn.platform];
              return (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${PLATFORM_COLORS[conn.platform]}`} />
                    <div>
                      <p className="font-medium capitalize">{conn.platform}</p>
                      {conn.platformUsername && (
                        <p className="text-sm text-muted-foreground">@{conn.platformUsername}</p>
                      )}
                      {conn.isTwitchPartner && (
                        <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-0.5 rounded">
                          Partner
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleConnection.mutate({ id: conn.id, enabled: !conn.enabled })}
                    >
                      <Power className={`h-4 w-4 ${conn.enabled ? "text-green-500" : "text-muted-foreground"}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Disconnect ${conn.platform}?`)) {
                          deleteConnection.mutate({ id: conn.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No platforms connected yet</p>
              <p className="text-sm">Add your first platform to start multistreaming</p>
            </div>
          )}
        </div>
      </Card>

      {/* Revenue Calculator */}
      <RevenueCalculator />

      {/* How It Works */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
        <h2 className="text-xl font-bold mb-4">How Multistreaming Works</h2>
        <div className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="font-medium">Stream to PROUDY.TV</p>
              <p className="text-muted-foreground">Use your PROUDY.TV stream key in OBS</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="font-medium">Automatic Redistribution</p>
              <p className="text-muted-foreground">
                We automatically restream to your connected platforms based on your mode
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="font-medium">Earn More</p>
              <p className="text-muted-foreground">
                Keep {MODE_CONFIG[currentMode].split} of all revenue from PROUDY.TV
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
