// src/app/curiosidades/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curiosidades | Guilherme Portella",
  description: "Filmes, séries e músicas que gosto — sessão não-técnica do site.",
};

export default function CuriosidadesPage() {
  return (
    <main className="mx-auto max-w-4xl p-6 space-y-10">
      <header className="space-y-2 border-b border-neutral-800 pb-4">
        <h1 className="text-4xl font-bold">Curiosidades</h1>
        <p className="text-neutral-700 text-lg">
          Fora da arquitetura: o que eu assisto e escuto.
        </p>
      </header>

      {/* Favoritos: Filmes & Séries */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Filmes & Séries</h2>
        <p className="text-neutral-900">Quando não estou modelando domínios, provavelmente estou revendo algo daqui:</p>
        <ul className="list-disc list-inside text-neutral-900 space-y-1">
          <li>🎬 <em>Interstellar</em> (Nolan)</li>
          <li>🧪 <em>Mr. Robot</em></li>
          <li>🧠 <em>Rick and Morty</em></li>
          <li>🤠 <em>Yellowstone</em></li>
          <li>🔬 <em>The Big Bang Theory</em></li>
        </ul>
      </section>

      {/* Música — Playlist do Spotify */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Músicas</h2>
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
