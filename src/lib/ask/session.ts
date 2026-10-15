import { createHmac, timingSafeEqual } from 'crypto'
import { MAX_QUESTIONS, SESSION_TTL_SECONDS } from './config'

export interface AskSession {
  name: string
  role: string
  company: string
  used: number
  exp: number
}

export interface Intro {
  name: string
  role: string
  company: string
}

const LIMITS = { name: 60, role: 60, company: 80 } as const

function secret() {
  const value = process.env.ASK_SESSION_SECRET
  if (!value) throw new Error('ASK_SESSION_SECRET is not set')
  return value
}

function sign(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function cleanField(value: unknown, max: number) {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

export function parseIntro(body: unknown): Intro | null {
  if (!body || typeof body !== 'object') return null
  const raw = body as Record<string, unknown>
  const name = cleanField(raw.name, LIMITS.name)
  const role = cleanField(raw.role, LIMITS.role)
  const company = cleanField(raw.company, LIMITS.company)
  if (!name || !company) return null
  return { name, role, company }
}

export function createSession(intro: Intro, now = Date.now()): AskSession {
  return { ...intro, used: 0, exp: now + SESSION_TTL_SECONDS * 1000 }
}

export function encodeSession(session: AskSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function decodeSession(token: string | undefined, now = Date.now()): AskSession | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = Buffer.from(sign(payload))
  const actual = Buffer.from(signature)
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AskSession
    if (typeof session.used !== 'number' || typeof session.exp !== 'number') return null
    if (session.exp <= now) return null
    return session
  } catch {
    return null
  }
}

export function remaining(session: AskSession) {
  return Math.max(0, MAX_QUESTIONS - session.used)
}
