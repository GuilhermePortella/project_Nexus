// src/app/about/page.tsx
import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl p-6 space-y-10">
      <header className="space-y-2 text-center">
        <h1 className="text-4xl font-bold text-neutral-900">Sobre</h1>
        <p className="text-neutral-600 text-lg">
          Engenheiro de Software especializado em arquitetura backend, sistemas bancários e modernização de plataformas legadas.
        </p>
      </header>

      <div className="flex justify-center">
        <Image
          src="https://avatars.githubusercontent.com/u/59876059?v=4"
          alt="Foto de Guilherme Portella"
          width={250}
          height={250}
          className="rounded-full shadow-md object-cover"
          priority
        />
      </div>

      <section className="prose prose-neutral lg:prose-lg max-w-none">
        <p>
          Sou <strong>Guilherme Portella</strong>, Engenheiro de Software Backend com experiência sólida em
          <strong> Java, Spring Boot, arquitetura hexagonal, DDD e microsserviços</strong>. Ao longo da carreira,
          atuei em projetos estratégicos para grandes instituições financeiras como
          <strong> Banco do Brasil</strong>, <strong>Bradesco</strong> e <strong>Itaú Unibanco</strong>, conduzindo processos de modernização de sistemas,
          migração para nuvem (AWS e Azure) e reestruturação de aplicações legadas rumo a arquiteturas mais resilientes e escaláveis.
        </p>

        <p>
          Na <strong>IBM Brasil</strong>, fui mentor técnico certificado, ponto focal de homologação e produção, e colaborei
          em iniciativas internas voltadas à integração de times e disseminação de boas práticas de engenharia.
          Atualmente, no <strong>Itaú</strong>, sigo atuando em projetos de alto impacto no ecossistema de serviços digitais,
          com foco em qualidade de código, automação e governança técnica.
        </p>

        <p>
          Este site, em{" "}
          <a href="https://guilhermeportella.com.br" target="_blank" rel="noopener noreferrer">
            <strong>guilhermeportella.com.br</strong>
          </a>
          , é o meu hub pessoal: aqui organizo meus <strong>planos de estudo</strong> e publico notas sobre
          <strong> arquitetura de software</strong>, engenharia e liderança técnica. O objetivo é registrar, de forma honesta e iterativa,
          como projetar e evoluir sistemas complexos — equilibrando decisões de <strong>governança</strong> e <strong>migração</strong> com a prática
          cotidiana de desenvolvimento e revisão de código.
        </p>

        <p>
          Também mantenho o projeto acadêmico{" "}
          <a href="https://www.nf1hub.med.br" target="_blank" rel="noopener noreferrer">
            <strong>NF1 Study Hub</strong>
          </a>
          , que integra tecnologia e pesquisa médica em uma curadoria técnica com foco em Neurofibromatose Tipo 1 (NF1).
        </p>

        <p>
          Meu foco atual é 100% voltado a <strong>arquitetura moderna</strong> e <strong>governança técnica</strong> — incluindo
          <strong> estratégias de migração</strong>, <strong>liderança de times</strong> e <strong>desenho de ecossistemas distribuídos</strong> — sem perder a conexão com
          padrões de código, boas práticas e fundamentos que sustentam a engenharia de longo prazo.
        </p>
      </section>
    </main>
  );
}
