import { ImageResponse } from 'next/og'
import { getContent } from '@/lib/content'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const { frontmatter } = getContent('blog', locale, slug)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 80,
        }}
      >
        <div style={{ fontSize: 16, color: '#71717a', marginBottom: 16 }}>
          paotharit
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            color: '#fafafa',
            lineHeight: 1.1,
            marginBottom: 24,
            maxWidth: 900,
          }}
        >
          {frontmatter.title}
        </div>
        <div style={{ fontSize: 24, color: '#a1a1aa', maxWidth: 800 }}>
          {frontmatter.description}
        </div>
      </div>
    ),
    size
  )
}
