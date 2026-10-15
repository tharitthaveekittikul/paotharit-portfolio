import Link from 'next/link'

const LINK = /\[([^\]\n]+)\]\((\/[^)\s]*)\)/g

export function RichText({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const parts: React.ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(LINK)) {
    const [raw, label, href] = match
    if (href.startsWith('//')) continue
    if (match.index > last) parts.push(text.slice(last, match.index))
    parts.push(
      <Link
        key={match.index}
        href={href}
        onClick={onNavigate}
        className="text-primary underline-offset-2 hover:underline"
      >
        {label}
      </Link>,
    )
    last = match.index + raw.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}
