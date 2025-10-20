// src/app/articles/page.tsx
import Link from "next/link";
import ArticlesSearch from "./ArticlesSearch";
import YearMonthFilter from "./YearMonthFilter";
import ArticlesByYearList from "./ArticlesByYearList";
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
    const label = d.getTime() === 0 ? "Sem data" : `${year} - ${monthTitle(d)}`;
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
          Diretão: posts filtrados por ano e agrupados por mês, com busca por título, resumo e conteúdo.
        </p>
      </header>

      {/* Busca (client) */}
      <ArticlesSearch index={searchIndex} />

      {/* Filtro Ano + Meses do ano selecionado (client) */}
      <YearMonthFilter groups={grouped.map(g => ({ id: g.id, label: g.label, key: g.key }))} />

      {/* Lista apenas do ano selecionado (client) */}
      {grouped.length === 0 ? (
        <p className="text-neutral-500">Nenhum artigo publicado ainda.</p>
      ) : (
        <ArticlesByYearList groups={grouped} />
      )}
    </main>
  );
}
