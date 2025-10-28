"use client";

import { useEffect, useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count?: number;
  language?: string | null;
  homepage?: string | null;
};

const PROJECTS_PER_PAGE = 6;

// --------- Emojis básicos
function parseEmojis(text: string | null): string {
  if (!text) return "";
  return text
    .replace(/:camera:/g, "📷")
    .replace(/:rocket:/g, "🚀")
    .replace(/:star:/g, "⭐")
    .replace(/:fire:/g, "🔥")
    .replace(/:zap:/g, "⚡")
    .replace(/:computer:/g, "💻")
    .replace(/:bug:/g, "🐛")
    .replace(/:tada:/g, "🎉")
    .replace(/:art:/g, "🎨")
    .replace(/:memo:/g, "📝")
    .replace(/:lock:/g, "🔒")
    .replace(/:mag:/g, "🔍")
    .replace(/:books?:/g, "📚")
    .replace(/:pencil:/g, "✏️")
    .replace(/:eyes:/g, "👀");
}

/** breakpoints → vizinhos (sm ±1, md ±2, lg ±3) */
function useNeighborWindow() {
  const [neighbors, setNeighbors] = useState(1);
  useEffect(() => {
    const mqMd = window.matchMedia("(min-width: 768px)");
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const compute = () => {
      if (mqLg.matches) setNeighbors(3);
      else if (mqMd.matches) setNeighbors(2);
      else setNeighbors(1);
    };
    compute();
    mqMd.addEventListener("change", compute);
    mqLg.addEventListener("change", compute);
    return () => {
      mqMd.removeEventListener("change", compute);
      mqLg.removeEventListener("change", compute);
    };
  }, []);
  return neighbors;
}

/** paginação com reticências */
function getPaginationItems(total: number, current: number, neighbors: number, edgeCount = 1) {
  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  const page = clamp(current, 1, Math.max(1, total));
  const range = (a: number, b: number) => Array.from({ length: Math.max(0, b - a + 1) }, (_, i) => a + i);
  if (total <= 1) return [1];

  const start = range(1, Math.min(edgeCount, total));
  const end = range(Math.max(total - edgeCount + 1, edgeCount + 1), total);

  const middleStart = clamp(page - neighbors, edgeCount + 1, total - edgeCount);
  const middleEnd = clamp(page + neighbors, edgeCount, total - edgeCount);

  const items: (number | "...")[] = [];
  items.push(...start);
  if (middleStart > start[start.length - 1] + 1) items.push("...");
  if (middleEnd >= middleStart) items.push(...range(middleStart, middleEnd));
  if (end.length && end[0] > (items[items.length - 1] as number) + 1) items.push("...");
  items.push(...end);

  // dedup
  const dedup: (number | "...")[] = [];
  for (const it of items) {
    const last = dedup[dedup.length - 1];
    if (last === "..." && it === "...") continue;
    if (typeof last === "number" && typeof it === "number" && last === it) continue;
    dedup.push(it);
  }
  return dedup;
}

/** formata número de estrelas */
const fmt = new Intl.NumberFormat("en-US", { notation: "compact" });

const SORT_OPTIONS = ["recent", "stars", "az"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];
function isSortOption(v: string): v is SortOption {
  return (SORT_OPTIONS as readonly string[]).includes(v);
}

export default function ProjectsPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // toolbar state
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");

  // fetch
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          "https://api.github.com/users/guilhermeportella/repos?sort=pushed&per_page=100"
        );
        if (!res.ok) throw new Error("Erro na requisição");
        const data = await res.json();
        setRepos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // filtra + ordena
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = repos.filter((r) => {
      if (!q) return true;
      const hay = `${r.name} ${r.description ?? ""}`.toLowerCase();
      return hay.includes(q);
    });

    if (sort === "stars") {
      arr = arr.sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0));
    } else if (sort === "az") {
      arr = arr.sort((a, b) => a.name.localeCompare(b.name));
    }
    return arr;
  }, [repos, query, sort]);

  // paginação
  const totalPages = Math.max(1, Math.ceil(filtered.length / PROJECTS_PER_PAGE));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const start = (currentPage - 1) * PROJECTS_PER_PAGE;
  const paginatedRepos = filtered.slice(start, start + PROJECTS_PER_PAGE);

  const neighbors = useNeighborWindow();
  const pageItems = useMemo(
    () => getPaginationItems(totalPages, currentPage, neighbors, 1),
    [totalPages, currentPage, neighbors]
  );

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-10">
      {/* Heading */}
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-bold">Projetos no GitHub 🚀</h1>
        <p className="text-neutral-600">
          Repositórios públicos atualizados com frequência. Filtre, ordene e explore.
        </p>
      </header>

      {/* Toolbar */}
      <section className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-1">
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nome ou descrição…"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            aria-label="Buscar repositórios"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-neutral-600">Ordenar:</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              const v = e.target.value;
              if (isSortOption(v)) setSort(v);
            }}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <option value="recent">Recentes</option>
            <option value="stars">Mais estrelados</option>
            <option value="az">A → Z</option>
          </select>
        </div>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: PROJECTS_PER_PAGE }).map((_, i) => (
            <div key={i} className="rounded-lg border border-neutral-200 p-5">
              <div className="h-5 w-2/3 bg-neutral-200 rounded mb-3 animate-pulse" />
              <div className="h-4 w-full bg-neutral-100 rounded mb-2 animate-pulse" />
              <div className="h-4 w-5/6 bg-neutral-100 rounded mb-6 animate-pulse" />
              <div className="h-8 w-32 bg-neutral-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-600">Erro ao carregar projetos do GitHub.</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-neutral-500">Nenhum projeto encontrado para “{query}”.</p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRepos.map((repo) => (
              <ProjectCard
                key={repo.id}
                name={repo.name}
                description={repo.description ? parseEmojis(repo.description) : "Sem descrição."}
                stars={repo.stargazers_count ?? 0}
                language={repo.language ?? null}
                githubUrl={repo.html_url}
                homepage={repo.homepage ?? null}
              />
            ))}
          </div>

          {/* Paginação com reticências */}
          <nav className="pt-6">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              <li>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  aria-label="Página anterior"
                >
                  Anterior
                </button>
              </li>

              {pageItems.map((it, idx) =>
                it === "..." ? (
                  <li key={`e-${idx}`} className="px-2 text-neutral-500 select-none">…</li>
                ) : (
                  <li key={it}>
                    <button
                      onClick={() => setCurrentPage(it)}
                      aria-current={it === currentPage ? "page" : undefined}
                      className={`px-2.5 py-1 text-sm border border-neutral-300
                      ${it === currentPage ? "bg-neutral-100" : "hover:bg-neutral-50"}
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    >
                      {it}
                    </button>
                  </li>

                )
              )}

              <li>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-50"
                  aria-label="Próxima página"
                >
                  Próxima
                </button>
              </li>
            </ul>
          </nav>
        </>
      )}

      <footer className="text-center text-sm text-neutral-500 border-t pt-6">
        © {new Date().getFullYear()} Guilherme Portella
      </footer>
    </main>
  );
}
