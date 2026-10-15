import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RichText } from '../RichText'

describe('RichText', () => {
  it('turns internal markdown links into anchors and keeps other text plain', () => {
    render(<p><RichText text="Built [DocRAG](/en/projects/docrag) and more." /></p>)
    expect(screen.getByRole('link', { name: 'DocRAG' })).toHaveAttribute('href', '/en/projects/docrag')
    expect(screen.getByText(/Built/)).toHaveTextContent('Built DocRAG and more.')
  })

  it('does not render protocol-relative or external targets as links', () => {
    render(<p><RichText text="[a](//evil.example) [b](https://evil.example)" /></p>)
    expect(screen.queryByRole('link')).toBeNull()
  })
})
