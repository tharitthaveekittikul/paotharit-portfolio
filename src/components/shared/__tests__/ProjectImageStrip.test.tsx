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
      '/projects/zentri/a.png',
      '/projects/zentri/b.png',
      '/projects/zentri/c.png',
    ]
    const { container } = render(<ProjectImageStrip images={images} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(3)
    expect(screen.queryByText(/^\+/)).toBeNull()
  })

  it('shows overflow count on 4th tile when more than 4 images', () => {
    const images = Array.from({ length: 9 }, (_, i) => `/projects/zentri/${i}.png`)
    render(<ProjectImageStrip images={images} />)
    const imgs = document.querySelectorAll('img')
    expect(imgs).toHaveLength(4)
    expect(screen.getByText('+6')).toBeDefined()
  })

  it('shows exactly 4 tiles with no overflow when total is exactly 4', () => {
    const images = Array.from({ length: 4 }, (_, i) => `/projects/zentri/${i}.png`)
    const { container } = render(<ProjectImageStrip images={images} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(4)
    expect(screen.queryByText(/^\+/)).toBeNull()
  })
})
