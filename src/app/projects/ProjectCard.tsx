import * as React from "react";

export type ProjectCardProps = {
   name: string;
   description?: string | null;
   stars?: number;
   language?: string | null;
   githubUrl: string;
   homepage?: string | null;
};

function hostname(url?: string | null) {
   if (!url) return null;
   try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, "");
   } catch {
      return null;
   }
}

export default function ProjectCard({
   name,
   description,
   stars = 0,
   language,
   githubUrl,
   homepage,
}: ProjectCardProps) {
   const site = hostname(homepage);

   return (
      <article
         className="group flex h-full flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition
                 hover:shadow-md focus-within:shadow-md"
      >
         <div className="space-y-2.5">
            <h3 className="text-lg font-semibold tracking-tight text-neutral-900">
               <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-transparent underline-offset-2 transition group-hover:decoration-neutral-900"
               >
                  {name}
               </a>
            </h3>

            {description && (
               <p className="text-sm text-neutral-700 line-clamp-3">{description}</p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-neutral-600">
               <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-2 py-0.5">
                  <span aria-hidden>⭐</span>
                  {Intl.NumberFormat("en-US", { notation: "compact" }).format(stars)}
               </span>
               {language && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-2 py-0.5">
                     {language}
                  </span>
               )}
               {site && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-50 px-2 py-0.5">
                     {site}
                  </span>
               )}
            </div>
         </div>

         <div className="mt-4 flex items-center gap-2">
            <a
               href={githubUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center justify-center rounded-md border border-neutral-300 px-3 py-1.5 text-sm
                     text-neutral-800 hover:bg-neutral-100"
            >
               GitHub
            </a>

            {homepage && /^https?:\/\//.test(homepage) && (
               <a
                  href={homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md border border-blue-600 px-6 py-1.5 text-sm
                       text-blue-700 hover:bg-blue-50 hover:border-blue-700 transition"
               >
                  Live →
               </a>
            )}
         </div>
      </article>
   );
}
