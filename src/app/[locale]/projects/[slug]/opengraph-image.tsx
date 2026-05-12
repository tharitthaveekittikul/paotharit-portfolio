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
  const { frontmatter } = getContent('projects', locale, slug)

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
          paotharit · project
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
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {frontmatter.techStack.slice(0, 5).map(tech => (
            <div
              key={tech}
              style={{
                background: '#27272a',
                color: '#a1a1aa',
                padding: '4px 12px',
                borderRadius: 4,
                fontSize: 18,
              }}
            >
              {tech}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
