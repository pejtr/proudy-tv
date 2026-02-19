import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, AlertCircle, Smile, Coins, Volume2 } from 'lucide-react';
import EmotePicker, { renderEmotesInMessage } from '@/components/EmotePicker';
import VerifiedBadge from '@/components/VerifiedBadge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  moderated?: boolean;
  highlighted?: boolean;
  highlightAmount?: number;
  ttsEnabled?: boolean;
  emailVerified?: boolean;
}

// Parse @mentions in message
function parseMentions(message: string, currentUsername?: string) {
  const mentionRegex = /@(\w+)/g;
  const parts: { type: string; content: string; isCurrentUser?: boolean }[] = [];
  let lastIndex = 0;
  let match;
  let isMentioned = false;

  while ((match = mentionRegex.exec(message)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: message.substring(lastIndex, match.index) });
    }
    const mentionedUser = match[1];
    const isCurrentUser = currentUsername ? mentionedUser.toLowerCase() === currentUsername.toLowerCase() : false;
    if (isCurrentUser) isMentioned = true;
    parts.push({ type: 'mention', content: `@${mentionedUser}`, isCurrentUser });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < message.length) {
    parts.push({ type: 'text', content: message.substring(lastIndex) });
  }

  return { parts, isMentioned };
}

// Czech TTS voices available
const CZECH_VOICES = [
  { id: 'cs-female-1', name: 'Eva (žena)', lang: 'cs-CZ' },
  { id: 'cs-female-2', name: 'Jana (žena)', lang: 'cs-CZ' },
  { id: 'cs-male-1', name: 'Tomáš (muž)', lang: 'cs-CZ' },
  { id: 'cs-male-2', name: 'Petr (muž)', lang: 'cs-CZ' },
];

const HIGHLIGHT_AMOUNTS = [50, 100, 200, 300, 500, 1000];

interface ChatProps {
  streamId: number;
  className?: string;
}

