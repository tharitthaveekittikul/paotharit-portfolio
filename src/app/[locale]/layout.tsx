import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import { Analytics } from '@vercel/analytics/react'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import '../globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000'
  ),
  title: {
    default: 'Paotharit — Developer & Builder',
    template: '%s | Paotharit',
  },
  description: 'Personal portfolio and technical blog by Paotharit.',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </ThemeProvider>
      <Analytics />
    </NextIntlClientProvider>
  )
}
