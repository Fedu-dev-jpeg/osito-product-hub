import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import type { Product } from "./data";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ProductCarousel({ products, label }: { products: Product[]; label: string }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    skipSnaps: false,
    duration: prefersReducedMotion() ? 0 : 25,
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!products.length) return null;

  return (
    <div
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          emblaApi?.scrollPrev();
        }
        if (event.key === "ArrowRight") {
          event.preventDefault();
          emblaApi?.scrollNext();
        }
      }}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-0 shrink-0 basis-[78%] sm:basis-[46%] lg:basis-[23.5%]"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 hidden items-center justify-end gap-2 md:flex">
        <button
          type="button"
          aria-label={`Anterior ${label}`}
          disabled={!canPrev}
          onClick={() => emblaApi?.scrollPrev()}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-ink/20 disabled:opacity-30"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          type="button"
          aria-label={`Siguiente ${label}`}
          disabled={!canNext}
          onClick={() => emblaApi?.scrollNext()}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-ink/20 disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
