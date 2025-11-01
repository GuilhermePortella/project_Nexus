import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { markdownToHtml } from "./markdown";
const ARTICLES_DIR = path.join(process.cwd(), "content/articles");

export type ArticleFrontmatter = {
  title: string;
  summary?: string;
  author?: string;
  publishedAt?: string;
  publishedDate?: string;
  tags?: string[];
  slug?: string;
};

export type ArticleSearchDoc = {
  slug: string;
  title: string;
  summary?: string;
  publishedAt?: string;
  content: string;
};

export type ArticleIndexItem = {
  slug: string;
  frontmatter: ArticleFrontmatter;
};

export type ArticleFull = {
  slug: string;
  html: string;
  frontmatter: ArticleFrontmatter;
};

type NodeErr = NodeJS.ErrnoException & { code?: string };

function isNodeErr(e: unknown): e is NodeErr {
  return typeof e === "object" && e !== null && "code" in e;
}

async function safeReaddir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch (e) {
    if (isNodeErr(e) && e.code === "ENOENT") return [];
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

function normalizeFrontmatter(data: unknown): ArticleFrontmatter {
  const fm = (data ?? {}) as Partial<ArticleFrontmatter>;
  const published =
    fm.publishedAt ??
    fm.publishedDate ??
    undefined;
  const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : undefined;

  return {
    title: fm.title ?? "Sem título",
    summary: fm.summary,
    author: fm.author,
    publishedAt: published,
    tags,
    slug: fm.slug ? normalizeSlug(fm.slug) : undefined,
  };
}

export async function listSlugs(): Promise<string[]> {
  const files = (await safeReaddir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));
  return files.map((f) => normalizeSlug(fileBase(f)));
}

export async function getAllArticles(limit?: number): Promise<ArticleIndexItem[]> {
  const files = (await safeReaddir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));

  const items = await Promise.all(
    files.map(async (file) => {
      const raw = await safeReadFile(path.join(ARTICLES_DIR, file));
      if (!raw) return null;

      const { data } = matter(raw);
      const fm = normalizeFrontmatter(data);

      const base = fm.slug ? normalizeSlug(fm.slug) : normalizeSlug(fileBase(file));

      return {
        slug: base,
        frontmatter: fm,
      } as ArticleIndexItem;
    })
  );

  const filtered = (items.filter(Boolean) as ArticleIndexItem[])
    .sort((a, b) => parseDateForSort(b.frontmatter.publishedAt) - parseDateForSort(a.frontmatter.publishedAt));

  return limit ? filtered.slice(0, limit) : filtered;
}

export async function getArticleHtmlBySlug(slug: string): Promise<ArticleFull> {
  const files = (await safeReaddir(ARTICLES_DIR)).filter((f) => f.endsWith(".md"));
  if (files.length === 0) {
    throw new Error(`Nenhum artigo encontrado. Crie arquivos Markdown em "content/articles/*.md".`);
  }

  const wanted = normalizeSlug(slug);

  let match = files.find((f) => normalizeSlug(fileBase(f)) === wanted);

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

function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/^\s{0,3}(#{1,6}|\*|-|\+|>|\d+\.)\s+/gm, "")
    .replace(/[_*~>#+=|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
  docs.sort((a, b) => parseDateForSort(b.publishedAt) - parseDateForSort(a.publishedAt));
  return docs;
}

function parseDateForSort(raw?: string): number {
  if (!raw) return 0;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (m) {
    const y = +m[1], mo = +m[2] - 1, d = +m[3];
    return Date.UTC(y, mo, d);
  }
  const t = Date.parse(raw);
  return Number.isNaN(t) ? 0 : t;
}
