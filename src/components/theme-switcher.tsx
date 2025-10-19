'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeSwitcher() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch (Next.js padrão)
  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  // Determina tema atual (respeita o sistema)
  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      className="rounded-md border px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
      onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
    >
      {currentTheme === 'dark' ? '☀️ Claro' : '🌙 Escuro'}
    </button>
  )
}
