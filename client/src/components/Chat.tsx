import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, AlertCircle, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  moderated?: boolean;
}

// Parse @mentions in message
function parseMentions(message: string, currentUsername?: string) {
  const mentionRegex = /@(\w+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let isMentioned = false;

  while ((match = mentionRegex.exec(message)) !== null) {
    // Add text before mention
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: message.substring(lastIndex, match.index),
      });
    }

    // Add mention
    const mentionedUser = match[1];
    const isCurrentUser = currentUsername && mentionedUser.toLowerCase() === currentUsername.toLowerCase();
    if (isCurrentUser) isMentioned = true;

    parts.push({
      type: 'mention',
      content: `@${mentionedUser}`,
      isCurrentUser,
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < message.length) {
    parts.push({
      type: 'text',
      content: message.substring(lastIndex),
    });
  }

  return { parts, isMentioned };
}

interface ChatProps {
  streamId: number;
  className?: string;
}

export default function Chat({ streamId, className = '' }: ChatProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
    // Connect to Socket.io server
    const socket = io({
      path: '/socket.io/',
      transports: ['websocket', 'polling'], // Fallback to polling if WebSocket fails
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Chat connected');
      setIsConnected(true);
      setError(null);
      
      // Join stream room
      socket.emit('join_stream', streamId);
    });

    socket.on('disconnect', () => {
      console.log('Chat disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to chat. Retrying...');
    });

    // Receive chat history
    socket.on('chat_history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    // Receive new messages
    socket.on('new_message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Receive message blocked notification
    socket.on('message_blocked', ({ reason, message }: { reason: string; message: string }) => {
      setError(message);
      setTimeout(() => setError(null), 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, [streamId]);

  const sendMessage = () => {
    if (!inputMessage.trim() || !isAuthenticated || !socketRef.current) return;

    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      userId: user!.id,
      username: user!.name || 'Anonymous',
      message: inputMessage.trim(),
    };

    socketRef.current.emit('send_message', {
      streamId,
      userId: user!.id,
      username: user!.name || 'Anonymous',
      message: inputMessage.trim(),
    });
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
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
        {error && (
          <p className="text-sm text-red-500 mt-2">{error}</p>
        )}
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
            messages.map((msg) => (
              <div key={msg.id} className="group">
                <div className="flex items-start gap-2">
                  {/* Username */}
                  <span className="font-bold text-sm text-primary min-w-[80px]">
                    {msg.username}:
                  </span>
                  {/* Message */}
                  <span className={`text-sm break-words flex-1 ${
                    msg.moderated ? 'text-muted-foreground italic' : 'text-foreground'
                  }`}>
                    {(() => {
                      const { parts, isMentioned } = parseMentions(msg.message, user?.name || undefined);
                      return (
                        <span className={isMentioned ? 'bg-primary/20 px-1 rounded' : ''}>
                          {parts.map((part, idx) => (
                            part.type === 'mention' ? (
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
                            ) : (
                              <span key={idx}>{part.content}</span>
                            )
                          ))}
                        </span>
                      );
                    })()}
                  </span>
                </div>
                {/* Timestamp */}
                <div className="text-xs text-muted-foreground ml-[88px] opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
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
              onKeyPress={handleKeyPress}
              placeholder="Send a message..."
              disabled={!isConnected}
              className="flex-1"
              maxLength={500}
            />
            
            {/* Emoji Picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  type="button"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 border-0" align="end">
                <EmojiPicker
                  onEmojiClick={(emojiData: EmojiClickData) => {
                    setInputMessage(prev => prev + emojiData.emoji);
                    setShowEmojiPicker(false);
                  }}
                  width={350}
                  height={400}
                />
              </PopoverContent>
            </Popover>
            
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
