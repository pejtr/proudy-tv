import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Send, Users, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export default function Messages() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get user ID from URL query if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const userId = params.get('user');
    if (userId) {
      setSelectedUserId(parseInt(userId));
    }
  }, [location]);
  
  const { data: conversations, refetch: refetchConversations } = trpc.messages.getConversations.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 3000 }
  );
  
  const { data: messages, refetch: refetchMessages } = trpc.messages.getMessages.useQuery(
    { otherUserId: selectedUserId!, limit: 50 },
    { enabled: !!selectedUserId, refetchInterval: 2000 }
  );
  
  const { data: unreadCount } = trpc.messages.getUnreadCount.useQuery(
    undefined,
    { enabled: isAuthenticated, refetchInterval: 5000 }
  );
  
  const sendMessageMutation = trpc.messages.send.useMutation({
    onSuccess: () => {
      setMessageText("");
      refetchMessages();
      refetchConversations();
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });
  
  const markAsReadMutation = trpc.messages.markAsRead.useMutation({
    onSuccess: () => {
      refetchConversations();
    },
  });
  
  useEffect(() => {
    if (selectedUserId && messages) {
      markAsReadMutation.mutate({ senderId: selectedUserId });
    }
  }, [selectedUserId, messages]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedUserId) return;
    
    sendMessageMutation.mutate({
      receiverId: selectedUserId,
      message: messageText.trim(),
    });
  };
  
  const selectedConversation = conversations?.find(c => c.user.id === selectedUserId);
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign in to view messages</h2>
          <a href={getLoginUrl()}>
            <Button className="rainbow-gradient text-black">Sign In</Button>
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-black z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-2xl rainbow-text font-bold">PROUDY.TV</div>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/browse">
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link href="/feed">
              <Button variant="ghost">For You</Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost" className="relative">
                Messages
                {unreadCount && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href={`/profile/${user?.id}`}>
              <Button variant="ghost">Profile</Button>
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Messages Layout */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[350px_1fr] gap-6 h-[calc(100vh-140px)]">
          {/* Conversations List */}
          <Card className="rainbow-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-bold">Messages</h2>
            </div>
            
            <ScrollArea className="flex-1">
              {conversations && conversations.length > 0 ? (
                <div className="p-2">
                  {conversations.map((conv) => (
                    <button
                      key={conv.user.id}
                      onClick={() => setSelectedUserId(conv.user.id)}
                      className={`w-full p-4 rounded-lg text-left transition-colors mb-2 ${
                        selectedUserId === conv.user.id
                          ? 'bg-primary/20 border border-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {conv.user.avatarUrl ? (
                            <img 
                              src={conv.user.avatarUrl} 
                              alt={conv.user.name || "User"} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold truncate">
                              {conv.user.name || "Anonymous"}
                            </span>
                            {conv.unreadCount > 0 && (
                              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                                {conv.unreadCount}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.lastMessage.message}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-center p-8">
                  <div>
                    <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No conversations yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start chatting with streamers!
                    </p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </Card>
          
          {/* Chat Window */}
          <Card className="rainbow-border flex flex-col">
            {selectedUserId && selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {selectedConversation.user.avatarUrl ? (
                      <img 
                        src={selectedConversation.user.avatarUrl} 
                        alt={selectedConversation.user.name || "User"} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedConversation.user.name || "Anonymous"}</h3>
                    <Link href={`/profile/${selectedConversation.user.id}`}>
                      <span className="text-sm text-primary hover:underline cursor-pointer">
                        View Profile
                      </span>
                    </Link>
                  </div>
                </div>
                
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages && messages.length > 0 ? (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              msg.senderId === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="break-words">{msg.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        No messages yet. Start the conversation!
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      placeholder="Type a message..."
                      maxLength={2000}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!messageText.trim() || sendMessageMutation.isPending}
                      className="rainbow-gradient text-black"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
