import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleHtmlBySlug, getAllArticles } from "@/lib/articles";
import ArticleTOC from "../ArticleTOC";

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

function parsePublishedStrict(
  fm: ArticleFrontmatter
):
  | { date: Date; isDateOnly: true; attr: string }
  | { date: Date; isDateOnly: false; attr: string }
  | null {
  const raw = fm.publishedAt ?? fm.publishedDate;
  if (!raw) return null;

  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (m) {
    const y = +m[1],
      mo = +m[2] - 1,
      d = +m[3];
    const date = new Date(Date.UTC(y, mo, d));
    return { date, isDateOnly: true, attr: `${m[1]}-${m[2]}-${m[3]}` };
  }
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return null;
  const date = new Date(t);
  return { date, isDateOnly: false, attr: date.toISOString() };
}

function safeDateLabel(d: Date | null, forceUTC = false): string | null {
  if (!d) return null;
  try {
    return d.toLocaleDateString("pt-BR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(forceUTC ? { timeZone: "UTC" } : {}),
    });
  } catch {
    return null;
  }
}

function readingTimeFromHtml(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
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
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleHtmlBySlug(slug).catch(() => null);
  if (!article) notFound();

  const parsed = parsePublishedStrict(article.frontmatter as ArticleFrontmatter);
  const dateLabel = parsed
    ? safeDateLabel(parsed.date, parsed.isDateOnly)
    : null;

  const minutes = readingTimeFromHtml(article.html);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <article>
        <nav className="mb-4 text-sm text-neutral-500">
          <Link href="/" className="hover:underline">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link href="/articles/" className="hover:underline">
            Artigos
          </Link>
        </nav>

        <header className="mb-6 border-b pb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900">
            {article.frontmatter.title}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-600">
            <span>Por {article.frontmatter.author ?? "Guilherme Portella"}</span>
            {dateLabel && parsed && (
              <>
                <span aria-hidden>•</span>
                <time dateTime={parsed.attr}>{dateLabel}</time>
              </>
            )}
            <span aria-hidden>•</span>
            <span>{minutes} min de leitura</span>
            {Array.isArray(article.frontmatter.tags) &&
              article.frontmatter.tags.length > 0 && (
                <>
                  <span aria-hidden>•</span>
                  <ul className="inline-flex flex-wrap gap-2">
                    {article.frontmatter.tags.map((t) => (
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

        <ArticleTOC targetSelector="#article-content" variant="mobile" />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-8">
          <div id="article-content">
            <div
              className="prose prose-neutral lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />
          </div>

          <ArticleTOC targetSelector="#article-content" variant="desktop" />
        </div>

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
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}
