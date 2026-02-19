import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Radio, Settings, Eye, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PartnerProgress from "@/components/PartnerProgress";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [copiedKey, setCopiedKey] = useState(false);

  // Redirect if not authenticated or not a streamer
  if (!isAuthenticated || (user?.role !== 'streamer' && user?.role !== 'admin')) {
    if (typeof window !== 'undefined') {
      window.location.href = getLoginUrl();
    }
    return null;
  }

  const { data: myStreams, refetch: refetchStreams } = trpc.streams.getMyStreams.useQuery();
  const { data: settings } = trpc.settings.get.useQuery();
  const createStreamMutation = trpc.streams.create.useMutation({
    onSuccess: () => {
      toast.success("Stream created!");
      refetchStreams();
    },
  });

  const updateSettingsMutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      toast.success("Settings saved!");
    },
  });

  const [newStreamTitle, setNewStreamTitle] = useState("");
  const [newStreamDesc, setNewStreamDesc] = useState("");

  const handleCreateStream = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamTitle.trim()) {
      toast.error("Please enter a stream title");
      return;
    }

    createStreamMutation.mutate({
      title: newStreamTitle,
      description: newStreamDesc || undefined,
    });

    setNewStreamTitle("");
    setNewStreamDesc("");
  };

  const copyStreamKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    toast.success("Stream key copied!");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-2xl rainbow-text font-bold">PROUDY</div>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/browse">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Browse
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-primary">
                Dashboard
              </Button>
            </Link>
            <span className="text-sm text-muted-foreground">{user?.name}</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Streamer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your streams and settings
          </p>
        </div>

        <Tabs defaultValue="streams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="streams">My Streams</TabsTrigger>
            <TabsTrigger value="partner">Partner Program</TabsTrigger>
            <TabsTrigger value="settings">Stream Settings</TabsTrigger>
          </TabsList>

          {/* Streams Tab */}
          <TabsContent value="streams" className="space-y-6">
            {/* Email Verification Banner */}
            {!user?.emailVerified && (
              <EmailVerificationBanner email={user?.email || null} />
            )}

            {/* Create New Stream */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Create New Stream</h2>
              <form onSubmit={handleCreateStream} className="space-y-4">
                <div>
                  <Label htmlFor="title">Stream Title</Label>
                  <Input
                    id="title"
                    value={newStreamTitle}
                    onChange={(e) => setNewStreamTitle(e.target.value)}
                    placeholder="Enter stream title..."
                    maxLength={255}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={newStreamDesc}
                    onChange={(e) => setNewStreamDesc(e.target.value)}
                    placeholder="Describe your stream..."
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createStreamMutation.isPending || !user?.emailVerified}
                  className="rainbow-gradient text-black font-bold"
                  title={!user?.emailVerified ? "Ověřte email pro vytvoření streamu" : ""}
                >
                  <Radio className="mr-2 h-4 w-4" />
                  {!user?.emailVerified ? "Ověřte email pro streamování" : "Create Stream"}
                </Button>
              </form>
            </Card>

            {/* Existing Streams */}
            <div>
              <h2 className="text-xl font-bold mb-4">Your Streams</h2>
              <div className="grid gap-4">
                {myStreams && myStreams.length > 0 ? (
                  myStreams.map((stream) => (
                    <Card key={stream.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold">{stream.title}</h3>
                            {stream.isLive && (
                              <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse-live">
                                LIVE
                              </span>
                            )}
                          </div>
                          
                          {stream.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {stream.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {stream.viewerCount} viewers
                            </div>
                            <div>
                              Peak: {stream.peakViewerCount}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Stream Key</Label>
                            <div className="flex gap-2">
                              <Input
                                value={stream.streamKey}
                                readOnly
                                type="password"
                                className="font-mono text-sm"
                              />
                              <Button
                                size="icon"
                                variant="outline"
                                onClick={() => copyStreamKey(stream.streamKey)}
                              >
                                {copiedKey ? (
                                  <Check className="h-4 w-4" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Use this key in your streaming software (OBS, Streamlabs, etc.)
                            </p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => navigate(`/stream/${stream.id}`)}
                        >
                          View Stream
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <Card className="p-12 text-center">
                    <Radio className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      You haven't created any streams yet. Create one above!
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Partner Program Tab */}
          <TabsContent value="partner" className="space-y-6">
            <PartnerProgress />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Stream Effects & Layout
              </h2>

              <div className="space-y-6">
                {/* AR Filters */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="ar-filter">AR Face Filters</Label>
                      <p className="text-sm text-muted-foreground">
                        Snapchat-style face filters
                      </p>
                    </div>
                    <Switch
                      id="ar-filter"
                      checked={settings?.arFilterEnabled || false}
                      onCheckedChange={(checked) => {
                        updateSettingsMutation.mutate({ arFilterEnabled: checked });
                      }}
                    />
                  </div>

                  {settings?.arFilterEnabled && (
                    <Select
                      value={settings.arFilterType || "none"}
                      onValueChange={(value) => {
                        updateSettingsMutation.mutate({ arFilterType: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="dog">Dog Ears</SelectItem>
                        <SelectItem value="cat">Cat Ears</SelectItem>
                        <SelectItem value="glasses">Glasses</SelectItem>
                        <SelectItem value="rainbow">Rainbow</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Voice Changer */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="voice-changer">Voice Changer</Label>
                      <p className="text-sm text-muted-foreground">
                        Real-time voice effects
                      </p>
                    </div>
                    <Switch
                      id="voice-changer"
                      checked={settings?.voiceChangerEnabled || false}
                      onCheckedChange={(checked) => {
                        updateSettingsMutation.mutate({ voiceChangerEnabled: checked });
                      }}
                    />
                  </div>

                  {settings?.voiceChangerEnabled && (
                    <Select
                      value={settings.voiceChangerPreset || "normal"}
                      onValueChange={(value) => {
                        updateSettingsMutation.mutate({ voiceChangerPreset: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="deep">Deep Voice</SelectItem>
                        <SelectItem value="chipmunk">Chipmunk</SelectItem>
                        <SelectItem value="robot">Robot</SelectItem>
                        <SelectItem value="echo">Echo</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* 3D Avatar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="avatar">3D Avatar (VTuber)</Label>
                      <p className="text-sm text-muted-foreground">
                        Use 3D avatar instead of camera
                      </p>
                    </div>
                    <Switch
                      id="avatar"
                      checked={settings?.avatarEnabled || false}
                      onCheckedChange={(checked) => {
                        updateSettingsMutation.mutate({ avatarEnabled: checked });
                      }}
                    />
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-3">
                  <Label>Background</Label>
                  <Select
                    value={settings?.backgroundType || "none"}
                    onValueChange={(value: any) => {
                      updateSettingsMutation.mutate({ backgroundType: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select background" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="greenscreen">Green Screen</SelectItem>
                      <SelectItem value="image">Custom Image</SelectItem>
                      <SelectItem value="video">Custom Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* PIP Layout */}
                <div className="space-y-3">
                  <Label>PIP Camera Layout</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Shape</Label>
                      <Select
                        value={settings?.pipLayout || "rectangular"}
                        onValueChange={(value: any) => {
                          updateSettingsMutation.mutate({ pipLayout: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rectangular">Rectangular</SelectItem>
                          <SelectItem value="circular">Circular</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Size</Label>
                      <Select
                        value={settings?.pipSize || "medium"}
                        onValueChange={(value: any) => {
                          updateSettingsMutation.mutate({ pipSize: value });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Position</Label>
                    <Select
                      value={settings?.pipPosition || "bottom-right"}
                      onValueChange={(value: any) => {
                        updateSettingsMutation.mutate({ pipPosition: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top-left">Top Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="bottom-right">Bottom Right</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
