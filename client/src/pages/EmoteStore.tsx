import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import {
  Search,
  Coins,
  ShoppingCart,
  Star,
  TrendingUp,
  Smile,
  Filter,
  Check,
  ArrowLeft,
  Sparkles,
  Crown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getLoginUrl } from '@/const';

// Demo emote store data
const DEMO_EMOTES = [
  {
    id: 1,
    name: 'jakubLUL',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=lul&backgroundColor=b6e3f4',
    streamer: 'Jakub Gaming',
    streamerUsername: 'jakub_gaming',
    priceCoins: 50,
    tier: 'free',
    category: 'Gaming',
    totalSold: 1240,
    isNew: false,
    isTrending: true,
  },
  {
    id: 2,
    name: 'jakubGG',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=gg&backgroundColor=c0aede',
    streamer: 'Jakub Gaming',
    streamerUsername: 'jakub_gaming',
    priceCoins: 75,
    tier: 'free',
    category: 'Gaming',
    totalSold: 890,
    isNew: false,
    isTrending: false,
  },
  {
    id: 3,
    name: 'terezaHeart',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=heart&backgroundColor=ffd5dc',
    streamer: 'Tereza ASMR',
    streamerUsername: 'tereza_asmr',
    priceCoins: 50,
    tier: 'free',
    category: 'ASMR',
    totalSold: 456,
    isNew: true,
    isTrending: false,
  },
  {
    id: 4,
    name: 'terezaRelax',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=relax&backgroundColor=d1f4e0',
    streamer: 'Tereza ASMR',
    streamerUsername: 'tereza_asmr',
    priceCoins: 100,
    tier: 'free',
    category: 'ASMR',
    totalSold: 234,
    isNew: true,
    isTrending: false,
  },
  {
    id: 5,
    name: 'proudyWave',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=wave&backgroundColor=7c3aed',
    streamer: 'PROUDY.TV',
    streamerUsername: 'proudy',
    priceCoins: 0,
    tier: 'free',
    category: 'Platform',
    totalSold: 9999,
    isNew: false,
    isTrending: true,
    isFree: true,
  },
  {
    id: 6,
    name: 'proudyHype',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hype&backgroundColor=9333ea',
    streamer: 'PROUDY.TV',
    streamerUsername: 'proudy',
    priceCoins: 0,
    tier: 'free',
    category: 'Platform',
    totalSold: 8765,
    isNew: false,
    isTrending: true,
    isFree: true,
  },
  {
    id: 7,
    name: 'gamingRage',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=rage&backgroundColor=fecaca',
    streamer: 'ProGamer_CZ',
    streamerUsername: 'progamer_cz',
    priceCoins: 75,
    tier: 'free',
    category: 'Gaming',
    totalSold: 678,
    isNew: false,
    isTrending: true,
  },
  {
    id: 8,
    name: 'musicVibes',
    imageUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=music&backgroundColor=bfdbfe',
    streamer: 'DJ_Marek',
    streamerUsername: 'dj_marek',
    priceCoins: 50,
    tier: 'free',
    category: 'Music',
    totalSold: 345,
    isNew: true,
    isTrending: false,
  },
];

const COIN_PACKAGES = [
  { coins: 100, price: 99, bonus: 0, label: 'Starter' },
  { coins: 500, price: 449, bonus: 50, label: 'Popular', highlight: true },
  { coins: 1000, price: 849, bonus: 150, label: 'Value' },
  { coins: 5000, price: 3999, bonus: 1000, label: 'Pro' },
];

