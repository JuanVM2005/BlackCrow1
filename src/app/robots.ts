// src/app/robots.ts
import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  const envBase = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const base = (envBase || site.url).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
