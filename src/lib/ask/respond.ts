import { generateAnswer, type Turn } from './answer'
import { allowedPaths, sanitizeLinks } from './links'
import { loadBrief, sliceBrief } from './brief'
import { readSignals, decide, type GateDecision } from './gate'
import type { AskSession } from './session'

export type AskReply =
  | { type: 'answer'; text: string; outcome: string }
  | { type: 'refusal'; reason: 'off_topic' | 'injection'; outcome: string }
  | { type: 'contact'; channel: 'phone' | 'email'; outcome: string }

export interface Dependencies {
  signals: typeof readSignals
  answer: typeof generateAnswer
}

const defaults: Dependencies = { signals: readSignals, answer: generateAnswer }

export async function respond(
  args: { session: AskSession; message: string; history: Turn[]; locale: string },
  deps: Dependencies = defaults,
): Promise<AskReply> {
  const brief = loadBrief()
  const last = args.history.at(-1)
  const signals = await deps.signals(
    { message: args.message, previousQuestion: last?.question, previousAnswer: last?.answer },
    brief.projects,
  )
  const decision: GateDecision = decide(signals)
  if (decision.kind === 'refuse') return { type: 'refusal', reason: decision.reason, outcome: decision.reason }
  if (decision.kind === 'contact') return { type: 'contact', channel: decision.channel, outcome: `contact:${decision.channel}` }
  const text = await deps.answer({
    brief: sliceBrief(brief, decision.projectSlugs, args.locale),
    visitor: { name: args.session.name, role: args.session.role, company: args.session.company },
    history: args.history,
    message: args.message,
  })
  const allowed = allowedPaths(args.locale, brief.projects.map((p) => p.slug))
  return { type: 'answer', text: sanitizeLinks(text, allowed), outcome: `answer:${decision.projectSlugs.join(',')}` }
}
