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
  tags?: string[];
};

function parsePublished(fm: ArticleFrontmatter): Date | null {
  const raw = fm.publishedAt ?? fm.publishedDate;
  if (!raw) return null;
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : new Date(raw);
}

function safeDateLabel(d: Date | null): string | null {
  if (!d) return null;
  try {
    return d.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return null;
  }
}

function readingTimeFromHtml(html: string): number {
  // Estimativa simples: ~200 wpm
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

// ============================
// 🔹 SEO dinâmico
// ============================
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

// ============================
// 🔹 Página de Artigo
// ============================
export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const article = await getArticleHtmlBySlug(slug).catch(() => null);
  if (!article) notFound();

  const publishedDate = parsePublished(article.frontmatter as ArticleFrontmatter);
  const dateLabel = safeDateLabel(publishedDate);
  const minutes = readingTimeFromHtml(article.html);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <article>
        {/* Breadcrumb simples */}
        <nav className="mb-4 text-sm text-neutral-500">
          <Link href="/" className="hover:underline">Início</Link>
          <span className="mx-2">/</span>
          <Link href="/articles/" className="hover:underline">Artigos</Link>
        </nav>

        {/* Cabeçalho do artigo */}
        <header className="mb-8 border-b pb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">
            {article.frontmatter.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
            <span>Por {article.frontmatter.author ?? "Guilherme Portella"}</span>
            {dateLabel && (
              <>
                <span aria-hidden>•</span>
                <time dateTime={publishedDate?.toISOString()}>{dateLabel}</time>
              </>
            )}
            <span aria-hidden>•</span>
            <span>{minutes} min de leitura</span>

            {Array.isArray(article.frontmatter.tags) && article.frontmatter.tags.length > 0 && (
              <>
                <span aria-hidden>•</span>
                <ul className="inline-flex flex-wrap gap-2">
                  {article.frontmatter.tags!.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border px-2 py-0.5 text-xs text-neutral-700"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </header>

        {/* Corpo do artigo */}
        <div
          className="prose prose-neutral lg:prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.html }}
        />

        {/* Rodapé */}
        <div className="mt-12 border-t pt-6 flex items-center justify-between text-sm">
          <Link href="/articles/" className="text-blue-600 hover:underline">
            &larr; Voltar para a lista de artigos
          </Link>
          <a
            href="https://github.com/GuilhermePortella"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-600 hover:underline"
          >
            Ver GitHub
          </a>
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
