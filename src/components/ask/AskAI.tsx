'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Drawer } from '@base-ui/react/drawer'
import { Sparkles, X } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useKeyboardInset, useMediaQuery } from '@/lib/useMediaQuery'
import { ContactDialog, type ContactRequest } from './ContactDialog'
import { RichText } from './RichText'

interface Turn {
  question: string
  answer: string
}

interface ChatLine {
  role: 'user' | 'assistant'
  text: string
}

interface SessionState {
  name: string
  company: string
  remaining: number
  max: number
}

const MAX_MESSAGE_CHARS = 500
const FIELD_CLASS =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none focus-visible:border-primary md:py-2 md:text-sm'

export function AskAI() {
  const t = useTranslations('ask')
  const locale = useLocale()
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = useState(false)
  const keyboardInset = useKeyboardInset(open && !isDesktop)
  const [session, setSession] = useState<SessionState | null>(null)
  const [checked, setChecked] = useState(false)
  const [intro, setIntro] = useState({ name: '', role: '', company: '' })
  const [lines, setLines] = useState<ChatLine[]>([])
  const [turns, setTurns] = useState<Turn[]>([])
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [contact, setContact] = useState<ContactRequest | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || checked) return
    fetch('/api/ask/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.active) setSession({ name: data.name, company: '', remaining: data.remaining, max: data.max })
      })
      .catch(() => {})
      .finally(() => setChecked(true))
  }, [open, checked])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [lines, pending])

  const startSession = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const res = await fetch('/api/ask/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(intro),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setSession({ name: data.name, company: intro.company, remaining: data.remaining, max: data.max })
    } catch {
      setError(t('errorGeneric'))
    } finally {
      setPending(false)
    }
  }

  const ask = async (text: string) => {
    if (!text || pending || !session) return
    setError('')
    setPending(true)
    setLines((prev) => [...prev, { role: 'user', text }])
    setMessage('')
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: text, history: turns, locale }),
      })
      const data = await res.json()
      if (res.status === 401) {
        setSession(null)
        setLines([])
        setTurns([])
        return
      }
      if (res.status === 429) {
        setSession({ ...session, remaining: 0 })
        return
      }
      if (!res.ok) {
        setLines((prev) => [...prev, { role: 'assistant', text: data.message ?? t('errorGeneric') }])
        return
      }
      setSession({ ...session, remaining: data.remaining })
      if (data.type === 'contact') {
        setLines((prev) => [...prev, { role: 'assistant', text: data.channel === 'phone' ? t('callTitle') : t('emailTitle') }])
        setContact({ channel: data.channel, phone: data.phone, email: data.email })
      } else {
        setLines((prev) => [...prev, { role: 'assistant', text: data.text }])
        setTurns((prev) => [...prev, { question: text, answer: data.text }])
      }
    } catch {
      setLines((prev) => [...prev, { role: 'assistant', text: t('errorGeneric') }])
    } finally {
      setPending(false)
    }
  }

  const send = (event: FormEvent) => {
    event.preventDefault()
    ask(message.trim())
  }

  const exhausted = session !== null && session.remaining === 0

  return (
    <>
      <Drawer.Root
        open={open}
        onOpenChange={setOpen}
        swipeDirection={isDesktop ? 'right' : 'down'}
        modal={!isDesktop}
        disablePointerDismissal={isDesktop}
      >
        <Drawer.Trigger
          render={
            <Button
              size="sm"
              aria-label={t('button')}
              className="gap-1 rounded-full bg-primary px-2.5 text-primary-foreground hover:bg-primary/90"
            />
          }
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t('button')}</span>
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/40 opacity-[calc(1-var(--drawer-swipe-progress,0))] transition-opacity duration-300 data-ending-style:opacity-0 data-starting-style:opacity-0 data-swiping:duration-0 md:hidden" />
          <Drawer.Viewport className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center md:items-stretch md:justify-end">
              <Drawer.Popup style={{ marginBottom: keyboardInset }} className="pointer-events-auto flex h-[88dvh] w-full flex-col overflow-hidden rounded-t-xl border-t border-border bg-popover text-popover-foreground outline-none transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] [transform:translateY(var(--drawer-swipe-movement-y,0px))] data-ending-style:[transform:translateY(100%)] data-starting-style:[transform:translateY(100%)] data-swiping:duration-0 md:h-full md:max-w-[26rem] md:rounded-none md:border-t-0 md:border-l md:[transform:translateX(var(--drawer-swipe-movement-x,0px))] md:data-ending-style:[transform:translateX(100%)] md:data-starting-style:[transform:translateX(100%)]">
                <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border md:hidden" aria-hidden />
                <div className="flex items-start justify-between gap-3 px-4 pt-3 pb-3 md:pt-4">
                  <div className="min-w-0">
                    <Drawer.Title className="text-base font-semibold">{t('title')}</Drawer.Title>
                    <Drawer.Description className="mt-1 text-xs text-muted-foreground">{t('description')}</Drawer.Description>
                  </div>
                  <Drawer.Close
                    render={<Button variant="ghost" size="icon-sm" aria-label={t('close')} className="shrink-0" />}
                  >
                    <X className="h-4 w-4" />
                  </Drawer.Close>
                </div>
                <div className="border-t border-border" />

                <Drawer.Content className="flex min-h-0 flex-1 flex-col">
                  {!session ? (
                    <form onSubmit={startSession} className="flex flex-col gap-3 overflow-y-auto px-4 py-4">
                      <input
                        required
                        maxLength={60}
                        value={intro.name}
                        onChange={(e) => setIntro({ ...intro, name: e.target.value })}
                        placeholder={t('name')}
                        aria-label={t('name')}
                        autoComplete="name"
                        className={FIELD_CLASS}
                      />
                      <input
                        maxLength={60}
                        value={intro.role}
                        onChange={(e) => setIntro({ ...intro, role: e.target.value })}
                        placeholder={t('role')}
                        aria-label={t('role')}
                        autoComplete="organization-title"
                        className={FIELD_CLASS}
                      />
                      <input
                        required
                        maxLength={80}
                        value={intro.company}
                        onChange={(e) => setIntro({ ...intro, company: e.target.value })}
                        placeholder={t('company')}
                        aria-label={t('company')}
                        autoComplete="organization"
                        className={FIELD_CLASS}
                      />
                      <p className="text-xs text-muted-foreground">{t('notice')}</p>
                      {error && <p className="text-xs text-destructive">{error}</p>}
                      <Button type="submit" size="lg" disabled={pending}>
                        {t('start')}
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
                        {lines.map((line, index) => (
                          <div
                            key={index}
                            className={
                              line.role === 'user'
                                ? 'ml-10 rounded-lg border border-border bg-muted px-3 py-2 text-sm whitespace-pre-wrap'
                                : 'mr-6 text-sm leading-relaxed whitespace-pre-wrap text-foreground'
                            }
                          >
                            {line.role === 'assistant' ? (
                              <RichText text={line.text} onNavigate={() => !isDesktop && setOpen(false)} />
                            ) : (
                              line.text
                            )}
                          </div>
                        ))}
                        {lines.length === 0 && !exhausted && (
                          <div className="flex flex-col items-start gap-2">
                            {(t.raw('suggestions') as string[]).map((suggestion) => (
                              <button
                                key={suggestion}
                                type="button"
                                onClick={() => ask(suggestion)}
                                className="rounded-full border border-border px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                        {pending && <p className="text-sm text-muted-foreground">{t('thinking')}</p>}
                        <div ref={bottomRef} />
                      </div>
                      <div className="shrink-0 border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                        {exhausted ? (
                          <p className="text-sm text-muted-foreground">{t('limitReached')}</p>
                        ) : (
                          <form onSubmit={send} className="flex gap-2">
                            <input
                              value={message}
                              maxLength={MAX_MESSAGE_CHARS}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder={t('placeholder')}
                              aria-label={t('placeholder')}
                              enterKeyHint="send"
                              className={FIELD_CLASS}
                            />
                            <Button type="submit" size="lg" disabled={pending || !message.trim()}>
                              {t('send')}
                            </Button>
                          </form>
                        )}
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t('remaining', { count: session.remaining, max: session.max })}
                        </p>
                      </div>
                    </>
                  )}
                </Drawer.Content>
              </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
      <ContactDialog
        request={contact}
        visitor={{ name: session?.name ?? '', company: session?.company ?? intro.company }}
        onClose={() => setContact(null)}
      />
    </>
  )
}
