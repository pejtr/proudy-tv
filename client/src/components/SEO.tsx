import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "video.other";
  video?: {
    url: string;
    width?: number;
    height?: number;
    type?: string;
  };
  article?: {
    publishedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

export default function SEO({
  title = "PROUDY.TV - Česká Streamovací Platforma",
  description = "Barevná revoluce v českém streamingu. Streamuj s AR filtry, voice changerem a 3D avatary. Multistreaming support. 80/20 revenue split pro partnery. Žádné limity.",
  image = "https://proudy.tv/og-image.png",
  url,
  type = "website",
  video,
  article,
}: SEOProps) {
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://proudy.tv";
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith("http") ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="PROUDY.TV" />
      <meta property="og:locale" content="cs_CZ" />

      {/* Video specific OG tags */}
      {video && (
        <>
          <meta property="og:video" content={video.url} />
          {video.width && <meta property="og:video:width" content={video.width.toString()} />}
          {video.height && <meta property="og:video:height" content={video.height.toString()} />}
          {video.type && <meta property="og:video:type" content={video.type} />}
        </>
      )}

      {/* Article specific OG tags */}
      {article && (
        <>
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags?.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content={video ? "player" : "summary_large_image"} />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      {video && (
        <>
          <meta name="twitter:player" content={video.url} />
          {video.width && <meta name="twitter:player:width" content={video.width.toString()} />}
          {video.height && <meta name="twitter:player:height" content={video.height.toString()} />}
        </>
      )}

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="Czech" />
      <meta name="author" content="PROUDY.TV" />
      <meta name="keywords" content="streaming, česká platforma, live stream, AR filtry, voice changer, multistreaming, 80/20 split, gaming, music, ASMR, chill talk" />
    </Helmet>
  );
}
