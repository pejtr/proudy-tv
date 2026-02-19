import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Play, Users, Sparkles, Radio } from "lucide-react";


export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-black/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <img src="/proudy-logo.png" alt="PROUDY" className="h-10 w-auto" />
              <div className="text-2xl gradient-text-animated font-bold">PROUDY</div>
            </div>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/browse">
              <Button variant="ghost" className="text-foreground hover:text-primary transition-all">
                Browse
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <>
                {(user?.role === 'streamer' || user?.role === 'admin') && (
                  <Link href="/dashboard">
                    <Button variant="ghost" className="text-foreground hover:text-primary transition-all">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <span className="text-sm text-muted-foreground">{user?.name}</span>
              </>
            ) : (
              <a href={getLoginUrl()}>
                <Button variant="default" className="bg-primary hover:bg-primary/90 transition-all">
                  Sign In
                </Button>
              </a>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Animated Logo and Title */}
            <div className="flex flex-col items-center animate-fade-in-up">
              <img src="/proudy-logo.png" alt="PROUDY Logo" className="w-64 h-auto mb-2" />
              
              {/* Title directly below logo */}
              <div className="space-y-4" style={{ animationDelay: '0.2s' }}>
              <div className="text-7xl md:text-8xl gradient-text-animated font-bold tracking-tight">
                PROUDY
              </div>
              <div className="text-sm text-muted-foreground tracking-[0.3em] uppercase">
                Česká Streamovací Platforma
              </div>
              </div>
            </div>

            {/* Tagline */}
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Barevná revoluce<br />
              <span className="gradient-text-animated">v českém streamingu</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              Streamuj s AR filtry, voice changerem a 3D avatary. 
              Multistreaming support. 85/15 revenue split. Žádné limity.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <Link href="/browse">
                <Button size="lg" className="rainbow-gradient text-black font-bold px-10 py-6 text-lg button-animated">
                  <Play className="mr-2 h-6 w-6" />
                  Sledovat Streamy
                </Button>
              </Link>
              
              {!isAuthenticated && (
                <a href={getLoginUrl()}>
                  <Button size="lg" variant="outline" className="border-2 border-primary px-10 py-6 text-lg hover:bg-primary/10 transition-all">
                    <Radio className="mr-2 h-6 w-6" />
                    Začít Streamovat
                  </Button>
                </a>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 pt-24 animate-fade-in-up" style={{ animationDelay: '1s' }}>
              <div className="card-modern bg-card/50 backdrop-blur-sm rounded-xl p-8 space-y-4 border border-border">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mx-auto">
                  <Sparkles className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold">AR Filtry & Avatary</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Snapchat-style filtry, voice changer a 3D avatary pro unikátní stream
                </p>
              </div>

              <div className="card-modern bg-card/50 backdrop-blur-sm rounded-xl p-8 space-y-4 border border-border">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mx-auto">
                  <Radio className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold">Multistreaming</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Streamuj současně na více platformách. Na rozdíl od Twitche, žádné omezení
                </p>
              </div>

              <div className="card-modern bg-card/50 backdrop-blur-sm rounded-xl p-8 space-y-4 border border-border">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto">
                  <Users className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold">85/15 Split</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Férové podmínky. 85% příjmů jde streamerovi, ne platformě
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="pt-24 grid grid-cols-3 gap-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '1.2s' }}>
              <div className="text-center space-y-2">
                <div className="text-5xl md:text-6xl font-bold gradient-text-animated">0ms</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Latence</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-5xl md:text-6xl font-bold gradient-text-animated">100%</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Uptime</div>
              </div>
              <div className="text-center space-y-2">
                <div className="text-5xl md:text-6xl font-bold gradient-text-animated">∞</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider">Možnosti</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 backdrop-blur-sm bg-black/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 PROUDY.TV - Barevná platforma 🌈</p>
        </div>
      </footer>
    </div>
  );
}
