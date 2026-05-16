import Image from "next/image";
import type { ProjectImage } from "@/lib/project-images";

interface ProjectImageStripProps {
  images: ProjectImage[];
}

export function ProjectImageStrip({ images }: ProjectImageStripProps) {
  if (images.length === 0) return null;

  const showOverlay = images.length > 4;
  const tiles = images.slice(0, 4);
  const overflowCount = images.length - 3;

  return (
    <div className="flex gap-1.5 px-3 pb-3 transition-[filter] hover:brightness-90">
      {tiles.map((image, i) => {
        const isOverflowTile = showOverlay && i === 3;
        return (
          <div
            key={image.src}
            className="relative flex-1 overflow-hidden rounded-md"
            style={{ height: "80px" }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 25vw, 200px"
              className="object-cover"
              priority={i === 0}
            />
            {isOverflowTile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <span className="text-sm font-medium text-white">
                  +{overflowCount}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
