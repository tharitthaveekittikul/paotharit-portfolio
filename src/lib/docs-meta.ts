export type DocsMeta = {
  title: string
  description: string
}

export const DOCS_META: Record<string, DocsMeta> = {
  zentri: {
    title: 'Zentri',
    description: 'Technical architecture and API reference for the Zentri platform.',
  },
  docrag: {
    title: 'DocRAG',
    description: 'System design and API docs for the DocRAG retrieval pipeline.',
  },
  utiliship: {
    title: 'Utiliship',
    description: 'Frontend, API, and DevOps documentation for the Utiliship app.',
  },
  llmsystemtrading: {
    title: 'LLM System Trading',
    description: 'Architecture and implementation notes for the LLM trading system.',
  },
}

export function getDocsMeta(slug: string): DocsMeta {
  return DOCS_META[slug] ?? { title: slug, description: '' }
}