export default function Chat({ streamId, className = '' }: ChatProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmotePicker, setShowEmotePicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // TTS Highlight state
  const [showHighlightDialog, setShowHighlightDialog] = useState(false);
  const [highlightAmount, setHighlightAmount] = useState(50);
  const [highlightMessage, setHighlightMessage] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('cs-female-1');
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  // TTS Queue
  const ttsQueueRef = useRef<ChatMessage[]>([]);
  const isSpeakingRef = useRef(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // TTS playback system
  const speakMessage = (msg: ChatMessage) => {
    if (!('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(msg.message);
    utterance.lang = 'cs-CZ';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    // Try to find Czech voice
    const voices = speechSynthesis.getVoices();
    const czechVoice = voices.find(v => v.lang.startsWith('cs'));
    if (czechVoice) utterance.voice = czechVoice;
    
    utterance.onend = () => {
      isSpeakingRef.current = false;
      processNextTTS();
    };
    
    isSpeakingRef.current = true;
    speechSynthesis.speak(utterance);
  };

  const processNextTTS = () => {
    if (isSpeakingRef.current || ttsQueueRef.current.length === 0) return;
    const next = ttsQueueRef.current.shift();
    if (next) speakMessage(next);
  };

  // WebSocket connection
  useEffect(() => {
    const socket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      socket.emit('join_stream', streamId);
    });

    socket.on('disconnect', () => setIsConnected(false));

    socket.on('connect_error', (err: Error) => {
      console.error('Connection error:', err);
      setError('Failed to connect to chat. Retrying...');
    });

    socket.on('chat_history', (history: ChatMessage[]) => setMessages(history));

    socket.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
      // Add highlighted TTS messages to queue
      if (message.highlighted && message.ttsEnabled) {
        ttsQueueRef.current.push(message);
        processNextTTS();
      }
    });

    socket.on('message_blocked', ({ reason, message }: { reason: string; message: string }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => { socket.disconnect(); };
  }, [streamId]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !isAuthenticated || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      streamId,
      userId: user!.id,
      username: user!.name || 'Anonymous',
      message: inputMessage.trim(),
    });
    setInputMessage('');
  };

  const sendHighlightedMessage = () => {
    if (!highlightMessage.trim() || !isAuthenticated || !socketRef.current) return;

    socketRef.current.emit('send_message', {
      streamId,
      userId: user!.id,
      username: user!.name || 'Anonymous',
      message: highlightMessage.trim(),
      highlighted: true,
      highlightAmount,
      ttsEnabled,
      voiceId: selectedVoice,
    });
    setHighlightMessage('');
    setShowHighlightDialog(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmoteSelect = (emoteCode: string) => {
    setInputMessage(prev => prev + ' ' + emoteCode + ' ');
    setShowEmotePicker(false);
  };

  return (
    <div className={`flex flex-col h-full bg-background border border-border rounded-lg ${className}`}>
      {/* Chat Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Chat</h3>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-green-500 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Connected
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                Connecting...
              </div>
            )}
          </div>
        </div>
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {/* Welcome Message */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
            <p className="text-sm text-center">
              👋 <span className="font-semibold">Vítáme vás v chatu!</span> Chovejte se přátelsky a respektujte ostatní. 💬
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Zatím žádné zprávy. Buďte první kdo napíše!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isHighlighted = msg.highlighted;
              return (
                <div 
                  key={msg.id} 
                  className={`group ${isHighlighted ? 'relative' : ''}`}
                >
                  {/* Highlighted message wrapper */}
                  {isHighlighted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-lg -m-2 p-2 border border-primary/30 animate-pulse" />
                  )}
                  
                  <div className={`relative ${isHighlighted ? 'p-2' : ''}`}>
                    {/* Highlight amount badge */}
                    {isHighlighted && msg.highlightAmount && (
                      <div className="flex items-center gap-1 mb-1">
                        <Coins className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs font-bold text-yellow-500">
                          {msg.highlightAmount} coins
                        </span>
                        {msg.ttsEnabled && (
                          <Volume2 className="h-3 w-3 text-cyan-500 ml-1" />
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2">
                      <span className={`font-bold text-sm min-w-[80px] flex items-center gap-1 ${isHighlighted ? 'text-yellow-500' : 'text-primary'}`}>
                        {msg.username}
                        {msg.emailVerified && <VerifiedBadge verified={true} size="sm" showTooltip={false} />}
                        :
                      </span>
                      <span className={`text-sm break-words flex-1 ${
                        msg.moderated ? 'text-muted-foreground italic' : 'text-foreground'
                      }`}>
                        {(() => {
                          const { parts, isMentioned } = parseMentions(msg.message, user?.name || undefined);
                          return (
                            <span className={isMentioned ? 'bg-primary/20 px-1 rounded' : ''}>
                              {parts.map((part, idx) => {
                                if (part.type === 'mention') {
                                  return (
                                    <span
                                      key={idx}
                                      className={`font-bold ${
                                        part.isCurrentUser
                                          ? 'text-primary bg-primary/10 px-1 rounded'
                                          : 'text-blue-500'
                                      }`}
                                    >
                                      {part.content}
                                    </span>
                                  );
                                }
                                // Render emotes in text parts
                                const emoteParts = renderEmotesInMessage(part.content);
                                return emoteParts.map((ep, epIdx) => (
                                  <span key={`${idx}-${epIdx}`}>{ep}</span>
                                ));
                              })}
                            </span>
                          );
                        })()}
                      </span>
                    </div>
                    
                    <div className="text-xs text-muted-foreground ml-[88px] opacity-0 group-hover:opacity-100 transition-opacity">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border">
        {isAuthenticated ? (
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Send a message..."
              disabled={!isConnected}
              className="flex-1"
              maxLength={500}
            />
            
            {/* Emote Picker */}
            <Popover open={showEmotePicker} onOpenChange={setShowEmotePicker}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" type="button">
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-0" align="end" side="top">
                <EmotePicker onEmoteSelect={handleEmoteSelect} />
              </PopoverContent>
            </Popover>

            {/* TTS Highlight Button */}
            <Dialog open={showHighlightDialog} onOpenChange={setShowHighlightDialog}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  type="button"
                  className="text-yellow-500 hover:text-yellow-400 hover:border-yellow-500/50"
                  title="Zvýrazněná zpráva s TTS (50+ coins)"
                >
                  <Coins className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    Zvýrazněná zpráva s TTS
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  {/* Amount selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Počet coins</label>
                    <div className="grid grid-cols-3 gap-2">
                      {HIGHLIGHT_AMOUNTS.map(amount => (
                        <Button
                          key={amount}
                          variant={highlightAmount === amount ? 'default' : 'outline'}
                          onClick={() => setHighlightAmount(amount)}
                          className={highlightAmount === amount ? 'rainbow-border' : ''}
                        >
                          {amount} 💎
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Voice selection */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Český hlas</label>
                    <div className="grid grid-cols-2 gap-2">
                      {CZECH_VOICES.map(voice => (
                        <Button
                          key={voice.id}
                          variant={selectedVoice === voice.id ? 'default' : 'outline'}
                          onClick={() => setSelectedVoice(voice.id)}
                          size="sm"
                        >
                          {voice.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* TTS toggle */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="tts-toggle"
                      checked={ttsEnabled}
                      onChange={(e) => setTtsEnabled(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="tts-toggle" className="text-sm flex items-center gap-1">
                      <Volume2 className="h-4 w-4" />
                      Robot přečte zprávu nahlas
                    </label>
                  </div>

                  {/* Message input */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Vaše zpráva</label>
                    <Input
                      value={highlightMessage}
                      onChange={(e) => setHighlightMessage(e.target.value)}
                      placeholder="Napište zvýrazněnou zprávu..."
                      maxLength={300}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {highlightMessage.length}/300 znaků
                    </p>
                  </div>

                  {/* Preview */}
                  <div className="bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-lg p-3 border border-primary/30">
                    <div className="flex items-center gap-1 mb-1">
                      <Coins className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-bold text-yellow-500">{highlightAmount} coins</span>
                      {ttsEnabled && <Volume2 className="h-3 w-3 text-cyan-500 ml-1" />}
                    </div>
                    <p className="text-sm">
                      <span className="font-bold text-yellow-500">{user?.name}:</span>{' '}
                      {highlightMessage || 'Preview zprávy...'}
                    </p>
                  </div>

                  {/* Send button */}
                  <Button
                    onClick={sendHighlightedMessage}
                    disabled={!highlightMessage.trim()}
                    className="w-full rainbow-border"
                  >
                    Odeslat za {highlightAmount} coins 💎
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || !isConnected}
              size="icon"
              className="rainbow-border"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>Login to chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
