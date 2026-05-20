import { describe, it, expect } from 'vitest'
import { DOCS_META, getDocsMeta } from '../docs-meta'

describe('DOCS_META', () => {
  it('has entries for all four documented projects', () => {
    expect(DOCS_META).toHaveProperty('zentri')
    expect(DOCS_META).toHaveProperty('docrag')
    expect(DOCS_META).toHaveProperty('utiliship')
    expect(DOCS_META).toHaveProperty('llmsystemtrading')
  })

  it('each entry has a non-empty title and description', () => {
    for (const [, meta] of Object.entries(DOCS_META)) {
      expect(meta.title.length).toBeGreaterThan(0)
      expect(meta.description.length).toBeGreaterThan(0)
    }
  })
})

describe('getDocsMeta', () => {
  it('returns metadata for a known slug', () => {
    expect(getDocsMeta('zentri').title).toBe('Zentri')
  })

  it('falls back to the slug as title for an unknown project', () => {
    const meta = getDocsMeta('unknown-project')
    expect(meta.title).toBe('unknown-project')
    expect(meta.description).toBe('')
  })
})
