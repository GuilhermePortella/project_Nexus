import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

function safeDate(d?: string): Date | null {
  if (!d) return null;
  const t = Date.parse(d);
  return Number.isNaN(t) ? null : new Date(d);
}
function dateLabel(d?: string): string | null {
  const dt = safeDate(d);
  if (!dt) return null;
  try {
    return dt.toLocaleDateString("pt-BR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return null;
  }
}

/* =========================
   Componentes locais (Tailwind puro)
========================= */
// function SearchBar() {
//   return (
//     <div className="relative mx-auto w-full max-w-2xl">
//       <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
//         <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden className="opacity-80">
//           <path
//             fill="currentColor"
//             d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
//           />
//         </svg>
//       </div>
//       <input
//         type="search"
//         placeholder="Buscar por artigo, tema ou palavra-chave"
//         className="h-14 w-full rounded-full border border-neutral-300 bg-white pl-12 pr-4 text-base
//                    text-neutral-800 placeholder:text-neutral-400
//                    focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
//         aria-label="Buscar conteúdo"
//       />
//     </div>
//   );
// }

function CTAcard({
  title,
  description,
  href,
  linkText,
}: {
  title: string;
  description: string;
  href: string;
  linkText: string;
}) {
  return (
    <div className="h-full rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-5">
        <h3 className="text-lg font-semibold tracking-tight text-neutral-900">{title}</h3>
        <p className="mt-1.5 text-sm text-neutral-600">{description}</p>
      </div>
      <div className="border-t border-neutral-200 p-4">
        <Link
          href={href}
          className="group inline-flex w-full items-center justify-between text-sm font-medium text-neutral-900"
        >
          <span className="underline underline-offset-2 group-hover:no-underline">{linkText}</span>
          <span aria-hidden className="ml-2 transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}

export type FaqCard = {
  id: string;
  question: string;
  answer: string;
  links?: { href: string; label: string }[];
};

function FaqGrid({ items }: { items: FaqCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((it) => (
        <details
          key={it.id}
          className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm open:shadow-md transition-shadow"
        >
          <summary className="cursor-pointer list-none text-left text-base font-semibold text-neutral-900">
            {it.question}
          </summary>
          <div className="mt-2 space-y-2 text-neutral-700">
            <p className="text-[0.95rem] leading-relaxed">{it.answer}</p>
            {it.links?.length ? (
              <div className="pt-1">
                {it.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="mr-3 text-sm text-blue-700 underline underline-offset-2 hover:text-blue-800"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}

export default async function Home() {
  const recentArticles = await getAllArticles(3);

  const faqCanonicas: FaqCard[] = [
    {
      id: "hexagonal",
      question: "Como migrar um legado para Arquitetura Hexagonal sem parar o mundo?",
      answer:
        "Desacople casos de uso do transporte/persistência. Crie portas/adaptadores finos e migre periféricos em torno de um core estável.",
      links: [{ href: "/articles/sua-slug-hexagonal/", label: "Guia prático" }],
    },
    {
      id: "ddd",
      question: "DDD vale a pena em times pequenos?",
      answer:
        "Quando há linguagem ubíqua e regras de negócio não triviais, sim — o ganho está na clareza do modelo, não no tamanho do time.",
      links: [{ href: "/articles/sua-slug-ddd/", label: "Artigo DDD" }],
    },
    {
      id: "finops",
      question: "Como começar FinOps sem travar a equipe?",
      answer:
        "Defina métricas de custo por serviço, orçamento por squad e automações de desligamento/rightsizing. Comece pequeno e mensure.",
      links: [{ href: "/articles/sua-slug-finops/", label: "Playbook inicial" }],
    },
    {
      id: "observability",
      question: "Observabilidade mínima para sistemas críticos?",
      answer:
        "Rastreabilidade distribuída, logs estruturados, métricas RED/USE e p99 de latência com SLOs e alertas orientados a sintomas.",
      links: [{ href: "/articles/sua-slug-observabilidade/", label: "Checklist prático" }],
    },
  ];

  return (
    <main>
      <section className="relative bg-neutral-50">
        <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mb-10 text-center">
            <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Guilherme Portella
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-neutral-600 text-balance">
              Backend Engineer (Java/Spring). Arquitetura de sistemas, microsserviços e Cloud (AWS/Azure).
            </p>
          </div>

          <div className="mb-14">
            {/* <SearchBar /> */}
          </div>

          <div className="mx-auto -mb-36 grid max-w-6xl gap-6 md:grid-cols-3">
            <CTAcard
              title="Artigos"
              description="Conteúdo técnico sobre arquitetura, DDD, hexagonal e práticas modernas."
              linkText="Ver artigos"
              href="/articles/"
            />
            <CTAcard
              title="Sobre"
              description="Perfil, trajetória e visão de engenharia — direto ao ponto."
              linkText="Abrir página Sobre"
              href="/about"
            />
            <CTAcard
              title="Projetos"
              description="Repositórios públicos no GitHub com exemplos e estudos."
              linkText="Explorar projetos"
              href="/projects"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pt-40 pb-6 space-y-6">
        <div className="flex items-baseline justify-between border-b pb-3">
          <h2 className="h-serif text-2xl font-bold">Artigos Recentes</h2>
          <Link
            href="/articles/"
            className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-800"
          >
            Ver todos →
          </Link>
        </div>

        {recentArticles.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum artigo publicado ainda.</p>
        ) : (
          <ul className="space-y-3">
            {recentArticles.map((article) => {
              const d = dateLabel(article.frontmatter.publishedAt);
              return (
                <li key={article.slug}>
                  <Link
                    href={`/articles/${article.slug}/`}
                    className="group block border-l-4 border-neutral-300 bg-white p-4 transition hover:border-neutral-900"
                  >
                    <article className="space-y-1.5">
                      <h3 className="font-[ui-serif,Georgia,Times,serif] text-[1.125rem] font-semibold text-neutral-900">
                        <span className="underline decoration-transparent group-hover:decoration-neutral-900">
                          {article.frontmatter.title}
                        </span>
                      </h3>

                      <div className="text-xs text-neutral-600">
                        {d ?? "Sem data"}
                        {article.frontmatter.tags?.length ? (
                          <>
                            {" "}&middot;{" "}
                            <span className="uppercase tracking-wide">
                              {article.frontmatter.tags.join(" · ")}
                            </span>
                          </>
                        ) : null}
                      </div>

                      {article.frontmatter.summary && (
                        <p className="text-sm text-neutral-700">{article.frontmatter.summary}</p>
                      )}

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
        )}
      </section>

      <section className="bg-white py-16 md:py-28">
        <div className="container mx-auto px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-2xl font-bold md:text-3xl">Perguntas frequentes</h2>
            <p className="mx-auto max-w-3xl text-neutral-600">
              Respostas diretas para dúvidas recorrentes. Para aprofundar, veja os artigos indicados.
            </p>
          </div>
          <FaqGrid items={faqCanonicas} />
        </div>
      </section>
    </main>
  );
}
