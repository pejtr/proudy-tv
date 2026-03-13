import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle2, Circle, Copy, ExternalLink, Radio, Settings,
  Monitor, Zap, Trophy, ChevronRight, ChevronLeft, Rocket
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Vítejte na PROUDY.TV", icon: Rocket, description: "Začněte svou streamovací kariéru" },
  { id: 2, title: "Nastavení OBS", icon: Monitor, description: "Připojte OBS Studio k PROUDY.TV" },
  { id: 3, title: "Váš Stream Key", icon: Settings, description: "Zkopírujte svůj unikátní stream key" },
  { id: 4, title: "Test Stream", icon: Radio, description: "Otestujte připojení" },
  { id: 5, title: "Hotovo!", icon: Trophy, description: "Jste připraveni streamovat" },
];

export default function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);

  const { data: streamData } = trpc.streams.getMyStream.useQuery(undefined, {
    enabled: !!user,
  });

  const regenerateKey = trpc.streams.regenerateStreamKey.useMutation({
    onSuccess: () => toast.success("Stream key byl obnoven!"),
    onError: () => toast.error("Nepodařilo se obnovit stream key"),
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} zkopírováno!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const rtmpUrl = "rtmp://proudy.tv/live";
  const streamKey = streamData?.streamKey || "Načítání...";

  const goNext = () => {
    if (currentStep < STEPS.length) setCurrentStep(currentStep + 1);
    else navigate("/dashboard");
  };

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <img src="/proudy-logo-icon.png" alt="PROUDY.TV" className="h-10 w-10" />
        <span className="text-2xl font-bold gradient-text-animated">PROUDY.TV</span>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center gap-2 mb-8 flex-wrap justify-center">
        {STEPS.map((step, idx) => (
          <div key={step.id} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                currentStep > step.id
                  ? "bg-green-500 text-white"
                  : currentStep === step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.id ? <CheckCircle2 className="h-4 w-4" /> : step.id}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-8 ${currentStep > step.id ? "bg-green-500" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            {(() => {
              const StepIcon = STEPS[currentStep - 1].icon;
              return <StepIcon className="h-12 w-12 text-primary" />;
            })()}
          </div>
          <CardTitle className="text-2xl">{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription className="text-base">{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Welcome */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-center leading-relaxed">
                Vítejte na <strong className="text-foreground">PROUDY.TV</strong> — první české streamovací platformě
                s AR filtry, multistreaming podporou a revenue splitem až <strong className="text-primary">85/15</strong>.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "🎭", title: "AR Filtry", desc: "Streamuj s efekty v reálném čase" },
                  { icon: "📡", title: "Multistreaming", desc: "Streamuj na více platforem najednou" },
                  { icon: "💰", title: "85/15 Split", desc: "Nejlepší revenue split v ČR" },
                ].map((f) => (
                  <div key={f.title} className="bg-muted/30 rounded-lg p-3 text-center">
                    <div className="text-2xl mb-1">{f.icon}</div>
                    <div className="font-semibold text-sm">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Tento průvodce vás provede nastavením OBS a prvním streamem. Zabere to jen 5 minut.
              </p>
            </div>
          )}

          {/* Step 2: OBS Setup */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-400 mb-1">Potřebujete OBS Studio?</p>
                <p className="text-xs text-muted-foreground mb-2">Stáhněte si zdarma na obsproject.com</p>
                <a href="https://obsproject.com" target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="gap-2">
                    <ExternalLink className="h-3 w-3" />
                    Stáhnout OBS Studio
                  </Button>
                </a>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Nastavení v OBS Studio:</h3>
                {[
                  { step: "1", text: 'Otevřete OBS Studio a klikněte na "Nastavení" (Settings)' },
                  { step: "2", text: 'V levém menu vyberte "Stream"' },
                  { step: "3", text: 'V poli "Služba" (Service) vyberte "Vlastní..." (Custom...)' },
                  { step: "4", text: 'Do pole "Server" vložte RTMP URL z dalšího kroku' },
                  { step: "5", text: 'Do pole "Stream Key" vložte váš stream key z dalšího kroku' },
                  { step: "6", text: 'Klikněte "OK" a pak "Spustit stream" (Start Streaming)' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-3 items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-xs text-yellow-400">
                  💡 <strong>Tip:</strong> Doporučené nastavení videa: 1920x1080, 30fps, bitrate 4000-6000 kbps
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Stream Key */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Zkopírujte tyto hodnoty do OBS Studio. Váš stream key je tajný — nesdílejte ho s nikým.
              </p>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                    RTMP Server URL
                  </Label>
                  <div className="flex gap-2">
                    <Input value={rtmpUrl} readOnly className="font-mono text-sm bg-muted/30" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(rtmpUrl, "RTMP URL")}
                      className="flex-shrink-0 gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === "RTMP URL" ? "✓" : "Kopírovat"}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">
                    Stream Key (tajný)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={streamKey}
                      readOnly
                      type="password"
                      className="font-mono text-sm bg-muted/30"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(streamKey, "Stream Key")}
                      className="flex-shrink-0 gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      {copied === "Stream Key" ? "✓" : "Kopírovat"}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-xs text-muted-foreground">
                  Ztratili jste stream key? Vygenerujte nový.
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => regenerateKey.mutate()}
                  disabled={regenerateKey.isPending}
                  className="text-xs"
                >
                  Obnovit key
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Test Stream */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Nyní spusťte stream v OBS Studio a ověřte, že se připojení podařilo.
              </p>

              <div className="space-y-3">
                {[
                  { icon: "▶️", text: 'V OBS klikněte na "Spustit stream" (Start Streaming)' },
                  { icon: "🔍", text: "Přejděte na váš Dashboard → Stream a zkontrolujte status" },
                  { icon: "✅", text: "Pokud vidíte zelený indikátor, stream je aktivní!" },
                  { icon: "🛑", text: 'Po testu klikněte na "Zastavit stream" (Stop Streaming)' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-start bg-muted/20 rounded-lg p-3">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-sm text-muted-foreground">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate("/dashboard/stream")}
                >
                  <Radio className="h-4 w-4" />
                  Otevřít Stream Dashboard
                </Button>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-xs text-green-400">
                  ✅ Pokud test proběhl úspěšně, klikněte na "Pokračovat" níže.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Done */}
          {currentStep === 5 && (
            <div className="space-y-4 text-center">
              <div className="text-6xl mb-2">🎉</div>
              <p className="text-lg font-semibold">Gratulujeme! Jste připraveni streamovat!</p>
              <p className="text-sm text-muted-foreground">
                Váš účet je nastaven a připraven. Zde jsou doporučené další kroky:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {[
                  { icon: "📡", title: "Multistreaming", desc: "Připojte Twitch, Kick a YouTube", href: "/dashboard/multistreaming" },
                  { icon: "🔔", title: "Alert Customization", desc: "Přizpůsobte follow/sub alerty", href: "/dashboard/alerts" },
                  { icon: "📊", title: "Analytics", desc: "Sledujte statistiky streamů", href: "/dashboard/analytics" },
                  { icon: "💰", title: "Subscriptions", desc: "Nastavte Tier 1/2/3 odběry", href: "/subscriptions" },
                ].map((item) => (
                  <button
                    key={item.title}
                    onClick={() => navigate(item.href)}
                    className="flex gap-3 items-start bg-muted/20 hover:bg-muted/40 rounded-lg p-3 text-left transition-colors"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>

              <Badge className="bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
                🚀 Váš první stream vás čeká!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6 w-full max-w-2xl justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 1}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Zpět
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="text-muted-foreground text-sm">
            Přeskočit
          </Button>
          <Button onClick={goNext} className="gap-2 rainbow-gradient text-black font-bold">
            {currentStep === STEPS.length ? "Přejít na Dashboard" : "Pokračovat"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
