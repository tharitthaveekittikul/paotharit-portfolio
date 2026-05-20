import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'

vi.mock('next-intl/server', () => ({
  getLocale: vi.fn().mockResolvedValue('en'),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('../SearchButton', () => ({ SearchButton: () => <button>Search</button> }))
vi.mock('../LocaleSwitcher', () => ({ LocaleSwitcher: () => <button>Locale</button> }))
vi.mock('../ThemeToggle', () => ({ ThemeToggle: () => <button>Theme</button> }))

describe('Header', () => {
  it('renders the logo link pointing to locale root', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    const logo = screen.getByText('paotharit')
    expect(logo.closest('a')).toHaveAttribute('href', '/en')
  })

  it('renders blog and projects nav links', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    expect(screen.getByText('blog').closest('a')).toHaveAttribute('href', '/en/blog')
    expect(screen.getByText('projects').closest('a')).toHaveAttribute('href', '/en/projects')
  })

  it('renders the docs nav link', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    expect(screen.getByText('docs').closest('a')).toHaveAttribute('href', '/en/docs')
  })

  it('renders email mailto link', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    const emailLink = screen.getByRole('link', { name: /tharit\.thaveekittikul@gmail\.com/i })
    expect(emailLink).toHaveAttribute('href', 'mailto:tharit.thaveekittikul@gmail.com')
  })
})
