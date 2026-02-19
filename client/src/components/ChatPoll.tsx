import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/_core/hooks/useAuth';
import { BarChart3, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  id: number;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiresAt: string;
  isActive: boolean;
  creatorId: number;
}

interface ChatPollProps {
  poll: Poll | null;
  onCreatePoll?: (question: string, options: string[], durationMinutes: number) => void;
  onVote?: (pollId: number, optionIndex: number) => void;
  userVote?: number | null; // index of user's vote
  canCreate?: boolean; // streamer/mod only
}

const POLL_COLORS = [
  'bg-blue-500',
  'bg-purple-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-orange-500',
  'bg-red-500',
];

export default function ChatPoll({ poll, onCreatePoll, onVote, userVote, canCreate = false }: ChatPollProps) {
  const { isAuthenticated } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Countdown timer
  useEffect(() => {
    if (!poll?.isActive || !poll.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expires = new Date(poll.expiresAt).getTime();
      const diff = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [poll]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCreatePoll = () => {
    const validOptions = options.filter(o => o.trim());
    if (!question.trim() || validOptions.length < 2) return;
    onCreatePoll?.(question.trim(), validOptions, duration);
    setShowCreateDialog(false);
    setQuestion('');
    setOptions(['', '']);
    setDuration(5);
  };

  const addOption = () => {
    if (options.length < 8) setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  // Active poll display
  if (poll && poll.isActive) {
    const hasVoted = userVote !== null && userVote !== undefined;
    const isExpired = timeLeft !== null && timeLeft <= 0;

    return (
      <Card className="p-4 border-primary/30 bg-primary/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            <span className="font-bold text-sm">Anketa</span>
          </div>
          {timeLeft !== null && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {isExpired ? 'Ukončeno' : formatTime(timeLeft)}
            </div>
          )}
        </div>

        <p className="font-semibold text-sm mb-3">{poll.question}</p>

        <div className="space-y-2">
          {poll.options.map((option, idx) => {
            const percentage = poll.totalVotes > 0 
              ? Math.round((option.votes / poll.totalVotes) * 100) 
              : 0;
            const isSelected = userVote === idx;

            return (
              <button
                key={idx}
                onClick={() => !hasVoted && !isExpired && isAuthenticated && onVote?.(poll.id, idx)}
                disabled={hasVoted || isExpired || !isAuthenticated}
                className={`w-full relative overflow-hidden rounded-lg border transition-all ${
                  isSelected 
                    ? 'border-primary ring-1 ring-primary' 
                    : 'border-border hover:border-primary/50'
                } ${!hasVoted && !isExpired && isAuthenticated ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Background bar */}
                {(hasVoted || isExpired) && (
                  <div
                    className={`absolute inset-y-0 left-0 ${POLL_COLORS[idx % POLL_COLORS.length]} opacity-20 poll-option-bar`}
                    style={{ width: `${percentage}%` }}
                  />
                )}
                
                <div className="relative flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                    <span className="text-sm">{option.text}</span>
                  </div>
                  {(hasVoted || isExpired) && (
                    <span className="text-xs font-bold">{percentage}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-2 text-xs text-muted-foreground text-center">
          {poll.totalVotes} {poll.totalVotes === 1 ? 'hlas' : poll.totalVotes < 5 ? 'hlasy' : 'hlasů'}
        </div>
      </Card>
    );
  }

  // Create poll button (for streamers/mods)
  if (canCreate) {
    return (
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <BarChart3 className="h-4 w-4" />
            Vytvořit anketu
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Nová anketa
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Otázka</label>
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Na co se chcete zeptat?"
                maxLength={255}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Možnosti</label>
              <div className="space-y-2">
                {options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className={`w-1 rounded ${POLL_COLORS[idx % POLL_COLORS.length]}`} />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Možnost ${idx + 1}`}
                      maxLength={100}
                      className="flex-1"
                    />
                    {options.length > 2 && (
                      <Button variant="ghost" size="icon" onClick={() => removeOption(idx)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 8 && (
                <Button variant="ghost" size="sm" onClick={addOption} className="mt-2 gap-1">
                  <Plus className="h-4 w-4" />
                  Přidat možnost
                </Button>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Doba trvání (minuty)</label>
              <div className="flex gap-2">
                {[1, 2, 5, 10, 15].map(d => (
                  <Button
                    key={d}
                    variant={duration === d ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration(d)}
                  >
                    {d}m
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCreatePoll}
              disabled={!question.trim() || options.filter(o => o.trim()).length < 2}
              className="w-full rainbow-border"
            >
              Spustit anketu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
