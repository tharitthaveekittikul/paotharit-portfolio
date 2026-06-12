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

vi.mock('next/image', () => ({
  default: ({ src, alt }: { src: string; alt: string }) =>
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />,
}))

vi.mock('@/components/shared/ResumeDownloadButton', () => ({
  ResumeDownloadButton: ({ label }: { label: string }) => <button>{label}</button>,
}))

afterEach(cleanup)

describe('ResumePage', () => {
  it('renders the work experience section heading', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('workExperience.title')).toBeInTheDocument()
  })

  it('renders the SCB Tech X entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('workExperience.scb.company')).toBeInTheDocument()
    expect(screen.getByText('workExperience.scb.role')).toBeInTheDocument()
    expect(screen.getByText('workExperience.scb.years')).toBeInTheDocument()
  })

  it('renders the POMPKINS entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('workExperience.pompkins.company')).toBeInTheDocument()
    expect(screen.getByText('workExperience.pompkins.role')).toBeInTheDocument()
    expect(screen.getByText('workExperience.pompkins.years')).toBeInTheDocument()
  })

  it('renders project links in SCB entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    const satLink = screen.getByText('workExperience.scb.bullet1Link')
    expect(satLink.closest('a')?.getAttribute('href')).toBe('/en/projects/sat-scan-report')
    const debLink = screen.getByText('workExperience.scb.bullet2Link')
    expect(debLink.closest('a')?.getAttribute('href')).toBe('/en/projects/debenture-privilege-program')
  })

  it('renders project links in POMPKINS entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    const foodLink = screen.getByText('workExperience.pompkins.bullet1Link')
    expect(foodLink.closest('a')?.getAttribute('href')).toBe('/en/projects/pompkins-food-ios')
    const webLink = screen.getByText('workExperience.pompkins.bullet2Link1')
    expect(webLink.closest('a')?.getAttribute('href')).toBe('/en/projects/pompkins-web')
    const foodWebLink = screen.getByText('workExperience.pompkins.bullet2Link2')
    expect(foodWebLink.closest('a')?.getAttribute('href')).toBe('/en/projects/pompkins-food-web')
    const merchantLink = screen.getByText('workExperience.pompkins.bullet2Link3')
    expect(merchantLink.closest('a')?.getAttribute('href')).toBe('/en/projects/pompkins-merchant-portal')
  })

  it('renders 3 SCB intern photos', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    const photos = screen.getAllByRole('img')
    expect(photos).toHaveLength(3)
    expect(photos[0]).toHaveAttribute('src', '/work/scb/1.JPG')
    expect(photos[1]).toHaveAttribute('src', '/work/scb/2.JPG')
    expect(photos[2]).toHaveAttribute('src', '/work/scb/3.JPG')
  })

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
    // 6 list items total: 2 work (SCB) + 2 work (POMPKINS) + 2 education (university)
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
  })

  it('renders the high school entry', async () => {
    const jsx = await ResumePage({ params: Promise.resolve({ locale: 'en' }) })
    render(jsx)
    expect(screen.getByText('education.highschool.name')).toBeInTheDocument()
    expect(screen.getByText('education.highschool.program')).toBeInTheDocument()
    // 4 h3 headings: SCB Tech X, POMPKINS, university, highschool
    expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(4)
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
