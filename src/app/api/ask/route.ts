import { after, NextResponse, type NextRequest } from 'next/server'
import { getTranslations } from 'next-intl/server'
import type { Turn } from '@/lib/ask/answer'
import { ASK_COOKIE, CONTACT_EMAIL, MAX_MESSAGE_CHARS, MAX_QUESTIONS, SESSION_TTL_SECONDS } from '@/lib/ask/config'
import { notifyExchange, notifyFailure } from '@/lib/ask/discord'
import { respond } from '@/lib/ask/respond'
import { cleanField, decodeSession, encodeSession, remaining } from '@/lib/ask/session'

const THAI = /[฀-๿]/

function parseHistory(raw: unknown): Turn[] {
  if (!Array.isArray(raw)) return []
  return raw
    .slice(-MAX_QUESTIONS)
    .map((item) => ({
      question: cleanField((item as Turn)?.question, MAX_MESSAGE_CHARS),
      answer: typeof (item as Turn)?.answer === 'string' ? (item as Turn).answer.slice(0, 2400) : '',
    }))
    .filter((turn) => turn.question && turn.answer)
}

export async function POST(request: NextRequest) {
  const session = decodeSession(request.cookies.get(ASK_COOKIE)?.value)
  if (!session) return NextResponse.json({ error: 'no_session' }, { status: 401 })
  if (remaining(session) === 0) return NextResponse.json({ error: 'limit_reached' }, { status: 429 })

  const body = (await request.json().catch(() => null)) as { message?: unknown; history?: unknown; locale?: unknown } | null
  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  if (!message || message.length > MAX_MESSAGE_CHARS) return NextResponse.json({ error: 'invalid_message' }, { status: 400 })

  const siteLocale = body?.locale === 'th' ? 'th' : 'en'
  const locale = THAI.test(message) ? 'th' : siteLocale
  const t = await getTranslations({ locale, namespace: 'ask' })

  let reply
  try {
    reply = await respond({ session, message, history: parseHistory(body?.history), locale: siteLocale })
  } catch (error) {
    after(() => notifyFailure('respond', error instanceof Error ? error.message : String(error)))
    return NextResponse.json({ error: 'unavailable', message: t('unavailable'), email: CONTACT_EMAIL }, { status: 503 })
  }

  const updated = { ...session, used: session.used + 1 }
  const payload =
    reply.type === 'answer'
      ? { type: 'answer', text: reply.text }
      : reply.type === 'refusal'
        ? { type: 'answer', text: t(reply.reason === 'injection' ? 'refuseInjection' : 'refuseOffTopic') }
        : reply.channel === 'phone'
          ? { type: 'contact', channel: 'phone', phone: process.env.CONTACT_PHONE ?? '', email: CONTACT_EMAIL }
          : { type: 'contact', channel: 'email', email: CONTACT_EMAIL }

  const response = NextResponse.json({ ...payload, remaining: remaining(updated), max: MAX_QUESTIONS })
  response.cookies.set(ASK_COOKIE, encodeSession(updated), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/ask',
    maxAge: Math.max(1, Math.min(SESSION_TTL_SECONDS, Math.floor((session.exp - Date.now()) / 1000))),
  })
  after(() =>
    notifyExchange({
      name: session.name,
      company: session.company,
      number: updated.used,
      max: MAX_QUESTIONS,
      question: message,
      outcome: reply.outcome,
      answer: reply.type === 'answer' ? reply.text : reply.type === 'contact' ? `[contact ${reply.channel} shown]` : '[refused]',
    }),
  )
  return response
}
