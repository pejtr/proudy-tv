import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Ban, Clock, MessageSquareOff, Users } from 'lucide-react';
import { toast } from 'sonner';

interface ChatModerationToolsProps {
  streamId: number;
}

export function ChatModerationTools({ streamId }: ChatModerationToolsProps) {
  const [slowMode, setSlowMode] = useState(false);
  const [slowModeDelay, setSlowModeDelay] = useState(5);
  const [subOnlyMode, setSubOnlyMode] = useState(false);
  const [timeoutUsername, setTimeoutUsername] = useState('');
  const [timeoutDuration, setTimeoutDuration] = useState(600); // 10 minutes default
  const [banUsername, setBanUsername] = useState('');

  const handleSlowModeToggle = (enabled: boolean) => {
    setSlowMode(enabled);
    toast.success(enabled ? `Slow mode enabled (${slowModeDelay}s delay)` : 'Slow mode disabled');
    // TODO: Call tRPC mutation to enable/disable slow mode
  };

  const handleSubOnlyToggle = (enabled: boolean) => {
    setSubOnlyMode(enabled);
    toast.success(enabled ? 'Subscriber-only mode enabled' : 'Subscriber-only mode disabled');
    // TODO: Call tRPC mutation to enable/disable sub-only mode
  };

  const handleTimeout = () => {
    if (!timeoutUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    toast.success(`${timeoutUsername} timed out for ${timeoutDuration / 60} minutes`);
    setTimeoutUsername('');
    // TODO: Call tRPC mutation to timeout user
  };

  const handleBan = () => {
    if (!banUsername.trim()) {
      toast.error('Please enter a username');
      return;
    }

    toast.success(`${banUsername} has been banned`);
    setBanUsername('');
    // TODO: Call tRPC mutation to ban user
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MessageSquareOff className="w-5 h-5" />
          Chat Modes
        </h3>

        <div className="space-y-4">
          {/* Slow Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="slow-mode" className="text-base">Slow Mode</Label>
              <p className="text-sm text-muted-foreground">
                Limit how often users can send messages
              </p>
            </div>
            <Switch
              id="slow-mode"
              checked={slowMode}
              onCheckedChange={handleSlowModeToggle}
            />
          </div>

          {slowMode && (
            <div className="ml-4 space-y-2">
              <Label htmlFor="slow-mode-delay">Delay (seconds)</Label>
              <Input
                id="slow-mode-delay"
                type="number"
                min="1"
                max="120"
                value={slowModeDelay}
                onChange={(e) => setSlowModeDelay(parseInt(e.target.value) || 5)}
                className="w-32"
              />
            </div>
          )}

          {/* Subscriber-Only Mode */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sub-only" className="text-base">Subscriber-Only</Label>
              <p className="text-sm text-muted-foreground">
                Only subscribers can send messages
              </p>
            </div>
            <Switch
              id="sub-only"
              checked={subOnlyMode}
              onCheckedChange={handleSubOnlyToggle}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Timeout User
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="timeout-username">Username</Label>
            <Input
              id="timeout-username"
              placeholder="Enter username"
              value={timeoutUsername}
              onChange={(e) => setTimeoutUsername(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="timeout-duration">Duration (minutes)</Label>
            <select
              id="timeout-duration"
              value={timeoutDuration}
              onChange={(e) => setTimeoutDuration(parseInt(e.target.value))}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
              <option value={1800}>30 minutes</option>
              <option value={3600}>1 hour</option>
              <option value={86400}>24 hours</option>
            </select>
          </div>

          <Button onClick={handleTimeout} className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            Timeout User
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
          <Ban className="w-5 h-5" />
          Ban User
        </h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="ban-username">Username</Label>
            <Input
              id="ban-username"
              placeholder="Enter username"
              value={banUsername}
              onChange={(e) => setBanUsername(e.target.value)}
            />
          </div>

          <Button onClick={handleBan} variant="destructive" className="w-full">
            <Ban className="w-4 h-4 mr-2" />
            Ban User Permanently
          </Button>
        </div>
      </Card>
    </div>
  );
}
