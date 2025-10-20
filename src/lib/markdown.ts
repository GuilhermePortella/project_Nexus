// src/lib/markdown.ts
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

function buildSchema() {
  // Clona o schema default e permite class/id nos elementos relevantes
  const schema: any = JSON.parse(JSON.stringify(defaultSchema));

  // Garanta a lista de tags necessárias para tabelas/containers
  const ensure = (name: string) => {
    if (!schema.tagNames) schema.tagNames = [];
    if (!schema.tagNames.includes(name)) schema.tagNames.push(name);
  };

  [
    "div", "span", "code", "pre",
    "table", "thead", "tbody", "tr", "th", "td",
  ].forEach(ensure);

  // Permitir atributos class/id em todos os elementos (ou ao menos nos principais)
  if (!schema.attributes) schema.attributes = {};
  const allowAttrs = (el: string) => {
    schema.attributes[el] = [
      ...(schema.attributes[el] || []),
      ["className"], // Tailwind (class)
      ["id"],
      // Se um dia precisar data-*:
      // ["data-*"]
    ];
  };

  ["*","div","span","code","pre","table","thead","tbody","tr","th","td"].forEach(allowAttrs);

  // Opcional: permitir colspan/rowspan explicitamente (útil em tabelas mais ricas)
  schema.attributes.th = [
    ...(schema.attributes.th || []),
    ["colSpan", "number"],
    ["rowSpan", "number"],
    ["scope"]
  ];
  schema.attributes.td = [
    ...(schema.attributes.td || []),
    ["colSpan", "number"],
    ["rowSpan", "number"]
  ];

  return schema;
}

export async function markdownToHtml(md: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkBreaks)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw) // permite HTML embutido
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeKatex)
    .use(rehypeSanitize, buildSchema()) // <- schema custom liberando class/id
    .use(rehypeStringify)
    .process(md);

  return String(file);
}
