// src/app/articles/ArticlesSearch.tsx
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { ArticleSearchDoc } from "@/lib/articles";

function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return <>{text}</>;
  const q = query.trim();
  const esc = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(esc, "ig");
  const parts: (string | React.ReactNode)[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <mark key={m.index} className="bg-yellow-200 rounded px-0.5">
        {m[0]}
      </mark>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function makeSnippet(content: string, query: string, max = 160): string {
  if (!query.trim()) return "";
  const idx = content.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return content.slice(0, max) + (content.length > max ? "…" : "");
  const start = Math.max(0, idx - Math.floor(max / 2));
  const end = Math.min(content.length, start + max);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < content.length ? "…" : "";
  return prefix + content.slice(start, end) + suffix;
}

function normalize(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

export default function ArticlesSearch({ index }: { index: ArticleSearchDoc[] }) {
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const query = q.trim();
    if (!query) return [];
    const nq = normalize(query);
    return index.filter((doc) => {
      const hay = [
        normalize(doc.title),
        normalize(doc.summary ?? ""),
        normalize(doc.content),
      ].join(" ");
      return hay.includes(nq);
    });
  }, [q, index]);

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por título, resumo ou conteúdo…"
          className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Buscar artigos"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="text-sm text-neutral-600 hover:text-neutral-900"
            aria-label="Limpar busca"
          >
            Limpar
          </button>
        )}
      </div>

      {q && (
        <div className="space-y-2">
          <div className="text-sm text-neutral-600">
            {results.length} resultado{results.length === 1 ? "" : "s"} para{" "}
            <strong>“{q}”</strong>
          </div>

          {results.length === 0 ? (
            <p className="text-neutral-500">Nada encontrado. Tente outra palavra ou frase.</p>
          ) : (
            <ul className="space-y-3">
              {results.map((r) => {
                const snippet = makeSnippet(r.content, q);
                return (
                  <li key={r.slug} className="leading-relaxed">
                    <Link href={`/articles/${r.slug}/`} className="text-blue-700 hover:underline">
                      {highlight(r.title, q)}
                    </Link>
                    {r.summary && (
                      <div className="text-sm text-neutral-600">
                        {highlight(r.summary, q)}
                      </div>
                    )}
                    {snippet && (
                      <div className="text-xs text-neutral-500">
                        {highlight(snippet, q)}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
