import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') ?? 'paotharit'
  const description =
    searchParams.get('description') ??
    'Software engineer building AI systems, trading tools, and developer infrastructure.'
  const type = searchParams.get('type') ?? 'page'

  const truncated = description.length > 120 ? description.slice(0, 117) + '...' : description

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          backgroundColor: '#09090b',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex' }}>
          {type !== 'page' && (
            <div
              style={{
                fontSize: 14,
                color: '#71717a',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              {type}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              fontSize: type === 'page' ? 56 : 48,
              fontWeight: 700,
              lineHeight: 1.1,
              color: '#fafafa',
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 20,
              color: '#a1a1aa',
              lineHeight: 1.5,
              maxWidth: 800,
            }}
          >
            {truncated}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 18, color: '#ea580c', fontWeight: 600 }}>
            paotharit.me
          </div>
          <div style={{ fontSize: 14, color: '#3f3f46' }}>
            Tharit Thaveekittikul
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
