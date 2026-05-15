import { BackButton } from '@/components/shared/BackButton'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <p aria-hidden className="text-8xl font-bold text-muted-foreground sm:text-9xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
        Lost in the void
      </h1>
      <p className="mt-2 text-base text-muted-foreground">
        This page doesn&apos;t exist — but the rest of the site does.
      </p>
      <div className="mt-6">
        <BackButton label="Go back" />
      </div>
    </div>
  )
}
