import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import ResumePage from '../page'

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getTranslations: vi.fn().mockImplementation(async (namespace: string) => {
    return (key: string) => `${namespace}.${key}`
  }),
}))

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}))

vi.mock('@/components/shared/ResumeDownloadButton', () => ({
  ResumeDownloadButton: ({ label }: { label: string }) => <button>{label}</button>,
}))

afterEach(cleanup)

describe('ResumePage', () => {
  it('renders the education section heading', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('education.title')).toBeInTheDocument()
  })

  it('renders the university entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('education.university.name')).toBeInTheDocument()
    expect(screen.getByText('education.university.degree')).toBeInTheDocument()
    expect(screen.getByText(/education\.university\.gpa/)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })

  it('renders the high school entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('education.highschool.name')).toBeInTheDocument()
    expect(screen.getByText('education.highschool.program')).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(2)
  })

  it('renders a link to the volunteer blog post', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    const link = screen.getByText('education.university.volunteerLink')
    expect(link.closest('a')?.getAttribute('href')).toBe('/en/blog/ban-yang-pao-volunteer')
  })

  it('renders the PDF embed', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    const embed = document.querySelector('embed')
    expect(embed).toBeInTheDocument()
    expect(embed?.getAttribute('src')).toBe('/resume.pdf')
  })
})
