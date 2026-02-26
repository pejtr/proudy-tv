import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Users, TrendingUp } from "lucide-react";
import SEO from "@/components/SEO";
import { OrganizationStructuredData } from "@/components/StructuredData";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function TopStreamers() {
  const { data: liveStreams, isLoading } = trpc.streams.getLive.useQuery();

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://proudy.tv";

  // Sort by viewer count for top streamers
  const topStreamers = liveStreams
    ? [...liveStreams].sort((a, b) => (b.viewerCount || 0) - (a.viewerCount || 0)).slice(0, 20)
    : [];

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title="Top Streamers - PROUDY.TV | Nejlepší Čeští Streameři"
        description="Objevte nejlepší české streamery na PROUDY.TV. Gaming, Music, ASMR, Chill & Talk. 80/20 revenue split pro partnery. Žádné limity."
        url="/top-streamers"
      />

      {/* Structured Data */}
      <OrganizationStructuredData
        name="PROUDY.TV"
        url={siteUrl}
        logo={`${siteUrl}/logo.png`}
        description="Česká streamovací platforma s AR filtry, voice changerem a 3D avatary"
        sameAs={[
          "https://twitter.com/proudytv",
          "https://facebook.com/proudytv",
          "https://instagram.com/proudytv",
        ]}
      />

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
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="container max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <TrendingUp className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold rainbow-text">Top Streamers</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Nejlepší čeští streameři na PROUDY.TV. Gaming, Music, ASMR, Chill & Talk.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/browse">
                <Button size="lg" className="rainbow-border">
                  <Eye className="mr-2 h-5 w-5" />
                  Sledovat Live Streamy
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline">
                  Začít Streamovat
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Top Streamers List */}
        <section className="py-12 px-4">
          <div className="container max-w-6xl">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              Živé Streamy ({topStreamers.length})
            </h2>

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading streamers...</p>
              </div>
            )}

            {!isLoading && topStreamers.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  Žádné živé streamy momentálně. Buďte první, kdo začne streamovat!
                </p>
                <Link href="/dashboard">
                  <Button className="mt-6">Začít Streamovat</Button>
                </Link>
              </Card>
            )}

            <div className="grid gap-6">
              {topStreamers.map((stream, index) => (
                <Link key={stream.id} href={`/stream/${stream.id}`}>
                  <Card className="p-6 hover:rainbow-border transition-all cursor-pointer">
                    <div className="flex items-start gap-6">
                      {/* Rank Badge */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-black"
                              : index === 1
                              ? "bg-gray-400 text-black"
                              : index === 2
                              ? "bg-orange-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                      </div>

                      {/* Stream Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-2xl font-bold">{stream.title}</h3>
                          <span className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                            LIVE
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-lg font-semibold text-primary">
                            {stream.streamerName || "Unknown"}
                          </span>
                          {stream.emailVerified && <VerifiedBadge verified size="sm" />}
                        </div>

                        {stream.description && (
                          <p className="text-muted-foreground mb-3">{stream.description}</p>
                        )}

                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{stream.viewerCount || 0} diváků</span>
                          </div>
                          {stream.category && (
                            <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">
                              {stream.category === "Chill & Talk" && "💬"}
                              {stream.category === "Gaming" && "🎮"}
                              {stream.category === "Music" && "🎵"}
                              {stream.category === "ASMR" && "🎧"}
                              {" "}
                              {stream.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-gradient-to-b from-black to-primary/10">
          <div className="container max-w-4xl text-center">
            <h2 className="text-4xl font-bold mb-6 rainbow-text">Připojte se k PROUDY.TV</h2>
            <p className="text-xl text-muted-foreground mb-8">
              80/20 revenue split pro partnery. AR filtry, voice changer, 3D avatary. Multistreaming support.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="rainbow-border">
                Začít Streamovat Zdarma
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
