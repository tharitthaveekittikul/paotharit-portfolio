import { after, NextResponse } from 'next/server'
import { ASK_COOKIE, MAX_QUESTIONS, SESSION_TTL_SECONDS } from '@/lib/ask/config'
import { notifyIntro } from '@/lib/ask/discord'
import { createSession, decodeSession, encodeSession, parseIntro, remaining } from '@/lib/ask/session'

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(new RegExp(`${ASK_COOKIE}=([^;]+)`))?.[1]
  const session = decodeSession(token)
  if (!session) return NextResponse.json({ active: false })
  return NextResponse.json({ active: true, name: session.name, remaining: remaining(session), max: MAX_QUESTIONS })
}

export async function POST(request: Request) {
  const intro = parseIntro(await request.json().catch(() => null))
  if (!intro) return NextResponse.json({ error: 'invalid_intro' }, { status: 400 })
  const session = createSession(intro)
  const response = NextResponse.json({ active: true, name: session.name, remaining: MAX_QUESTIONS, max: MAX_QUESTIONS })
  response.cookies.set(ASK_COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/ask',
    maxAge: SESSION_TTL_SECONDS,
  })
  after(() => notifyIntro(intro))
  return response
}
