"use client";

import { useEffect, useMemo, useState } from "react";

type Repo = {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
};

const PROJECTS_PER_PAGE = 6;

// converte shortcodes de emoji tipo :rocket: → 🚀
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

/** Hook simples de breakpoints para definir vizinhança da página */
function useNeighborWindow() {
  const [neighbors, setNeighbors] = useState(1); // mobile: ±1

  useEffect(() => {
    const mqMd = window.matchMedia("(min-width: 768px)");
    const mqLg = window.matchMedia("(min-width: 1024px)");

    const compute = () => {
      if (mqLg.matches) setNeighbors(7); // lg: ±3
      else if (mqMd.matches) setNeighbors(5); // md: ±2
      else setNeighbors(3); // sm: ±1
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

/**
 * Gera itens de paginação com reticências.
 * - edgeCount: quantos números mostrar fixos no começo/fim (ex.: 1, 2 ... ... 19, 20)
 * - neighbors: quantos vizinhos ao redor da página atual (±neighbors)
 * Retorna números (páginas) e a string "..." para reticências.
 */
function getPaginationItems(total: number, current: number, neighbors: number, edgeCount = 1) {
  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
  const page = clamp(current, 1, Math.max(1, total));

  const range = (a: number, b: number) => {
    const out: number[] = [];
    for (let i = a; i <= b; i++) out.push(i);
    return out;
  };

  if (total <= 1) return [1];

  const start = range(1, Math.min(edgeCount, total));
  const end = range(Math.max(total - edgeCount + 1, edgeCount + 1), total);

  const middleStart = clamp(page - neighbors, edgeCount + 1, total - edgeCount);
  const middleEnd = clamp(page + neighbors, edgeCount, total - edgeCount);

  const items: (number | "...")[] = [];

  // início
  items.push(...start);

  // reticências entre início e meio
  if (middleStart > start[start.length - 1] + 1) items.push("...");
  // meio
  if (middleEnd >= middleStart) items.push(...range(middleStart, middleEnd));
  // reticências entre meio e fim
  if (end.length && end[0] > (items[items.length - 1] as number) + 1) items.push("...");

  // fim
  items.push(...end);

  // dedup de números contíguos repetidos
  const dedup: (number | "...")[] = [];
  for (const it of items) {
    if (dedup.length === 0) dedup.push(it);
    else {
      const last = dedup[dedup.length - 1];
      if (last === "..." && it === "...") continue;
      if (typeof last === "number" && typeof it === "number" && last === it) continue;
      dedup.push(it);
    }
  }

  return dedup;
}

export default function ProjectsPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const totalPages = Math.max(1, Math.ceil(repos.length / PROJECTS_PER_PAGE));
  const paginatedRepos = repos.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  );

  // Ajusta currentPage se o total de páginas mudar (ex.: após fetch)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    async function fetchRepos() {
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
    }
    fetchRepos();
  }, []);

  const neighbors = useNeighborWindow();

  const pageItems = useMemo(
    () => getPaginationItems(totalPages, currentPage, neighbors, 1),
    [totalPages, currentPage, neighbors]
  );

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-12">
      <header className="space-y-4 text-center">
        <h1 className="text-4xl font-bold">Projetos no GitHub 🚀</h1>
        <p className="text-neutral-10">
          Todos os repositórios públicos do meu GitHub são listados
          automaticamente abaixo. Você pode navegar entre páginas.
        </p>
      </header>

      {loading && (
        <p className="text-center text-neutral-10 animate-pulse">
          Carregando projetos...
        </p>
      )}

      {error && (
        <p className="text-center text-red-10">
          Erro ao carregar projetos do GitHub.
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedRepos.map((repo) => (
              <div
                key={repo.id}
                className="border rounded-lg p-5 hover:bg-neutral-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-blue-10 mb-2">
                  {repo.name}
                </h3>
                <p className="text-sm text-neutral-600 line-clamp-3 mb-3">
                  {repo.description ? parseEmojis(repo.description) : "Sem descrição."}
                </p>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver no GitHub →
                </a>
              </div>
            ))}
          </div>

          {/* Paginação com reticências (responsiva) */}
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
                  <li key={`e-${idx}`} className="px-2 text-neutral-500 select-none">
                    …
                  </li>
                ) : (
                  <li key={it}>
                    <button
                      onClick={() => setCurrentPage(it)}
                      aria-current={it === currentPage ? "page" : undefined}
                      className={
                        "px-3 py-1 rounded border text-sm " +
                        (it === currentPage
                          ? "bg-blue-600 text-white border-blue-600"
                          : "hover:bg-neutral-100")
                      }
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
