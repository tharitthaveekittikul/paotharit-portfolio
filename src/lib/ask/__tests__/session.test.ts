import { beforeAll, describe, expect, it } from 'vitest'
import { createSession, decodeSession, encodeSession, parseIntro, remaining } from '../session'
import { MAX_QUESTIONS } from '../config'

beforeAll(() => {
  process.env.ASK_SESSION_SECRET = 'test-secret'
})

describe('session cookie', () => {
  const intro = { name: 'Ann', role: 'Recruiter', company: 'Acme' }

  it('round-trips a valid session', () => {
    const session = createSession(intro, 1000)
    expect(decodeSession(encodeSession(session), 2000)).toEqual(session)
  })

  it('rejects a tampered payload', () => {
    const token = encodeSession(createSession(intro, 1000))
    const [payload, signature] = token.split('.')
    const forged = Buffer.from(JSON.stringify({ ...createSession(intro, 1000), used: -50 })).toString('base64url')
    expect(decodeSession(`${forged}.${signature}`, 2000)).toBeNull()
    expect(decodeSession(`${payload}.bad`, 2000)).toBeNull()
  })

  it('rejects an expired session and a missing token', () => {
    const session = createSession(intro, 1000)
    expect(decodeSession(encodeSession(session), session.exp + 1)).toBeNull()
    expect(decodeSession(undefined)).toBeNull()
  })

  it('counts remaining questions', () => {
    expect(remaining({ ...createSession(intro), used: 3 })).toBe(MAX_QUESTIONS - 3)
    expect(remaining({ ...createSession(intro), used: 99 })).toBe(0)
  })
})

describe('parseIntro', () => {
  it('requires name and company and trims control characters', () => {
    expect(parseIntro({ name: ' Ann\n', role: '', company: 'Acme' })).toEqual({ name: 'Ann', role: '', company: 'Acme' })
    expect(parseIntro({ name: 'Ann', company: '' })).toBeNull()
    expect(parseIntro(null)).toBeNull()
  })
})
