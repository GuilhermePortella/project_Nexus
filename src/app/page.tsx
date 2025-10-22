// src/app/page.tsx
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

export default async function Home() {
  const recentArticles = await getAllArticles(3);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-12">
      {/* Header mais editorial */}
      <header className="space-y-3">
        <h1 className="text-4xl font-bold h-serif">Guilherme Portella</h1>
        <p className="text-lg text-neutral-600">
          Backend Engineer (Java/Spring). Arquitetura de sistemas, microsserviços e Cloud (AWS/Azure).
        </p>
      </header>

      {/* Texto principal (mantém o tom, com leitura mais confortável) */}
      <section className="space-y-4 text-neutral-800">
        <p>
          Eu gosto de código limpo, arquitetura sólida e sistemas que não implodem na virada do mês.
          Mas sejamos honestos: todo dev já fez um quick and dirty que virou permanente.
          A diferença é admitir e documentar a desgraça.
        </p>

        <p>
          Meu trabalho gira em torno de <strong>Java</strong> e <strong>Spring Boot</strong>,
          e não — não é porque gosto de verbos como “Factory” ou “Manager” no nome da classe.
          É porque sistemas bancários não perdoam má arquitetura, e é ali que a brincadeira acaba.
          Já vi monólitos tentando fingir que são microserviços, e microserviços tentando voltar a ser monólitos.
          Spoiler: nenhum dos dois estava feliz.
        </p>

        <p>
          Não sou do time que acha que o framework vai salvar o projeto.
          Nem daquele que chama de “arquitetura limpa” um código que precisa de GPS pra entender o fluxo.
          Prefiro a escola do “funciona, mas com propósito”: cada abstração tem que pagar o próprio aluguel.
        </p>

        <p>
          Eu acredito que <strong>boa engenharia</strong> nasce do atrito entre o ideal técnico e o caos da vida real.
          E que liderança técnica é, na prática, a arte de dizer “não” com didática.
          Às vezes o melhor refactor é só um bom README explicando porque <em>não</em> mexer.
        </p>

        <p>
          Se quiser a versão mais formal,
          passa no <Link href="/about" className="text-blue-700 underline underline-offset-2 hover:text-blue-800">Sobre</Link>.
          Se quiser ver como eu penso, é só continuar lendo os artigos abaixo. 👇
        </p>
      </section>

      {/* Artigos recentes — estilo acadêmico (barra esquerda + título serifado) */}
      <section className="space-y-6">
        <div className="flex justify-between items-baseline border-b pb-3">
          <h2 className="text-2xl font-bold h-serif">Artigos Recentes</h2>
          <Link href="/articles/" className="text-sm text-blue-700 underline underline-offset-2 hover:text-blue-800">
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
                      <h3 className="text-[1.125rem] font-semibold text-neutral-900 font-[ui-serif,Georgia,Times,serif]">
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
                        <p className="text-sm text-neutral-700">
                          {article.frontmatter.summary}
                        </p>
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
    </main>
  );
}
