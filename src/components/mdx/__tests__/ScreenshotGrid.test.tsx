import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScreenshotGrid } from '../ScreenshotGrid'

describe('ScreenshotGrid', () => {
  it('renders children', () => {
    render(
      <ScreenshotGrid>
        <figure data-testid="fig">img</figure>
      </ScreenshotGrid>
    )
    expect(screen.getByTestId('fig')).toBeInTheDocument()
  })

  it('applies masonry and not-prose classes', () => {
    const { container } = render(
      <ScreenshotGrid>
        <div />
      </ScreenshotGrid>
    )
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('not-prose')
    expect(div.className).toContain('columns-1')
    expect(div.className).toContain('sm:columns-2')
  })

  it('merges custom className', () => {
    const { container } = render(
      <ScreenshotGrid className="mt-8">
        <div />
      </ScreenshotGrid>
    )
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('mt-8')
  })
})
