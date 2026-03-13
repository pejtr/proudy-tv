import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Filter, Eye, EyeOff, Settings2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type Platform = 'proudy' | 'twitch' | 'youtube' | 'kick' | 'facebook';

export interface SplitChatMessage {
  id: string;
  platform: Platform;
  username: string;
  displayName?: string;
  message: string;
  userColor?: string;
  badges?: string[];
  isSubscriber?: boolean;
  isModerator?: boolean;
  isVip?: boolean;
  timestamp: Date;
  // For PROUDY native messages
  emailVerified?: boolean;
  partnerTier?: 'basic' | 'affiliate' | 'partner';
}

const PLATFORM_CONFIG: Record<Platform, { label: string; color: string; bgColor: string; textColor: string; icon: string }> = {
  proudy: {
    label: 'PROUDY',
    color: '#7c3aed',
    bgColor: 'bg-purple-600',
    textColor: 'text-purple-300',
    icon: '🌊',
  },
  twitch: {
    label: 'Twitch',
    color: '#9146ff',
    bgColor: 'bg-[#9146ff]',
    textColor: 'text-[#bf94ff]',
    icon: '🟣',
  },
  youtube: {
    label: 'YouTube',
    color: '#ff0000',
    bgColor: 'bg-red-600',
    textColor: 'text-red-400',
    icon: '🔴',
  },
  kick: {
    label: 'Kick',
    color: '#53fc18',
    bgColor: 'bg-[#53fc18]',
    textColor: 'text-[#53fc18]',
    icon: '🟢',
  },
  facebook: {
    label: 'Facebook',
    color: '#1877f2',
    bgColor: 'bg-blue-600',
    textColor: 'text-blue-400',
    icon: '🔵',
  },
};

// Simulated external platform messages for demo
function generateDemoMessages(streamId: number): SplitChatMessage[] {
  const now = new Date();
  return [
    {
      id: `twitch-demo-1`,
      platform: 'twitch',
      username: 'TwitchFan_CZ',
      message: 'Zdravím z Twitche! 👋',
      userColor: '#9146ff',
      badges: ['subscriber'],
      isSubscriber: true,
      timestamp: new Date(now.getTime() - 120000),
    },
    {
      id: `youtube-demo-1`,
      platform: 'youtube',
      username: 'YT_Divák',
      message: 'Super stream! Přišel jsem z YouTube',
      userColor: '#ff0000',
      timestamp: new Date(now.getTime() - 90000),
    },
    {
      id: `kick-demo-1`,
      platform: 'kick',
      username: 'KickWatcher',
      message: 'Kick komunita pozdravuje! 🎮',
      userColor: '#53fc18',
      badges: ['subscriber', 'vip'],
      isSubscriber: true,
      isVip: true,
      timestamp: new Date(now.getTime() - 60000),
    },
    {
      id: `twitch-demo-2`,
      platform: 'twitch',
      username: 'StreamerBro',
      message: 'PROUDY.TV je nejlepší! Konečně pořádná česká platforma',
      userColor: '#ff69b4',
      badges: ['moderator'],
      isModerator: true,
      timestamp: new Date(now.getTime() - 30000),
    },
  ];
}

interface SplitChatProps {
  streamId: number;
  className?: string;
  activePlatforms?: Platform[];
}

