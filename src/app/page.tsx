// src/app/page.tsx
import Link from "next/link";
import { getAllArticles } from "@/lib/articles";

export default async function Home() {
  const recentArticles = await getAllArticles(3);

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold">Guilherme Portella</h1>
        <p className="text-lg text-neutral-600">
          Backend Engineer (Java/Spring), arquitetura de sistemas, microsserviços e Cloud (AWS/Azure).
        </p>
      </header>

      {/* Texto principal irreverente */}
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
          passa no <Link href="/about" className="text-blue-700 hover:underline">Sobre</Link>. 
          Se quiser ver como eu penso, é só continuar lendo os artigos abaixo. 👇
        </p>
      </section>

      {/* Artigos recentes */}
      <section className="space-y-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-2xl font-bold">Artigos Recentes</h2>
          <Link href="/articles/" className="text-sm text-blue-700 hover:underline">
            Ver todos &rarr;
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {recentArticles.length === 0 ? (
            <p className="text-sm text-neutral-500">Nenhum artigo publicado ainda.</p>
          ) : (
            recentArticles.map((article) => (
              <Link
                key={article.slug}
                href={`/articles/${article.slug}/`}
                className="block p-5 border rounded-lg hover:bg-neutral-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-blue-700 mb-2">
                  {article.frontmatter.title}
                </h3>
                {article.frontmatter.summary && (
                  <p className="text-sm text-neutral-600">
                    {article.frontmatter.summary}
                  </p>
                )}
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
