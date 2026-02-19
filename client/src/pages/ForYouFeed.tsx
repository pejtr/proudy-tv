import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Heart, Share2, X, Play, Eye, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function ForYouFeed() {
  const { user, isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const [allItems, setAllItems] = useState<any[]>([]);
  const observerRef = useRef<HTMLDivElement>(null);
  
  const { data: feedItems, isLoading, refetch } = trpc.feed.getForYou.useQuery(
    { limit: 10, offset: page * 10 },
    { enabled: isAuthenticated }
  );
  
  const likeMutation = trpc.feed.like.useMutation({
    onSuccess: () => {
      toast.success("Liked!");
      refetch();
    },
  });
  
  const notInterestedMutation = trpc.feed.notInterested.useMutation({
    onSuccess: () => {
      toast.success("We'll show you less of this");
      refetch();
    },
  });
  
  const recordViewMutation = trpc.feed.recordView.useMutation();
  
  useEffect(() => {
    if (feedItems) {
      setAllItems(prev => {
        const newItems = feedItems.filter(
          item => !prev.some(p => p.id === item.id)
        );
        return [...prev, ...newItems];
      });
    }
  }, [feedItems]);
  
  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.5 }
    );
    
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    
    return () => observer.disconnect();
  }, [isLoading]);
  
  const handleLike = (itemId: number) => {
    likeMutation.mutate({ feedItemId: itemId });
  };
  
  const handleNotInterested = (itemId: number) => {
    notInterestedMutation.mutate({ feedItemId: itemId });
    setAllItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  const handleView = (itemId: number) => {
    recordViewMutation.mutate({ feedItemId: itemId });
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to see your personalized feed</h2>
          <a href={getLoginUrl()}>
            <Button className="rainbow-gradient text-black">Sign In</Button>
          </a>
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
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link href="/feed">
              <Button variant="ghost" className="text-primary">For You</Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost">Messages</Button>
            </Link>
            <Link href={`/profile/${user?.id}`}>
              <Button variant="ghost">Profile</Button>
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Feed Content */}
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold gradient-text-animated">For You</h1>
          <p className="text-muted-foreground mt-2">
            Personalized content based on your interests
          </p>
        </div>
        
        {allItems.length > 0 ? (
          <div className="space-y-6">
            {allItems.map((item) => (
              <Card key={item.id} className="rainbow-border overflow-hidden">
                {/* Video/Image */}
                <div className="relative aspect-video bg-muted">
                  {item.mediaUrl && (
                    <video
                      src={item.mediaUrl}
                      poster={item.thumbnailUrl}
                      controls
                      className="w-full h-full object-cover"
                      onPlay={() => handleView(item.id)}
                    />
                  )}
                  
                  <div className="absolute top-4 right-4">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-black/50 hover:bg-black/70"
                      onClick={() => handleNotInterested(item.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Content Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {item.viewCount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      {item.likeCount.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {item.commentCount.toLocaleString()}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLike(item.id)}
                      disabled={likeMutation.isPending}
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    {item.streamId && (
                      <Link href={`/stream/${item.streamId}`}>
                        <Button variant="outline" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          Watch Stream
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Loading indicator */}
            <div ref={observerRef} className="py-8 text-center">
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              ) : (
                <p className="text-muted-foreground">Loading more...</p>
              )}
            </div>
          </div>
        ) : (
          <Card className="rainbow-border p-12 text-center">
            <Play className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">No content yet</h3>
            <p className="text-muted-foreground mb-4">
              Follow some streamers to see personalized content here!
            </p>
            <Link href="/browse">
              <Button className="rainbow-gradient text-black">
                Browse Streamers
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
