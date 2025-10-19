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
  return Number.isNaN(t) ? null : new Date(t);
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
    <main className="mx-auto max-w-4xl p-6 space-y-8">
      {/* Heading */}
      <header className="space-y-1">
        <h1 className="text-4xl font-bold text-neutral-900">Guilherme Portella’s Blog</h1>
        <p className="text-neutral-600">
          Diretão: posts agrupados por mês e uma busca que encontra título, resumo e conteúdo dos artigos.
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

      {/* Lista por mês (minimalista) */}
      {grouped.length === 0 ? (
        <p className="text-neutral-500">Nenhum artigo publicado ainda.</p>
      ) : (
        <section className="space-y-10">
          {grouped.map((g) => (
            <div key={g.id} className="space-y-3">
              <h2 id={g.id} className="text-2xl font-semibold text-neutral-900">
                {g.label}
              </h2>

              <ul className="space-y-2">
                {g.items.map((article) => (
                  <li key={article.slug} className="leading-relaxed">
                    <Link href={`/articles/${article.slug}/`} className="text-blue-700 hover:underline">
                      {article.frontmatter.title}
                    </Link>
                    {article.frontmatter.summary && (
                      <span className="block text-sm text-neutral-600">
                        {article.frontmatter.summary}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
