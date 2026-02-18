import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { Eye, Send, AlertCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

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
            <Card className="rainbow-border overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {stream.isLive ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl rainbow-text font-bold mb-4">LIVE</div>
                      <p className="text-muted-foreground">
                        Video player will be implemented with HLS/DASH support
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-xl font-bold mb-2">Stream Offline</p>
                      <p className="text-muted-foreground">This stream is not currently live</p>
                    </div>
                  </div>
                )}

                {stream.isLive && (
                  <>
                    <div className="absolute top-4 left-4 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse-live">
                      <span className="w-3 h-3 bg-white rounded-full"></span>
                      LIVE
                    </div>

                    <div className="absolute top-4 right-4 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {viewerCount || 0}
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Stream Info */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{stream.title}</h1>
              {stream.description && (
                <p className="text-muted-foreground">{stream.description}</p>
              )}
              
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
          <Card className="rainbow-border flex flex-col h-[calc(100vh-200px)]">
            <div className="border-b border-border p-4">
              <h2 className="font-bold text-lg">Live Chat</h2>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {chatHistory && chatHistory.length > 0 ? (
                  chatHistory.map((msg) => (
                    <div key={msg.id} className="text-sm">
                      <span className="font-bold text-primary">{msg.username}:</span>{" "}
                      <span className="text-foreground">{msg.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Be the first to chat!
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <div className="border-t border-border p-4">
              {isAuthenticated ? (
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Send a message..."
                    maxLength={500}
                    className="flex-1"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!message.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Sign in to chat
                  </p>
                  <a href={getLoginUrl()}>
                    <Button size="sm" className="w-full">
                      Sign In
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
