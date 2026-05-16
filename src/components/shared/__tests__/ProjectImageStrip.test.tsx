import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectImageStrip } from '../ProjectImageStrip'

describe('ProjectImageStrip', () => {
  it('renders nothing when images array is empty', () => {
    const { container } = render(<ProjectImageStrip images={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all images when count is 4 or fewer', () => {
    const images = [
      { src: '/projects/zentri/a.png', alt: 'A' },
      { src: '/projects/zentri/b.png', alt: 'B' },
      { src: '/projects/zentri/c.png', alt: 'C' },
    ]
    const { container } = render(<ProjectImageStrip images={images} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(3)
    expect(screen.queryByText(/^\+/)).toBeNull()
  })

  it('shows overflow count on 4th tile when more than 4 images', () => {
    const images = Array.from({ length: 9 }, (_, i) => ({ src: `/projects/zentri/${i}.png`, alt: `Screenshot ${i + 1}` }))
    render(<ProjectImageStrip images={images} />)
    const imgs = document.querySelectorAll('img')
    expect(imgs).toHaveLength(4)
    expect(screen.getByText('+6')).toBeDefined()
  })

  it('shows exactly 4 tiles with no overflow when total is exactly 4', () => {
    const images = Array.from({ length: 4 }, (_, i) => ({ src: `/projects/zentri/${i}.png`, alt: `Screenshot ${i + 1}` }))
    const { container } = render(<ProjectImageStrip images={images} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(4)
    expect(screen.queryByText(/^\+/)).toBeNull()
  })
})
