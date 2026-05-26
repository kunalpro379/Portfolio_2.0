import type { ReactNode } from "react";

type ShimmerTone = "light" | "dark";

const toneClasses: Record<ShimmerTone, { base: string; shine: string }> = {
  light: {
    base: "bg-black/[0.08]",
    shine: "via-black/10",
  },
  dark: {
    base: "bg-white/[0.12]",
    shine: "via-white/15",
  },
};

export function ShimmerOverlay({
  tone = "light",
  className = "",
}: {
  tone?: ShimmerTone;
  className?: string;
}) {
  const { shine } = toneClasses[tone];
  return (
    <div
      className={`absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent ${shine} to-transparent ${className}`}
      aria-hidden
    />
  );
}

export function ShimmerBox({
  tone = "light",
  className = "",
  children,
}: {
  tone?: ShimmerTone;
  className?: string;
  children?: ReactNode;
}) {
  const { base } = toneClasses[tone];
  return (
    <div className={`relative overflow-hidden ${base} ${className}`}>
      <ShimmerOverlay tone={tone} />
      {children}
    </div>
  );
}

export function ProjectCardsShimmer({ count = 5 }: { count?: number }) {
  return (
    <div className="mt-16 grid grid-cols-2 gap-0 lg:grid-cols-5">
      {Array.from({ length: count }, (_, i) => i + 1).map((card) => (
        <div
          key={card}
          className="relative overflow-hidden border border-black/15 bg-white"
          style={{ animationDelay: `${card * 0.1}s` }}
        >
          <ShimmerOverlay />
          <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-black/10">
            <ShimmerBox className="h-full w-full" />
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <ShimmerBox className="h-3 w-24" />
              <ShimmerBox className="h-3 w-12" />
            </div>
            <ShimmerBox className="h-5 w-full" />
            <ShimmerBox className="h-5 w-3/4" />
            <ShimmerBox className="h-3 w-full" />
            <ShimmerBox className="h-3 w-5/6" />
            <ShimmerBox className="h-3 w-2/3" />
            <div className="flex gap-2">
              <ShimmerBox className="h-3 w-16" />
              <ShimmerBox className="h-3 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReadingsCardsShimmer() {
  return (
    <>
      <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2">
        {[1, 2].map((card) => (
          <div key={card} className="space-y-4 border-t border-white/20 pt-8">
            <div className="flex items-center justify-between">
              <ShimmerBox tone="dark" className="h-3 w-20" />
              <ShimmerBox tone="dark" className="h-3 w-16" />
            </div>
            <ShimmerBox tone="dark" className="h-8 w-full" />
            <ShimmerBox tone="dark" className="h-4 w-full" />
            <ShimmerBox tone="dark" className="h-4 w-4/5" />
            <div className="flex gap-3">
              <ShimmerBox tone="dark" className="h-3 w-14" />
              <ShimmerBox tone="dark" className="h-3 w-14" />
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4].map((card) => (
          <ShimmerBox key={card} tone="dark" className="h-40 w-full rounded-lg sm:h-56" />
        ))}
      </div>
    </>
  );
}
