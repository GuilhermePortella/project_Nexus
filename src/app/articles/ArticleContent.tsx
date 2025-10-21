"use client";
import { useEffect, useRef } from "react";

export default function ArticleContent({ html }: { html: string }) {
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const root = ref.current;
      if (!root) return;

      const pres = Array.from(root.querySelectorAll("pre"));
      pres.forEach((pre) => {
         if (pre.querySelector('[data-copy="btn"]')) return;
         const btn = document.createElement("button");
         btn.setAttribute("data-copy", "btn");
         btn.className =
            "absolute top-2 right-2 rounded-md border px-2 py-1 text-xs bg-white/80 backdrop-blur border-neutral-300 hover:bg-white transition";
         btn.innerText = "Copiar";
         (pre as HTMLElement).style.position = "relative";
         pre.appendChild(btn);

         btn.addEventListener("click", async () => {
            const code = pre.querySelector("code")?.textContent ?? "";
            try {
               await navigator.clipboard.writeText(code);
               btn.innerText = "Copiado!";
               setTimeout(() => (btn.innerText = "Copiar"), 1500);
            } catch {
               btn.innerText = "Falhou";
               setTimeout(() => (btn.innerText = "Copiar"), 1500);
            }
         });
      });
   }, [html]);

   return (
      <div
         ref={ref}
         className="prose prose-neutral lg:prose-lg max-w-none"
         dangerouslySetInnerHTML={{ __html: html }}
      />
   );
}
