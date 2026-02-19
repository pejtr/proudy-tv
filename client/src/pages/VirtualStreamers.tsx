import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { getLoginUrl } from '@/const';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bot,
  Plus,
  Play,
  Pause,
  Settings,
  Video,
  MessageSquare,
  Sparkles,
  Globe,
  Users,
  ArrowLeft,
  Trash2,
  Edit,
  Volume2,
  Brain,
  Mic,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';

// Virtual streamer personality presets
const PERSONALITY_PRESETS = [
  {
    id: 'friendly',
    name: 'Přátelský',
    description: 'Veselý a přátelský streamer, který rád komunikuje s diváky',
    icon: '😊',
    systemPrompt: 'Jsi přátelský český streamer. Odpovídáš vesele, používáš emoji a bavíš diváky. Mluvíš česky.',
  },
  {
    id: 'gamer',
    name: 'Gamer',
    description: 'Vášnivý hráč, který komentuje hru a reaguje na chat',
    icon: '🎮',
    systemPrompt: 'Jsi vášnivý český gamer streamer. Komentuješ hru, reaguješ na chat a používáš herní slang. Mluvíš česky.',
  },
  {
    id: 'chill',
    name: 'Chill',
    description: 'Klidný a relaxovaný streamer pro Just Chatting',
    icon: '😎',
    systemPrompt: 'Jsi klidný a relaxovaný český streamer. Povídáš si s diváky o životě, hudbě a kultuře. Mluvíš česky.',
  },
  {
    id: 'educational',
    name: 'Vzdělávací',
    description: 'Učitel/mentor, který vysvětluje a vzdělává',
    icon: '📚',
    systemPrompt: 'Jsi vzdělaný český streamer. Vysvětluješ věci jednoduše a zajímavě. Rád učíš nové věci. Mluvíš česky.',
  },
  {
    id: 'comedian',
    name: 'Komik',
    description: 'Vtipný streamer s černým humorem',
    icon: '🤣',
    systemPrompt: 'Jsi vtipný český streamer s ostrým humorem. Děláš si legraci ze všeho a bavíš diváky. Mluvíš česky.',
  },
  {
    id: 'custom',
    name: 'Vlastní',
    description: 'Nastavte si vlastní osobnost',
    icon: '✨',
    systemPrompt: '',
  },
];

interface VirtualStreamer {
  id: string;
  name: string;
  avatarUrl: string;
  personalityPreset: string;
  customPrompt: string;
  videoUrl: string;
  isLive: boolean;
  viewerCount: number;
  chatEnabled: boolean;
  ttsEnabled: boolean;
  lipSyncEnabled: boolean;
  autoResponseDelay: number; // seconds
  category: string;
}

// Mock data for demo
const MOCK_STREAMERS: VirtualStreamer[] = [
  {
    id: '1',
    name: 'PROUDY Bot',
    avatarUrl: '',
    personalityPreset: 'friendly',
    customPrompt: 'Jsi PROUDY Bot, oficiální AI streamer platformy PROUDY.TV. Jsi přátelský, vtipný a rád pomáháš.',
    videoUrl: '',
    isLive: false,
    viewerCount: 0,
    chatEnabled: true,
    ttsEnabled: true,
    lipSyncEnabled: false,
    autoResponseDelay: 3,
    category: 'Just Chatting',
  },
];

