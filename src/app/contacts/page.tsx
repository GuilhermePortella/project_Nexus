// src/app/contact/page.tsx
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contato | Guilherme Portella",
  description: "Canais de contato, redes e um pouco do que eu curto — filmes, séries e música.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-10">
      <header className="space-y-2 border-b pb-4">
        <h1 className="text-4xl font-bold text-neutral-900">Contato</h1>
        <p className="text-neutral-600 text-lg">
          Canais diretos, redes sociais e algumas preferências pessoais — porque nem só de arquitetura vive um engenheiro.
        </p>
      </header>

      {/* Redes e Contatos */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-900">Redes e Contatos</h2>
        <ul className="space-y-2">
          <li>
            <Link href="mailto:guilherme@guilhermeportella.com.br" className="text-blue-700 hover:underline">
              ✉️ E-mail profissional
            </Link>
          </li>
          <li>
            <Link href="https://www.linkedin.com/in/guilherme-portella/" target="_blank" className="text-blue-700 hover:underline">
              💼 LinkedIn
            </Link>
          </li>
          <li>
            <Link href="https://github.com/GuilhermePortella" target="_blank" className="text-blue-700 hover:underline">
              🧠 GitHub
            </Link>
          </li>
          <li>
            <Link href="https://x.com/guilhermepcodes" target="_blank" className="text-blue-700 hover:underline">
              🐦 X (Twitter)
            </Link>
          </li>
        </ul>
      </section>

      {/* Favoritos: Filmes & Séries */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-900">Favoritos — Filmes & Séries</h2>
        <p className="text-neutral-700">
          Quando não estou modelando domínios, provavelmente estou revendo algo daqui:
        </p>
        <ul className="list-disc list-inside text-neutral-800 space-y-1">
          <li>🎬 <em>Interstellar</em> (Nolan)</li>
          <li>🧪 <em>Mr. Robot</em></li>
          <li>🧠 <em>Rick and Morty</em></li>
          <li>🤠 <em>Yellowstone</em></li>
          <li>🔬 <em>The Big Bang Theory</em></li>
        </ul>
      </section>

      {/* Música — Playlist do Spotify */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-neutral-900">Músicas</h2>
        <p className="text-neutral-700">
        </p>

        <div className="flex justify-center">
          <iframe
            data-testid="embed-iframe"
            style={{ borderRadius: "12px" }}
            src="https://open.spotify.com/embed/playlist/3LuwLZF9DuqtT5n92wCmcU?utm_source=generator&theme=0"
            width="90%"
            height="152"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </section>
    </main>
  );
}
