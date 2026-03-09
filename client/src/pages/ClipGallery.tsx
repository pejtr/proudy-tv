import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Scissors, Play, Heart, Share2, Eye, Search, Filter, Clock, TrendingUp, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Demo clips data for display
const DEMO_CLIPS = [
  {
    id: 1, title: "Neuvěřitelný 1v5 clutch!", streamer: "Karolína", category: "Gaming",
    views: 15420, likes: 892, duration: 45, thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop",
    createdAt: "před 2 hodinami", tags: ["clutch", "gaming", "cs2"],
  },
  {
    id: 2, title: "ASMR relaxační zvuky - nejlepší moment", streamer: "Tereza", category: "ASMR",
    views: 8930, likes: 654, duration: 30, thumbnailUrl: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400&h=225&fit=crop",
    createdAt: "před 5 hodinami", tags: ["asmr", "relaxace", "zvuky"],
  },
  {
    id: 3, title: "Epický fail při speedrunu 😂", streamer: "Natálie", category: "Gaming",
    views: 23100, likes: 1203, duration: 15, thumbnailUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=225&fit=crop",
    createdAt: "před 1 dnem", tags: ["fail", "speedrun", "funny"],
  },
  {
    id: 4, title: "Krásná improvizace na kytaře", streamer: "Petra", category: "Music",
    views: 5670, likes: 445, duration: 58, thumbnailUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=225&fit=crop",
    createdAt: "před 2 dny", tags: ["kytara", "hudba", "improvizace"],
  },
  {
    id: 5, title: "Chatování o životě - nejlepší odpověď", streamer: "Markéta", category: "Chill & Talk",
    views: 3210, likes: 287, duration: 22, thumbnailUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=225&fit=crop",
    createdAt: "před 3 dny", tags: ["chat", "talk", "komunita"],
  },
  {
    id: 6, title: "Minecraft stavba - timelapse", streamer: "Lucie", category: "Gaming",
    views: 11200, likes: 789, duration: 60, thumbnailUrl: "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=400&h=225&fit=crop",
    createdAt: "před 4 dny", tags: ["minecraft", "stavba", "timelapse"],
  },
  {
    id: 7, title: "Ranní rutina a povídání", streamer: "Veronika", category: "Chill & Talk",
    views: 2890, likes: 198, duration: 35, thumbnailUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=225&fit=crop",
    createdAt: "před 5 dny", tags: ["ranní", "rutina", "talk"],
  },
  {
    id: 8, title: "Lofi beat drop - komunita šílí!", streamer: "Simona", category: "Music",
    views: 7340, likes: 512, duration: 18, thumbnailUrl: "https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=400&h=225&fit=crop",
    createdAt: "před 1 týdnem", tags: ["lofi", "hudba", "beat"],
  },
];

const CATEGORIES = ["Vše", "Gaming", "ASMR", "Music", "Chill & Talk"];
const SORT_OPTIONS = [
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "newest", label: "Nejnovější", icon: Clock },
  { value: "top", label: "Nejlepší", icon: Star },
  { value: "views", label: "Nejvíce zhlédnutí", icon: Eye },
];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function ClipCard({ clip }: { clip: typeof DEMO_CLIPS[0] }) {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(clip.likes);

  function handleShare() {
    const url = `${window.location.origin}/clips/${clip.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast({ title: "Odkaz zkopírován!", description: "Odkaz na klip byl zkopírován do schránky." });
    });
  }

  function handleLike() {
    setLiked(!liked);
    setLocalLikes(l => liked ? l - 1 : l + 1);
  }

  return (
    <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden group hover:border-purple-500/50 transition-all duration-300">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        <img
          src={clip.thumbnailUrl}
          alt={clip.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded font-mono">
          {formatDuration(clip.duration)}
        </div>
        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <Badge className="bg-purple-600/90 text-white text-xs">{clip.category}</Badge>
        </div>
      </div>

      <CardContent className="p-3">
        <h3 className="text-white font-semibold text-sm line-clamp-2 mb-1 group-hover:text-purple-300 transition-colors">
          {clip.title}
        </h3>
        <p className="text-zinc-400 text-xs mb-2">
          <span className="text-purple-400">{clip.streamer}</span> · {clip.createdAt}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {clip.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Stats + Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-zinc-400 text-xs">
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {clip.views.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs ${liked ? "text-pink-400" : "text-zinc-400"} hover:text-pink-400`}
              onClick={handleLike}
            >
              <Heart className={`w-3 h-3 mr-1 ${liked ? "fill-pink-400" : ""}`} />
              {localLikes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-zinc-400 hover:text-blue-400"
              onClick={handleShare}
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ClipGallery() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Vše");
  const [sortBy, setSortBy] = useState("trending");

  const filtered = useMemo(() => {
    let clips = [...DEMO_CLIPS];

    if (search.trim()) {
      const q = search.toLowerCase();
      clips = clips.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.streamer.toLowerCase().includes(q) ||
        c.tags.some(t => t.includes(q))
      );
    }

    if (category !== "Vše") {
      clips = clips.filter(c => c.category === category);
    }

    switch (sortBy) {
      case "newest": return clips.sort((a, b) => a.id - b.id);
      case "top": return clips.sort((a, b) => b.likes - a.likes);
      case "views": return clips.sort((a, b) => b.views - a.views);
      default: return clips.sort((a, b) => (b.views * 0.6 + b.likes * 0.4) - (a.views * 0.6 + a.likes * 0.4));
    }
  }, [search, category, sortBy]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/browse">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                ← Browse
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Scissors className="w-5 h-5 text-purple-400" />
                Klipy
              </h1>
              <p className="text-zinc-400 text-sm">Nejlepší momenty z českých streamů</p>
            </div>
          </div>
          <Badge className="bg-zinc-800 text-zinc-300">
            {filtered.length} klipů
          </Badge>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Hledat klipy, streamery, tagy..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className={category === cat
                  ? "bg-purple-600 hover:bg-purple-700 text-white border-0"
                  : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-44 bg-zinc-800 border-zinc-700 text-white">
              <Filter className="w-4 h-4 mr-2 text-zinc-400" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700">
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-zinc-700">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clips Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Scissors className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <p className="text-zinc-400 text-lg">Žádné klipy nenalezeny</p>
            <p className="text-zinc-500 text-sm mt-1">Zkuste jiný filtr nebo vyhledávání</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(clip => (
              <ClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
