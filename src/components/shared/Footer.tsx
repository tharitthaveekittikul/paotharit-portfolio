export function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-zinc-500 dark:text-zinc-400">
        © {new Date().getFullYear()} Paotharit Thaveekittikul
      </div>
    </footer>
  )
}
