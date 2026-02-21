import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Link as LinkIcon, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
}

export default function ShareButtons({ url, title, description }: ShareButtonsProps) {
  const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || "");

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    discord: `https://discord.com/channels/@me?text=${encodedTitle}%20${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast.success("Link zkopírován do schránky!");
    } catch (error) {
      toast.error("Nepodařilo se zkopírovat link");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-muted-foreground mr-2">Sdílet:</span>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.twitter, "_blank")}
        className="gap-2"
      >
        <Twitter className="h-4 w-4" />
        Twitter
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.facebook, "_blank")}
        className="gap-2"
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(shareLinks.discord, "_blank")}
        className="gap-2"
      >
        <MessageCircle className="h-4 w-4" />
        Discord
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="gap-2"
      >
        <LinkIcon className="h-4 w-4" />
        Kopírovat
      </Button>
    </div>
  );
}
