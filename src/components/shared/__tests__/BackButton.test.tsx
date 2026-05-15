import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BackButton } from '../BackButton'

const mockBack = vi.fn()
const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}))

describe('BackButton', () => {
  beforeEach(() => {
    mockBack.mockClear()
    mockPush.mockClear()
  })

  it('renders with the provided label', () => {
    render(<BackButton label="Go back" />)
    expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument()
  })

  it('calls router.back() when history exists', () => {
    Object.defineProperty(window, 'history', {
      value: { length: 3 },
      writable: true,
    })
    render(<BackButton label="Go back" />)
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }))
    expect(mockBack).toHaveBeenCalledTimes(1)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('calls router.push("/") when no history', () => {
    Object.defineProperty(window, 'history', {
      value: { length: 1 },
      writable: true,
    })
    render(<BackButton label="Go back" />)
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }))
    expect(mockPush).toHaveBeenCalledWith('/')
    expect(mockBack).not.toHaveBeenCalled()
  })
})
