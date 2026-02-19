import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Heart, MessageCircle, Users, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  
  // Post form
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postCategory, setPostCategory] = useState<'discussion' | 'help' | 'showcase' | 'memes' | 'announcement'>('discussion');
  
  // Group form
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  
  const { data: posts, refetch: refetchPosts } = trpc.community.getPosts.useQuery({
    category: selectedCategory,
    limit: 20,
  });
  
  const { data: groups } = trpc.community.getGroups.useQuery({ limit: 10 });
  
  const createPostMutation = trpc.community.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      setIsCreatePostOpen(false);
      setPostTitle("");
      setPostContent("");
      refetchPosts();
    },
    onError: () => {
      toast.error("Failed to create post");
    },
  });
  
  const createGroupMutation = trpc.community.createGroup.useMutation({
    onSuccess: () => {
      toast.success("Group created!");
      setIsCreateGroupOpen(false);
      setGroupName("");
      setGroupDescription("");
    },
    onError: () => {
      toast.error("Failed to create group");
    },
  });
  
  const likePostMutation = trpc.community.likePost.useMutation({
    onSuccess: () => {
      refetchPosts();
    },
  });
  
  const handleCreatePost = () => {
    if (!postTitle.trim() || !postContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    createPostMutation.mutate({
      title: postTitle,
      content: postContent,
      category: postCategory,
    });
  };
  
  const handleCreateGroup = () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    createGroupMutation.mutate({
      name: groupName,
      description: groupDescription,
    });
  };
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-black z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-2xl rainbow-text font-bold">PROUDY</div>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/browse">
              <Button variant="ghost">Browse</Button>
            </Link>
            <Link href="/feed">
              <Button variant="ghost">For You</Button>
            </Link>
            <Link href="/community">
              <Button variant="ghost" className="text-primary">Community</Button>
            </Link>
            <Link href="/messages">
              <Button variant="ghost">Messages</Button>
            </Link>
            {isAuthenticated && (
              <Link href={`/profile/${user?.id}`}>
                <Button variant="ghost">Profile</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          {/* Main Content */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold gradient-text-animated">Friendly Komunita</h1>
                <p className="text-muted-foreground mt-2">
                  Diskutujte, sdílejte a spojte se s komunitou
                </p>
              </div>
              
              {isAuthenticated && (
                <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
                  <DialogTrigger asChild>
                    <Button className="rainbow-gradient text-black">
                      <Plus className="w-4 h-4 mr-2" />
                      Nový Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Vytvořit nový post</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Kategorie</Label>
                        <select
                          value={postCategory}
                          onChange={(e) => setPostCategory(e.target.value as any)}
                          className="w-full p-2 rounded bg-muted border border-border"
                        >
                          <option value="discussion">Diskuze</option>
                          <option value="help">Pomoc</option>
                          <option value="showcase">Showcase</option>
                          <option value="memes">Memes</option>
                          <option value="announcement">Oznámení</option>
                        </select>
                      </div>
                      <div>
                        <Label>Nadpis</Label>
                        <Input
                          value={postTitle}
                          onChange={(e) => setPostTitle(e.target.value)}
                          placeholder="Zadejte nadpis..."
                          maxLength={255}
                        />
                      </div>
                      <div>
                        <Label>Obsah</Label>
                        <Textarea
                          value={postContent}
                          onChange={(e) => setPostContent(e.target.value)}
                          placeholder="Co chcete sdílet?"
                          rows={6}
                        />
                      </div>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={createPostMutation.isPending}
                        className="w-full rainbow-gradient text-black"
                      >
                        Publikovat
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            
            {/* Category Filter */}
            <Tabs defaultValue="all" className="mb-6">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setSelectedCategory(undefined)}>
                  Všechny
                </TabsTrigger>
                <TabsTrigger value="discussion" onClick={() => setSelectedCategory('discussion')}>
                  Diskuze
                </TabsTrigger>
                <TabsTrigger value="help" onClick={() => setSelectedCategory('help')}>
                  Pomoc
                </TabsTrigger>
                <TabsTrigger value="showcase" onClick={() => setSelectedCategory('showcase')}>
                  Showcase
                </TabsTrigger>
                <TabsTrigger value="memes" onClick={() => setSelectedCategory('memes')}>
                  Memes
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Posts */}
            <div className="space-y-4">
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <Card key={post.id} className="rainbow-border p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        {post.user.avatarUrl ? (
                          <img 
                            src={post.user.avatarUrl} 
                            alt={post.user.name || "User"} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <Users className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{post.user.name || "Anonymous"}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-primary">
                            {post.category}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                        <p className="text-foreground mb-4 whitespace-pre-wrap">{post.content}</p>
                        
                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => isAuthenticated && likePostMutation.mutate({ postId: post.id })}
                            disabled={!isAuthenticated}
                          >
                            <Heart className="w-4 h-4 mr-2" />
                            {post.likeCount}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {post.commentCount}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            {post.viewCount}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="rainbow-border p-12 text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Žádné posty</h3>
                  <p className="text-muted-foreground">
                    Buďte první, kdo něco sdílí!
                  </p>
                </Card>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Groups */}
            <Card className="rainbow-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Skupiny</h3>
                {isAuthenticated && (
                  <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Vytvořit skupinu</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Název skupiny</Label>
                          <Input
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Zadejte název..."
                            maxLength={100}
                          />
                        </div>
                        <div>
                          <Label>Popis</Label>
                          <Textarea
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            placeholder="O čem je vaše skupina?"
                            rows={4}
                          />
                        </div>
                        <Button 
                          onClick={handleCreateGroup}
                          disabled={createGroupMutation.isPending}
                          className="w-full rainbow-gradient text-black"
                        >
                          Vytvořit
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              
              <div className="space-y-3">
                {groups && groups.length > 0 ? (
                  groups.map((group) => (
                    <div key={group.id} className="p-3 rounded bg-muted hover:bg-muted/80 cursor-pointer">
                      <div className="font-semibold">{group.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {group.memberCount} členů
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Žádné skupiny
                  </p>
                )}
              </div>
            </Card>
            
            {/* Guidelines */}
            <Card className="rainbow-border p-6">
              <h3 className="font-bold mb-4">Pravidla komunity</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✅ Buďte přátelští a respektující</li>
                <li>✅ Žádný spam nebo reklama</li>
                <li>✅ Žádné urážky nebo hate speech</li>
                <li>✅ Sdílejte relevantní obsah</li>
                <li>✅ Pomáhejte ostatním</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
