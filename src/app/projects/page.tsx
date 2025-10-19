"use client";

import { useEffect, useState } from "react";

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

export default function ProjectsPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const totalPages = Math.ceil(repos.length / PROJECTS_PER_PAGE);
  const paginatedRepos = repos.slice(
    (currentPage - 1) * PROJECTS_PER_PAGE,
    currentPage * PROJECTS_PER_PAGE
  );

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
                  {repo.description
                    ? parseEmojis(repo.description)
                    : "Sem descrição."}
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

          {/* Paginação */}
          <div className="flex justify-center gap-2 pt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded border text-sm ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white"
                    : "hover:bg-neutral-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
            >
              Próxima
            </button>
          </div>
        </>
      )}

      <footer className="text-center text-sm text-neutral-500 border-t pt-6">
        © {new Date().getFullYear()} Guilherme Portella
      </footer>
    </main>
  );
}
