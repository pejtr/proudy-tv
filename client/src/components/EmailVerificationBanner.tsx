import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Mail, Check } from "lucide-react";
import { toast } from "sonner";

interface EmailVerificationBannerProps {
  email: string | null;
}

export default function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [emailSent, setEmailSent] = useState(false);
  
  const sendVerificationMutation = trpc.auth.sendVerificationEmail.useMutation({
    onSuccess: () => {
      setEmailSent(true);
      toast.success("Ověřovací email odeslán!");
    },
    onError: (error) => {
      toast.error(error.message || "Nepodařilo se odeslat email");
    },
  });

  const handleSendEmail = () => {
    sendVerificationMutation.mutate();
  };

  return (
    <Card className="p-6 bg-yellow-500/10 border-yellow-500/30">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">Ověřte svůj email</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Pro začátek streamování musíte ověřit svůj email <strong>{email}</strong>.
            Klikněte na tlačítko níže a odešleme vám ověřovací odkaz.
          </p>
          <Button
            onClick={handleSendEmail}
            disabled={sendVerificationMutation.isPending || emailSent}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
          >
            {sendVerificationMutation.isPending ? (
              <>
                <Mail className="mr-2 h-4 w-4 animate-pulse" />
                Odesílám...
              </>
            ) : emailSent ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Email odeslán
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Odeslat ověřovací email
              </>
            )}
          </Button>
          {emailSent && (
            <p className="text-xs text-muted-foreground mt-2">
              Zkontrolujte svou emailovou schránku a klikněte na ověřovací odkaz.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
