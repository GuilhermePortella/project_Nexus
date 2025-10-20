"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Group = {
   id: string; // ex: "2025-10"
   label: string; // ex: "2025 - Outubro"
   key: { year: number; month: number }; // month 0..11
};

function classNames(...xs: (string | false | null | undefined)[]) {
   return xs.filter(Boolean).join(" ");
}

export default function YearMonthFilter({ groups }: { groups: Group[] }) {
   const router = useRouter();
   const sp = useSearchParams();

   const { years, monthsByYear, defaultYear } = useMemo(() => {
      const yearsSet = new Set<number>();
      const map = new Map<number, Group[]>();
      for (const g of groups) {
         yearsSet.add(g.key.year);
         const arr = map.get(g.key.year) ?? [];
         arr.push(g);
         map.set(g.key.year, arr);
      }
      const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);
      for (const y of sortedYears) {
         map.set(
            y,
            (map.get(y) ?? []).sort((a, b) =>
               a.key.month === b.key.month ? 0 : a.key.month - b.key.month
            )

         );
      }
      return {
         years: sortedYears,
         monthsByYear: map,
         defaultYear: sortedYears[0],
      };
   }, [groups]);

   const urlYear = sp.get("year");
   const initialYear =
      urlYear && /^\d{4}$/.test(urlYear) ? parseInt(urlYear, 10) : undefined;

   const [year, setYear] = useState<number>(initialYear ?? defaultYear);

   // mantém URL em sincronia (?year=YYYY)
   useEffect(() => {
      const current = sp.get("year");
      const next = String(year);
      if (current !== next) {
         const params = new URLSearchParams(sp.toString());
         params.set("year", next);
         router.replace(`?${params.toString()}`, { scroll: false });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [year]);

   const months = monthsByYear.get(year) ?? [];

   return (
      <div className="space-y-3">
         {/* Chips de anos */}
         <div className="flex flex-wrap gap-2">
            {years.map((y) => (
               <button
                  key={y}
                  type="button"
                  onClick={() => setYear(y)}
                  className={classNames(
                     "rounded-full border px-3 py-1 text-sm transition",
                     year === y
                        ? "border-neutral-900 text-neutral-900 bg-neutral-100"
                        : "border-neutral-300 text-neutral-600 hover:border-neutral-400 hover:text-neutral-800"
                  )}
                  aria-pressed={year === y}
               >
                  {y}
               </button>
            ))}
         </div>

         {/* Índice de meses do ano selecionado */}
         {months.length > 0 && (
            <nav className="text-sm text-neutral-600">
               <span className="mr-2">Meses:</span>
               <ul className="inline-flex flex-wrap gap-x-3 gap-y-2">
                  {months.map((g) => (
                     <li key={g.id}>
                        <a href={`#${g.id}`} className="hover:underline">
                           {g.label.replace(`${year} - `, "")}
                        </a>
                     </li>
                  ))}
               </ul>
            </nav>
         )}
      </div>
   );
}
