import { describe, expect, it } from 'vitest'
import { decide, type GateSignals } from '../gate'

const base: GateSignals = {
  onTopic: 0.9,
  injection: 0.02,
  contact: 'none',
  projects: { a: 0.8, b: 0.5, c: 0.45, d: 0.41, e: 0.1 },
}

describe('decide', () => {
  it('refuses injection before anything else, even for a contact ask', () => {
    expect(decide({ ...base, injection: 0.9, contact: 'phone' })).toEqual({ kind: 'refuse', reason: 'injection' })
  })

  it('returns a contact request for phone and email', () => {
    expect(decide({ ...base, contact: 'phone' })).toEqual({ kind: 'contact', channel: 'phone' })
    expect(decide({ ...base, contact: 'email' })).toEqual({ kind: 'contact', channel: 'email' })
  })

  it('refuses off-topic messages', () => {
    expect(decide({ ...base, onTopic: 0.1 })).toEqual({ kind: 'refuse', reason: 'off_topic' })
  })

  it('picks at most three relevant projects, strongest first', () => {
    expect(decide(base)).toEqual({ kind: 'answer', projectSlugs: ['a', 'b', 'c'] })
  })

  it('falls back to the two strongest projects when none is relevant', () => {
    const decision = decide({ ...base, projects: { a: 0.2, b: 0.3, c: 0.1 } })
    expect(decision).toEqual({ kind: 'answer', projectSlugs: ['b', 'a'] })
  })
})
