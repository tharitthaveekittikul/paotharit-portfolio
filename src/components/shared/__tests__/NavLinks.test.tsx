import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NavLinks } from '../NavLinks'

const mockPathname = vi.fn().mockReturnValue('/en/blog')

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

vi.mock('../ResumeLink', () => ({
  ResumeLink: ({ label, href, className }: { label: string; href: string; className?: string }) => (
    <a href={href} className={className}>{label}</a>
  ),
}))

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

const defaultProps = {
  locale: 'en',
  labels: {
    blog: 'Blog',
    projects: 'Projects',
    docs: 'Docs',
    about: 'About',
    resume: 'Resume',
  },
  resumeHref: '/en/resume',
}

describe('NavLinks', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/en/blog')
  })

  it('renders all nav links with correct hrefs', () => {
    render(<NavLinks {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/en/blog')
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveAttribute('href', '/en/projects')
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/en/docs')
    expect(screen.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/en/about')
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/en/resume')
  })

  it('applies active text class to the link matching the current pathname', () => {
    render(<NavLinks {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveClass('text-zinc-50')
    expect(screen.getByRole('link', { name: 'Projects' })).not.toHaveClass('text-zinc-50')
  })

  it('applies active text class to projects when pathname is /en/projects', () => {
    mockPathname.mockReturnValue('/en/projects')
    render(<NavLinks {...defaultProps} />)
    expect(screen.getByRole('link', { name: 'Projects' })).toHaveClass('text-zinc-50')
    expect(screen.getByRole('link', { name: 'Blog' })).not.toHaveClass('text-zinc-50')
  })

  it('shifts active text class to hovered link on mouseenter', () => {
    render(<NavLinks {...defaultProps} />)
    const projectsLink = screen.getByRole('link', { name: 'Projects' })
    fireEvent.mouseEnter(projectsLink.closest('[data-navkey="projects"]')!)
    expect(projectsLink).toHaveClass('text-zinc-50')
    expect(screen.getByRole('link', { name: 'Blog' })).not.toHaveClass('text-zinc-50')
  })

  it('restores active text class on mouseleave from container', () => {
    const { container } = render(<NavLinks {...defaultProps} />)
    const navContainer = container.firstChild as HTMLElement
    fireEvent.mouseEnter(screen.getByRole('link', { name: 'Projects' }).closest('[data-navkey="projects"]')!)
    fireEvent.mouseLeave(navContainer)
    expect(screen.getByRole('link', { name: 'Blog' })).toHaveClass('text-zinc-50')
    expect(screen.getByRole('link', { name: 'Projects' })).not.toHaveClass('text-zinc-50')
  })
})
