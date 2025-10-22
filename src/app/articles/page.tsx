// src/app/articles/page.tsx
import Link from "next/link";
import ArticlesSearch from "./ArticlesSearch";
import { getAllArticles, buildSearchIndex, type ArticleIndexItem } from "@/lib/articles";

export const metadata = {
  title: "Artigos | Guilherme Portella",
  description: "Artigos sobre arquitetura, Java, DDD e práticas modernas em engenharia de software.",
};

// Helpers de data (server)
function safeDate(d?: string): Date | null {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(d);
}
function monthTitle(date: Date): string {
  const m = date.toLocaleString("pt-BR", { month: "long" });
  return `${m.charAt(0).toUpperCase()}${m.slice(1)}`;
}
type GroupKey = { year: number; month: number }; // month 0..11
function groupByMonth(items: ArticleIndexItem[]) {
  const groups = new Map<string, { key: GroupKey; label: string; id: string; items: ArticleIndexItem[] }>();
  for (const a of items) {
    const d = safeDate(a.frontmatter.publishedAt) ?? new Date(0);
    const year = d.getFullYear();
    const month = d.getMonth();
    const id = `${year}-${String(month + 1).padStart(2, "0")}`;
    const label = `${year} - ${monthTitle(d)}`;
    const g = groups.get(id) ?? { key: { year, month }, label, id, items: [] };
    g.items.push(a);
    groups.set(id, g);
  }
  return Array.from(groups.values()).sort((a, b) =>
    a.key.year === b.key.year ? b.key.month - a.key.month : b.key.year - a.key.year
  );
}

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  const grouped = groupByMonth(articles);
  const searchIndex = await buildSearchIndex(); // título, summary e conteúdo

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-8">
      {/* Heading */}
      <header className="space-y-1 text-center">
        <h1 className="text-4xl font-bold h-serif">Artigos</h1>
        <p className="text-neutral-600">
          Posts agrupados por mês, com busca que encontra título, resumo e conteúdo.
        </p>
      </header>

      {/* Busca (client) */}
      <ArticlesSearch index={searchIndex} />

      {/* Índice de meses */}
      {grouped.length > 0 && (
        <nav className="text-sm text-neutral-600">
          <span className="mr-2">Meses:</span>
          <ul className="inline-flex flex-wrap gap-x-3 gap-y-2">
            {grouped.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="hover:underline">
                  {g.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Lista por mês com visual “acadêmico” (barra lateral) */}
      {grouped.length === 0 ? (
        <p className="text-neutral-500">Nenhum artigo publicado ainda.</p>
      ) : (
        <section className="space-y-12">
          {grouped.map((g) => (
            <div key={g.id} className="space-y-4">
              <h2 id={g.id} className="text-2xl font-semibold text-neutral-900 h-serif">
                {g.label}
              </h2>

              <ul className="space-y-3">
                {g.items.map((article) => {
                  const d = safeDate(article.frontmatter.publishedAt);
                  const dateLabel = d
                    ? d.toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" })
                    : null;

                  return (
                    <li key={article.slug}>
                      <Link
                        href={`/articles/${article.slug}/`}
                        className="group block border-l-4 border-neutral-300 bg-white p-4 transition hover:border-neutral-900"
                      >
                        <article className="space-y-1.5">
                          {/* Título serifado com sublinhado no hover */}
                          <h3 className="text-[1.125rem] font-semibold text-neutral-900 font-[ui-serif,Georgia,Times,serif]">
                            <span className="underline decoration-transparent group-hover:decoration-neutral-900">
                              {article.frontmatter.title}
                            </span>
                          </h3>

                          {/* Metadados discretos */}
                          <div className="text-xs text-neutral-600">
                            {dateLabel ?? "Sem data"}
                            {article.frontmatter.tags?.length ? (
                              <>
                                {" "}&middot;{" "}
                                <span className="uppercase tracking-wide">
                                  {article.frontmatter.tags.join(" · ")}
                                </span>
                              </>
                            ) : null}
                          </div>

                          {/* Resumo enxuto */}
                          {article.frontmatter.summary && (
                            <p className="text-sm text-neutral-700">
                              {article.frontmatter.summary}
                            </p>
                          )}

                          {/* CTA textual discreto */}
                          <div className="pt-0.5">
                            <span className="text-sm text-blue-700 underline underline-offset-2 group-hover:text-blue-800">
                              Ler artigo →
                            </span>
                          </div>
                        </article>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
