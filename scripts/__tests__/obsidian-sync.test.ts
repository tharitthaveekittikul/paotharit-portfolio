import { describe, it, expect } from 'vitest'
import { convertWikiLinks, convertCallouts, buildFrontmatter } from '../obsidian-sync'

describe('convertWikiLinks', () => {
  it('converts simple wiki-links to markdown links', () => {
    expect(convertWikiLinks('See [[Architecture]] for details.')).toBe(
      'See [Architecture](Architecture) for details.'
    )
  })

  it('converts aliased wiki-links', () => {
    expect(convertWikiLinks('See [[Architecture|the architecture doc]].')).toBe(
      'See [the architecture doc](Architecture).'
    )
  })

  it('leaves normal markdown links untouched', () => {
    const input = '[link](https://example.com)'
    expect(convertWikiLinks(input)).toBe(input)
  })
})

describe('convertCallouts', () => {
  it('converts Obsidian abstract callout to JSX', () => {
    const input = '> [!abstract] Title\n> Content here\n'
    const result = convertCallouts(input)
    expect(result).toContain('<Callout type="abstract">')
    expect(result).toContain('Content here')
    expect(result).toContain('</Callout>')
  })

  it('converts warning callout', () => {
    const input = '> [!warning]\n> Watch out\n'
    expect(convertCallouts(input)).toContain('<Callout type="warning">')
  })
})

describe('buildFrontmatter', () => {
  it('preserves title and tags', () => {
    const fm = { title: 'Test', tags: ['ai'], status: 'approved', created: '2026-01-01' }
    const result = buildFrontmatter(fm, 'test-slug')
    expect(result.title).toBe('Test')
    expect(result.tags).toEqual(['ai'])
  })

  it('maps non-published obsidian status to draft', () => {
    const result = buildFrontmatter({ title: 'Test', status: 'planning' }, 'test-slug')
    expect(result.status).toBe('draft')
  })

  it('maps obsidian created field to date', () => {
    const result = buildFrontmatter({ title: 'Test', created: '2026-04-22' }, 'test-slug')
    expect(result.date).toBe('2026-04-22')
  })
})