export default function SplitChat({ streamId, className, activePlatforms }: SplitChatProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<SplitChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [enabledPlatforms, setEnabledPlatforms] = useState<Set<Platform>>(
    new Set((activePlatforms || ['proudy', 'twitch', 'youtube', 'kick']) as Platform[])
  );
  const [showPlatformBadges, setShowPlatformBadges] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Platform message counts
  const platformCounts = messages.reduce((acc, msg) => {
    acc[msg.platform] = (acc[msg.platform] || 0) + 1;
    return acc;
  }, {} as Record<Platform, number>);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Setup Socket.io connection
  useEffect(() => {
    const newSocket = io(window.location.origin, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join_stream', streamId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // PROUDY native chat messages
    newSocket.on('new_message', (data: any) => {
      const msg: SplitChatMessage = {
        id: `proudy-${data.id || Date.now()}`,
        platform: 'proudy',
        username: data.username,
        message: data.message,
        timestamp: new Date(data.timestamp || Date.now()),
        emailVerified: data.emailVerified,
        partnerTier: data.partnerTier,
      };
      setMessages(prev => [...prev.slice(-200), msg]);
    });

    // External platform chat messages (from split chat bridge)
    newSocket.on('split_chat_message', (data: SplitChatMessage) => {
      setMessages(prev => [...prev.slice(-200), { ...data, timestamp: new Date(data.timestamp) }]);
    });

    // Chat history (PROUDY messages)
    newSocket.on('chat_history', (history: any[]) => {
      const historyMsgs: SplitChatMessage[] = history.map(h => ({
        id: `proudy-${h.id}`,
        platform: 'proudy' as Platform,
        username: h.username,
        message: h.message,
        timestamp: new Date(h.createdAt || h.created_at || Date.now()),
        emailVerified: h.emailVerified,
        partnerTier: h.partnerTier,
      }));
      // Add demo messages from external platforms
      const demoMsgs = generateDemoMessages(streamId);
      const allMsgs = [...demoMsgs, ...historyMsgs].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
      setMessages(allMsgs);
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave_stream', streamId);
      newSocket.disconnect();
    };
  }, [streamId]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !isAuthenticated || !user) {
      if (!isAuthenticated) toast.error('Přihlas se pro chatování');
      return;
    }
    if (isSending) return;

    setIsSending(true);
    try {
      socket?.emit('send_message', {
        streamId,
        userId: user.id,
        username: user.name || 'Anonym',
        message: inputMessage.trim(),
      });
      setInputMessage('');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const togglePlatform = (platform: Platform) => {
    setEnabledPlatforms(prev => {
      const next = new Set(prev);
      if (next.has(platform)) {
        if (next.size > 1) next.delete(platform); // Keep at least one
      } else {
        next.add(platform);
      }
      return next;
    });
  };

  const filteredMessages = messages.filter(m => enabledPlatforms.has(m.platform));

  const renderPlatformBadge = (platform: Platform) => {
    const cfg = PLATFORM_CONFIG[platform];
    if (!showPlatformBadges || platform === 'proudy') return null;
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1 py-0.5 rounded mr-1 opacity-90"
        style={{ backgroundColor: cfg.color + '33', color: cfg.color, border: `1px solid ${cfg.color}44` }}
      >
        {cfg.icon} {cfg.label}
      </span>
    );
  };

  const renderUsername = (msg: SplitChatMessage) => {
    const color = msg.userColor || (msg.platform === 'proudy' ? '#a78bfa' : PLATFORM_CONFIG[msg.platform].color);
    return (
      <span className="font-semibold text-sm" style={{ color }}>
        {msg.isModerator && <span className="text-green-400 mr-0.5">⚔</span>}
        {msg.isVip && <span className="text-yellow-400 mr-0.5">💎</span>}
        {msg.isSubscriber && !msg.isModerator && <span className="mr-0.5">⭐</span>}
        {msg.displayName || msg.username}
      </span>
    );
  };

  return (
    <div className={cn('flex flex-col bg-card border border-border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Split Chat</span>
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            )}
          />
          <span className="text-xs text-muted-foreground">
            {filteredMessages.length} zpráv
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Platform filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="text-xs">Platformy</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(PLATFORM_CONFIG) as Platform[]).map(platform => (
                <DropdownMenuCheckboxItem
                  key={platform}
                  checked={enabledPlatforms.has(platform)}
                  onCheckedChange={() => togglePlatform(platform)}
                >
                  <span className="flex items-center gap-2">
                    <span>{PLATFORM_CONFIG[platform].icon}</span>
                    <span>{PLATFORM_CONFIG[platform].label}</span>
                    {platformCounts[platform] ? (
                      <Badge variant="secondary" className="ml-auto text-[10px] h-4">
                        {platformCounts[platform]}
                      </Badge>
                    ) : null}
                  </span>
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={showPlatformBadges}
                onCheckedChange={setShowPlatformBadges}
              >
                Zobrazit štítky platforem
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Platform stats bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/50 bg-muted/10 overflow-x-auto">
        {(Object.keys(PLATFORM_CONFIG) as Platform[]).map(platform => {
          const cfg = PLATFORM_CONFIG[platform];
          const count = platformCounts[platform] || 0;
          const isEnabled = enabledPlatforms.has(platform);
          return (
            <button
              key={platform}
              onClick={() => togglePlatform(platform)}
              className={cn(
                'flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-all whitespace-nowrap',
                isEnabled ? 'opacity-100' : 'opacity-40'
              )}
              style={{
                backgroundColor: isEnabled ? cfg.color + '22' : 'transparent',
                color: cfg.color,
                border: `1px solid ${isEnabled ? cfg.color + '44' : 'transparent'}`,
              }}
            >
              {cfg.icon} {cfg.label}
              {count > 0 && <span className="opacity-70">({count})</span>}
            </button>
          );
        })}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="px-3 py-2 space-y-1">
          {filteredMessages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-8">
              <div className="text-2xl mb-2">💬</div>
              <p>Zatím žádné zprávy</p>
              <p className="text-xs mt-1">Zprávy ze všech platforem se zobrazí zde</p>
            </div>
          )}
          {filteredMessages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'text-sm leading-relaxed py-0.5 px-1 rounded transition-colors hover:bg-muted/20',
                msg.platform !== 'proudy' && 'border-l-2'
              )}
              style={
                msg.platform !== 'proudy'
                  ? { borderLeftColor: PLATFORM_CONFIG[msg.platform].color + '66' }
                  : undefined
              }
            >
              {renderPlatformBadge(msg.platform)}
              {renderUsername(msg)}
              <span className="text-muted-foreground mx-1">:</span>
              <span className="text-foreground/90">{msg.message}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-2 border-t border-border">
        {isAuthenticated ? (
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Napište zprávu... (odešle se na PROUDY)"
              className="flex-1 h-8 text-sm bg-muted/30"
              maxLength={500}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending}
              size="sm"
              className="h-8 px-3 bg-purple-600 hover:bg-purple-700"
            >
              <Send className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-1">
            <a href="/api/oauth/login" className="text-purple-400 hover:underline">Přihlas se</a> pro chatování
          </p>
        )}
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          Zprávy ze Twitche, YouTube a Kicku jsou zobrazeny v reálném čase
        </p>
      </div>
    </div>
  );
}

export { PLATFORM_CONFIG };
