import { useEffect, useState } from "react";
import type { Collection } from "@/lib/store-data";
import { Link } from "@tanstack/react-router";

const FLIP_INTERVAL = 3500;

export function CollectionCard({ collection }: { collection: Collection }) {
  const images = collection.sampleImages.length > 0
    ? collection.sampleImages
    : [collection.image];

  const [current, setCurrent] = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [displayIdx, setDisplayIdx] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setFlipping(true);

      setTimeout(() => {
        setCurrent((prev) => {
          const next = (prev + 1) % images.length;
          setDisplayIdx(next);
          return next;
        });
      }, 300);

      setTimeout(() => {
        setFlipping(false);
      }, 600);
    }, FLIP_INTERVAL);

    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <Link
      to="/colecoes/$slug"
      params={{ slug: collection.slug }}
      className="art-frame group block bg-card"
    >
      <div className="relative aspect-[3/4] overflow-hidden" style={{ perspective: "800px" }}>
        <div
          className="absolute inset-0 transition-transform duration-[600ms] ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipping ? "rotateY(90deg)" : "rotateY(0deg)",
          }}
        >
          <img
            src={images[displayIdx]}
            alt={`Amostra da colecao ${collection.name}`}
            loading="lazy"
            width={600}
            height={840}
            className="size-full object-cover"
            style={{ backfaceVisibility: "hidden" }}
            onContextMenu={(e) => e.preventDefault()}
            draggable={false}
          />
        </div>

        <div className="veil absolute inset-0 pointer-events-none" />

        <div className="absolute inset-x-0 bottom-0 p-6 pointer-events-none">
          <p className="font-display text-2xl">{collection.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gold">
            {collection.cardCount} cartas
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {collection.description}
          </p>
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-2 right-4 flex gap-1.5 pointer-events-none">
            {images.map((_, i) => (
              <span
                key={`${collection.slug}-dot-${i}`}
                className={`block size-1.5 rounded-full transition-colors duration-300 ${
                  i === current ? "bg-gold" : "bg-gold/30"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
