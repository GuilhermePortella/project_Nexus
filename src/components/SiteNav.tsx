"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Links principais do site
const LINKS = [
  { href: "/", label: "Início" },
  { href: "/projects", label: "Projetos" },
  { href: "/articles", label: "Artigos" },
  { href: "/about", label: "Sobre" },
  { href: "/curiosidades", label: "Curisosidades" },
];

export default function SiteNav() {
  const pathname = (usePathname() || "/").replace(/\/+$/, "") || "/";

  return (
    <nav className="site-nav sticky-top" aria-label="Primary">
      <div className="container inner">
        {/* Marca (nome ou logo futuramente) */}
        <Link className="site-brand" href="/">
          Guilherme Portella
        </Link>

        {/* Navegação principal */}
        <ul className="site-links" role="list">
          {LINKS.map(({ href, label }) => {
            const clean = href.replace(/\/+$/, "");
            const active =
              pathname === clean || (clean !== "/" && pathname.startsWith(clean));

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
