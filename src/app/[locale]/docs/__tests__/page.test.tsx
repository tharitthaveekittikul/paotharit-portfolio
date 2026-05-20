import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('@/lib/docs', () => ({
  getDocsProjects: vi.fn().mockReturnValue(['zentri', 'docrag', 'utiliship', 'llmsystemtrading']),
}))

vi.mock('@/lib/docs-meta', () => ({
  getDocsMeta: vi.fn((slug: string) => ({
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    description: `Desc for ${slug}`,
  })),
}))

describe('DocsIndexPage', () => {
  it('renders a card for each documented project', async () => {
    const { default: DocsIndexPage } = await import('../page')
    const jsx = await DocsIndexPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('Zentri')).toBeInTheDocument()
    expect(screen.getByText('Docrag')).toBeInTheDocument()
    expect(screen.getByText('Utiliship')).toBeInTheDocument()
    expect(screen.getByText('Llmsystemtrading')).toBeInTheDocument()
  })

  it('each card links to the correct docs route', async () => {
    const { default: DocsIndexPage } = await import('../page')
    const jsx = await DocsIndexPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('Zentri').closest('a')).toHaveAttribute('href', '/en/docs/zentri')
  })
})
