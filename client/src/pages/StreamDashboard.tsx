import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Copy, Eye, EyeOff, Radio, RefreshCw, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function StreamDashboard() {
  const { user } = useAuth();
  const [showStreamKey, setShowStreamKey] = useState(false);
  
  const { data: streamData, isLoading, refetch } = trpc.streams.getMyStream.useQuery(undefined, {
    enabled: !!user,
  });

  const regenerateKey = trpc.streams.regenerateStreamKey.useMutation({
    onSuccess: () => {
      toast.success("Stream key regenerated!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!streamData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Stream Found</h2>
          <p className="text-muted-foreground mb-4">
            You need to create a stream first before accessing the dashboard.
          </p>
        </Card>
      </div>
    );
  }

  const streamUrl = `rtmp://${window.location.hostname}:1935/live`;
  const streamKey = streamData.streamKey || "No stream key";

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text-animated">Stream Dashboard</h1>
          <p className="text-muted-foreground">Configure OBS and manage your live stream</p>
        </div>
        {streamData.isLive && (
          <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full animate-pulse-live">
            <span className="w-2 h-2 bg-white rounded-full"></span>
            <span className="font-bold">LIVE</span>
          </div>
        )}
      </div>

      {/* Stream Status Card */}
      <Card className="p-6 rainbow-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Video className="h-5 w-5" />
            Stream Status
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="text-lg font-bold">
              {streamData.isLive ? (
                <span className="text-red-600">● Live</span>
              ) : (
                <span className="text-muted-foreground">○ Offline</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Current Viewers</p>
            <p className="text-lg font-bold">{streamData.viewerCount || 0}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Stream Title</p>
            <p className="text-lg font-bold truncate">{streamData.title}</p>
          </div>
        </div>
      </Card>

      {/* OBS Setup Guide */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">OBS Studio Setup</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">1. Stream URL (Server)</label>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={streamUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(streamUrl, "Stream URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground flex items-center justify-between">
              2. Stream Key
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowStreamKey(!showStreamKey)}
              >
                {showStreamKey ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show
                  </>
                )}
              </Button>
            </label>
            <div className="flex gap-2 mt-1">
              <input
                type={showStreamKey ? "text" : "password"}
                value={streamKey}
                readOnly
                className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(streamKey, "Stream Key")}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to regenerate your stream key? Your old key will stop working.")) {
                    regenerateKey.mutate();
                  }
                }}
                disabled={regenerateKey.isPending}
              >
                <RefreshCw className={`h-4 w-4 ${regenerateKey.isPending ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ⚠️ Keep your stream key private! Anyone with this key can stream to your channel.
            </p>
          </div>
        </div>

        {/* Step-by-step guide */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-bold mb-2">Quick Setup Guide:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Open OBS Studio and go to <strong>Settings → Stream</strong></li>
            <li>Select <strong>Custom</strong> as Service</li>
            <li>Copy the <strong>Stream URL</strong> above and paste it into the Server field</li>
            <li>Copy your <strong>Stream Key</strong> and paste it into the Stream Key field</li>
            <li>Click <strong>OK</strong> and then <strong>Start Streaming</strong></li>
          </ol>
        </div>

        {/* Download OBS */}
        <div className="mt-4 flex items-center justify-between p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div>
            <p className="font-bold">Don't have OBS Studio?</p>
            <p className="text-sm text-muted-foreground">Download the free streaming software</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open('https://obsproject.com/download', '_blank')}
          >
            Download OBS
          </Button>
        </div>
      </Card>

      {/* Stream Settings Quick Links */}
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-4 flex-col"
            onClick={() => window.location.href = '/dashboard'}
          >
            <Video className="h-6 w-6 mb-2" />
            <span className="font-bold">Edit Stream Info</span>
            <span className="text-xs text-muted-foreground">Title, category, description</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col"
            onClick={() => window.location.href = '/dashboard/alerts'}
          >
            <Radio className="h-6 w-6 mb-2" />
            <span className="font-bold">Alert Settings</span>
            <span className="text-xs text-muted-foreground">Customize alerts & sounds</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex-col"
            onClick={() => { if (streamData?.isLive) window.location.href = `/stream/${streamData.id}`; }}
            disabled={!streamData?.isLive}
          >
            <Eye className="h-6 w-6 mb-2" />
            <span className="font-bold">View Stream</span>
            <span className="text-xs text-muted-foreground">
              {streamData?.isLive ? 'Watch your live stream' : 'Start streaming first'}
            </span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
