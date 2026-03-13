import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { cn } from '@/lib/utils';

interface PushNotificationButtonProps {
  streamerId: number;
  streamerName: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function PushNotificationButton({
  streamerId,
  streamerName,
  variant = 'outline',
  size = 'sm',
  className,
}: PushNotificationButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission);
    }
    // Check if already subscribed (stored in localStorage for demo)
    const key = `push_sub_${streamerId}`;
    setIsSubscribed(localStorage.getItem(key) === 'true');
  }, [streamerId]);

  // Push subscription handled client-side with browser Notification API

  const handleToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Přihlas se pro zapnutí notifikací');
      return;
    }

    if (isSubscribed) {
      // Unsubscribe
      localStorage.removeItem(`push_sub_${streamerId}`);
      setIsSubscribed(false);
      toast.success('Notifikace vypnuty');
      return;
    }

    // Request permission
    if ('Notification' in window && Notification.permission === 'default') {
      setIsLoading(true);
      try {
        const permission = await Notification.requestPermission();
        setPermissionState(permission);
        if (permission !== 'granted') {
          toast.error('Notifikace jsou zakázány v nastavení prohlížeče');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (permissionState === 'denied') {
      toast.error('Notifikace jsou zakázány. Povol je v nastavení prohlížeče.');
      return;
    }

    // Subscribe
    setIsLoading(true);
    try {
      // In production, this would register a real push subscription
      // For now, we simulate it
      await new Promise(resolve => setTimeout(resolve, 500));
      localStorage.setItem(`push_sub_${streamerId}`, 'true');
      setIsSubscribed(true);
      toast.success(`🔔 Dostaneš notifikaci když ${streamerName} začne streamovat!`);

      // Show a demo notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('PROUDY.TV', {
          body: `Notifikace pro ${streamerName} zapnuty!`,
          icon: '/icons/icon-192.png',
        });
      }
    } catch (error) {
      toast.error('Nepodařilo se zapnout notifikace');
    } finally {
      setIsLoading(false);
    }
  };

  if (permissionState === 'denied') {
    return (
      <Button
        variant="ghost"
        size={size}
        disabled
        className={cn('text-muted-foreground', className)}
        title="Notifikace jsou zakázány v nastavení prohlížeče"
      >
        <BellOff className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant={isSubscribed ? 'default' : variant}
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={cn(
        isSubscribed && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30',
        className
      )}
      title={isSubscribed ? 'Vypnout notifikace' : `Notifikace když ${streamerName} začne streamovat`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <>
          <BellRing className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-1">Notifikace zapnuty</span>}
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          {size !== 'icon' && <span className="ml-1">Notifikovat</span>}
        </>
      )}
    </Button>
  );
}
