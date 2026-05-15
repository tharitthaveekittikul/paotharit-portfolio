interface ProjectImageStripProps {
  images: string[]
}

export function ProjectImageStrip({ images }: ProjectImageStripProps) {
  if (images.length === 0) return null

  const showOverlay = images.length > 4
  const tiles = images.slice(0, 4)
  const overflowCount = images.length - 3

  return (
    <div className="flex h-24 border-t border-zinc-200 dark:border-zinc-800">
      {tiles.map((src, i) => {
        const isOverflowTile = showOverlay && i === 3
        return (
          <div key={src} className="relative flex-1 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
            {isOverflowTile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-sm font-medium text-white">+{overflowCount}</span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
