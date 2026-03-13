import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, Zap, Crown, Star, ExternalLink } from "lucide-react";

const TIERS = [
  {
    id: "tier1",
    name: "Tier 1",
    icon: Star,
    priceKc: 59,
    priceCents: 5900,
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
    description: "Podpoř svého oblíbeného streamera",
    features: [
      "Exkluzivní Tier 1 badge v chatu",
      "Přístup k sub-only chatu",
      "Custom emotes (5 slotů)",
      "Ad-free sledování",
      "Prioritní notifikace",
    ],
  },
  {
    id: "tier2",
    name: "Tier 2",
    icon: Zap,
    priceKc: 119,
    priceCents: 11900,
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500/50",
    bgColor: "bg-purple-500/10",
    description: "Silnější podpora s více výhodami",
    popular: true,
    features: [
      "Vše z Tier 1",
      "Tier 2 animovaný badge",
      "Custom emotes (10 slotů)",
      "Exkluzivní Discord role",
      "Měsíční Q&A se streamerem",
      "Prioritní odpovědi v chatu",
    ],
  },
  {
    id: "tier3",
    name: "Tier 3",
    icon: Crown,
    priceKc: 299,
    priceCents: 29900,
    color: "from-yellow-500 to-orange-500",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/5",
    description: "Maximální podpora pro true fanoušky",
    features: [
      "Vše z Tier 1 & 2",
      "Zlatý Crown badge",
      "Custom emotes (neomezené)",
      "Jméno v credits streamu",
      "Přístup k behind-the-scenes",
      "Osobní poděkování ve streamu",
      "Exkluzivní merch sleva 20%",
    ],
  },
];

interface SubscriptionTiersProps {
  streamerId?: number;
  streamerName?: string;
}

export default function SubscriptionTiers({ streamerName }: SubscriptionTiersProps) {
  const { isAuthenticated } = useAuth();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);

  const createCheckout = trpc.payment.createCheckout.useMutation({
    onSuccess: (data: { url: string | null }) => {
      if (data.url) {
        toast.info("Přesměrování na platební bránu...");
        window.open(data.url, "_blank");
      }
      setLoadingTier(null);
    },
    onError: (err: { message: string }) => {
      toast.error("Nepodařilo se vytvořit platbu: " + err.message);
      setLoadingTier(null);
    },
  });

  const handleSubscribe = (tier: typeof TIERS[0]) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }
    setLoadingTier(tier.id);
    createCheckout.mutate({
      productType: 'subscription',
      priceInCzk: tier.priceKc,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">
              {streamerName ? (
                <>Odebírej <span className="gradient-text-animated">{streamerName}</span></>
              ) : (
                "Subscription Tiers"
              )}
            </h1>
            <p className="text-muted-foreground">
              Podpoř svého oblíbeného streamera a získej exkluzivní výhody
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TIERS.map((tier) => {
            const TierIcon = tier.icon;
            return (
              <Card
                key={tier.id}
                className={`relative border ${tier.borderColor} ${tier.bgColor} transition-all hover:scale-[1.02] ${
                  tier.popular ? "ring-2 ring-purple-500/50 shadow-lg shadow-purple-500/10" : ""
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white text-xs px-3 py-1">
                      ⭐ Nejoblíbenější
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br ${tier.color} mx-auto mb-3`}>
                    <TierIcon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-3">
                    <span className="text-3xl font-bold">{tier.priceKc} Kč</span>
                    <span className="text-muted-foreground text-sm">/měsíc</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full font-semibold ${
                      tier.popular
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                        : ""
                    }`}
                    variant={tier.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(tier)}
                    disabled={loadingTier === tier.id}
                  >
                    {loadingTier === tier.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Přesměrování...
                      </span>
                    ) : (
                      <>Odebírat {tier.name}</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg">💳 Bezpečná platba</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Platby jsou zpracovávány přes <strong className="text-foreground">Stripe</strong> — světového lídra v online platbách.</p>
              <p>Podporujeme: Visa, Mastercard, Apple Pay, Google Pay a bankovní převod.</p>
              <p>Předplatné lze kdykoliv zrušit v nastavení účtu.</p>
              <div className="flex items-center gap-2 mt-3">
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs">Testovací karta: 4242 4242 4242 4242</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg">💰 Revenue Split pro Streamery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Streameři dostávají <strong className="text-foreground">85 %</strong> z každého subscription poplatku.</p>
              <div className="space-y-1 mt-3">
                {TIERS.map((tier) => (
                  <div key={tier.id} className="flex justify-between items-center">
                    <span>{tier.name} ({tier.priceKc} Kč/měsíc)</span>
                    <span className="font-semibold text-green-400">
                      {Math.round(tier.priceKc * 0.85)} Kč pro streamera
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
