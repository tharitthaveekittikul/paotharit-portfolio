import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { ProjectGithubLink } from '../ProjectGithubLink'
import { sendGAEvent } from '@next/third-parties/google'

vi.mock('@next/third-parties/google', () => ({
  sendGAEvent: vi.fn(),
}))

describe('ProjectGithubLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fires project_github_click with project name on click', () => {
    render(
      <ProjectGithubLink
        href="https://github.com/tharitthaveekittikul/Zentri"
        project="zentri"
      />
    )
    fireEvent.click(screen.getByRole('link'))
    expect(sendGAEvent).toHaveBeenCalledWith('event', 'project_github_click', {
      project: 'zentri',
    })
  })

  it('has correct href', () => {
    render(
      <ProjectGithubLink
        href="https://github.com/tharitthaveekittikul/Zentri"
        project="zentri"
      />
    )
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://github.com/tharitthaveekittikul/Zentri'
    )
  })

  it('opens in new tab', () => {
    render(
      <ProjectGithubLink
        href="https://github.com/tharitthaveekittikul/Zentri"
        project="zentri"
      />
    )
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank')
  })
})
