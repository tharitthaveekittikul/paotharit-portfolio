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

  it('renders social links wrapper', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    expect(screen.getByTestId('social-links')).toBeInTheDocument()
  })

  it('renders all four social links inside the wrapper', async () => {
    const { Header } = await import('../Header')
    const jsx = await Header()
    render(jsx)
    const wrapper = screen.getByTestId('social-links')
    const links = wrapper.querySelectorAll('a')
    expect(links.length).toBe(4)
  })
})
