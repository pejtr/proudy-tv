import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface EmoteGeneratorProps {
  onSuccess?: () => void;
}

export default function EmoteGenerator({ onSuccess }: EmoteGeneratorProps) {
  const [name, setName] = useState('');
  const [prompt, setPrompt] = useState('');
  const [tier, setTier] = useState<'free' | 'subscriber'>('free');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateMutation = trpc.emotes.generateWithAI.useMutation({
    onSuccess: (data) => {
      setGeneratedImage(data.imageUrl);
      toast.success(`Emote "${name}" vygenerován!`);
      setName('');
      setPrompt('');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Chyba při generování emotu');
    },
  });

  const handleGenerate = () => {
    if (!name.trim() || !prompt.trim()) {
      toast.error('Vyplňte název a popis emotu');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(name)) {
      toast.error('Název může obsahovat pouze písmena, čísla a podtržítka');
      return;
    }

    generateMutation.mutate({ name: name.trim(), prompt: prompt.trim(), tier });
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setName('');
    setPrompt('');
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold">AI Emote Generator</h3>
      </div>

      {generatedImage ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center p-8 bg-muted/50 rounded-lg">
            <img 
              src={generatedImage} 
              alt="Generated emote" 
              className="w-32 h-32 object-contain"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="outline" className="flex-1">
              <Sparkles className="h-4 w-4 mr-2" />
              Vygenerovat další
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Emote Name */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Název emotu <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="happycat, rage, kekw..."
              maxLength={50}
              disabled={generateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Pouze písmena, čísla a podtržítka (např. :happycat:)
            </p>
          </div>

          {/* AI Prompt */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Popis pro AI <span className="text-destructive">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Např: happy cat with big smile, cute cartoon style, yellow color"
              className="w-full h-24 rounded-md border border-border bg-background px-3 py-2 text-sm"
              maxLength={500}
              disabled={generateMutation.isPending}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Popište emote co nejpřesněji (v angličtině pro nejlepší výsledky)
            </p>
          </div>

          {/* Tier Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">Dostupnost</label>
            <div className="flex gap-2">
              <Button
                variant={tier === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTier('free')}
                disabled={generateMutation.isPending}
                className="flex-1"
              >
                <Check className="h-4 w-4 mr-1" />
                Free (všichni)
              </Button>
              <Button
                variant={tier === 'subscriber' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTier('subscriber')}
                disabled={generateMutation.isPending}
                className="flex-1"
              >
                <Sparkles className="h-4 w-4 mr-1" />
                Subscriber only
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!name.trim() || !prompt.trim() || generateMutation.isPending}
            className="w-full rainbow-border"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generuji emote...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Vygenerovat s AI
              </>
            )}
          </Button>

          {/* Example Prompts */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs font-medium mb-2">💡 Příklady promptů:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• "happy cat with big smile, cute cartoon, yellow"</li>
              <li>• "angry face emoji, red color, steam from ears"</li>
              <li>• "crying laughing emoji, tears of joy"</li>
              <li>• "pepe frog meme, sad expression, green"</li>
              <li>• "heart eyes emoji, love, pink hearts"</li>
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}
