import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ContactDialog } from '../ContactDialog'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, string>) =>
    values ? `${key}:${Object.values(values).join('|')}` : key,
}))

const visitor = { name: 'Ann', company: 'Acme' }

describe('ContactDialog', () => {
  it('renders nothing when there is no request', () => {
    render(<ContactDialog request={null} visitor={visitor} onClose={() => {}} />)
    expect(screen.queryByTestId('contact-value')).toBeNull()
  })

  it('shows the phone number with a tel link and a copy action', () => {
    render(
      <ContactDialog request={{ channel: 'phone', phone: '0123456789', email: 'a@b.co' }} visitor={visitor} onClose={() => {}} />,
    )
    expect(screen.getByTestId('contact-value')).toHaveTextContent('0123456789')
    expect(screen.getByRole('link', { name: 'call' })).toHaveAttribute('href', 'tel:0123456789')
    expect(screen.getByRole('button', { name: 'copyNumber' })).toBeInTheDocument()
  })

  it('shows the email with a prefilled mailto link', () => {
    render(<ContactDialog request={{ channel: 'email', email: 'a@b.co' }} visitor={visitor} onClose={() => {}} />)
    const href = screen.getByRole('link', { name: 'openEmail' }).getAttribute('href') ?? ''
    expect(href.startsWith('mailto:a@b.co?subject=')).toBe(true)
    expect(decodeURIComponent(href)).toContain('Ann|Acme')
  })
})
