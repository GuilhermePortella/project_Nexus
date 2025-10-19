// Gera sitemap 100% estático, compatível com `output: "export"`
export const dynamic = "force-static";     // exige static export
export const revalidate = 3600;            // 1h (não tem efeito em export puro, mas é OK)

import type { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/articles";

// Opcional: defina o domínio do site via env
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await getAllArticles();

  const now = new Date();
  const urls: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/articles/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  for (const a of items) {
    const last = a.frontmatter.publishedAt
      ? new Date(a.frontmatter.publishedAt)
      : now;

    urls.push({
      url: `${BASE_URL}/articles/${a.slug}/`, // trailing slash p/ export estático
      lastModified: last,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return urls;
}
