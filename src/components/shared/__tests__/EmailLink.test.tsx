import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { EmailLink } from '../EmailLink'
import { sendGAEvent } from '@next/third-parties/google'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

describe('EmailLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fires email_click event on click', () => {
    render(<EmailLink />)
    fireEvent.click(screen.getByRole('link'))
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'email_click')
  })

  it('has correct mailto href', () => {
    render(<EmailLink />)
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'mailto:tharit.thaveekittikul@gmail.com'
    )
  })
})
