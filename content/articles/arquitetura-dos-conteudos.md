---
title: "Arquitetura de Conteúdo Estruturado: Por que usamos YAML Front Matter em sites técnicos"
summary: "Como metadados em YAML Front Matter trazem previsibilidade, automação e 
   consistência semântica em pipelines de conteúdo estático com Next.js e remark/rehype."
author: "Guilherme Portella"
publishedDate: "2025-10-19"
---

## Introdução

Em projetos de software e sites técnicos, o código raramente é o único ativo que precisa de arquitetura.  
O conteúdo — especialmente em blogs técnicos, hubs de conhecimento e portfólios — também exige previsibilidade, rastreabilidade e padronização.  
A decisão de utilizar **YAML Front Matter** no início de cada artigo reflete essa mentalidade: **tratar o conteúdo como código**.

---

## O problema da desorganização semântica

Sem uma estrutura de metadados clara, os artigos são apenas blocos de texto, sem contexto processável.  
O sistema não sabe quem é o autor, quando foi publicado ou como exibir um resumo. Isso gera:

- Dificuldade em gerar *cards* e *feeds* automaticamente;  
- Falta de contexto temporal (ordenação cronológica via `publishedDate`);  
- Problemas de SEO e indexação;  
- Inconsistência visual e estrutural entre páginas.

O resultado é uma experiência despadronizada — para leitor e desenvolvedor.

---

## A solução: YAML Front Matter como contrato de conteúdo

O bloco YAML no topo de cada artigo atua como um **contrato de dados**, semelhante a um *Data Transfer Object (DTO)* no backend.  
Cada campo possui responsabilidade semântica e funcional:

```yaml
---
title: "Refatorando sistemas legados com Arquitetura Limpa e Spring Boot"
summary: "Como aplicar os princípios da Arquitetura Limpa para 
            evoluir sistemas legados sem comprometer a base existente."
author: "Guilherme Portella"
publishedDate: "2025-01-05"
---
```

### Campos e responsabilidades

<div class="overflow-x-auto border border-gray-200 rounded-lg my-4">
  <table class="min-w-full text-sm text-left align-top border-collapse">
    <thead class="bg-gray-50 text-gray-700 border-b">
      <tr>
        <th class="px-3 py-2 font-semibold text-center border-r border-gray-300">Estrutura comprometida</th>
        <th class="px-3 py-2 font-semibold text-center border-r border-gray-300">Mecanismo lesional</th>
        <th class="px-3 py-2 font-semibold text-center">Efeito clínico</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-200">
      <tr>
        <td class="px-3 py-2 border-r border-gray-200"><code>title</code></td>
        <td class="px-3 py-2 border-r border-gray-200">Título semântico; SEO; Open Graph</td>
        <td class="px-3 py-2">Melhor ranqueamento; coerência visual</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-r border-gray-200"><code>summary</code></td>
        <td class="px-3 py-2 border-r border-gray-200">Meta description; cards/listagens</td>
        <td class="px-3 py-2">Aumenta clareza e CTR</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-r border-gray-200"><code>author</code></td>
        <td class="px-3 py-2 border-r border-gray-200">Autoria explícita</td>
        <td class="px-3 py-2">Credibilidade e rastreabilidade</td>
      </tr>
      <tr>
        <td class="px-3 py-2 border-r border-gray-200"><code>publishedDate</code></td>
        <td class="px-3 py-2 border-r border-gray-200">Data ISO para ordenação e schema temporal</td>
        <td class="px-3 py-2">Feeds, sorting e arquivo histórico</td>
      </tr>
    </tbody>
  </table>
</div>

O arquivo Markdown deixa de ser “texto solto” e vira um **objeto de domínio**: dados previsíveis + corpo renderizável.

---

## Integração com o pipeline Next.js

No projeto, a função `getSortedArticlesData()` percorre `content/articles/`, usa **gray-matter** para extrair o front matter e monta objetos tipados:

```ts
export interface ArticleData {
  id: string;
  title: string;
  summary: string;
  author: string;
  publishedDate: string;
}
```

Durante o build, o **Next.js** gera páginas estáticas com base nesses metadados.  
A pipeline `unified → remark → rehype` transforma Markdown em HTML semântico e seguro, preservando tabelas, fórmulas e blocos de código.

---

## Conteúdo como código

Adotar YAML Front Matter concretiza o princípio **Content as Code**:

- **Versionamento e rastreabilidade:** cada alteração é um commit com diff claro;  
- **CI/CD natural:** publicação via merge/PR, sem CMS;  
- **FinOps-friendly:** zero banco de dados/infra adicional;  
- **Extensível:** adicionar `tags`, `category`, `updatedAt`, `hero`, `canonical` sem quebrar o build.

---

## Arquitetura limpa aplicada ao conteúdo

Assim como a Arquitetura Limpa isola camadas, o Front Matter separa **estrutura de dados** do **corpo narrativo**.  
O renderizador (Next.js + componentes React) pode evoluir sem tocar no conteúdo — e vice-versa.  
Isso reduz acoplamento, facilita refatorações visuais e mantém o domínio editorial independente da apresentação.

---

## Boas práticas adicionais

- **Datas em ISO 8601** (`YYYY-MM-DD`) para ordenação determinística;  
- **Campos obrigatórios:** `title`, `summary`, `author`, `publishedDate`;  
- **Campos opcionais úteis:** `tags`, `category`, `readingTime`, `updatedAt`, `slug`, `draft`, `cover`;  
- **Validação:** criar um *guard* no loader para checar campos ausentes e falhar cedo no build;  
- **SEO:** derivar meta e JSON-LD do front matter (não duplicar fonte da verdade).

---

## Conclusão

**YAML Front Matter é decisão arquitetural, não detalhe cosmético.**  
Traz previsibilidade, automação e clareza semântica ao pipeline de conteúdo — com custo operacional mínimo e excelente escalabilidade editorial.  
Cada artigo torna-se um artefato autocontido, validável e versionável, alinhado à disciplina de engenharia que aplicamos ao código.
