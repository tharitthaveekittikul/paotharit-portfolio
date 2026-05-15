import { render, screen, fireEvent } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import { MobileDocsSidebar } from '../MobileDocsSidebar'
import type { SidebarNode } from '@/lib/docs'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn().mockReturnValue('/en/docs/zentri'),
}))

const mockTree: SidebarNode[] = [
  { type: 'item', label: 'Introduction', href: '/en/docs/zentri/intro' },
]

describe('MobileDocsSidebar', () => {
  it('renders a menu trigger button', () => {
    render(<MobileDocsSidebar tree={mockTree} projectTitle="Zentri" />)
    expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument()
  })

  it('opens the sheet and shows project title when trigger is clicked', async () => {
    render(<MobileDocsSidebar tree={mockTree} projectTitle="Zentri" />)
    fireEvent.click(screen.getByRole('button', { name: /open navigation/i }))
    expect(await screen.findByText('Zentri')).toBeInTheDocument()
  })
})
