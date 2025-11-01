import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleHtmlBySlug, getAllArticles } from "@/lib/articles";
import ArticleTOC from "../ArticleTOC";

export const runtime = "nodejs";
export const dynamicParams = false;

/* ==========================
   Tipos e Utilitários
========================== */
type ArticleFrontmatter = {
  title: string;
  summary?: string;
  author?: string;
  publishedAt?: string;
  publishedDate?: string;
  tags?: string[];
};

/**
 * Interpreta datas no formato 'YYYY-MM-DD' como "date-only" (sem fuso),
 * garantindo que o dia exibido não volte um dia em relação ao configurado.
 */
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
    // Cria um Date em UTC para não sofrer deslocamento por fuso
    const date = new Date(Date.UTC(y, mo, d));
    // Para o atributo datetime usamos o formato date-only
    return { date, isDateOnly: true, attr: `${m[1]}-${m[2]}-${m[3]}` };
  }

  // Fallback: tenta parsear strings completas com hora
  const t = Date.parse(raw);
  if (Number.isNaN(t)) return null;
  const date = new Date(t);
  return { date, isDateOnly: false, attr: date.toISOString() };
}

/**
 * Formata uma data para exibição local, respeitando UTC quando for date-only.
 */
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

/**
 * Estima tempo de leitura com base no conteúdo HTML.
 */
function readingTimeFromHtml(html: string): number {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const words = text ? text.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

/* ==========================
   SEO Dinâmico
========================== */
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

/* ==========================
   Página do Artigo
========================== */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleHtmlBySlug(slug).catch(() => null);
  if (!article) notFound();

  // Corrige exibição e ordenação de datas
  const parsed = parsePublishedStrict(article.frontmatter as ArticleFrontmatter);
  const dateLabel = parsed
    ? safeDateLabel(parsed.date, parsed.isDateOnly)
    : null;

  const minutes = readingTimeFromHtml(article.html);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <article>
        {/* Breadcrumb */}
        <nav className="mb-4 text-sm text-neutral-500">
          <Link href="/" className="hover:underline">
            Início
          </Link>
          <span className="mx-2">/</span>
          <Link href="/articles/" className="hover:underline">
            Artigos
          </Link>
        </nav>

        {/* Cabeçalho do artigo */}
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

        {/* TOC (mobile) */}
        <ArticleTOC targetSelector="#article-content" variant="mobile" />

        {/* Conteúdo + TOC lateral */}
        <div className="grid lg:grid-cols-[minmax(0,1fr)_260px] gap-8">
          <div id="article-content">
            <div
              className="prose prose-neutral lg:prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />
          </div>

          {/* TOC lateral (desktop) */}
          <ArticleTOC targetSelector="#article-content" variant="desktop" />
        </div>

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

/* ==========================
   Geração Estática (SSG)
========================== */
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug }));
}
