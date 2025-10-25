// src/app/articles/ArticleTOC.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

type TocItem = { id: string; text: string; level: 2 | 3 };
type Variant = "mobile" | "desktop" | "both";

export default function ArticleTOC({
  targetSelector = "#article-content",
  variant = "both",
}: {
  targetSelector?: string;
  variant?: Variant;
}) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const root = document.querySelector<HTMLElement>(targetSelector);
    if (!root) return;

    const headings = Array.from(root.querySelectorAll<HTMLElement>("h2, h3")).filter((el) => el.id);
    const mapped: TocItem[] = headings.map((el) => ({
      id: el.id,
      text: (el.textContent ?? "").trim(),
      level: el.tagName === "H2" ? 2 : 3,
    }));
    setItems(mapped);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const h = e.target as HTMLElement;
            setActiveId(h.id);
          }
        }
      },
      { rootMargin: "0px 0px -70% 0px", threshold: 0.1 }
    );
    headings.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [targetSelector]);

  const hasItems = items.length > 0;
  const grouped = useMemo(() => items, [items]);
  if (!hasItems) return null;

  const showMobile = variant === "mobile" || variant === "both";
  const showDesktop = variant === "desktop" || variant === "both";

  return (
    <>
      {/* Mobile (collapsible) */}
      {showMobile && (
        <details className="lg:hidden mb-4 rounded-md border border-neutral-200 bg-white p-3">
          <summary className="cursor-pointer text-sm font-medium text-neutral-800 select-none">
            Sumário
          </summary>
          <nav className="mt-3">
            <ul className="space-y-1">
              {grouped.map((it) => (
                <li key={it.id} className={it.level === 3 ? "pl-4" : ""}>
                  <a
                    href={`#${it.id}`}
                    className={`block text-sm underline-offset-2 hover:underline ${
                      activeId === it.id ? "text-blue-700" : "text-neutral-700"
                    }`}
                  >
                    {it.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </details>
      )}

      {/* Desktop (sticky) */}
      {showDesktop && (
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-md border border-neutral-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-600 mb-2">
              Sumário
            </div>
            <nav>
              <ul className="space-y-1">
                {grouped.map((it) => (
                  <li key={it.id} className={it.level === 3 ? "pl-4" : ""}>
                    <a
                      href={`#${it.id}`}
                      className={`block text-sm underline-offset-2 hover:underline ${
                        activeId === it.id ? "text-blue-700" : "text-neutral-700"
                      }`}
                    >
                      {it.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>
      )}
    </>
  );
}
