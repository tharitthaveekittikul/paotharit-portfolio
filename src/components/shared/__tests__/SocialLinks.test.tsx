import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SocialLinks } from '../SocialLinks'
import { sendGAEvent } from '@next/third-parties/google'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

describe('SocialLinks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fires social_click with platform GitHub on GitHub link click', () => {
    render(<SocialLinks className="p-2" />)
    fireEvent.click(screen.getByRole('link', { name: 'GitHub' }))
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'social_click', { platform: 'GitHub' })
  })

  it('fires social_click with platform LinkedIn on LinkedIn link click', () => {
    render(<SocialLinks className="p-2" />)
    fireEvent.click(screen.getByRole('link', { name: 'LinkedIn' }))
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'social_click', { platform: 'LinkedIn' })
  })

  it('renders all 4 social links', () => {
    render(<SocialLinks className="p-2" />)
    expect(screen.getAllByRole('link')).toHaveLength(4)
  })
})
