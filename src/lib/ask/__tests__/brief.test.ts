import { describe, expect, it } from 'vitest'
import { parseBrief, sliceBrief } from '../brief'
import { allowedPaths, sanitizeLinks } from '../links'

const markdown = `# Profile
<!-- draft note -->
Name: Test Person.

# Projects

## alpha | Alpha App
Alpha is a web app.
- Role: Solo
- Stack: Next.js, Postgres
- Limits: none

## beta | Beta Tool
Beta is a script.
- Stack: Python
`

describe('knowledge brief', () => {
  const brief = parseBrief(markdown)

  it('splits profile and projects and strips draft comments', () => {
    expect(brief.profile).toBe('Name: Test Person.')
    expect(brief.projects.map((p) => p.slug)).toEqual(['alpha', 'beta'])
    expect(brief.projects[0]).toMatchObject({ title: 'Alpha App', summary: 'Alpha is a web app.', stack: 'Next.js, Postgres' })
  })

  it('lists every project stack in the index but only sliced detail', () => {
    const text = sliceBrief(brief, ['beta'], 'en')
    expect(text).toContain('[Alpha App](/en/projects/alpha): Alpha is a web app. Stack: Next.js, Postgres.')
    expect(text).toContain('### Beta Tool')
    expect(text).not.toContain('### Alpha App')
  })
})

describe('sanitizeLinks', () => {
  const allowed = allowedPaths('en', ['alpha'])

  it('keeps known internal links and unwraps invented ones', () => {
    const text = 'See [Alpha App](/en/projects/alpha), [Ghost](/en/projects/ghost) and [x](https://evil.example).'
    expect(sanitizeLinks(text, allowed)).toBe('See [Alpha App](/en/projects/alpha), Ghost and x.')
  })

  it('allows the resume page', () => {
    expect(sanitizeLinks('[resume](/en/resume)', allowed)).toBe('[resume](/en/resume)')
  })
})
