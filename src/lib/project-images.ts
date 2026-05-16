import fs from 'fs'
import path from 'path'

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp'])

export interface ProjectImage {
  src: string
  alt: string
}

function filenameToAlt(filename: string): string {
  const name = path.basename(filename, path.extname(filename))
  const words = name.replace(/[-_]/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export function getProjectImages(slug: string): ProjectImage[] {
  const dir = path.join(process.cwd(), 'public', 'projects', slug)
  try {
    return fs
      .readdirSync(dir)
      .filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort()
      .map(f => ({ src: `/projects/${slug}/${f}`, alt: filenameToAlt(f) }))
  } catch {
    return []
  }
}

export function getBlogImages(slug: string): ProjectImage[] {
  const dir = path.join(process.cwd(), 'public', 'blog', slug)
  try {
    return fs
      .readdirSync(dir)
      .filter(f => IMAGE_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort()
      .map(f => ({ src: `/blog/${slug}/${f}`, alt: filenameToAlt(f) }))
  } catch {
    return []
  }
}
