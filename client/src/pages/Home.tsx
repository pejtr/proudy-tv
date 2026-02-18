import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Play, Users, Sparkles, Radio } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-3xl rainbow-text font-bold">PROUDY</div>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/browse">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                Browse
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <>
                {(user?.role === 'streamer' || user?.role === 'admin') && (
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-foreground hover:text-primary">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">{user?.name}</span>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default" className="bg-primary hover:bg-primary/90">
                  Sign In
                </Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="text-8xl rainbow-text font-bold retro-glow">
                  PROUDY
                </div>
                <div className="text-sm text-muted-foreground mt-2 tracking-widest">
                  ČESKÁ STREAMOVACÍ PLATFORMA
                </div>
              </div>
            </div>

            {/* Tagline */}
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Barevná revoluce<br />v českém streamingu
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Streamuj s AR filtry, voice changerem a 3D avatary. 
              Multistreaming support. 85/15 revenue split. Žádné limity.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center pt-8">
              <Link href="/browse">
                <Button size="lg" className="rainbow-gradient text-black font-bold px-8">
                  <Play className="mr-2 h-5 w-5" />
                  Sledovat Streamy
                </Button>
              </Link>
              
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="outline" className="border-2 px-8">
                    <Radio className="mr-2 h-5 w-5" />
                    Začít Streamovat
                  </Button>
                </a>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 pt-20">
              <div className="rainbow-border rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">AR Filtry & Avatary</h3>
                <p className="text-sm text-muted-foreground">
                  Snapchat-style filtry, voice changer a 3D avatary pro unikátní stream
                </p>
              </div>

              <div className="rainbow-border rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Radio className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Multistreaming</h3>
                <p className="text-sm text-muted-foreground">
                  Streamuj současně na více platformách. Na rozdíl od Twitche, žádné omezení
                </p>
              </div>

              <div className="rainbow-border rounded-lg p-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">85/15 Split</h3>
                <p className="text-sm text-muted-foreground">
                  Férové podmínky. 85% příjmů jde streamerovi, ne platformě
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="pt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold rainbow-text">0ms</div>
                <div className="text-sm text-muted-foreground mt-2">Latence</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold rainbow-text">100%</div>
                <div className="text-sm text-muted-foreground mt-2">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold rainbow-text">∞</div>
                <div className="text-sm text-muted-foreground mt-2">Možnosti</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 PROUDY.TV - Barevná platforma 🌈</p>
        </div>
      </footer>
    </div>
  );
}
