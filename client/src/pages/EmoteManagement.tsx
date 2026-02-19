import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Sparkles, Trash2, Power, PowerOff, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import EmoteGenerator from '@/components/EmoteGenerator';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link } from 'wouter';

export default function EmoteManagement() {
  const { user } = useAuth();
  const [showGenerator, setShowGenerator] = useState(false);

  const { data: emotes, isLoading, refetch } = trpc.emotes.getMyEmotes.useQuery();

  const toggleMutation = trpc.emotes.toggleEnabled.useMutation({
    onSuccess: () => {
      toast.success('Emote stav změněn');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.emotes.delete.useMutation({
    onSuccess: () => {
      toast.success('Emote smazán');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggle = (emoteId: number) => {
    toggleMutation.mutate({ emoteId });
  };

  const handleDelete = (emoteId: number, name: string) => {
    if (confirm(`Opravdu smazat emote "${name}"?`)) {
      deleteMutation.mutate({ emoteId });
    }
  };

  if (user?.role !== 'streamer' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Přístup odepřen</h2>
          <p className="text-muted-foreground mb-6">
            Tato stránka je dostupná pouze pro streamery.
          </p>
          <Link href="/">
            <Button>Zpět na homepage</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost">← Dashboard</Button>
          </Link>
          <h1 className="text-2xl font-bold gradient-text-animated">Custom Emotes</h1>
          <div className="w-24" />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-3xl font-bold gradient-text-animated">
              {emotes?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Celkem emotů</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-green-500">
              {emotes?.filter((e) => e.isEnabled).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Aktivních</div>
          </Card>
          <Card className="p-6">
            <div className="text-3xl font-bold text-purple-500">
              {emotes?.filter((e) => e.generatedByAI).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">AI Generated</div>
          </Card>
        </div>

        {/* Generator Section */}
        <div className="mb-8">
          {showGenerator ? (
            <div className="space-y-4">
              <EmoteGenerator onSuccess={() => {
                refetch();
                setShowGenerator(false);
              }} />
              <Button
                variant="outline"
                onClick={() => setShowGenerator(false)}
                className="w-full"
              >
                Zrušit
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setShowGenerator(true)}
              className="w-full rainbow-border"
              size="lg"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Vygenerovat nový emote s AI
            </Button>
          )}
        </div>

        {/* Emotes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : emotes && emotes.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {emotes.map((emote) => (
              <Card
                key={emote.id}
                className={`p-4 relative group ${
                  !emote.isEnabled ? 'opacity-50' : ''
                }`}
              >
                {/* Emote Image */}
                <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                  <img
                    src={emote.imageUrl}
                    alt={emote.name}
                    className="w-full h-full object-contain"
                  />
                  {emote.generatedByAI && (
                    <div className="absolute top-1 right-1 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                      AI
                    </div>
                  )}
                  {emote.tier === 'subscriber' && (
                    <div className="absolute top-1 left-1 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                      SUB
                    </div>
                  )}
                </div>

                {/* Emote Name */}
                <div className="text-sm font-medium text-center mb-2 truncate">
                  :{emote.name}:
                </div>

                {/* Usage Count */}
                <div className="text-xs text-muted-foreground text-center mb-3">
                  {emote.usageCount} použití
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(emote.id)}
                    disabled={toggleMutation.isPending}
                    className="flex-1"
                  >
                    {emote.isEnabled ? (
                      <Power className="h-3 w-3" />
                    ) : (
                      <PowerOff className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(emote.id, emote.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* AI Prompt (if available) */}
                {emote.aiPrompt && (
                  <div className="mt-2 text-xs text-muted-foreground line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Prompt: {emote.aiPrompt}
                  </div>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">Žádné emoty</h3>
            <p className="text-muted-foreground mb-6">
              Začněte vytvořením svého prvního custom emotu pomocí AI
            </p>
            <Button onClick={() => setShowGenerator(true)} className="rainbow-border">
              <Sparkles className="h-4 w-4 mr-2" />
              Vygenerovat první emote
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
