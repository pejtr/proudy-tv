import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string | null>(null);
  
  const verifyMutation = trpc.auth.verifyEmail.useMutation({
    onSuccess: () => {
      setTimeout(() => navigate("/dashboard"), 3000);
    },
  });

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");
    
    if (tokenParam) {
      setToken(tokenParam);
      verifyMutation.mutate({ token: tokenParam });
    }
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        {verifyMutation.isPending ? (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Ověřuji email...</h1>
            <p className="text-muted-foreground">
              Prosím počkejte, zatímco ověřujeme váš email.
            </p>
          </>
        ) : verifyMutation.isSuccess ? (
          <>
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-green-500">Email ověřen!</h1>
            <p className="text-muted-foreground mb-6">
              Váš email byl úspěšně ověřen. Nyní můžete začít streamovat.
            </p>
            <p className="text-sm text-muted-foreground">
              Budete přesměrováni na Dashboard za 3 sekundy...
            </p>
            <Link href="/dashboard">
              <Button className="mt-4 rainbow-gradient text-black font-bold">
                Přejít na Dashboard
              </Button>
            </Link>
          </>
        ) : verifyMutation.isError ? (
          <>
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-red-500">Ověření selhalo</h1>
            <p className="text-muted-foreground mb-6">
              {verifyMutation.error?.message || "Neplatný nebo expirovaný ověřovací token."}
            </p>
            <Link href="/dashboard">
              <Button variant="outline">
                Zpět na Dashboard
              </Button>
            </Link>
          </>
        ) : (
          <>
            <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Chybí ověřovací token</h1>
            <p className="text-muted-foreground mb-6">
              Prosím použijte odkaz z ověřovacího emailu.
            </p>
            <Link href="/">
              <Button variant="outline">
                Zpět na hlavní stránku
              </Button>
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
