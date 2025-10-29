import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import rehypeFixAssetUrls from "./rehype-fix-asset-urls";

import type { Schema } from "hast-util-sanitize";

type PropertyDefinition = string | [string, ...(string | number | boolean | RegExp | null | undefined)[]];

function buildSchema(): Schema {
  const schema: Schema = structuredClone(defaultSchema as Schema);

  schema.tagNames ??= [];
  schema.attributes ??= {};

  const ensureTag = (name: string) => {
    if (!schema.tagNames!.includes(name)) schema.tagNames!.push(name);
  };

  [
    "div", "span", "code", "pre",
    "table", "thead", "tbody", "tr", "th", "td",
    "figure", "figcaption",
    "img", "source", "video", "audio",
    "a"
  ].forEach(ensureTag);

  const allow = (el: string, attrs: PropertyDefinition[]) => {
    const existing = (schema.attributes?.[el] as PropertyDefinition[] | undefined) ?? [];
    (schema.attributes as Record<string, PropertyDefinition[]>)[el] = [
      ...existing,
      ...attrs,
    ];
  };

  ["*", "div", "span", "code", "pre", "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption"]
    .forEach(el => allow(el, [["className"], ["id"]]));
  allow("th", [["colSpan", "number"], ["rowSpan", "number"], ["scope"]]);
  allow("td", [["colSpan", "number"], ["rowSpan", "number"]]);
  allow("img", [
    ["src"], ["alt"], ["className"], ["width", "number"], ["height", "number"],
    ["loading"], ["decoding"], ["srcset"], ["sizes"]
  ]);
  allow("source", [["src"], ["srcset"], ["type"]]);
  allow("video", [["controls"], ["poster"], ["width", "number"], ["height", "number"], ["className"]]);
  allow("audio", [["controls"], ["className"]]);
  allow("a", [["href"], ["target"], ["rel"], ["className"]]);

  return schema;
}

export async function markdownToHtml(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeFixAssetUrls)
    .use(rehypeSanitize, buildSchema())
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(md);

  return String(file);
}
