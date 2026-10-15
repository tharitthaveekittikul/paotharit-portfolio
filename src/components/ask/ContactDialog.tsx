'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { useTranslations } from 'next-intl'
import { Button, buttonVariants } from '@/components/ui/button'

export interface ContactRequest {
  channel: 'phone' | 'email'
  phone?: string
  email: string
}

interface ContactDialogProps {
  request: ContactRequest | null
  visitor: { name: string; company: string }
  onClose: () => void
}

export function ContactDialog({ request, visitor, onClose }: ContactDialogProps) {
  const t = useTranslations('ask')
  const [copied, setCopied] = useState(false)
  const isPhone = request?.channel === 'phone'
  const value = isPhone ? request?.phone ?? '' : request?.email ?? ''

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  const mailto = request
    ? `mailto:${request.email}?subject=${encodeURIComponent(t('emailSubject'))}&body=${encodeURIComponent(
        t('emailBody', { name: visitor.name, company: visitor.company }),
      )}`
    : ''

  return (
    <Dialog.Root open={request !== null} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/50" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-[61] w-[calc(100vw-3rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-popover p-5 text-popover-foreground">
          <Dialog.Title className="text-base font-semibold">
            {isPhone ? t('callTitle') : t('emailTitle')}
          </Dialog.Title>
          <p className="mt-3 break-all text-lg font-medium tabular-nums" data-testid="contact-value">
            {value}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {isPhone ? (
              <a href={`tel:${value}`} className={buttonVariants()}>
                {t('call')}
              </a>
            ) : (
              <a href={mailto} className={buttonVariants()}>
                {t('openEmail')}
              </a>
            )}
            <Button variant="outline" onClick={copy}>
              {copied ? t('copied') : isPhone ? t('copyNumber') : t('copyEmail')}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t('close')}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
