import { Lora, Noto_Serif_Thai, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

const lora = Lora({ variable: '--font-lora', subsets: ['latin'], display: 'swap' })
const notoSerifThai = Noto_Serif_Thai({ variable: '--font-noto-serif-thai', subsets: ['thai'], display: 'swap' })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'], display: 'swap' })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      className={`${lora.variable} ${notoSerifThai.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
      </body>
    </html>
  )
}
