"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Links do seu site pessoal (ajuste conforme for adicionando novas páginas)
const LINKS = [
  { href: "/", label: "Início" },
  { href: "/projects", label: "Projetos" },
  { href: "/articles", label: "Artigos" },
  { href: "/about", label: "Sobre" },
  { href: "https://github.com/GuilhermePortella", label: "GitHub", external: true },
];

export default function SiteNav() {
  const pathname = (usePathname() || "/").replace(/\/+$/, "") || "/";

  return (
    <nav className="site-nav sticky-top" aria-label="Primary">
      <div className="container inner">
        {/* Marca (pode virar logo futuramente) */}
        <Link className="site-brand" href="/">
          Guilherme Portella
        </Link>

        {/* Links principais */}
        <ul className="site-links" role="list">
          {LINKS.map(({ href, label, external }) => {
            const clean = href.replace(/\/+$/, "");
            const active =
              pathname === clean || (clean !== "/" && pathname.startsWith(clean));

            if (external) {
              return (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={active ? "active" : undefined}
                  >
                    {label}
                  </a>
                </li>
              );
            }

            return (
              <li key={href}>
                <Link href={href} className={active ? "active" : undefined}>
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