export default function EmoteStore() {
  const { user, isAuthenticated } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<number[]>([]);
  const [purchased, setPurchased] = useState<number[]>([]);

  const coinsBalance = user?.coinsBalance || 0;

  const categories = ['all', 'Platform', 'Gaming', 'ASMR', 'Music'];

  const filteredEmotes = DEMO_EMOTES.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.streamer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (emoteId: number) => {
    if (!isAuthenticated) {
      toast.error('Přihlas se pro nákup emotes');
      return;
    }
    setCart(prev => {
      if (prev.includes(emoteId)) {
        return prev.filter(id => id !== emoteId);
      } else {
        return [...prev, emoteId];
      }
    });
  };

  const handleBuyNow = (emote: typeof DEMO_EMOTES[0]) => {
    if (!isAuthenticated) {
      toast.error('Přihlas se pro nákup emotes');
      return;
    }
    if (emote.isFree || emote.priceCoins === 0) {
      setPurchased(prev => prev.includes(emote.id) ? prev : [...prev, emote.id]);
      toast.success(`Emote :${emote.name}: přidán do tvé kolekce!`);
      return;
    }
    if (coinsBalance < emote.priceCoins) {
      toast.error(`Nemáš dost Proudy Coins! Potřebuješ ${emote.priceCoins} 🪙`);
      return;
    }
    setPurchased(prev => prev.includes(emote.id) ? prev : [...prev, emote.id]);
    toast.success(`Koupil jsi :${emote.name}: za ${emote.priceCoins} 🪙!`);
  };

  const handleBuyCart = () => {
    const totalCost = cart.reduce((sum, id) => {
      const emote = DEMO_EMOTES.find(e => e.id === id);
      return sum + (emote?.priceCoins || 0);
    }, 0);

    if (coinsBalance < totalCost) {
      toast.error(`Nemáš dost Proudy Coins! Potřebuješ ${totalCost} 🪙`);
      return;
    }

    const cartSnapshot = [...cart];
    setPurchased(prev => Array.from(new Set([...prev, ...cartSnapshot])));
    setCart([]);
    toast.success(`Koupil jsi ${cartSnapshot.length} emotes za ${totalCost} 🪙!`);
  };

  const cartTotal = cart.reduce((sum, id) => {
    const emote = DEMO_EMOTES.find(e => e.id === id);
    return sum + (emote?.priceCoins || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/browse">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                Zpět
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-purple-400" />
              <h1 className="font-bold text-lg">Emote Store</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-3 py-1">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="font-bold text-yellow-300">{coinsBalance.toLocaleString()}</span>
                <span className="text-xs text-muted-foreground">Proudy Coins</span>
              </div>
            )}
              {cart.length > 0 && (
              <Button
                onClick={handleBuyCart}
                className="bg-purple-600 hover:bg-purple-700 gap-1"
                size="sm"
              >
                <ShoppingCart className="h-4 w-4" />
                Koupit ({cart.length}) — {cartTotal} 🪙
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <Tabs defaultValue="emotes">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="emotes" className="gap-1">
                <Smile className="h-3.5 w-3.5" /> Emotes
              </TabsTrigger>
              <TabsTrigger value="coins" className="gap-1">
                <Coins className="h-3.5 w-3.5" /> Koupit Coins
              </TabsTrigger>
              {isAuthenticated && (
                <TabsTrigger value="collection" className="gap-1">
                  <Star className="h-3.5 w-3.5" /> Moje kolekce
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Emotes Tab */}
          <TabsContent value="emotes">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Hledat emotes nebo streamery..."
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'whitespace-nowrap',
                      selectedCategory === cat && 'bg-purple-600 hover:bg-purple-700'
                    )}
                  >
                    {cat === 'all' ? 'Vše' : cat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Trending section */}
            {selectedCategory === 'all' && !search && (
              <div className="mb-6">
                <h2 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                  Trending emotes
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {DEMO_EMOTES.filter(e => e.isTrending).map(emote => (
                    <EmoteCard
                      key={emote.id}
                      emote={emote}
                                     inCart={cart.includes(emote.id)}
                      isPurchased={purchased.includes(emote.id)}
                      onAddToCart={() => handleAddToCart(emote.id)}
                      onBuyNow={() => handleBuyNow(emote)}
                    />
                  ))}
                </div>
              </div>
            )}
            {/* All emotes */}
            <div>
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                {selectedCategory === 'all' ? 'Všechny emotes' : selectedCategory}
                <span className="text-muted-foreground font-normal text-sm">({filteredEmotes.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredEmotes.map(emote => (
                  <EmoteCard
                    key={emote.id}
                    emote={emote}
                    inCart={cart.includes(emote.id)}
                    isPurchased={purchased.includes(emote.id)}
                    onAddToCart={() => handleAddToCart(emote.id)}
                    onBuyNow={() => handleBuyNow(emote)}
                  />
                ))}
              </div>
              {filteredEmotes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Smile className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Žádné emotes nenalezeny</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Coins Tab */}
          <TabsContent value="coins">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <Coins className="h-12 w-12 mx-auto mb-3 text-yellow-400" />
                <h2 className="text-2xl font-bold mb-2">Proudy Coins</h2>
                <p className="text-muted-foreground">
                  Koupi emotes, posílej donace a podporuj své oblíbené streamery
                </p>
                {isAuthenticated && (
                  <div className="mt-3 inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    <span className="font-bold text-yellow-300 text-lg">{coinsBalance.toLocaleString()}</span>
                    <span className="text-muted-foreground">aktuální zůstatek</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {COIN_PACKAGES.map(pkg => (
                  <Card
                    key={pkg.coins}
                    className={cn(
                      'p-4 text-center cursor-pointer transition-all hover:border-purple-500/50',
                      pkg.highlight && 'border-purple-500 bg-purple-500/5 relative'
                    )}
                  >
                    {pkg.highlight && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-xs">
                        Nejoblíbenější
                      </Badge>
                    )}
                    <Coins className="h-8 w-8 mx-auto mb-2 text-yellow-400" />
                    <div className="text-2xl font-bold text-yellow-300">
                      {(pkg.coins + pkg.bonus).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {pkg.coins} + {pkg.bonus} bonus
                    </div>
                    <div className="text-sm font-semibold mb-3">{pkg.price} Kč</div>
                    <Button
                      size="sm"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
                      onClick={() => {
                        if (!isAuthenticated) {
                          toast.error('Přihlas se pro nákup');
                          return;
                        }
                        toast.success(`Přesměrování na platbu... (${pkg.price} Kč)`);
                      }}
                    >
                      Koupit
                    </Button>
                  </Card>
                ))}
              </div>

              <Card className="mt-6 p-4 bg-muted/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-yellow-400" />
                  Jak využít Proudy Coins
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Smile className="h-4 w-4 text-purple-400 mt-0.5 shrink-0" />
                    <span>Koupit emotes od oblíbených streamerů (od 50 🪙)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Coins className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                    <span>Posílat donace streamerům (min. 100 🪙)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                    <span>Zvýraznit zprávu v chatu (200 🪙)</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Collection Tab */}
          <TabsContent value="collection">
            <div>
              <h2 className="font-semibold mb-4">Moje emotes ({purchased.length})</h2>
              {purchased.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {purchased.map(id => {
                    const emote = DEMO_EMOTES.find(e => e.id === id);
                    if (!emote) return null;
                    return (
                      <Card key={id} className="p-4 text-center border-green-500/30 bg-green-500/5">
                        <img src={emote.imageUrl} alt={emote.name} className="w-16 h-16 mx-auto mb-2 rounded" />
                        <p className="text-sm font-medium">:{emote.name}:</p>
                        <Badge variant="secondary" className="mt-1 text-xs bg-green-500/20 text-green-400">
                          <Check className="h-3 w-3 mr-1" /> Vlastním
                        </Badge>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Smile className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Zatím žádné emotes</p>
                  <p className="text-sm mt-1">Prozkoumej obchod a kup si první emote!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Emote Card Component
function EmoteCard({
  emote,
  inCart,
  isPurchased,
  onAddToCart,
  onBuyNow,
}: {
  emote: typeof DEMO_EMOTES[0];
  inCart: boolean;
  isPurchased: boolean;
  onAddToCart: () => void;
  onBuyNow: () => void;
}) {
  return (
    <Card
      className={cn(
        'p-3 text-center transition-all hover:border-purple-500/50 group',
        isPurchased ? 'border-green-500/30 bg-green-500/5' : inCart ? 'border-purple-500/50 bg-purple-500/5' : ''
      )}
    >
      <div className="relative">
        <img
          src={emote.imageUrl}
          alt={emote.name}
          className="w-14 h-14 mx-auto mb-2 rounded group-hover:scale-110 transition-transform"
        />
        {emote.isNew && (
          <Badge className="absolute -top-1 -right-1 text-[9px] h-4 px-1 bg-green-500">NEW</Badge>
        )}
        {emote.isTrending && !emote.isNew && (
          <Badge className="absolute -top-1 -right-1 text-[9px] h-4 px-1 bg-orange-500">🔥</Badge>
        )}
      </div>
      <p className="text-xs font-medium truncate">:{emote.name}:</p>
      <Link href={`/streamer/${emote.streamerUsername}`}>
        <p className="text-[10px] text-muted-foreground hover:text-purple-400 transition-colors truncate">
          {emote.streamer}
        </p>
      </Link>

      {isPurchased ? (
        <Badge variant="secondary" className="mt-2 text-[10px] h-5 bg-green-500/20 text-green-400 w-full justify-center">
          <Check className="h-3 w-3 mr-1" /> Vlastním
        </Badge>
      ) : emote.isFree || emote.priceCoins === 0 ? (
        <Button
          size="sm"
          onClick={onBuyNow}
          className="mt-2 w-full text-[10px] h-6 bg-green-600 hover:bg-green-700"
        >
          Zdarma
        </Button>
      ) : (
        <div className="mt-2 space-y-1">
          <Button
            size="sm"
            onClick={onBuyNow}
            className="w-full text-[10px] h-6 bg-purple-600 hover:bg-purple-700"
          >
            {emote.priceCoins} 🪙
          </Button>
          <Button
            size="sm"
            variant={inCart ? 'secondary' : 'outline'}
            onClick={onAddToCart}
            className="w-full text-[10px] h-6"
          >
            {inCart ? '✓ V košíku' : '+ Košík'}
          </Button>
        </div>
      )}
    </Card>
  );
}
