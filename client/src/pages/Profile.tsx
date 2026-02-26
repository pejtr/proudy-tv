import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { Camera, Save, Twitter, Instagram, Youtube, Music, MessageCircle, Heart, Users } from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { storagePut } from "../../../server/storage";

export default function Profile() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { user: currentUser, isAuthenticated } = useAuth();
  const profileUserId = id ? parseInt(id) : currentUser?.id;
  
  const { data: profile, isLoading, refetch } = trpc.profile.get.useQuery(
    { userId: profileUserId! },
    { enabled: !!profileUserId }
  );
  
  const { data: followerCount } = trpc.follows.getFollowerCount.useQuery(
    { userId: profileUserId! },
    { enabled: !!profileUserId }
  );
  
  const { data: isFollowing } = trpc.follows.isFollowing.useQuery(
    { userId: profileUserId! },
    { enabled: !!profileUserId && !!currentUser && profileUserId !== currentUser.id }
  );
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinks, setSocialLinks] = useState({
    twitter: "",
    instagram: "",
    youtube: "",
    tiktok: "",
    discord: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      refetch();
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
  
  const updateAvatarMutation = trpc.profile.updateAvatar.useMutation({
    onSuccess: () => {
      toast.success("Avatar updated!");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update avatar");
    },
  });
  
  const followMutation = trpc.follows.follow.useMutation({
    onSuccess: () => {
      toast.success("Followed!");
      refetch();
    },
  });
  
  const unfollowMutation = trpc.follows.unfollow.useMutation({
    onSuccess: () => {
      toast.success("Unfollowed");
      refetch();
    },
  });
  
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      if (profile.socialLinks) {
        try {
          const links = typeof profile.socialLinks === 'string' 
            ? JSON.parse(profile.socialLinks) 
            : profile.socialLinks;
          setSocialLinks({ ...socialLinks, ...links });
        } catch (e) {
          console.error("Failed to parse social links", e);
        }
      }
    }
  }, [profile]);
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large. Max 5MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSaveProfile = async () => {
    // Upload avatar if changed
    if (avatarFile) {
      try {
        const formData = new FormData();
        formData.append('file', avatarFile);
        
        // Upload to your server endpoint that uses storagePut
        const response = await fetch('/api/upload-avatar', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const { url } = await response.json();
          await updateAvatarMutation.mutateAsync({ avatarUrl: url });
        }
      } catch (error) {
        toast.error("Failed to upload avatar");
        return;
      }
    }
    
    // Update profile info
    await updateProfileMutation.mutateAsync({
      name: name || undefined,
      bio: bio || undefined,
      socialLinks,
    });
  };
  
  const handleFollowToggle = () => {
    if (!profileUserId) return;
    if (isFollowing) {
      unfollowMutation.mutate({ userId: profileUserId });
    } else {
      followMutation.mutate({ userId: profileUserId });
    }
  };
  
  const isOwnProfile = currentUser?.id === profileUserId;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-black z-50">
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
              <Button variant="ghost">Messages</Button>
            </Link>
            {isAuthenticated && (
              <Link href={`/profile/${currentUser?.id}`}>
                <Button variant="ghost">Profile</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      {/* Profile Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="rainbow-border p-8">
          {/* Avatar and Header */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {(avatarPreview || profile.avatarUrl) ? (
                  <img 
                    src={avatarPreview || profile.avatarUrl!} 
                    alt={profile.name || "Avatar"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="w-16 h-16 text-muted-foreground" />
                )}
              </div>
              
              {isOwnProfile && isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              {isEditing ? (
                <>
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label>Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {bio.length}/500 characters
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                      {profile.name || "Anonymous"}
                      <VerifiedBadge verified={profile.emailVerified || false} size="lg" />
                    </h1>
                    <p className="text-muted-foreground">
                      {followerCount || 0} followers
                    </p>
                  </div>
                  
                  {profile.bio && (
                    <p className="text-foreground">{profile.bio}</p>
                  )}

                  {/* Email Verification Status */}
                  <div className="flex items-center gap-2 text-sm">
                    {profile.emailVerified ? (
                      <span className="text-blue-500 flex items-center gap-1">
                        <VerifiedBadge verified={true} size="sm" showTooltip={false} />
                        Email ověřen
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        Email neověřen
                      </span>
                    )}
                  </div>
                </>
              )}
              
              {/* Social Links */}
              <div className="space-y-2">
                <Label>Social Links</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {isEditing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-blue-400" />
                        <Input
                          value={socialLinks.twitter}
                          onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                          placeholder="Twitter username"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-400" />
                        <Input
                          value={socialLinks.instagram}
                          onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                          placeholder="Instagram username"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-400" />
                        <Input
                          value={socialLinks.youtube}
                          onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                          placeholder="YouTube channel"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-purple-400" />
                        <Input
                          value={socialLinks.tiktok}
                          onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                          placeholder="TikTok username"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-indigo-400" />
                        <Input
                          value={socialLinks.discord}
                          onChange={(e) => setSocialLinks({ ...socialLinks, discord: e.target.value })}
                          placeholder="Discord username"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      {socialLinks.twitter && (
                        <a href={`https://twitter.com/${socialLinks.twitter}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:underline">
                          <Twitter className="w-4 h-4" />
                          @{socialLinks.twitter}
                        </a>
                      )}
                      {socialLinks.instagram && (
                        <a href={`https://instagram.com/${socialLinks.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-pink-400 hover:underline">
                          <Instagram className="w-4 h-4" />
                          @{socialLinks.instagram}
                        </a>
                      )}
                      {socialLinks.youtube && (
                        <a href={`https://youtube.com/${socialLinks.youtube}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-red-400 hover:underline">
                          <Youtube className="w-4 h-4" />
                          {socialLinks.youtube}
                        </a>
                      )}
                      {socialLinks.tiktok && (
                        <a href={`https://tiktok.com/@${socialLinks.tiktok}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-400 hover:underline">
                          <Music className="w-4 h-4" />
                          @{socialLinks.tiktok}
                        </a>
                      )}
                      {socialLinks.discord && (
                        <div className="flex items-center gap-2 text-indigo-400">
                          <MessageCircle className="w-4 h-4" />
                          {socialLinks.discord}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {isOwnProfile ? (
                  isEditing ? (
                    <>
                      <Button onClick={handleSaveProfile} className="rainbow-gradient text-black">
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="rainbow-gradient text-black">
                      Edit Profile
                    </Button>
                  )
                ) : (
                  <>
                    <Button 
                      onClick={handleFollowToggle}
                      className={isFollowing ? "rainbow-border" : "rainbow-gradient text-black"}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setLocation(`/messages?user=${profileUserId}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
