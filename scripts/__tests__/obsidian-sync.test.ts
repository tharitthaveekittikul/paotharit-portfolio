import { describe, it, expect } from 'vitest'
import { convertWikiLinks, convertCallouts, buildFrontmatter, stripSections, buildDocFrontmatter } from '../obsidian-sync'

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

  it('resolves wiki-links to URLs when resolver is provided', () => {
    const resolver = (name: string) => name === 'API - GET Sessions' ? '/en/docs/zentri/02-api/01-sessions/01-get' : null
    expect(convertWikiLinks('See [[API - GET Sessions]].', resolver)).toBe(
      'See [API - GET Sessions](/en/docs/zentri/02-api/01-sessions/01-get).'
    )
  })

  it('falls back to page title when resolver returns null', () => {
    const resolver = (_name: string) => null
    expect(convertWikiLinks('See [[Unknown Page]].', resolver)).toBe(
      'See [Unknown Page](Unknown Page).'
    )
  })

  it('resolves aliased wiki-links with resolver', () => {
    const resolver = (name: string) => name === 'API - GET Sessions' ? '/en/docs/zentri/02-api/01-sessions/01-get' : null
    expect(convertWikiLinks('See [[API - GET Sessions|the sessions API]].', resolver)).toBe(
      'See [the sessions API](/en/docs/zentri/02-api/01-sessions/01-get).'
    )
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

describe('stripSections', () => {
  it('strips a matching ## section and its content until the next ##', () => {
    const input = `## Keep\n\nKeep content.\n\n## 🛡️ Technical Defense\n\nRemove this.\n\n## Keep Too\n\nMore to keep.\n`
    const result = stripSections(input, ['## 🛡️ Technical Defense'])
    expect(result).toContain('Keep content.')
    expect(result).toContain('Keep Too')
    expect(result).not.toContain('Technical Defense')
    expect(result).not.toContain('Remove this.')
  })

  it('strips multiple listed sections', () => {
    const input = `## A\n\nKeep.\n\n## 🛡️ Technical Defense\n\nRemove 1.\n\n## 🔄 Change Impact Analysis\n\nRemove 2.\n\n## B\n\nAlso keep.\n`
    const result = stripSections(input, ['## 🛡️ Technical Defense', '## 🔄 Change Impact Analysis'])
    expect(result).toContain('Keep.')
    expect(result).toContain('Also keep.')
    expect(result).not.toContain('Remove 1.')
    expect(result).not.toContain('Remove 2.')
  })

  it('returns content unchanged when no heading matches', () => {
    const input = `## A\n\nContent.\n`
    expect(stripSections(input, ['## Missing'])).toBe(input)
  })
})

describe('buildDocFrontmatter', () => {
  it('extracts title from first h1 heading when no obsidian title', () => {
    const result = buildDocFrontmatter({}, '# My Title\n\nContent here.')
    expect(result.title).toBe('My Title')
  })

  it('uses obsidian title over h1 heading', () => {
    const result = buildDocFrontmatter({ title: 'Custom' }, '# Ignored\n\nContent.')
    expect(result.title).toBe('Custom')
  })

  it('always sets type to doc', () => {
    const result = buildDocFrontmatter({}, '')
    expect(result.type).toBe('doc')
  })

  it('falls back to Untitled when no title or heading', () => {
    const result = buildDocFrontmatter({}, 'No heading here.')
    expect(result.title).toBe('Untitled')
  })
})
