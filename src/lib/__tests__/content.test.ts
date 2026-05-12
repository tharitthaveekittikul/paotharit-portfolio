import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { createContentUtils } from '../content'

const FIXTURE_ROOT = join(__dirname, 'fixtures/content')
const { getAllSlugs, getContent, getAllContent } = createContentUtils(FIXTURE_ROOT)

describe('getAllSlugs', () => {
  it('returns slugs from en/ as source of truth', () => {
    const slugs = getAllSlugs('blog')
    expect(slugs).toContain('hello-world')
    expect(slugs).toContain('draft-post')
  })

  it('returns empty array when directory does not exist', () => {
    const slugs = getAllSlugs('projects')
    expect(slugs).toEqual([])
  })
})

describe('getContent', () => {
  it('returns frontmatter and content for en locale', () => {
    const { frontmatter, content } = getContent('blog', 'en', 'hello-world')
    expect(frontmatter.title).toBe('Hello World')
    expect(content).toContain('Hello world content')
  })

  it('returns TH content when TH file exists', () => {
    const { frontmatter } = getContent('blog', 'th', 'hello-world')
    expect(frontmatter.title).toBe('สวัสดีโลก')
  })

  it('falls back to EN when TH file does not exist', () => {
    const { frontmatter } = getContent('blog', 'th', 'draft-post')
    expect(frontmatter.title).toBe('Draft Post')
  })
})

describe('getAllContent', () => {
  it('returns only published posts sorted by date descending', () => {
    const posts = getAllContent('blog', 'en')
    expect(posts.every(p => p.status === 'published')).toBe(true)
  })

  it('filters out draft posts', () => {
    const posts = getAllContent('blog', 'en')
    expect(posts.find(p => p.slug === 'draft-post')).toBeUndefined()
  })
})
