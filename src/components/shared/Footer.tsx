import { SocialLinks } from './SocialLinks'

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-3xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Tharit Thaveekittikul</span>
        <div className="flex items-center gap-1 lg:hidden">
          <SocialLinks className="p-2 hover:text-foreground transition-colors" />
        </div>
      </div>
    </footer>
  )
}
