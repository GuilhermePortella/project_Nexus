// src/app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleHtmlBySlug, getAllArticles } from "@/lib/articles";

export const runtime = "nodejs";
export const dynamicParams = false;

type ArticleFrontmatter = {
  title: string;
  summary?: string;
  author?: string;
  publishedAt?: string;
  publishedDate?: string;
};

function parsePublished(fm: ArticleFrontmatter): Date | null {
  const raw = fm.publishedAt ?? fm.publishedDate;
  if (!raw) return null;
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : new Date(raw);
}

// SEO
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const article = await getArticleHtmlBySlug(slug).catch(() => null);
  if (!article) {
    return {
      title: "Artigo não encontrado",
      description: "O artigo solicitado não foi encontrado.",
    };
  }
  return {
    title: `${article.frontmatter.title} | Guilherme Portella`,
    description: article.frontmatter.summary ?? "Artigo do blog.",
  };
}

// Página
export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const article = await getArticleHtmlBySlug(slug).catch(() => null);
  if (!article) notFound();

  const publishedDate = parsePublished(article.frontmatter as ArticleFrontmatter);

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

// SSG
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}
