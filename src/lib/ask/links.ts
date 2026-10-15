const LINK = /\[([^\]\n]+)\]\(([^)\s]*)\)/g

export function allowedPaths(locale: string, slugs: string[]) {
  return new Set([`/${locale}/resume`, `/${locale}/about`, ...slugs.map((slug) => `/${locale}/projects/${slug}`)])
}

export function sanitizeLinks(text: string, allowed: Set<string>) {
  return text.replace(LINK, (match, label: string, path: string) => (allowed.has(path) ? match : label))
}
