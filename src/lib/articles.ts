// src/lib/articles.ts
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { markdownToHtml } from "./markdown";

// Diretório dos artigos Markdown (.md)
const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

/* ==========================
   Tipos
========================== */
export type ArticleFrontmatter = {
  title: string;
  summary?: string;
  author?: string;
  publishedAt?: string;   // ISO (preferencial)
  publishedDate?: string; // compat: convertemos para publishedAt
  tags?: string[];
  slug?: string;          // opcional: se vier, preferimos ele
};

export type ArticleSearchDoc = {
  slug: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  content: string; // markdown “quase” texto puro
};

export type ArticleIndexItem = {
  slug: string;                    // slug normalizado (hífen, minúsculo, sem acentos)
  frontmatter: ArticleFrontmatter; // frontmatter já normalizado (publishedAt)
};

export type ArticleFull = {
  slug: string;
  html: string;                    // HTML gerado a partir do Markdown
  frontmatter: ArticleFrontmatter; // frontmatter já normalizado (publishedAt)
};

/* ==========================
   Helpers
========================== */
type NodeErr = NodeJS.ErrnoException & { code?: string };

function isNodeErr(e: unknown): e is NodeErr {
  return typeof e === "object" && e !== null && "code" in e;
}

async function safeReaddir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch (e) {
    if (isNodeErr(e) && e.code === "ENOENT") return []; // diretório ainda não existe
    throw e;
  }
}

async function safeReadFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (e) {
    if (isNodeErr(e) && e.code === "ENOENT") return null;
    throw e;
  }
}

/** Remove acentos, normaliza espaços/_ para -, e caixa para minúscula */
function normalizeSlug(input: string): string {
  return input
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/_/g, "-")
    .replace(/-+/g, "-");
}

function fileBase(name: string): string {
  return name.replace(/\.md$/i, "");
}

/** Garante que publishedAt exista (preferimos publishedAt a publishedDate) */
function normalizeFrontmatter(data: unknown): ArticleFrontmatter {
  const fm = (data ?? {}) as Partial<ArticleFrontmatter>;
  const published =
    fm.publishedAt ??
    fm.publishedDate ??
    undefined;

  return {
    title: fm.title ?? "Sem título",
    summary: fm.summary,
    author: fm.author,
    publishedAt: published,
    tags: fm.tags,
    slug: fm.slug ? normalizeSlug(fm.slug) : undefined,
  };
}

/* ==========================
   API principal
========================== */

/** Lista apenas os slugs normalizados (para links/rotas) */
export async function listSlugs(): Promise<string[]> {
  const files = (await safeReaddir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));
  return files.map((f) => normalizeSlug(fileBase(f)));
}

/** Retorna todos os artigos (index), já ordenados por data desc (mais recentes primeiro) */
export async function getAllArticles(limit?: number): Promise<ArticleIndexItem[]> {
  const files = (await safeReaddir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));

  const items = await Promise.all(
    files.map(async (file) => {
      const raw = await safeReadFile(path.join(ARTICLES_DIR, file));
      if (!raw) return null;

      const { data } = matter(raw);
      const fm = normalizeFrontmatter(data);

      // Slug: frontmatter.slug (se existir) OU nome do arquivo
      const base = fm.slug ? normalizeSlug(fm.slug) : normalizeSlug(fileBase(file));

      return {
        slug: base,
        frontmatter: fm,
      } as ArticleIndexItem;
    })
  );

  const filtered = (items.filter(Boolean) as ArticleIndexItem[])
    // ordena por data (publishedAt) desc; sem data vai para o fim
    .sort((a, b) => {
      const aTime = a.frontmatter.publishedAt ? new Date(a.frontmatter.publishedAt).getTime() : 0;
      const bTime = b.frontmatter.publishedAt ? new Date(b.frontmatter.publishedAt).getTime() : 0;
      return bTime - aTime;
    });

  return limit ? filtered.slice(0, limit) : filtered;
}

/** Retorna artigo completo (HTML + frontmatter normalizado) a partir do slug (tolerante) */
export async function getArticleHtmlBySlug(slug: string): Promise<ArticleFull> {
  const files = (await safeReaddir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    throw new Error(`Nenhum artigo encontrado. Crie arquivos Markdown em "content/articles/*.md".`);
  }

  const wanted = normalizeSlug(slug);

  // 1) tenta por nome do arquivo
  let match = files.find((f) => normalizeSlug(fileBase(f)) === wanted);

  // 2) tenta por frontmatter.slug normalizado
  if (!match) {
    for (const f of files) {
      const raw = await safeReadFile(path.join(ARTICLES_DIR, f));
      if (!raw) continue;
      const { data } = matter(raw);
      const fm = normalizeFrontmatter(data);
      if (fm.slug && normalizeSlug(fm.slug) === wanted) {
        match = f;
        break;
      }
    }
  }

  if (!match) {
    throw new Error(`Artigo não encontrado: ${slug}. Verifique o nome do arquivo (.md) ou o frontmatter.slug.`);
  }

  const full = await safeReadFile(path.join(ARTICLES_DIR, match));
  if (!full) throw new Error(`Falha ao ler o artigo: ${match}`);

  const { content, data } = matter(full);
  const fm = normalizeFrontmatter(data);

  const html = await markdownToHtml(content);

  return {
    slug: normalizeSlug(fm.slug || fileBase(match)),
    html,
    frontmatter: fm,
  };
}

/* ==========================
   Busca: índice leve
========================== */

function stripMarkdown(md: string): string {
  return md
    // remove blocos de código triplos
    .replace(/```[\s\S]*?```/g, " ")
    // remove inline code
    .replace(/`[^`]*`/g, " ")
    // remove links, mantendo o texto
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // remove imagens ![alt](src)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    // remove headings/quotes/list markers
    .replace(/^\s{0,3}(#{1,6}|\*|-|\+|>|\d+\.)\s+/gm, "")
    // remove ênfases e resto de sintaxe leve
    .replace(/[_*~>#+=|]/g, " ")
    // normaliza espaços
    .replace(/\s+/g, " ")
    .trim();
}

/** Constrói índice de busca (título, resumo e conteúdo em texto) */
export async function buildSearchIndex(): Promise<ArticleSearchDoc[]> {
  const files = (await safeReaddir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));

  const docs: ArticleSearchDoc[] = [];
  for (const file of files) {
    const raw = await safeReadFile(path.join(ARTICLES_DIR, file));
    if (!raw) continue;

    const { content, data } = matter(raw);
    const fm = normalizeFrontmatter(data);
    const slug = fm.slug ? normalizeSlug(fm.slug) : normalizeSlug(fileBase(file));

    docs.push({
      slug,
      title: fm.title ?? slug,
      summary: fm.summary,
      publishedAt: fm.publishedAt,
      content: stripMarkdown(content),
    });
  }

  // ordena por data desc
  docs.sort((a, b) => {
    const at = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const bt = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return bt - at;
  });

  return docs;
}
