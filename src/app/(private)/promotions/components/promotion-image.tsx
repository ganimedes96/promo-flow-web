"use client";
import { useCallback, useState } from "react";
import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/shadcn/utils";

export function PromotionImage({
  src,
  title,
  compact = false,
}: {
  src: string;
  title: string;
  compact?: boolean;
}) {
  const [result, setResult] = useState<{ src: string; failed: boolean } | null>(
    null
  );
  const imageRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (image?.complete) {
        const failed = image.naturalWidth === 0;
        setResult((previous) =>
          previous?.src === src && previous.failed === failed
            ? previous
            : { src, failed }
        );
      }
    },
    [src]
  );
  const settled = result?.src === src;
  const failed = settled && result.failed;
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-white",
        compact ? "size-14 overflow-hidden rounded-xl border p-1.5" : "h-48 p-4"
      )}
    >
      {!settled && (
        <Skeleton
          aria-hidden="true"
          className={cn(
            "absolute motion-reduce:animate-none",
            compact ? "inset-1" : "inset-4"
          )}
        />
      )}
      {failed ? (
        <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
          <ImageOff className="size-7" />
          {!compact && <span>Imagem indisponível</span>}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imageRef}
          src={src}
          alt={title}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setResult({ src, failed: false })}
          onError={() => setResult({ src, failed: true })}
          className={cn(
            "h-full w-full object-contain motion-safe:transition-opacity motion-safe:duration-300",
            settled ? "opacity-100" : "opacity-0"
          )}
        />
      )}
    </div>
  );
}
