import { describe, it, expect } from 'vitest'
import { join } from 'path'
import { createDocsUtils, extractHeadings } from '../docs'

const FIXTURES = join(__dirname, 'fixtures', 'docs')
const { buildSidebarTree, getDocBySlug } = createDocsUtils(FIXTURES)

describe('extractHeadings', () => {
  it('extracts h2 and h3 headings, skips h1', () => {
    const content = '# Title\n\n## Overview\n\nText.\n\n### Sub-section\n\nMore.\n'
    expect(extractHeadings(content)).toEqual([
      { text: 'Overview', id: 'overview', level: 2 },
      { text: 'Sub-section', id: 'sub-section', level: 3 },
    ])
  })

  it('slugifies heading ids', () => {
    const headings = extractHeadings('## GET /api/v1/auth\n')
    expect(headings[0].id).toBe('get-api-v1-auth')
  })

  it('returns empty array when no h2/h3 headings', () => {
    expect(extractHeadings('# Only h1\n\nSome text.\n')).toEqual([])
  })
})

describe('buildSidebarTree', () => {
  it('strips numeric prefix from item labels and uses frontmatter title', () => {
    const tree = buildSidebarTree('testproject', 'en')
    const introItem = tree.find(n => n.type === 'item')
    expect(introItem?.label).toBe('Introduction')
  })

  it('returns groups for subdirectories', () => {
    const tree = buildSidebarTree('testproject', 'en')
    const apiGroup = tree.find(n => n.type === 'group')
    expect(apiGroup).toBeDefined()
    expect(apiGroup?.label).toBe('Api')
  })

  it('returns empty array for missing project', () => {
    expect(buildSidebarTree('noexist', 'en')).toEqual([])
  })
})

describe('getDocBySlug', () => {
  it('resolves clean slug to doc content', () => {
    const result = getDocBySlug('testproject', ['intro'], 'en')
    expect(result).not.toBeNull()
    expect(result?.frontmatter.title).toBe('Introduction')
  })

  it('resolves nested clean slug', () => {
    const result = getDocBySlug('testproject', ['api', 'auth', 'login'], 'en')
    expect(result).not.toBeNull()
    expect(result?.frontmatter.title).toBe('Login')
  })

  it('returns null for unknown slug', () => {
    expect(getDocBySlug('testproject', ['nonexistent'], 'en')).toBeNull()
  })
})
