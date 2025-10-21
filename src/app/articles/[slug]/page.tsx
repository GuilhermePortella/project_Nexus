// src/app/articles/[slug]/page.tsx
import type { PageProps } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleHtmlBySlug, getAllArticles } from "@/lib/articles";

export const runtime = "nodejs";
export const dynamicParams = false;

// ============================
// 🔹 SEO dinâmico (Next 15)
// ============================
export async function generateMetadata(
  { params }: PageProps<{ slug: string }>
) {
  const { slug } = await params;

  if (!slug) {
    return { title: "Artigo", description: "Artigo do blog." };
  }

  const article = await getArticleHtmlBySlug(slug).catch(() => null);
  if (!article) {
    return { title: "Artigo não encontrado", description: "O artigo solicitado não foi encontrado." };
  }

  return {
    title: `${article.frontmatter.title} | Guilherme Portella`,
    description: article.frontmatter.summary ?? "Artigo do blog.",
  };
}

// ============================
// 🔹 Página de Artigo
// ============================
export default async function ArticlePage(
  { params }: PageProps<{ slug: string }>
) {
  const { slug } = await params;

  const article = await getArticleHtmlBySlug(slug).catch(() => null);
  if (!article) notFound();

  // publishedAt || publishedDate, com fallback seguro
  const dateStr =
    article.frontmatter.publishedAt ??
    (article.frontmatter as any).publishedDate ??
    "";
  const publishedDate = dateStr ? new Date(dateStr) : null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <article>
        <header className="mb-8 border-b pb-4">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">
            {article.frontmatter.title}
          </h1>
          <div className="text-md text-neutral-500">
            <span>Por {article.frontmatter.author ?? "Guilherme Portella"}</span>
            {publishedDate && (
              <>
                <span className="mx-2">|</span>
                <span>
                  {publishedDate.toLocaleDateString("pt-BR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </>
            )}
          </div>
        </header>

        <div
          className="prose prose-neutral lg:prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        <div className="mt-12 border-t pt-6">
          <Link href="/articles" className="text-blue-600 hover:underline">
            &larr; Voltar para a lista de artigos
          </Link>
        </div>
      </article>
    </main>
  );
}

// ============================
// 🔹 Geração estática (SSG)
// ============================
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}
