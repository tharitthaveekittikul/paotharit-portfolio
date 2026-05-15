import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, setRequestLocale } from 'next-intl/server'
import { Header } from '@/components/shared/Header'
import { Footer } from '@/components/shared/Footer'
import { CommandPaletteProvider } from "@/components/shared/CommandPaletteProvider"
import { CommandPalette } from "@/components/shared/CommandPalette"
import '../globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://www.paotharit.me'
      : 'http://localhost:3000'
  ),
  title: {
    default: 'paotharit — Portfolio & Blog',
    template: '%s | paotharit',
  },
  description: 'paotharit — Portfolio & Blog',
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
      <CommandPaletteProvider>
        <Header />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <CommandPalette />
      </CommandPaletteProvider>
    </NextIntlClientProvider>
  )
}
