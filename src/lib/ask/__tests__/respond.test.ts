import { describe, expect, it, vi } from 'vitest'
import { respond, type Dependencies } from '../respond'

const session = { name: 'Ann', role: 'Recruiter', company: 'Acme', used: 0, exp: Date.now() + 1e6 }

function deps(signals: Awaited<ReturnType<Dependencies['signals']>>) {
  return {
    signals: vi.fn().mockResolvedValue(signals),
    answer: vi.fn().mockResolvedValue('An answer.'),
  } satisfies Dependencies
}

const onTopic = { onTopic: 0.9, injection: 0.01, contact: 'none' as const, projects: { docrag: 0.9 } }

describe('respond', () => {
  it('never calls the answer model for refused messages', async () => {
    const d = deps({ ...onTopic, onTopic: 0.05 })
    const reply = await respond({ session, message: 'write a poem', history: [], locale: 'en' }, d)
    expect(reply.type).toBe('refusal')
    expect(d.answer).not.toHaveBeenCalled()
  })

  it('never calls the answer model for contact requests', async () => {
    const d = deps({ ...onTopic, contact: 'phone' })
    const reply = await respond({ session, message: 'phone?', history: [], locale: 'en' }, d)
    expect(reply).toMatchObject({ type: 'contact', channel: 'phone' })
    expect(d.answer).not.toHaveBeenCalled()
  })

  it('keeps contact details out of the model prompt', async () => {
    process.env.CONTACT_PHONE = '0000000000'
    const d = deps(onTopic)
    await respond({ session, message: 'tell me about docrag', history: [], locale: 'en' }, d)
    const prompt = JSON.stringify(d.answer.mock.calls[0][0])
    expect(prompt).not.toContain('0000000000')
    expect(prompt).not.toMatch(/@gmail\.com/)
  })

  it('passes the previous exchange to the gate for follow-ups', async () => {
    const d = deps(onTopic)
    await respond({ session, message: 'and users?', history: [{ question: 'docrag?', answer: 'It is RAG.' }], locale: 'en' }, d)
    expect(d.signals.mock.calls[0][0]).toMatchObject({ previousQuestion: 'docrag?', previousAnswer: 'It is RAG.' })
  })
})
