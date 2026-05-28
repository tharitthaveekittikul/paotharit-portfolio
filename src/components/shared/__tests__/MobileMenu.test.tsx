import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { MobileMenu } from '../MobileMenu'

vi.mock('@next/third-parties/google', () => ({ sendGAEvent: vi.fn() }))

const defaultProps = {
  locale: 'en',
  labels: { docs: 'Docs', about: 'About', resume: 'Resume', moreLinks: 'More navigation links' },
  resumeHref: '/en/resume',
}

describe('MobileMenu', () => {
  it('renders the ⋯ trigger button', () => {
    render(<MobileMenu {...defaultProps} />)
    expect(screen.getByRole('button', { name: /more navigation links/i })).toBeInTheDocument()
  })

  it('dropdown is hidden by default', () => {
    render(<MobileMenu {...defaultProps} />)
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
  })

  it('clicking the button shows the dropdown', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('Docs')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Resume')).toBeInTheDocument()
  })

  it('clicking the button again hides the dropdown', () => {
    render(<MobileMenu {...defaultProps} />)
    const btn = screen.getByRole('button', { name: /more navigation links/i })
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
  })

  it('clicking a link closes the dropdown', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    fireEvent.click(screen.getByText('Docs'))
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
  })

  it('clicking outside closes the dropdown', () => {
    render(
      <div>
        <MobileMenu {...defaultProps} />
        <button>outside</button>
      </div>
    )
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('Docs')).toBeInTheDocument()
    fireEvent.mouseDown(screen.getByText('outside'))
    expect(screen.queryByText('Docs')).not.toBeInTheDocument()
  })

  it('docs link points to correct href', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('Docs').closest('a')).toHaveAttribute('href', '/en/docs')
  })

  it('about link points to correct href', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/en/about')
  })

  it('resume link points to correct href', () => {
    render(<MobileMenu {...defaultProps} />)
    fireEvent.click(screen.getByRole('button', { name: /more navigation links/i }))
    expect(screen.getByText('Resume').closest('a')).toHaveAttribute('href', '/en/resume')
  })
})
