import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ScreenshotsPage from '../page'
import { getProjectImages } from '@/lib/project-images'
import { getAllContent } from '@/lib/content'
import { redirect } from 'next/navigation'

vi.mock('@/lib/project-images')
vi.mock('@/lib/content')
vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation(() => { throw new Error('NEXT_REDIRECT') }),
}))
vi.mock('next-intl/server', () => ({ setRequestLocale: vi.fn() }))

describe('ScreenshotsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to project page when no images exist', async () => {
    vi.mocked(getProjectImages).mockReturnValue([])
    vi.mocked(getAllContent).mockReturnValue([])

    await expect(
      ScreenshotsPage({ params: Promise.resolve({ locale: 'en', slug: 'zentri' }) })
    ).rejects.toThrow('NEXT_REDIRECT')

    expect(redirect).toHaveBeenCalledWith('/en/projects/zentri')
  })

  it('renders one img per image returned by getProjectImages', async () => {
    vi.mocked(getProjectImages).mockReturnValue([
      '/projects/zentri/a.png',
      '/projects/zentri/b.png',
      '/projects/zentri/c.png',
    ])
    vi.mocked(getAllContent).mockReturnValue([
      { slug: 'zentri', title: 'Zentri', date: '2024-01-01', description: '', techStack: [], featured: false },
    ])

    const jsx = await ScreenshotsPage({
      params: Promise.resolve({ locale: 'en', slug: 'zentri' }),
    })
    render(jsx)

    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(3)
  })

  it('renders back link pointing to the project detail page', async () => {
    vi.mocked(getProjectImages).mockReturnValue(['/projects/zentri/a.png'])
    vi.mocked(getAllContent).mockReturnValue([
      { slug: 'zentri', title: 'Zentri', date: '2024-01-01', description: '', techStack: [], featured: false },
    ])

    const jsx = await ScreenshotsPage({
      params: Promise.resolve({ locale: 'en', slug: 'zentri' }),
    })
    render(jsx)

    const link = screen.getByRole('link', { name: /← Zentri/i })
    expect(link.getAttribute('href')).toBe('/en/projects/zentri')
  })

  it('falls back to slug as title when project is not found in content', async () => {
    vi.mocked(getProjectImages).mockReturnValue(['/projects/unknown/a.png'])
    vi.mocked(getAllContent).mockReturnValue([])

    const jsx = await ScreenshotsPage({
      params: Promise.resolve({ locale: 'en', slug: 'unknown' }),
    })
    render(jsx)

    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('unknown')
  })
})
