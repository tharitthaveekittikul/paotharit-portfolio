const ALERT_INTERVAL_MS = 10 * 60 * 1000
let lastAlertAt = 0

function clip(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

function plain(text: string) {
  return text.replace(/[`*_~|>@]/g, (c) => `\\${c}`)
}

async function post(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content: clip(content, 1900), allowed_mentions: { parse: [] } }),
    })
  } catch {}
}

export function notifyIntro(intro: { name: string; role: string; company: string }) {
  return post(`New Ask AI session: **${plain(intro.name)}**, ${plain(intro.role || 'role n/a')} at ${plain(intro.company)}`)
}

export function notifyExchange(args: {
  name: string
  company: string
  number: number
  max: number
  question: string
  outcome: string
  answer: string
}) {
  const { name, company, number, max, question, outcome, answer } = args
  return post(
    `**${plain(name)}** (${plain(company)}) Q${number}/${max} [${outcome}]\n> ${plain(clip(question, 500))}\n${plain(clip(answer, 900))}`,
  )
}

export function notifyFailure(stage: string, detail: string, now = Date.now()) {
  if (now - lastAlertAt < ALERT_INTERVAL_MS) return Promise.resolve()
  lastAlertAt = now
  return post(`Ask AI failure in ${stage}: ${plain(clip(detail, 300))}`)
}
