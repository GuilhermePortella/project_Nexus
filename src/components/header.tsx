'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeSwitcher } from './theme-switcher'

const links = [
  { href: '/', label: 'Início' },
  { href: '/projects', label: 'Projetos' },
  { href: '/articles', label: 'Artigos' },
  { href: '/about', label: 'Sobre' },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b">
      <nav className="container flex items-center justify-between py-4">
        <Link href="/" className="font-semibold text-lg">
          GP
        </Link>

        <ul className="flex gap-4 text-sm">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={
                  pathname === link.href
                    ? 'underline font-medium'
                    : 'hover:underline'
                }
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <ThemeSwitcher />
      </nav>
    </header>
  )
}
