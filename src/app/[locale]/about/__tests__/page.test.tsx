import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}))

vi.mock('@/components/shared/EmailLink', () => ({
  EmailLink: () => <a href="mailto:paopaioz.t@gmail.com">Email</a>,
}))

describe('AboutPage', () => {
  it('renders profile image with correct alt text', async () => {
    const { default: AboutPage } = await import('../page')
    const jsx = await AboutPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByRole('img', { name: 'Tharit Thaveekittikul' })).toBeInTheDocument()
  })

  it('renders open to work badge', async () => {
    const { default: AboutPage } = await import('../page')
    const jsx = await AboutPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('openToWork')).toBeInTheDocument()
  })

  it('renders all three system section titles', async () => {
    const { default: AboutPage } = await import('../page')
    const jsx = await AboutPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('systems.obsidian.title')).toBeInTheDocument()
    expect(screen.getByText('systems.ai.title')).toBeInTheDocument()
    expect(screen.getByText('systems.homelab.title')).toBeInTheDocument()
  })

  it('renders LinkedIn link in closing section', async () => {
    const { default: AboutPage } = await import('../page')
    const jsx = await AboutPage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByRole('link', { name: /linkedin/i })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/paotharit/'
    )
  })
})
