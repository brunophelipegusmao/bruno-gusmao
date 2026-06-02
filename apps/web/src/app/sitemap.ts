import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

  const posts = await fetch(`${base}/api/posts`, { cache: "no-store" })
    .then<{ slug: string; updatedAt: string }[]>((r) => (r.ok ? r.json() : []))
    .catch(() => []);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: "https://brunogusmao.dev", lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: "https://brunogusmao.dev/about", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://brunogusmao.dev/projects", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://brunogusmao.dev/blog", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: "https://brunogusmao.dev/contact", lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `https://brunogusmao.dev/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...postRoutes];
}
