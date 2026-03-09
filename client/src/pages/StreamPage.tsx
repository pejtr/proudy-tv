import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import VideoPlayer from '@/components/VideoPlayer';
import Chat from '@/components/Chat';
import GoalWidget from '@/components/GoalWidget';
import { Eye, Send, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import SEO from "@/components/SEO";
import { VideoStructuredData, BreadcrumbStructuredData } from "@/components/StructuredData";
import ShareButtons from "@/components/ShareButtons";
import { ProudyAlerts } from "@/components/ProudyAlerts";

export default function StreamPage() {
  const { id } = useParams();
  const streamId = parseInt(id || "0");
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: stream, isLoading: streamLoading } = trpc.streams.getById.useQuery({ id: streamId });
  const { data: chatHistory } = trpc.chat.getHistory.useQuery({ streamId, limit: 100 });
  const { data: viewerCount } = trpc.viewers.getCount.useQuery({ streamId });

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: (data) => {
      if (data.isModerated) {
        toast.error(`Message blocked: ${data.moderationReason}`);
      }
      setMessage("");
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  const joinStreamMutation = trpc.viewers.join.useMutation();
  const leaveStreamMutation = trpc.viewers.leave.useMutation();

  useEffect(() => {
    if (streamId) {
      joinStreamMutation.mutate({ streamId, sessionId });
    }

    return () => {
      leaveStreamMutation.mutate({ sessionId });
    };
  }, [streamId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!isAuthenticated) {
      toast.error("Please sign in to chat");
      return;
    }

    sendMessageMutation.mutate({
      streamId,
      message: message.trim(),
    });
  };

  if (streamLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading stream...</p>
        </div>
      </div>
    );
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Stream not found</h2>
          <Link href="/browse">
            <Button>Browse Streams</Button>
          </Link>
        </div>
      </div>
    );
  }

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://proudy.tv";
  const streamUrl = `/stream/${streamId}`;

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title={`${stream.title} - ${stream.streamerName || "Unknown"} | PROUDY.TV`}
        description={stream.description || `Watch ${stream.streamerName || "this streamer"} live on PROUDY.TV. ${stream.category} stream with ${stream.viewerCount} viewers.`}
        image={`${siteUrl}/api/og-image/${streamId}`}
        url={streamUrl}
        type="video.other"
        video={{
          url: stream.hlsUrl || `${siteUrl}${streamUrl}`,
          width: 1920,
          height: 1080,
          type: "application/x-mpegURL",
        }}
      />

      {/* Structured Data */}
      <VideoStructuredData
        name={stream.title}
        description={stream.description || `Live stream by ${stream.streamerName || "Unknown"}`}
        thumbnailUrl={stream.thumbnailUrl || `${siteUrl}/default-thumbnail.png`}
        uploadDate={stream.startedAt?.toISOString() || new Date().toISOString()}
        contentUrl={stream.hlsUrl || undefined}
        embedUrl={`${siteUrl}${streamUrl}`}
      />

      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Browse", url: `${siteUrl}/browse` },
          { name: stream.title, url: `${siteUrl}${streamUrl}` },
        ]}
      />

      {/* PROUDY Alerts */}
      <ProudyAlerts enabled={alertsEnabled} testMode={false} />

      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="border-b border-border sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-2xl rainbow-text font-bold">PROUDY.TV</div>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/browse">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Browse
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <>
                {(user?.role === 'streamer' || user?.role === 'admin') && (
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-foreground hover:text-primary">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">{user?.name}</span>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default" className="bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Video Player */}
          <div className="space-y-4">
            {/* Video Player with Goal Widget Overlay */}
            <div className="relative">
              <VideoPlayer
                src={stream.hlsUrl || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'}
                poster={stream.thumbnailUrl || undefined}
                autoPlay={stream.isLive}
                className="rainbow-border"
              />
              
              {/* Sticky Goal Widget */}
              <div className="absolute top-4 right-4 w-80 z-10">
                <GoalWidget streamerId={stream.streamerId} />
              </div>
            </div>

            {/* Stream Info Card removed - already shown in VideoPlayer section */}

            {/* Stream Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{stream.title}</h1>
              {stream.description && (
                <p className="text-muted-foreground mb-4">{stream.description}</p>
              )}
              
              {/* Share Buttons */}
              <div className="mb-4">
                <ShareButtons
                  url={streamUrl}
                  title={stream.title}
                  description={stream.description || `Watch ${stream.streamerName || "this streamer"} live on PROUDY.TV`}
                />
              </div>
              
              <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {viewerCount || 0} viewers
                </div>
                {stream.startedAt && (
                  <div>
                    Started {new Date(stream.startedAt).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Chat */}
          <Chat streamId={streamId} className="h-[calc(100vh-200px)] rainbow-border" />
        </div>
      </div>

      {/* Other Live Streams Carousel */}
      <OtherLiveStreams currentStreamId={streamId} />
    </div>
    </>
  );
}

// ─── Other Live Streams Carousel ─────────────────────────────────────────────
function OtherLiveStreams({ currentStreamId }: { currentStreamId: number }) {
  const { data: liveStreams } = trpc.streams.getLive.useQuery();
  const [audioEnabled, setAudioEnabled] = useState<Record<number, boolean>>({});

  const others = liveStreams?.filter(s => s.id !== currentStreamId) ?? [];
  if (!others.length) return null;

  function toggleAudio(id: number) {
    setAudioEnabled(prev => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-6 py-6">
      <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"></span>
        Další živé streamy
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-700">
        {others.map(s => (
          <div key={s.id} className="flex-shrink-0 w-56 group">
            <div className="relative rounded-xl overflow-hidden bg-zinc-800 aspect-video mb-2">
              {s.hlsUrl ? (
                <video
                  src={s.hlsUrl}
                  autoPlay
                  muted={!audioEnabled[s.id]}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : s.thumbnailUrl ? (
                <img src={s.thumbnailUrl} alt={s.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                  <span className="text-zinc-500 text-xs">No preview</span>
                </div>
              )}
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <button
                  onClick={() => toggleAudio(s.id)}
                  className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                    audioEnabled[s.id]
                      ? 'bg-purple-600 text-white'
                      : 'bg-black/60 text-zinc-300 hover:bg-purple-600 hover:text-white'
                  }`}
                >
                  {audioEnabled[s.id] ? '🔊 Zvuk' : '🔇 Zvuk'}
                </button>
                <Link href={`/stream/${s.id}`}>
                  <button className="text-xs px-2 py-1 rounded-full bg-white/20 text-white hover:bg-white/40 transition-colors">
                    Přejít →
                  </button>
                </Link>
              </div>
              {/* LIVE badge */}
              <div className="absolute top-2 left-2">
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-bold">● LIVE</span>
              </div>
              {/* Viewer count */}
              <div className="absolute top-2 right-2">
                <span className="bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                  👁 {(s.viewerCount || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <Link href={`/stream/${s.id}`}>
              <p className="text-white text-sm font-medium line-clamp-1 hover:text-purple-300 transition-colors">{s.title}</p>
            </Link>
            <p className="text-zinc-400 text-xs">{s.streamerName || 'Streamer'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
