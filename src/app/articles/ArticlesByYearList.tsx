"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ArticleIndexItem = {
  slug: string;
  frontmatter: {
    title: string;
    summary?: string;
    tags?: string[];
    publishedAt?: string;
  };
};

type Group = {
  id: string; // "YYYY-MM"
  label: string; // "YYYY - Mês"
  key: { year: number; month: number }; // month 0..11
  items: ArticleIndexItem[];
};

function safeDate(d?: string): Date | null {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(t);
}
function formatCardDate(iso?: string): string | null {
  const d = safeDate(iso);
  if (!d) return null;
  return d.toLocaleDateString("pt-BR", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

export default function ArticlesByYearList({ groups }: { groups: Group[] }) {
  const sp = useSearchParams();
  const urlYear = sp.get("year");
  const selectedYear =
    urlYear && /^\d{4}$/.test(urlYear) ? parseInt(urlYear, 10) : null;

  // fallback: se não há ?year, mostra o ano mais recente presente
  const yearsPresent = Array.from(
    new Set(groups.map((g) => g.key.year))
  ).sort((a, b) => b - a);
  const activeYear = selectedYear ?? yearsPresent[0];

  const visible = groups.filter((g) => g.key.year === activeYear);

  if (visible.length === 0) {
    return <p className="text-neutral-500">Nenhum artigo para este ano.</p>;
  }

  return (
    <section className="space-y-10">
      {visible.map((g) => (
        <div key={g.id} className="space-y-4">
          <h2 id={g.id} className="text-2xl font-semibold text-neutral-900 scroll-mt-24">
            {g.label}
          </h2>

          <ul className="grid grid-cols-1 gap-4">
            {g.items.map((article) => {
              const dateLabel = formatCardDate(article.frontmatter.publishedAt);
              const href = `/articles/${article.slug}/`;
              const title = article.frontmatter.title || article.slug;
              const summary = article.frontmatter.summary;

              return (
                <li key={article.slug}>
                  <Link
                    href={href}
                    className="group block rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    <article className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        {dateLabel && <time aria-label="Data de publicação">{dateLabel}</time>}
                        {article.frontmatter.tags?.length ? (
                          <>
                            <span aria-hidden>&middot;</span>
                            <ul className="inline-flex flex-wrap gap-1">
                              {article.frontmatter.tags.slice(0, 3).map((t) => (
                                <li
                                  key={t}
                                  className="rounded-full border px-2 py-0.5 text-[11px] leading-5 text-neutral-600"
                                >
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </div>

                      <h3 className="text-lg font-semibold leading-snug text-neutral-900">
                        {title}
                      </h3>

                      {summary ? (
                        <p className="text-sm text-neutral-700 overflow-hidden text-ellipsis">
                          {summary}
                        </p>
                      ) : null}
                    </article>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