export default function VirtualStreamers() {
  const { user, isAuthenticated } = useAuth();
  const [streamers, setStreamers] = useState<VirtualStreamer[]>(MOCK_STREAMERS);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingStreamer, setEditingStreamer] = useState<VirtualStreamer | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Create form state
  const [newName, setNewName] = useState('');
  const [newPreset, setNewPreset] = useState('friendly');
  const [newCustomPrompt, setNewCustomPrompt] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newCategory, setNewCategory] = useState('Just Chatting');
  const [newAutoDelay, setNewAutoDelay] = useState(3);
  const [newChatEnabled, setNewChatEnabled] = useState(true);
  const [newTtsEnabled, setNewTtsEnabled] = useState(true);
  const [newLipSync, setNewLipSync] = useState(false);

  // Check admin access
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <Bot className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">
            Pouze administrátoři mohou spravovat AI virtuální streamery.
          </p>
          {!isAuthenticated ? (
            <a href={getLoginUrl()}>
              <Button className="rainbow-border">Přihlásit se</Button>
            </a>
          ) : (
            <Link href="/">
              <Button variant="outline">Zpět na hlavní stránku</Button>
            </Link>
          )}
        </Card>
      </div>
    );
  }

  const handleCreateStreamer = () => {
    if (!newName.trim()) {
      toast.error('Zadejte jméno streameru');
      return;
    }

    const preset = PERSONALITY_PRESETS.find(p => p.id === newPreset);
    const newStreamer: VirtualStreamer = {
      id: Date.now().toString(),
      name: newName.trim(),
      avatarUrl: '',
      personalityPreset: newPreset,
      customPrompt: newPreset === 'custom' ? newCustomPrompt : (preset?.systemPrompt || ''),
      videoUrl: newVideoUrl,
      isLive: false,
      viewerCount: 0,
      chatEnabled: newChatEnabled,
      ttsEnabled: newTtsEnabled,
      lipSyncEnabled: newLipSync,
      autoResponseDelay: newAutoDelay,
      category: newCategory,
    };

    setStreamers(prev => [...prev, newStreamer]);
    setShowCreateDialog(false);
    resetForm();
    toast.success(`AI Streamer "${newName}" vytvořen!`);
  };

  const resetForm = () => {
    setNewName('');
    setNewPreset('friendly');
    setNewCustomPrompt('');
    setNewVideoUrl('');
    setNewCategory('Just Chatting');
    setNewAutoDelay(3);
    setNewChatEnabled(true);
    setNewTtsEnabled(true);
    setNewLipSync(false);
  };

  const toggleLive = (id: string) => {
    setStreamers(prev => prev.map(s => {
      if (s.id === id) {
        const newLive = !s.isLive;
        toast.success(newLive ? `${s.name} je nyní LIVE!` : `${s.name} ukončil stream`);
        return { ...s, isLive: newLive, viewerCount: newLive ? Math.floor(Math.random() * 50) + 5 : 0 };
      }
      return s;
    }));
  };

  const deleteStreamer = (id: string) => {
    setStreamers(prev => prev.filter(s => s.id !== id));
    toast.success('AI Streamer smazán');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="text-2xl rainbow-text font-bold">PROUDY</div>
              </div>
            </Link>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-bold">AI Virtual Streamers</span>
            </div>
          </div>
          
          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{streamers.length}</p>
                <p className="text-xs text-muted-foreground">Celkem AI Streamerů</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Play className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{streamers.filter(s => s.isLive).length}</p>
                <p className="text-xs text-muted-foreground">Právě LIVE</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="h-8 w-8 text-cyan-500" />
              <div>
                <p className="text-2xl font-bold">{streamers.reduce((sum, s) => sum + s.viewerCount, 0)}</p>
                <p className="text-xs text-muted-foreground">Celkem Diváků</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{PERSONALITY_PRESETS.length}</p>
                <p className="text-xs text-muted-foreground">Osobností</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="overview" className="gap-1">
                <Users className="h-4 w-4" />
                Přehled
              </TabsTrigger>
              <TabsTrigger value="personalities" className="gap-1">
                <Brain className="h-4 w-4" />
                Osobnosti
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1">
                <Settings className="h-4 w-4" />
                Nastavení
              </TabsTrigger>
            </TabsList>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="rainbow-border gap-2">
                  <Plus className="h-4 w-4" />
                  Nový AI Streamer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Vytvořit AI Virtual Streamera
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  {/* Name */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Jméno streameru</label>
                    <Input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Např. PROUDY Bot, GameMaster CZ..."
                      maxLength={50}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kategorie</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Just Chatting', 'Gaming', 'Music', 'IRL', 'Creative', 'Education'].map(cat => (
                        <Button
                          key={cat}
                          variant={newCategory === cat ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewCategory(cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Personality */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Osobnost AI</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PERSONALITY_PRESETS.map(preset => (
                        <Button
                          key={preset.id}
                          variant={newPreset === preset.id ? 'default' : 'outline'}
                          className="h-auto py-3 flex-col gap-1"
                          onClick={() => setNewPreset(preset.id)}
                        >
                          <span className="text-2xl">{preset.icon}</span>
                          <span className="text-xs font-bold">{preset.name}</span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {PERSONALITY_PRESETS.find(p => p.id === newPreset)?.description}
                    </p>
                  </div>

                  {/* Custom prompt (if custom preset) */}
                  {newPreset === 'custom' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Vlastní system prompt</label>
                      <textarea
                        value={newCustomPrompt}
                        onChange={(e) => setNewCustomPrompt(e.target.value)}
                        placeholder="Popiš osobnost AI streameru..."
                        className="w-full h-24 rounded-md border border-border bg-background px-3 py-2 text-sm"
                        maxLength={1000}
                      />
                    </div>
                  )}

                  {/* Video URL */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Video URL (loop)</label>
                    <Input
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="https://... (MP4 video pro loopování)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Nahrajte MP4 video, které se bude přehrávat ve smyčce jako stream
                    </p>
                  </div>

                  {/* Chat Settings */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium block">Chat nastavení</label>
                    
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={newChatEnabled}
                        onChange={(e) => setNewChatEnabled(e.target.checked)}
                        className="rounded"
                      />
                      <label className="text-sm flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        AI odpovídá v chatu
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={newTtsEnabled}
                        onChange={(e) => setNewTtsEnabled(e.target.checked)}
                        className="rounded"
                      />
                      <label className="text-sm flex items-center gap-1">
                        <Volume2 className="h-4 w-4" />
                        TTS - AI mluví nahlas
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={newLipSync}
                        onChange={(e) => setNewLipSync(e.target.checked)}
                        className="rounded"
                      />
                      <label className="text-sm flex items-center gap-1">
                        <Mic className="h-4 w-4" />
                        Lip-sync (synchronizace rtů s řečí)
                      </label>
                    </div>
                  </div>

                  {/* Response delay */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Zpoždění odpovědi: {newAutoDelay}s
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={newAutoDelay}
                      onChange={(e) => setNewAutoDelay(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1s (rychlé)</span>
                      <span>15s (přirozené)</span>
                    </div>
                  </div>

                  <Button onClick={handleCreateStreamer} className="w-full rainbow-border">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Vytvořit AI Streamera
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streamers.map(streamer => (
                <Card key={streamer.id} className={`overflow-hidden ${streamer.isLive ? 'ring-2 ring-green-500' : ''}`}>
                  {/* Stream Preview */}
                  <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-cyan-900/50 flex items-center justify-center">
                    {streamer.isLive ? (
                      <>
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">
                          LIVE
                        </div>
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {streamer.viewerCount}
                        </div>
                        <Bot className="h-16 w-16 text-primary animate-pulse" />
                      </>
                    ) : (
                      <Bot className="h-16 w-16 text-muted-foreground" />
                    )}
                  </div>

                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{streamer.name}</h3>
                        <p className="text-xs text-muted-foreground">{streamer.category}</p>
                      </div>
                      <span className="text-2xl">
                        {PERSONALITY_PRESETS.find(p => p.id === streamer.personalityPreset)?.icon || '🤖'}
                      </span>
                    </div>

                    {/* Features badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {streamer.chatEnabled && (
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                          💬 Chat AI
                        </span>
                      )}
                      {streamer.ttsEnabled && (
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                          🔊 TTS
                        </span>
                      )}
                      {streamer.lipSyncEnabled && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded">
                          👄 Lip-sync
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleLive(streamer.id)}
                        variant={streamer.isLive ? 'destructive' : 'default'}
                        size="sm"
                        className="flex-1 gap-1"
                      >
                        {streamer.isLive ? (
                          <>
                            <Pause className="h-4 w-4" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Go Live
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingStreamer(streamer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteStreamer(streamer.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add new card */}
              <Card
                className="aspect-auto min-h-[300px] border-dashed border-2 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => setShowCreateDialog(true)}
              >
                <div className="text-center">
                  <Plus className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Přidat AI Streamera</p>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Personalities Tab */}
          <TabsContent value="personalities">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PERSONALITY_PRESETS.map(preset => (
                <Card key={preset.id} className="p-6">
                  <div className="text-center mb-4">
                    <span className="text-5xl">{preset.icon}</span>
                  </div>
                  <h3 className="font-bold text-lg text-center mb-2">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">{preset.description}</p>
                  {preset.id !== 'custom' && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground italic">
                        "{preset.systemPrompt}"
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  AI Model nastavení
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">AI Model</label>
                    <div className="flex gap-2">
                      <Button variant="default" size="sm">GPT-4o (doporučeno)</Button>
                      <Button variant="outline" size="sm">GPT-3.5</Button>
                      <Button variant="outline" size="sm">Claude</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Teplota (kreativita)</label>
                    <input type="range" min={0} max={100} defaultValue={70} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Konzervativní</span>
                      <span>Kreativní</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max délka odpovědi</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Krátká (50 slov)</Button>
                      <Button variant="default" size="sm">Střední (100 slov)</Button>
                      <Button variant="outline" size="sm">Dlouhá (200 slov)</Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-green-500" />
                  TTS nastavení
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Výchozí hlas</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="default" size="sm">Eva (žena)</Button>
                      <Button variant="outline" size="sm">Jana (žena)</Button>
                      <Button variant="outline" size="sm">Tomáš (muž)</Button>
                      <Button variant="outline" size="sm">Petr (muž)</Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Rychlost řeči</label>
                    <input type="range" min={50} max={150} defaultValue={100} className="w-full" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Pomalá</span>
                      <span>Rychlá</span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Mic className="h-5 w-5 text-purple-500" />
                  Lip-sync nastavení
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Lip-sync synchronizuje pohyb rtů AI avataru s generovanou řečí.
                    Tato funkce vyžaduje video s viditelným obličejem.
                  </p>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kvalita lip-sync</label>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Základní</Button>
                      <Button variant="default" size="sm">Pokročilá</Button>
                      <Button variant="outline" size="sm">Ultra (pomalé)</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
