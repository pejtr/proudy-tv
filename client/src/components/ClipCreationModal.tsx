import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import { Scissors, Clock } from 'lucide-react';

interface ClipCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streamId: number;
  streamDuration: number; // Total stream duration in seconds
}

export function ClipCreationModal({ open, onOpenChange, streamId, streamDuration }: ClipCreationModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(Math.max(0, streamDuration - 30)); // Default to last 30s
  const [endTime, setEndTime] = useState(streamDuration);

  const createClip = trpc.clips.create.useMutation({
    onSuccess: () => {
      toast.success('Klip vytvořen!', {
        description: 'Váš klip byl úspěšně vytvořen a je nyní dostupný.',
      });
      onOpenChange(false);
      // Reset form
      setTitle('');
      setDescription('');
      setStartTime(Math.max(0, streamDuration - 30));
      setEndTime(streamDuration);
    },
    onError: (error) => {
      toast.error('Chyba při vytváření klipu', {
        description: error.message,
      });
    },
  });

  const duration = endTime - startTime;
  const isValidDuration = duration >= 5 && duration <= 60;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCreate = () => {
    if (!title.trim()) {
      toast.error('Zadejte název klipu');
      return;
    }

    if (!isValidDuration) {
      toast.error('Délka klipu musí být mezi 5-60 sekundami');
      return;
    }

    createClip.mutate({
      streamId,
      title: title.trim(),
      description: description.trim() || undefined,
      startTime,
      endTime,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scissors className="h-5 w-5 text-primary" />
            Vytvořit Klip
          </DialogTitle>
          <DialogDescription>
            Vyberte 5-60 sekundový úsek ze streamu a vytvořte klip
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="clip-title">Název klipu *</Label>
            <Input
              id="clip-title"
              placeholder="Např. Epic moment!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={255}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="clip-description">Popis (volitelné)</Label>
            <Textarea
              id="clip-description"
              placeholder="Popište, co se v klipu děje..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Time Selector */}
          <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Časový rozsah
              </Label>
              <div className={`text-sm font-medium ${isValidDuration ? 'text-primary' : 'text-destructive'}`}>
                {duration}s {!isValidDuration && '(5-60s vyžadováno)'}
              </div>
            </div>

            {/* Start Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Začátek</span>
                <span className="font-mono font-medium">{formatTime(startTime)}</span>
              </div>
              <Slider
                value={[startTime]}
                onValueChange={([value]) => {
                  setStartTime(value);
                  // Ensure end time is at least 5s after start
                  if (endTime - value < 5) {
                    setEndTime(Math.min(value + 5, streamDuration));
                  }
                  // Ensure duration doesn't exceed 60s
                  if (endTime - value > 60) {
                    setEndTime(value + 60);
                  }
                }}
                max={streamDuration - 5}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* End Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Konec</span>
                <span className="font-mono font-medium">{formatTime(endTime)}</span>
              </div>
              <Slider
                value={[endTime]}
                onValueChange={([value]) => {
                  setEndTime(value);
                  // Ensure start time is at least 5s before end
                  if (value - startTime < 5) {
                    setStartTime(Math.max(value - 5, 0));
                  }
                  // Ensure duration doesn't exceed 60s
                  if (value - startTime > 60) {
                    setStartTime(value - 60);
                  }
                }}
                max={streamDuration}
                min={5}
                step={1}
                className="w-full"
              />
            </div>

            {/* Visual Timeline */}
            <div className="relative h-2 rounded-full bg-muted">
              <div
                className="absolute h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                style={{
                  left: `${(startTime / streamDuration) * 100}%`,
                  width: `${(duration / streamDuration) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušit
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValidDuration || !title.trim() || createClip.isPending}
          >
            {createClip.isPending ? 'Vytváření...' : 'Vytvořit Klip'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
