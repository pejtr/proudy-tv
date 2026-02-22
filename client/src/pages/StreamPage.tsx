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

export default function StreamPage() {
  const { id } = useParams();
  const streamId = parseInt(id || "0");
  const { user, isAuthenticated } = useAuth();
  const [message, setMessage] = useState("");
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
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
    </div>
    </>
  );
}
