export type FaqCard = {
  id: string;
  question: string;
  answer: string;       
  links?: { href: string; label: string }[];
};

export function FaqGrid({ items }: { items: FaqCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((it) => (
        <details
          key={it.id}
          className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm open:shadow-md transition-shadow"
        >
          <summary className="cursor-pointer list-none text-left text-base font-semibold text-neutral-900">
            {it.question}
          </summary>
          <div className="mt-2 space-y-2 text-neutral-700">
            <p className="text-[0.95rem] leading-relaxed">{it.answer}</p>
            {it.links?.length ? (
              <div className="pt-1">
                {it.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="mr-3 text-sm text-blue-700 underline underline-offset-2 hover:text-blue-800"
                  >
                    {l.label} →
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </details>
      ))}
    </div>
  );
}
