import { Share2, Copy, Facebook, Twitter, Linkedin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface ShareDialogProps {
  title: string;
  text: string;
  url?: string;
}

export default function ShareDialog({ title, text, url = window.location.href }: ShareDialogProps) {
  const { toast } = useToast();
  
  const shareData = {
    title,
    text,
    url,
  };

  const socialPlatforms = [
    {
      name: "X (Twitter)",
      icon: Twitter,
      shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "Facebook",
      icon: Facebook,
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`,
    },
  ];

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Shared successfully",
          description: "Your insight has been shared!",
        });
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Share link has been copied to clipboard",
      });
    } catch (err) {
      console.error("Error copying:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {title}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <motion.div 
            className="grid grid-cols-3 gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <motion.div
                  key={platform.name}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => window.open(platform.shareUrl, "_blank")}
                  >
                    <Icon className="h-4 w-4" />
                    {platform.name}
                  </Button>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="flex gap-2">
            {navigator.share && (
              <Button className="flex-1" onClick={handleNativeShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            <Button variant="secondary" className="flex-1" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
