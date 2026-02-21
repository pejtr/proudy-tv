import { Router } from "express";
import * as db from "./db";

const seoRouter = Router();

// Sitemap.xml endpoint
seoRouter.get("/sitemap.xml", async (req, res) => {
  try {
    const siteUrl = `${req.protocol}://${req.get("host")}`;
    const liveStreams = await db.getLiveStreams();
    
    const staticPages: Array<{url: string; priority: string; changefreq: string; lastmod?: string}> = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/browse", priority: "0.9", changefreq: "hourly" },
      { url: "/coins", priority: "0.7", changefreq: "weekly" },
      { url: "/category/gaming", priority: "0.8", changefreq: "daily" },
      { url: "/category/music", priority: "0.8", changefreq: "daily" },
      { url: "/category/asmr", priority: "0.8", changefreq: "daily" },
      { url: "/category/chill-talk", priority: "0.8", changefreq: "daily" },
    ];

    const streamPages = liveStreams.map(stream => ({
      url: `/stream/${stream.id}`,
      priority: "0.9",
      changefreq: "always",
      lastmod: stream.startedAt?.toISOString() || new Date().toISOString(),
    }));

    const allPages = [...staticPages, ...streamPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ""}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("[SEO] Sitemap generation error:", error);
    res.status(500).send("Error generating sitemap");
  }
});

// Robots.txt endpoint
seoRouter.get("/robots.txt", (req, res) => {
  const siteUrl = `${req.protocol}://${req.get("host")}`;
  
  const robotsTxt = `# PROUDY.TV Robots.txt
User-agent: *
Allow: /
Allow: /browse
Allow: /stream/*
Allow: /category/*
Allow: /coins

# Disallow private areas
Disallow: /dashboard
Disallow: /admin
Disallow: /api

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Crawl-delay for polite crawlers
Crawl-delay: 1
`;

  res.header("Content-Type", "text/plain");
  res.send(robotsTxt);
});

export default seoRouter;
