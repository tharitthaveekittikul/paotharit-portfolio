import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Callout } from '../Callout'

describe('Callout', () => {
  it('renders children', () => {
    render(<Callout type="info">Test content</Callout>)
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders the type label', () => {
    render(<Callout type="warning">Watch out</Callout>)
    expect(screen.getByText('warning')).toBeInTheDocument()
  })

  it('applies the correct border color class for abstract type', () => {
    const { container } = render(<Callout type="abstract">text</Callout>)
    expect(container.firstChild).toHaveClass('border-blue-300')
  })
})
