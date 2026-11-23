import { useCallback, useEffect, useState } from "react";
import { RotateCw } from "lucide-react";
import { Card3DTilt } from "@/components/card-3d-tilt";

const CARD_BACK_IMAGE = "/images/verso.jpg";

type LightboxProps = {
  images: string[];
  alt?: string;
  children: (open: (index: number) => void) => React.ReactNode;
};

export function Lightbox({ images, alt = "Imagem", children }: LightboxProps) {
  const [index, setIndex] = useState(-1);
  const [flipped, setFlipped] = useState(false);
  const isOpen = index >= 0;

  const open = useCallback((i: number) => setIndex(i), []);
  const close = useCallback(() => setIndex(-1), []);

  const prev = useCallback(() => {
    setIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i >= images.length - 1 ? 0 : i + 1));
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, prev, next]);

  // Reset flip when changing card
  useEffect(() => {
    setFlipped(false);
  }, [index]);

  // Preload adjacent images + card back
  useEffect(() => {
    if (!isOpen) return;
    const preload = [index - 1, index + 1]
      .map((i) => (i + images.length) % images.length)
      .filter((i) => i !== index);
    preload.forEach((i) => {
      const img = new Image();
      img.src = images[i];
    });
    const back = new Image();
    back.src = CARD_BACK_IMAGE;
  }, [isOpen, index, images]);

  return (
    <>
      {children(open)}

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={close}
          style={{ animation: "fade-in 0.2s ease-out" }}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Fechar"
          >
            <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-4 z-10 rounded-full bg-white/10 px-3 py-1 text-sm text-white/80">
            {index + 1} / {images.length}
          </div>

          {/* Previous */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-4 z-10 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Anterior"
            >
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          {/* Image with flip */}
          <div
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setFlipped((f) => !f);
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ animation: "fade-in 0.2s ease-out", perspective: "1200px" }}
            className="relative cursor-pointer"
          >
            <Card3DTilt tiltMaxAngle={18} scale={1.08} className="inline-block">
              <div
                className="relative"
                style={{
                  transformStyle: "preserve-3d",
                  transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
                  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                {/* Front */}
                <img
                  src={images[index]}
                  alt={`${alt} ${index + 1}`}
                  className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                  style={{
                    userSelect: "none",
                    pointerEvents: "none",
                    backfaceVisibility: "hidden",
                  }}
                  draggable={false}
                />
                {/* Back */}
                <img
                  src={CARD_BACK_IMAGE}
                  alt="Verso da carta"
                  className="absolute inset-0 size-full rounded-lg object-contain"
                  style={{
                    userSelect: "none",
                    pointerEvents: "none",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                  draggable={false}
                />
              </div>
            </Card3DTilt>
            {/* Flip hint */}
            <div className="absolute bottom-3 right-3 rounded-full bg-black/40 p-1.5 text-white/50 pointer-events-none">
              <RotateCw className="size-4" />
            </div>
          </div>

          {/* Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-4 z-10 flex size-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              aria-label="Proximo"
            >
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
