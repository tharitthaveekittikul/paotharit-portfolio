@AGENTS.md
@DESIGN.md

## Commands

```bash
npm run dev        # Start dev server (Next.js 16)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run test       # Vitest (watch mode)
npm run test:run   # Vitest (single run, CI)
npm run sync       # Sync Obsidian notes → content/
```

## Architecture

```
src/           # App source — Next.js App Router
content/       # MDX content files (synced from Obsidian)
public/        # Static assets
scripts/       # obsidian-sync.ts and other build scripts
docs/          # Plans and specs (not served)
```

Key stack: Next.js 16 + React 19 + Tailwind v4 + next-mdx-remote + Vitest + next-intl (i18n) + next-themes (dark/light).

