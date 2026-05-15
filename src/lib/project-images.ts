import fs from 'fs'
import path from 'path'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

export function getProjectImages(slug: string): string[] {
  const dir = path.join(process.cwd(), 'public', 'projects', slug)
  try {
    return fs
      .readdirSync(dir)
      .filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort()
      .map(f => `/projects/${slug}/${f}`)
  } catch {
    return []
  }
}
