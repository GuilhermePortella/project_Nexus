/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export const mdxComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link {...props} href={props.href ?? "#"} className="underline" />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ""} style={{ borderRadius: 8, maxWidth: "100%", height: "auto" }} />
  ),
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
