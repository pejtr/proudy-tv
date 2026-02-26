import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Heart, DollarSign, Star, Gift } from 'lucide-react';
import { toast } from 'sonner';

export type AlertType = 'follow' | 'subscription' | 'donation' | 'raid';

interface Alert {
  id: string;
  type: AlertType;
  username: string;
  amount?: number;
  message?: string;
  timestamp: number;
}

interface ProudyAlertsProps {
  enabled?: boolean;
  testMode?: boolean;
}

export function ProudyAlerts({ enabled = true, testMode = false }: ProudyAlertsProps) {
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [alertQueue, setAlertQueue] = useState<Alert[]>([]);

  // Test alerts for demo
  useEffect(() => {
    if (!testMode || !enabled) return;

    const testAlerts: Alert[] = [
      { id: '1', type: 'follow', username: 'StreamFan123', timestamp: Date.now() },
      { id: '2', type: 'subscription', username: 'MegaSupporter', timestamp: Date.now() + 5000 },
      { id: '3', type: 'donation', username: 'GenerousViewer', amount: 50, message: 'Miluju tvůj content!', timestamp: Date.now() + 10000 },
      { id: '4', type: 'raid', username: 'AnotherStreamer', amount: 100, timestamp: Date.now() + 15000 },
    ];

    const timers = testAlerts.map((alert) => {
      const delay = alert.timestamp - Date.now();
      return setTimeout(() => {
        setAlertQueue((prev) => [...prev, alert]);
      }, delay);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [testMode, enabled]);

  // Process alert queue
  useEffect(() => {
    if (!enabled || activeAlert || alertQueue.length === 0) return;

    const nextAlert = alertQueue[0];
    setActiveAlert(nextAlert);
    setAlertQueue((prev) => prev.slice(1));

    // Play sound effect
    playAlertSound(nextAlert.type);

    // Show toast notification
    showAlertToast(nextAlert);

    // Clear alert after 5 seconds
    const timer = setTimeout(() => {
      setActiveAlert(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [alertQueue, activeAlert, enabled]);

  const playAlertSound = (type: AlertType) => {
    // Create audio context for sound effects
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sounds for different alert types
    switch (type) {
      case 'follow':
        oscillator.frequency.value = 523.25; // C5
        break;
      case 'subscription':
        oscillator.frequency.value = 659.25; // E5
        break;
      case 'donation':
        oscillator.frequency.value = 783.99; // G5
        break;
      case 'raid':
        oscillator.frequency.value = 880.00; // A5
        break;
    }

    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const showAlertToast = (alert: Alert) => {
    const messages = {
      follow: `${alert.username} právě začal sledovat!`,
      subscription: `${alert.username} se stal předplatitelem!`,
      donation: `${alert.username} daroval ${alert.amount} Kč! ${alert.message || ''}`,
      raid: `${alert.username} přivedl ${alert.amount} diváků!`,
    };

    toast.success(messages[alert.type], {
      duration: 5000,
    });
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'follow':
        return <Heart className="w-12 h-12 text-pink-500 fill-pink-500" />;
      case 'subscription':
        return <Star className="w-12 h-12 text-yellow-500 fill-yellow-500" />;
      case 'donation':
        return <DollarSign className="w-12 h-12 text-green-500" />;
      case 'raid':
        return <Gift className="w-12 h-12 text-purple-500" />;
    }
  };

  const getAlertTitle = (alert: Alert) => {
    switch (alert.type) {
      case 'follow':
        return 'Nový Follower!';
      case 'subscription':
        return 'Nový Předplatitel!';
      case 'donation':
        return `${alert.amount} Kč Dar!`;
      case 'raid':
        return `Raid! ${alert.amount} diváků`;
    }
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case 'follow':
        return 'from-pink-500/20 to-pink-500/5 border-pink-500/50';
      case 'subscription':
        return 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/50';
      case 'donation':
        return 'from-green-500/20 to-green-500/5 border-green-500/50';
      case 'raid':
        return 'from-purple-500/20 to-purple-500/5 border-purple-500/50';
    }
  };

  if (!enabled || !activeAlert) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-5 duration-500">
      <Card className={`p-6 bg-gradient-to-br ${getAlertColor(activeAlert.type)} border-2 shadow-2xl min-w-[400px]`}>
        <div className="flex items-center gap-4">
          <div className="animate-bounce">
            {getAlertIcon(activeAlert.type)}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-1">
              {getAlertTitle(activeAlert)}
            </h3>
            <p className="text-lg font-semibold text-muted-foreground">
              {activeAlert.username}
            </p>
            {activeAlert.message && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{activeAlert.message}"
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
