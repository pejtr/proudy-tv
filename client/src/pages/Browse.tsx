import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Eye, Radio } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import LiveThumbnail from "@/components/LiveThumbnail";
import { useState } from "react";

export default function Browse() {
  const { user, isAuthenticated } = useAuth();
  const { data: liveStreams, isLoading } = trpc.streams.getLive.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Chill & Talk" | "Gaming" | "Music" | "ASMR">("All");

  // Filter streams by category
  const filteredStreams = liveStreams?.filter(stream => 
    selectedCategory === "All" || stream.category === selectedCategory
  ) || [];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img src="/proudy-logo.png" alt="PROUDY" className="h-10 w-auto" />
              <div className="text-2xl gradient-text-animated font-bold">PROUDY.TV</div>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/browse">
              <Button variant="ghost" className="text-primary">
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
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Streams</h1>
          <p className="text-muted-foreground">
            {liveStreams?.length || 0} streamers are live right now
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            onClick={() => setSelectedCategory("All")}
            className={selectedCategory === "All" ? "rainbow-gradient text-black font-bold" : ""}
          >
            All
          </Button>
          <Button
            variant={selectedCategory === "Chill & Talk" ? "default" : "outline"}
            onClick={() => setSelectedCategory("Chill & Talk")}
            className={selectedCategory === "Chill & Talk" ? "rainbow-gradient text-black font-bold" : ""}
          >
            💬 Chill & Talk
          </Button>
          <Button
            variant={selectedCategory === "Gaming" ? "default" : "outline"}
            onClick={() => setSelectedCategory("Gaming")}
            className={selectedCategory === "Gaming" ? "rainbow-gradient text-black font-bold" : ""}
          >
            🎮 Gaming
          </Button>
          <Button
            variant={selectedCategory === "Music" ? "default" : "outline"}
            onClick={() => setSelectedCategory("Music")}
            className={selectedCategory === "Music" ? "rainbow-gradient text-black font-bold" : ""}
          >
            🎵 Music
          </Button>
          <Button
            variant={selectedCategory === "ASMR" ? "default" : "outline"}
            onClick={() => setSelectedCategory("ASMR")}
            className={selectedCategory === "ASMR" ? "rainbow-gradient text-black font-bold" : ""}
          >
            🎧 ASMR
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredStreams && filteredStreams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStreams.map((stream) => (
              <Link key={stream.id} href={`/stream/${stream.id}`}>
                <Card className="rainbow-border hover:scale-105 transition-transform cursor-pointer overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    <LiveThumbnail
                      hlsUrl={stream.hlsUrl || undefined}
                      thumbnailUrl={stream.thumbnailUrl || undefined}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Live Badge */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse-live">
                        <span className="w-2 h-2 bg-white rounded-full"></span>
                        LIVE
                      </div>
                      {stream.streamKey?.startsWith('demo-') && (
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          🎬 Demo Stream
                        </div>
                      )}
                    </div>

                    {/* Viewer Count */}
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {stream.viewerCount}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">{stream.streamerName}</span>
                      <VerifiedBadge verified={stream.emailVerified || false} size="sm" showTooltip={false} />
                    </div>
                    <h3 className="font-bold text-lg mb-1 truncate">{stream.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                        {stream.category === "Chill & Talk" && "💬"}
                        {stream.category === "Gaming" && "🎮"}
                        {stream.category === "Music" && "🎵"}
                        {stream.category === "ASMR" && "🎧"}
                        {" "}{stream.category}
                      </span>
                    </div>
                    {stream.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {stream.description}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Radio className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No live streams right now</h2>
            <p className="text-muted-foreground mb-6">
              Be the first to go live!
            </p>
            {!isAuthenticated && (
              <a href={getLoginUrl()}>
                <Button size="lg" className="rainbow-gradient text-black font-bold">
                  Start Streaming
                </Button>
              </a>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
