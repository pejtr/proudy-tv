import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, AlertCircle } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface ChatMessage {
  id: string;
  userId: number;
  username: string;
  message: string;
  timestamp: Date;
  moderated?: boolean;
}

interface ChatProps {
  streamId: number;
  className?: string;
}

export default function Chat({ streamId, className = '' }: ChatProps) {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
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
      path: '/api/socket.io',
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
      socket.emit('join-stream', { streamId });
    });

    socket.on('disconnect', () => {
      console.log('Chat disconnected');
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to chat. Retrying...');
    });

    // Receive new messages
    socket.on('chat-message', (message: ChatMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Receive message moderation result
    socket.on('message-moderated', ({ messageId, reason }: { messageId: string; reason: string }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, moderated: true, message: `[Message removed: ${reason}]` }
          : msg
      ));
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

    socketRef.current.emit('send-message', { streamId, ...message });
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
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Be the first to chat!</p>
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
                    {msg.message}
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
