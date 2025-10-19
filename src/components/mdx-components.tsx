import Link from "next/link";

// Componentes de MDX (usados pelo MDXRemote)
export const mdxComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link {...props} href={props.href ?? "#"} className="underline" />
  ),

  // Para posts estáticos exportados, usar <img> simples evita dor de cabeça com next/image
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} style={{ borderRadius: 8, maxWidth: "100%", height: "auto" }} />
  ),

  // Code block simples (pode trocar por shiki/prism depois)
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      {...props}
      className={
        "overflow-x-auto rounded-lg bg-neutral-950/95 text-neutral-100 p-4 " +
        (props.className ?? "")
      }
    />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className={
        "rounded bg-neutral-100 px-1 py-0.5 dark:bg-neutral-800 " +
        (props.className ?? "")
      }
    />
  ),
};
export type MdxComponents = typeof mdxComponents;
