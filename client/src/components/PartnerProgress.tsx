import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/lib/trpc';
import { Loader2, TrendingUp, Users, Clock } from 'lucide-react';

export default function PartnerProgress() {
  const { data: progress, isLoading } = trpc.partner.getMyProgress.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!progress) {
    return null;
  }

  const { currentTier, stats, nextTier } = progress;

  return (
    <div className="space-y-4">
      {/* Current Tier Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">{currentTier.badge}</span>
              {currentTier.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Tvůj aktuální status
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold gradient-text-animated">
              {Math.round(currentTier.revenueSplit.streamer * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Revenue split</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.monthlyHours}h</div>
              <div className="text-xs text-muted-foreground">Tento měsíc</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.activeSubscribers}</div>
              <div className="text-xs text-muted-foreground">Subscribers</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Next Tier Progress */}
      {nextTier && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h4 className="font-bold">Postup k {nextTier.name}</h4>
            <span className="text-2xl ml-auto">{nextTier.badge}</span>
          </div>

          <div className="space-y-4">
            {/* Hours Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Streamovací hodiny</span>
                <span className="text-sm text-muted-foreground">
                  {stats.monthlyHours} / {nextTier.requiredHours}h
                </span>
              </div>
              <Progress 
                value={(stats.monthlyHours / nextTier.requiredHours) * 100} 
                className="h-2"
              />
              {nextTier.hoursRemaining > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Zbývá {nextTier.hoursRemaining}h
                </p>
              )}
            </div>

            {/* Subscribers Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Aktivní subscribers</span>
                <span className="text-sm text-muted-foreground">
                  {stats.activeSubscribers} / {nextTier.requiredSubscribers}
                </span>
              </div>
              <Progress 
                value={(stats.activeSubscribers / nextTier.requiredSubscribers) * 100} 
                className="h-2"
              />
              {nextTier.subscribersRemaining > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Zbývá {nextTier.subscribersRemaining} subscribers
                </p>
              )}
            </div>

            {/* Reward Preview */}
            <div className="bg-muted/50 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Po dosažení {nextTier.name}:</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Revenue split se zvýší na 70% nebo 80%
                  </p>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {nextTier.name === 'Affiliate' ? '70%' : '80%'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Max Tier Achieved */}
      {!nextTier && (
        <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <div className="text-center">
            <div className="text-5xl mb-2">👑</div>
            <h4 className="font-bold text-lg mb-2">Gratulujeme!</h4>
            <p className="text-sm text-muted-foreground">
              Dosáhl jsi nejvyššího Partner statusu s 80% revenue split
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
