import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useSearch } from 'wouter';
import { getLoginUrl } from '@/const';
import { trpc } from '@/lib/trpc';
import { Coins, Check, X, Sparkles, Crown, Gift, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';

const COIN_PACKAGES = [
  { amount: 100, price: 100, icon: '💎', bonus: '', popular: false },
  { amount: 250, price: 240, icon: '💎💎', bonus: '+10 bonus', popular: false },
  { amount: 500, price: 450, icon: '💎💎💎', bonus: '+50 bonus', popular: true },
  { amount: 1000, price: 850, icon: '🌟', bonus: '+150 bonus', popular: false },
  { amount: 5000, price: 4000, icon: '🌟🌟', bonus: '+1000 bonus', popular: false },
  { amount: 10000, price: 7500, icon: '👑', bonus: '+2500 bonus', popular: false },
];

export default function CoinsPage() {
  const { user, isAuthenticated } = useAuth();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const createCheckout = trpc.payment.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error('Chyba při vytváření platby');
    },
  });

  useEffect(() => {
    if (params.get('success') === 'true') {
      toast.success('Platba proběhla úspěšně! Coins budou připsány.');
    }
    if (params.get('canceled') === 'true') {
      toast.error('Platba byla zrušena.');
    }
  }, []);

  const handlePurchase = (amount: number, price: number) => {
    if (!isAuthenticated) {
      toast.error('Přihlaste se pro nákup coins');
      return;
    }
    createCheckout.mutate({
      productType: 'coins',
      coinAmount: amount,
      priceInCzk: price,
    });
  };

  return (
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
              <Button variant="ghost">Browse</Button>
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-bold text-yellow-500">{user?.coinsBalance || 0}</span>
                </div>
                <span className="text-sm text-muted-foreground">{user?.name}</span>
              </div>
            ) : (
              <a href={getLoginUrl()}>
                <Button>Přihlásit se</Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text-animated">Proudy Coins</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Kupte si Proudy Coins a podpořte své oblíbené streamery. 1 Coin = 1 Kč.
          </p>
        </div>

        {/* Coin Packages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {COIN_PACKAGES.map((pkg) => (
            <Card
              key={pkg.amount}
              className={`relative overflow-hidden card-modern ${pkg.popular ? 'ring-2 ring-primary' : ''}`}
            >
              {pkg.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-bold">
                  NEJPOPULÁRNĚJŠÍ
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <div className="text-4xl mb-2">{pkg.icon}</div>
                <CardTitle className="text-2xl">{pkg.amount.toLocaleString()} Coins</CardTitle>
                {pkg.bonus && (
                  <p className="text-sm text-green-500 font-bold">{pkg.bonus}</p>
                )}
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-3xl font-bold mb-4">{pkg.price} Kč</p>
                <Button
                  onClick={() => handlePurchase(pkg.amount, pkg.price)}
                  className="w-full rainbow-border"
                  disabled={createCheckout.isPending}
                >
                  <Coins className="h-4 w-4 mr-2" />
                  Koupit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What can you do with coins */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Co můžete s Coins dělat?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 text-center">
              <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">Předplatné</h3>
              <p className="text-xs text-muted-foreground">88 coins/měsíc</p>
            </Card>
            <Card className="p-4 text-center">
              <Gift className="h-8 w-8 text-pink-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">Donace</h3>
              <p className="text-xs text-muted-foreground">Od 100 coins</p>
            </Card>
            <Card className="p-4 text-center">
              <Zap className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">TTS Zprávy</h3>
              <p className="text-xs text-muted-foreground">Od 50 coins</p>
            </Card>
            <Card className="p-4 text-center">
              <Sparkles className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-bold text-sm mb-1">Custom Emotes</h3>
              <p className="text-xs text-muted-foreground">AI generované</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
