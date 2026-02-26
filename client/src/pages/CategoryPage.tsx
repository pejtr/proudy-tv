import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Eye, Gamepad2, Music, Headphones, MessageCircle } from "lucide-react";
import SEO from "@/components/SEO";
import { BreadcrumbStructuredData } from "@/components/StructuredData";
import VerifiedBadge from "@/components/VerifiedBadge";

const categoryIcons = {
  "gaming": <Gamepad2 className="h-8 w-8" />,
  "music": <Music className="h-8 w-8" />,
  "asmr": <Headphones className="h-8 w-8" />,
  "chill-talk": <MessageCircle className="h-8 w-8" />,
};

const categoryNames = {
  "gaming": "Gaming",
  "music": "Music",
  "asmr": "ASMR",
  "chill-talk": "Chill & Talk",
};

const categoryDescriptions = {
  "gaming": "Sledujte nejlepší české gaming streamy. CS:GO, League of Legends, Minecraft, Fortnite a další.",
  "music": "Živá hudba, DJ sety, produkce beatů a hudební performance od českých umělců.",
  "asmr": "Relaxační ASMR streamy pro lepší spánek a odpočinek. Šeptání, zvuky, roleplay.",
  "chill-talk": "Povídání, diskuze, just chatting streamy. Poznejte české streamery osobně.",
};

export default function CategoryPage() {
  const { category } = useParams();
  const { data: liveStreams, isLoading } = trpc.streams.getLive.useQuery();

  const categoryKey = category as keyof typeof categoryNames;
  const categoryName = categoryNames[categoryKey] || "Unknown";
  const categoryDescription = categoryDescriptions[categoryKey] || "";
  const categoryIcon = categoryIcons[categoryKey];

  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://proudy.tv";

  // Filter streams by category
  const categoryStreams = liveStreams?.filter(
    (stream) => stream.category?.toLowerCase().replace(" & ", "-").replace(" ", "-") === category
  ) || [];

  return (
    <>
      {/* SEO Meta Tags */}
      <SEO
        title={`${categoryName} Streamy - PROUDY.TV | České ${categoryName} Live Streamy`}
        description={categoryDescription}
        url={`/category/${category}`}
      />

      {/* Breadcrumb Structured Data */}
      <BreadcrumbStructuredData
        items={[
          { name: "Home", url: siteUrl },
          { name: "Browse", url: `${siteUrl}/browse` },
          { name: categoryName, url: `${siteUrl}/category/${category}` },
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
            <div className="flex items-center justify-center gap-3 mb-6 text-primary">
              {categoryIcon}
              <h1 className="text-5xl font-bold rainbow-text">{categoryName} Streamy</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              {categoryDescription}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/browse">
                <Button size="lg" variant="outline">
                  Všechny Kategorie
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" className="rainbow-border">
                  Začít Streamovat
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Category Streams */}
        <section className="py-12 px-4">
          <div className="container max-w-6xl">
            <h2 className="text-3xl font-bold mb-8">
              Živé {categoryName} Streamy ({categoryStreams.length})
            </h2>

            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading streams...</p>
              </div>
            )}

            {!isLoading && categoryStreams.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg mb-4">
                  Žádné živé {categoryName.toLowerCase()} streamy momentálně.
                </p>
                <Link href="/browse">
                  <Button>Prozkoumat Jiné Kategorie</Button>
                </Link>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryStreams.map((stream) => (
                <Link key={stream.id} href={`/stream/${stream.id}`}>
                  <Card className="overflow-hidden hover:rainbow-border transition-all cursor-pointer">
                    {/* Thumbnail */}
                    <div className="relative aspect-video bg-muted">
                      {stream.hlsUrl ? (
                        <video
                          src={stream.hlsUrl}
                          className="w-full h-full object-cover"
                          autoPlay
                          muted
                          loop
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Eye className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">
                        LIVE
                      </span>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/80 text-white text-xs font-semibold rounded flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {stream.viewerCount || 0}
                      </div>
                    </div>

                    {/* Stream Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2">{stream.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-primary">
                          {stream.streamerName || "Unknown"}
                        </span>
                        {stream.emailVerified && <VerifiedBadge verified size="sm" />}
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
            <h2 className="text-4xl font-bold mb-6 rainbow-text">Streamujte {categoryName}</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Připojte se k PROUDY.TV a začněte streamovat {categoryName.toLowerCase()} obsah. 80/20 revenue split pro partnery.
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
