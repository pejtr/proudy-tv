import { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Coins as CoinsIcon, Sparkles, Zap, Crown, Rocket } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const COIN_PACKAGES = [
  { 
    coins: 100, 
    price: 100, 
    icon: Sparkles,
    popular: false,
    bonus: 0
  },
  { 
    coins: 500, 
    price: 500, 
    icon: Zap,
    popular: true,
    bonus: 25 // +5% bonus
  },
  { 
    coins: 1000, 
    price: 1000, 
    icon: Crown,
    popular: false,
    bonus: 100 // +10% bonus
  },
  { 
    coins: 5000, 
    price: 5000, 
    icon: Rocket,
    popular: false,
    bonus: 750 // +15% bonus
  },
  { 
    coins: 10000, 
    price: 10000, 
    icon: Crown,
    popular: false,
    bonus: 2000 // +20% bonus
  },
];

export default function CoinsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<number | null>(null);

  const createCheckout = trpc.payment.createCheckout.useMutation({
    onSuccess: (data) => {
      // Open Stripe Checkout in new tab
      window.open(data.url, '_blank');
      toast({
        title: 'Redirecting to checkout',
        description: 'Opening Stripe payment page...',
      });
      setLoading(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(null);
    },
  });

  const handlePurchase = (coins: number, price: number) => {
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please login to purchase coins',
        variant: 'destructive',
      });
      return;
    }

    setLoading(coins);
    createCheckout.mutate({
      productType: 'coins',
      coinAmount: coins,
      priceInCzk: price,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 mb-6">
            <CoinsIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Proudy Coins
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Podpořte své oblíbené streamery, kupte si předplatné nebo darujte coiny ostatním! 
            <br />
            <span className="text-sm">1 Proudy Coin = 1 Kč</span>
          </p>
        </div>

        {/* User Balance */}
        {isAuthenticated && user && (
          <Card className="max-w-md mx-auto mb-12 p-6 rainbow-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Váš zůstatek</p>
                <p className="text-3xl font-bold">{user.coinsBalance || 0} coins</p>
              </div>
              <CoinsIcon className="w-12 h-12 text-primary" />
            </div>
          </Card>
        )}

        {/* Coin Packages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {COIN_PACKAGES.map((pkg) => {
            const Icon = pkg.icon;
            const totalCoins = pkg.coins + pkg.bonus;
            
            return (
              <Card
                key={pkg.coins}
                className={`relative p-6 hover:scale-105 transition-transform ${
                  pkg.popular ? 'rainbow-border' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    POPULÁRNÍ
                  </div>
                )}

                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>

                  <div>
                    <p className="text-4xl font-bold">{pkg.coins}</p>
                    {pkg.bonus > 0 && (
                      <p className="text-sm text-green-500 font-semibold">
                        +{pkg.bonus} BONUS
                      </p>
                    )}
                    <p className="text-2xl font-bold text-primary mt-2">
                      = {totalCoins} coins
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-3xl font-bold mb-4">{pkg.price} Kč</p>
                    <Button
                      onClick={() => handlePurchase(totalCoins, pkg.price)}
                      disabled={loading === pkg.coins}
                      className="w-full rainbow-border"
                    >
                      {loading === pkg.coins ? 'Processing...' : 'Koupit'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Features */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Co můžete s coiny dělat?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">💎</div>
              <h3 className="font-bold mb-2">Předplatné</h3>
              <p className="text-sm text-muted-foreground">
                Kupte si sub za 88 coins/měsíc a získejte exkluzivní výhody
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="font-bold mb-2">Donations</h3>
              <p className="text-sm text-muted-foreground">
                Podpořte streamery custom donations s vlastním videem a zvukem
              </p>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-4xl mb-4">✨</div>
              <h3 className="font-bold mb-2">Highlighted Messages</h3>
              <p className="text-sm text-muted-foreground">
                Zvýrazněte svou zprávu v chatu za 50+ coins s TTS přečtením
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
