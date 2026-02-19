import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";

interface Story {
  id: number;
  userId: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  duration: number;
  createdAt: Date;
  expiresAt: Date;
  viewCount: number;
  user: {
    id: number;
    name: string | null;
    avatarUrl: string | null;
  };
}

interface StoriesCarouselProps {
  onClose?: () => void;
}

export function StoriesCarousel({ onClose }: StoriesCarouselProps) {
  const { data: stories, refetch } = trpc.stories.getFollowingStories.useQuery();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const viewStoryMutation = trpc.stories.view.useMutation();
  
  const currentStory = stories?.[currentStoryIndex];
  
  useEffect(() => {
    if (!currentStory || isPaused) return;
    
    // Mark as viewed
    viewStoryMutation.mutate({ storyId: currentStory.id });
    
    const duration = currentStory.duration * 1000; // Convert to ms
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;
    
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < (stories?.length || 0) - 1) {
            setCurrentStoryIndex(prev => prev + 1);
            return 0;
          } else {
            // End of stories
            onClose?.();
            return 100;
          }
        }
        return prev + increment;
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [currentStory, currentStoryIndex, isPaused, stories?.length]);
  
  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    }
  };
  
  const handleNext = () => {
    if (stories && currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose?.();
    }
  };
  
  if (!stories || stories.length === 0) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 text-white"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>
      
      {/* Navigation */}
      {currentStoryIndex > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 z-10 text-white"
          onClick={handlePrevious}
        >
          <ChevronLeft className="w-8 h-8" />
        </Button>
      )}
      
      {currentStoryIndex < stories.length - 1 && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 z-10 text-white"
          onClick={handleNext}
        >
          <ChevronRight className="w-8 h-8" />
        </Button>
      )}
      
      {/* Story content */}
      <div 
        className="relative w-full max-w-md h-full max-h-[90vh] bg-black"
        onClick={() => setIsPaused(!isPaused)}
      >
        {/* Progress bars */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
          {stories.map((_, index) => (
            <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-white transition-all"
                style={{
                  width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>
        
        {/* User info */}
        <div className="absolute top-8 left-0 right-0 z-10 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            {currentStory?.user.avatarUrl ? (
              <img 
                src={currentStory.user.avatarUrl} 
                alt={currentStory.user.name || "User"} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Users className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-white font-semibold">{currentStory?.user.name || "Anonymous"}</p>
            <p className="text-white/70 text-sm">
              {currentStory && new Date(currentStory.createdAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        {/* Media */}
        <div className="w-full h-full flex items-center justify-center">
          {currentStory?.mediaType === 'image' ? (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video
              src={currentStory?.mediaUrl}
              autoPlay
              muted
              className="max-w-full max-h-full object-contain"
              onEnded={handleNext}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Stories preview component for horizontal scroll
export function StoriesPreview() {
  const { data: stories } = trpc.stories.getFollowingStories.useQuery();
  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  
  // Group stories by user
  const groupedStories = stories?.reduce((acc, story) => {
    const userId = story.userId;
    if (!acc[userId]) {
      acc[userId] = {
        user: story.user,
        stories: [],
      };
    }
    acc[userId].stories.push(story);
    return acc;
  }, {} as Record<number, { user: any; stories: Story[] }>);
  
  const userStories = groupedStories ? Object.values(groupedStories) : [];
  
  if (!userStories || userStories.length === 0) {
    return null;
  }
  
  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {userStories.map((userStory, index) => (
          <button
            key={userStory.user.id}
            onClick={() => setSelectedStoryIndex(index)}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="w-16 h-16 rounded-full p-0.5 rainbow-gradient">
              <div className="w-full h-full rounded-full bg-black p-0.5">
                <div className="w-full h-full rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {userStory.user.avatarUrl ? (
                    <img 
                      src={userStory.user.avatarUrl} 
                      alt={userStory.user.name || "User"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
              </div>
            </div>
            <span className="text-xs text-center max-w-[70px] truncate">
              {userStory.user.name || "Anonymous"}
            </span>
          </button>
        ))}
      </div>
      
      {selectedStoryIndex !== null && (
        <StoriesCarousel onClose={() => setSelectedStoryIndex(null)} />
      )}
    </>
  );
}
