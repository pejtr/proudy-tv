import { Card } from "@/components/ui/card";
import { useState } from "react";
import { TrendingUp, DollarSign } from "lucide-react";

const REVENUE_SPLITS = {
  affiliate: 0.7,
  partner: 0.75,
  exclusive: 0.85,
  twitch: 0.5,
  kick: 0.95,
  youtube: 0.7,
};

export function RevenueCalculator() {
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);

  const calculations = {
    proudyAffiliate: monthlyRevenue * REVENUE_SPLITS.affiliate,
    proudyPartner: monthlyRevenue * REVENUE_SPLITS.partner,
    proudyExclusive: monthlyRevenue * REVENUE_SPLITS.exclusive,
    twitch: monthlyRevenue * REVENUE_SPLITS.twitch,
    kick: monthlyRevenue * REVENUE_SPLITS.kick,
    youtube: monthlyRevenue * REVENUE_SPLITS.youtube,
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Revenue Calculator
      </h2>

      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">
          Monthly Revenue (Kč)
        </label>
        <input
          type="range"
          min="1000"
          max="100000"
          step="1000"
          value={monthlyRevenue}
          onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-center mt-2">
          <span className="text-3xl font-bold gradient-text-animated">
            {monthlyRevenue.toLocaleString()} Kč
          </span>
          <p className="text-xs text-muted-foreground">Total monthly revenue from all sources</p>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="space-y-2">
        <h3 className="font-bold text-sm mb-3">Your Earnings Comparison:</h3>
        
        {/* PROUDY.TV Modes */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg border border-blue-500/20">
          <div>
            <p className="text-xs text-muted-foreground">PROUDY Affiliate (70/30)</p>
            <p className="text-xl font-bold text-blue-500">
              {calculations.proudyAffiliate.toLocaleString()} Kč
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">vs Twitch (50/50)</p>
            <p className="text-sm font-bold text-red-500">
              +{(calculations.proudyAffiliate - calculations.twitch).toLocaleString()} Kč
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div>
            <p className="text-xs text-muted-foreground">PROUDY Partner (75/25)</p>
            <p className="text-xl font-bold text-purple-500">
              {calculations.proudyPartner.toLocaleString()} Kč
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">vs Twitch (50/50)</p>
            <p className="text-sm font-bold text-red-500">
              +{(calculations.proudyPartner - calculations.twitch).toLocaleString()} Kč
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
          <div>
            <p className="text-xs text-muted-foreground">PROUDY Exclusive (85/15)</p>
            <p className="text-xl font-bold text-orange-500">
              {calculations.proudyExclusive.toLocaleString()} Kč
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">vs Twitch (50/50)</p>
            <p className="text-sm font-bold text-red-500">
              +{(calculations.proudyExclusive - calculations.twitch).toLocaleString()} Kč
            </p>
          </div>
        </div>

        {/* Other Platforms */}
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-bold text-sm mb-3">Other Platforms:</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Twitch</p>
              <p className="font-bold text-purple-500">50%</p>
              <p className="text-xs">{calculations.twitch.toLocaleString()} Kč</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">Kick</p>
              <p className="font-bold text-green-500">95%</p>
              <p className="text-xs">{calculations.kick.toLocaleString()} Kč</p>
            </div>
            <div className="p-2 bg-muted rounded">
              <p className="text-xs text-muted-foreground">YouTube</p>
              <p className="font-bold text-red-500">70%</p>
              <p className="text-xs">{calculations.youtube.toLocaleString()} Kč</p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Why PROUDY.TV?</p>
            <p className="text-xs text-muted-foreground mt-1">
              Even with Affiliate mode (70/30), you earn <strong>+{((calculations.proudyAffiliate - calculations.twitch) / calculations.twitch * 100).toFixed(0)}%</strong> more than Twitch. 
              With Exclusive mode (85/15), you earn <strong>+{((calculations.proudyExclusive - calculations.twitch) / calculations.twitch * 100).toFixed(0)}%</strong> more!
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
