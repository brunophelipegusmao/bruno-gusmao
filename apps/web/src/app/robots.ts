import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/ControlPanel/" },
    sitemap: "https://brunogusmao.dev/sitemap.xml",
  };
}
